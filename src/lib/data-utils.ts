import { StreamData, KPIData } from '@/types/stream'

export const formatCurrency = (val: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)
export const formatPercent = (val: number) => `${val.toFixed(1)}%`
export const formatNumber = (val: number) =>
  new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1 }).format(val)

export const cleanNumeric = (val: any): string => {
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

export const parseNumber = (val: any): number => {
  const num = Number(cleanNumeric(val))
  return isNaN(num) ? 0 : num
}

export const normalizeKey = (key: string) =>
  key
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()

export const getVal = (rowObj: Record<string, string>, aliases: string[]) => {
  for (const alias of aliases) if (rowObj[alias] !== undefined) return rowObj[alias]
  return ''
}

export function parseCSV(text: string) {
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

export const parseDateStr = (dateStr: string) => {
  if (!dateStr) return new Date(0)
  const parts = String(dateStr).split('/')
  if (parts.length !== 3) return new Date(0)
  const [d, m, y] = parts
  return new Date(Number(y), Number(m) - 1, Number(d))
}

export const calculateKPIs = (data: StreamData[]): KPIData => {
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
