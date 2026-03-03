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

export const useStreamData = (url: string): UseStreamDataReturn => {
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
      const fetchUrl = url.includes('?')
        ? `${url}&_t=${new Date().getTime()}`
        : `${url}?_t=${new Date().getTime()}`
      const response = await fetch(fetchUrl)
      if (!response.ok) throw new Error('Falha ao buscar o arquivo CSV')

      const text = await response.text()
      const rows = parseCSV(text).filter((row) => row.some((cell) => cell.trim().length > 0))
      if (rows.length < 2) {
        setRawData([])
        return
      }

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

      const filledData = parsedData.filter(
        (row) => row.views > 0 || row.leads > 0 || row.revenue > 0 || row.sales > 0,
      )
      setRawData(filledData)
    } catch (err) {
      setError('Erro ao carregar dados')
    } finally {
      if (isFirstLoad.current) {
        setIsLoading(false)
        isFirstLoad.current = false
      }
    }
  }, [url])

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
