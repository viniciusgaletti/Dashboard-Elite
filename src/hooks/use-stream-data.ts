import { useState, useEffect, useCallback, useRef } from 'react'
import { StreamData, KPIData } from '@/types/stream'

interface UseStreamDataReturn {
  data: StreamData[]
  kpis: KPIData | null
  isLoading: boolean
  error: string | null
}

const cleanNumeric = (val: any): string => {
  if (typeof val !== 'string') val = String(val)
  if (val.includes('#')) return '0'
  let clean = val
    .replace(/R\$\s?/g, '')
    .replace('%', '')
    .trim()
  if (clean.includes('.') && clean.includes(',')) {
    clean =
      clean.lastIndexOf(',') > clean.lastIndexOf('.')
        ? clean.replace(/\./g, '').replace(',', '.')
        : clean.replace(/,/g, '')
  } else if (clean.includes(',')) {
    clean = clean.replace(',', '.')
  }
  return clean.replace(/[^\d.-]/g, '')
}

const parseNumber = (val: any): number => {
  const num = Number(cleanNumeric(val))
  return isNaN(num) ? 0 : num
}
const parseCurrency = parseNumber
const parsePercentage = parseNumber

const normalizeKey = (key: string) =>
  key
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()

const getVal = (rowObj: Record<string, string>, aliases: string[]) => {
  for (const alias of aliases) if (rowObj[alias] !== undefined) return rowObj[alias]
  return ''
}

function parseCSV(text: string) {
  const result: string[][] = []
  let row: string[] = []
  let current = ''
  let inQuotes = false
  for (let i = 0; i < text.length; i++) {
    const char = text[i]
    if (inQuotes) {
      if (char === '"') {
        if (text[i + 1] === '"') {
          current += '"'
          i++
        } else inQuotes = false
      } else current += char
    } else {
      if (char === '"') inQuotes = true
      else if (char === ',') {
        row.push(current)
        current = ''
      } else if (char === '\n' || char === '\r') {
        row.push(current)
        result.push(row)
        row = []
        current = ''
        if (char === '\r' && text[i + 1] === '\n') i++
      } else current += char
    }
  }
  if (current || row.length > 0) {
    row.push(current)
    result.push(row)
  }
  return result
}

const calculateKPIs = (data: StreamData[]): KPIData => {
  if (!data.length)
    return {
      faturamentoTotal: 0,
      totalVendas: 0,
      faturamentoPorLive: 0,
      conversaoMedia: 0,
      melhorDia: '-',
      totalLives: 0,
      mediaVendasPorLive: 0,
      retencaoMedia: 0,
      recordeVendas: 0,
      recordeVendasApresentador: '-',
      recordeVendasData: '-',
      recordeConversao: 0,
      recordeConversaoApresentador: '-',
      recordeConversaoData: '-',
    }
  const faturamentoTotal = data.reduce((acc, curr) => acc + curr.revenue, 0)
  const totalVendas = data.reduce((acc, curr) => acc + curr.sales, 0)
  const totalLives = data.length
  let melhorDia = data[0].date
  let maxFaturamento = data[0].revenue
  let recordeVendas = data[0].sales
  let recVendasApr = data[0].presenter
  let recVendasData = data[0].date
  let recordeConversao = data[0].conversion
  let recConvApr = data[0].presenter
  let recConvData = data[0].date

  data.forEach((row) => {
    if (row.revenue > maxFaturamento) {
      maxFaturamento = row.revenue
      melhorDia = row.date
    }
    if (row.sales > recordeVendas) {
      recordeVendas = row.sales
      recVendasApr = row.presenter
      recVendasData = row.date
    }
    if (row.conversion > recordeConversao) {
      recordeConversao = row.conversion
      recConvApr = row.presenter
      recConvData = row.date
    }
  })

  return {
    faturamentoTotal,
    totalVendas,
    faturamentoPorLive: faturamentoTotal / totalLives,
    conversaoMedia: data.reduce((acc, curr) => acc + curr.conversion, 0) / totalLives,
    melhorDia,
    totalLives,
    mediaVendasPorLive: totalVendas / totalLives,
    retencaoMedia: data.reduce((acc, curr) => acc + curr.retention, 0) / totalLives,
    recordeVendas,
    recordeVendasApresentador: recVendasApr,
    recordeVendasData: recVendasData,
    recordeConversao,
    recordeConversaoApresentador: recConvApr,
    recordeConversaoData: recConvData,
  }
}

export const useStreamData = (url: string): UseStreamDataReturn => {
  const [data, setData] = useState<StreamData[]>([])
  const [kpis, setKpis] = useState<KPIData | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const isFirstLoad = useRef(true)

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
        setData([])
        setKpis(calculateKPIs([]))
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
          views: parseNumber(getVal(rowObj, ['pico de pessoas', 'pico', 'audiencia', 'max'])),
          leads: parseNumber(getVal(rowObj, ['leads', 'cadastros'])),
          conversion: parsePercentage(
            getVal(rowObj, ['conversao', 'tx conversao', 'taxa de conversao']),
          ),
          revenue: parseCurrency(
            getVal(rowObj, ['faturamento', 'valor', 'receita', 'faturamento total']),
          ),
          sales: parseNumber(
            getVal(rowObj, ['numero de vendas', 'vendas', 'qtd vendas', 'quantidade']),
          ),
          presenter: getVal(rowObj, ['apresentador', 'host', 'nome']) || 'Desconhecido',
          retention: parsePercentage(
            getVal(rowObj, ['retencao', 'tx retencao', 'taxa de retencao']),
          ),
        })
      }
      setData(parsedData)
      setKpis(calculateKPIs(parsedData))
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

  return { data, kpis, isLoading, error }
}
