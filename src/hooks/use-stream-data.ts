import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { StreamData, KPIData, FilterState } from '@/types/stream'
import {
  parseCSV,
  parseNumber,
  getVal,
  normalizeKey,
  calculateKPIs,
  parseDateStr,
} from '@/lib/data-utils'
import { startOfDay, endOfDay } from 'date-fns'
import { supabase } from '@/lib/supabase/client'
import type { Tables } from '@/lib/supabase/types'

type LiveSessionRow = Tables<'live_sessions'>

interface UseStreamDataReturn {
  rawData: StreamData[]
  data: StreamData[]
  kpis: KPIData | null
  isLoading: boolean
  error: string | null
  filterState: FilterState
  setFilterState: React.Dispatch<React.SetStateAction<FilterState>>
  availableHosts: string[]
}

function rowToStreamData(row: LiveSessionRow): StreamData {
  return {
    date: row.date,
    views: Number(row.views),
    leads: Number(row.leads),
    conversion: Number(row.conversion),
    revenue: Number(row.revenue),
    sales: Number(row.sales),
    presenter: row.presenter,
    retention: Number(row.retention),
  }
}

async function fetchFromSupabase(dashboardKey: string): Promise<StreamData[] | null> {
  const { data, error } = await supabase
    .from('live_sessions')
    .select('*')
    .eq('dashboard_key', dashboardKey)
    .order('date', { ascending: false })

  if (error || !data || data.length === 0) return null
  return data.map(rowToStreamData)
}

async function fetchFromCSV(url: string): Promise<StreamData[]> {
  const fetchUrl = url.includes('?')
    ? `${url}&_t=${new Date().getTime()}`
    : `${url}?_t=${new Date().getTime()}`
  const response = await fetch(fetchUrl)
  if (!response.ok) throw new Error('Falha ao buscar o arquivo CSV')

  const text = await response.text()
  const rows = parseCSV(text).filter((row) => row.some((cell) => cell.trim().length > 0))
  if (rows.length < 2) return []

  const headers = rows[0].map((h) => normalizeKey(h))
  const parsedData: StreamData[] = []
  for (let i = 1; i < rows.length; i++) {
    const rowObj: Record<string, string> = {}
    headers.forEach((h, idx) => {
      rowObj[h] = rows[i][idx] ? rows[i][idx].trim() : ''
    })
    parsedData.push({
      date: getVal(rowObj, ['data']),
      views: parseNumber(getVal(rowObj, ['pico', 'pico de pessoas', 'audiencia', 'max'])),
      leads: parseNumber(getVal(rowObj, ['leads', 'cadastros'])),
      conversion: parseNumber(
        getVal(rowObj, ['conversao', 'tx conversao', 'taxa de conversao']),
      ),
      revenue: parseNumber(
        getVal(rowObj, ['receita', 'faturamento', 'valor', 'faturamento total']),
      ),
      sales: parseNumber(
        getVal(rowObj, ['vendas', 'qtdvendas', 'qtd vendas', 'quantidade', 'numero de vendas']),
      ),
      presenter: getVal(rowObj, ['apresentador', 'host', 'nome']) || 'Desconhecido',
      retention: parseNumber(getVal(rowObj, ['retencao', 'tx retencao', 'taxa de retencao'])),
    })
  }
  return parsedData.filter(
    (row) => row.views > 0 || row.leads > 0 || row.revenue > 0 || row.sales > 0,
  )
}

export const useStreamData = (url: string, dashboardKey?: string): UseStreamDataReturn => {
  const [rawData, setRawData] = useState<StreamData[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [usingSupabase, setUsingSupabase] = useState(false)
  const isFirstLoad = useRef(true)

  const [filterState, setFilterState] = useState<FilterState>({
    dataInicio: null,
    dataFim: null,
    apresentadores: [],
    diaSemana: 'all',
    comparisonEnabled: false,
    weeklyComparisonEnabled: false,
    weeklyComparisonDay: 'all',
    weeklyComparisonSelectedDates: [],
  })

  const fetchData = useCallback(async () => {
    if (!url) {
      setIsLoading(false)
      return
    }
    try {
      if (isFirstLoad.current) setIsLoading(true)
      setError(null)

      let result: StreamData[] | null = null

      if (dashboardKey) {
        result = await fetchFromSupabase(dashboardKey)
        if (result !== null) {
          setUsingSupabase(true)
        }
      }

      if (result === null) {
        result = await fetchFromCSV(url)
        setUsingSupabase(false)
      }

      setRawData(result)
    } catch (err) {
      setError('Erro ao carregar dados')
    } finally {
      if (isFirstLoad.current) {
        setIsLoading(false)
        isFirstLoad.current = false
      }
    }
  }, [url, dashboardKey])

  // Initial fetch + polling (somente no modo CSV — Realtime substitui o polling no modo Supabase)
  useEffect(() => {
    isFirstLoad.current = true
    fetchData()

    if (!dashboardKey) {
      const intervalId = setInterval(fetchData, 30000)
      return () => clearInterval(intervalId)
    }
  }, [fetchData, dashboardKey])

  // Realtime subscription (somente quando usando Supabase)
  useEffect(() => {
    if (!dashboardKey || !usingSupabase) return

    const channel = supabase
      .channel(`live-sessions-${dashboardKey}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'live_sessions',
          filter: `dashboard_key=eq.${dashboardKey}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newRow = rowToStreamData(payload.new as LiveSessionRow)
            setRawData((prev) => {
              const exists = prev.some(
                (r) => r.date === newRow.date && r.presenter === newRow.presenter,
              )
              if (exists) return prev
              return [newRow, ...prev]
            })
          } else if (payload.eventType === 'UPDATE') {
            const updated = rowToStreamData(payload.new as LiveSessionRow)
            setRawData((prev) =>
              prev.map((r) =>
                r.date === updated.date && r.presenter === updated.presenter ? updated : r,
              ),
            )
          } else if (payload.eventType === 'DELETE') {
            const old = payload.old as { date: string; presenter: string }
            setRawData((prev) =>
              prev.filter((r) => !(r.date === old.date && r.presenter === old.presenter)),
            )
          }
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [dashboardKey, usingSupabase])

  const availableHosts = useMemo(() => {
    const hosts = new Set<string>()
    rawData.forEach((r) => hosts.add(r.presenter))
    return Array.from(hosts).sort()
  }, [rawData])

  const data = useMemo(() => {
    return rawData.filter((row) => {
      const d = parseDateStr(row.date)
      if (filterState.dataInicio && d < startOfDay(filterState.dataInicio)) return false
      if (filterState.dataFim && d > endOfDay(filterState.dataFim)) return false
      if (
        filterState.apresentadores.length > 0 &&
        !filterState.apresentadores.includes(row.presenter)
      )
        return false
      if (filterState.diaSemana !== 'all' && d.getDay().toString() !== filterState.diaSemana)
        return false
      return true
    })
  }, [rawData, filterState])

  const kpis = useMemo(() => calculateKPIs(data), [data])

  return { rawData, data, kpis, isLoading, error, filterState, setFilterState, availableHosts }
}
