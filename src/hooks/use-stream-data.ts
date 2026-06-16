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

function sortStreamData(data: StreamData[]): StreamData[] {
  return [...data].sort((a, b) => parseDateStr(b.date).getTime() - parseDateStr(a.date).getTime())
}

function normalizeStreamData(data: StreamData[]): StreamData[] {
  const deduped = new Map<string, StreamData>()
  data.forEach((row) => {
    const date = row.date.trim()
    const presenter = row.presenter.trim() || 'Desconhecido'
    if (!date) return

    deduped.set(`${date}__${presenter}`, {
      ...row,
      date,
      presenter,
    })
  })

  return sortStreamData(Array.from(deduped.values()))
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
  return normalizeStreamData(data.map(rowToStreamData))
}

function findHeaderRowIndex(rows: string[][]): number {
  return rows.findIndex((row) => {
    const headers = row.map((cell) => normalizeKey(cell))
    return (
      headers.includes('data') &&
      headers.some((header) => ['apresentador', 'host', 'nome', 'mentor'].includes(header)) &&
      headers.some((header) =>
        ['receita', 'faturamento', 'valor', 'faturamento total'].includes(header),
      )
    )
  })
}

function parseCSVWithHeaders(rows: string[][], headerIndex: number): StreamData[] {
  const headers = rows[headerIndex].map((h) => normalizeKey(h))
  const parsedData: StreamData[] = []

  for (let i = headerIndex + 1; i < rows.length; i++) {
    const rowObj: Record<string, string> = {}
    headers.forEach((h, idx) => {
      rowObj[h] = rows[i][idx] ? rows[i][idx].trim() : ''
    })
    parsedData.push({
      date: getVal(rowObj, ['data', 'date']),
      views: parseNumber(
        getVal(rowObj, ['pico', 'pico de pessoas', 'audiencia', 'audiencia maxima', 'max']),
      ),
      leads: parseNumber(getVal(rowObj, ['leads', 'cadastros', 'inscritos', 'participantes'])),
      conversion: parseNumber(getVal(rowObj, ['conversao', 'tx conversao', 'taxa de conversao'])),
      revenue: parseNumber(
        getVal(rowObj, ['receita', 'faturamento', 'valor', 'faturamento total']),
      ),
      sales: parseNumber(
        getVal(rowObj, ['vendas', 'qtdvendas', 'qtd vendas', 'quantidade', 'numero de vendas']),
      ),
      presenter: getVal(rowObj, ['apresentador', 'host', 'nome', 'mentor']) || 'Desconhecido',
      retention: parseNumber(getVal(rowObj, ['retencao', 'tx retencao', 'taxa de retencao'])),
    })
  }

  return parsedData
}

function parseHeaderlessCSV(rows: string[][]): StreamData[] {
  return rows.map((row) => ({
    date: row[0]?.trim() || '',
    views: parseNumber(row[2] || ''),
    leads: parseNumber(row[3] || ''),
    sales: parseNumber(row[4] || ''),
    presenter: row[5]?.trim() || 'Desconhecido',
    conversion: parseNumber(row[6] || ''),
    retention: parseNumber(row[7] || ''),
    revenue: parseNumber(row[8] || ''),
  }))
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

  const headerIndex = findHeaderRowIndex(rows)
  const parsedData =
    headerIndex >= 0 ? parseCSVWithHeaders(rows, headerIndex) : parseHeaderlessCSV(rows)
  return normalizeStreamData(
    parsedData.filter((row) => row.views > 0 || row.leads > 0 || row.revenue > 0 || row.sales > 0),
  )
}

export const useStreamData = (url: string, dashboardKey?: string): UseStreamDataReturn => {
  const [rawData, setRawData] = useState<StreamData[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
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

      try {
        const result = await fetchFromCSV(url)
        if (result.length > 0) {
          setRawData(result)
          return
        }

        if (!dashboardKey) {
          setRawData([])
          return
        }

        const fallback = await fetchFromSupabase(dashboardKey)
        if (fallback === null) {
          setRawData([])
          return
        }
        setRawData(fallback)
        setError('A planilha retornou vazia; exibindo último cache disponível.')
      } catch (csvError) {
        if (!dashboardKey) throw csvError

        const fallback = await fetchFromSupabase(dashboardKey)
        if (fallback === null) throw csvError
        setRawData(fallback)
        setError('A planilha não respondeu; exibindo último cache disponível.')
      }
    } catch (err) {
      setError('Erro ao carregar dados')
    } finally {
      if (isFirstLoad.current) {
        setIsLoading(false)
        isFirstLoad.current = false
      }
    }
  }, [url, dashboardKey])

  // The published sheet is the canonical source. Polling keeps edits reflected without a reload.
  useEffect(() => {
    isFirstLoad.current = true
    fetchData()

    const intervalId = setInterval(fetchData, 30000)
    return () => clearInterval(intervalId)
  }, [fetchData])

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
