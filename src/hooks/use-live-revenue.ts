import { useState, useEffect, useCallback, useRef } from 'react'

export interface LiveRevenueData {
  date: string
  revenue: number
}

interface UseLiveRevenueReturn {
  data: LiveRevenueData[]
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

const parseCurrency = (val: any): number => {
  const num = Number(cleanNumeric(val))
  return isNaN(num) ? 0 : num
}

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

export const useLiveRevenue = (url: string): UseLiveRevenueReturn => {
  const [data, setData] = useState<LiveRevenueData[]>([])
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
        return
      }

      const headers = rows[0].map((h) => normalizeKey(h))
      const parsedData: LiveRevenueData[] = []
      for (let i = 1; i < rows.length; i++) {
        const rowObj: Record<string, string> = {}
        headers.forEach((h, idx) => {
          rowObj[h] = rows[i][idx] ? rows[i][idx].trim() : ''
        })

        parsedData.push({
          date: getVal(rowObj, ['data']),
          revenue: parseCurrency(
            getVal(rowObj, ['faturamento', 'valor', 'receita', 'faturamento total']),
          ),
        })
      }
      setData(parsedData)
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

  return { data, isLoading, error }
}
