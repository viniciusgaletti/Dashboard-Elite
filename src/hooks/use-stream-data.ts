import { useState, useEffect, useCallback, useRef } from 'react'
import { StreamData, KPIData } from '@/types/stream'

interface UseStreamDataReturn {
  data: StreamData[]
  kpis: KPIData | null
  isLoading: boolean
  error: string | null
}

const calculateKPIs = (data: StreamData[]): KPIData => {
  if (data.length === 0) {
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
  }

  const faturamentoTotal = data.reduce((acc, curr) => acc + curr.revenue, 0)
  const totalVendas = data.reduce((acc, curr) => acc + curr.sales, 0)
  const totalLives = data.length

  const faturamentoPorLive = totalLives > 0 ? faturamentoTotal / totalLives : 0
  const conversaoMedia =
    totalLives > 0 ? data.reduce((acc, curr) => acc + curr.conversion, 0) / totalLives : 0
  const mediaVendasPorLive = totalLives > 0 ? totalVendas / totalLives : 0
  const retencaoMedia =
    totalLives > 0 ? data.reduce((acc, curr) => acc + curr.retention, 0) / totalLives : 0

  let melhorDia = data[0].date
  let maxFaturamento = data[0].revenue

  let recordeVendas = data[0].sales
  let recordeVendasApresentador = data[0].presenter
  let recordeVendasData = data[0].date

  let recordeConversao = data[0].conversion
  let recordeConversaoApresentador = data[0].presenter
  let recordeConversaoData = data[0].date

  data.forEach((row) => {
    if (row.revenue > maxFaturamento) {
      maxFaturamento = row.revenue
      melhorDia = row.date
    }
    if (row.sales > recordeVendas) {
      recordeVendas = row.sales
      recordeVendasApresentador = row.presenter
      recordeVendasData = row.date
    }
    if (row.conversion > recordeConversao) {
      recordeConversao = row.conversion
      recordeConversaoApresentador = row.presenter
      recordeConversaoData = row.date
    }
  })

  return {
    faturamentoTotal,
    totalVendas,
    faturamentoPorLive,
    conversaoMedia,
    melhorDia,
    totalLives,
    mediaVendasPorLive,
    retencaoMedia,
    recordeVendas,
    recordeVendasApresentador,
    recordeVendasData,
    recordeConversao,
    recordeConversaoApresentador,
    recordeConversaoData,
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
      if (isFirstLoad.current) {
        setIsLoading(true)
      }
      setError(null)

      const cacheBuster = `_t=${new Date().getTime()}`
      const fetchUrl = url.includes('?') ? `${url}&${cacheBuster}` : `${url}?${cacheBuster}`

      const response = await fetch(fetchUrl)
      if (!response.ok) {
        throw new Error('Falha ao buscar o arquivo CSV')
      }

      const text = await response.text()
      const rows = text.split('\n').filter((row) => row.trim().length > 0)

      if (rows.length < 2) {
        setData([])
        setKpis(calculateKPIs([]))
        return
      }

      const headers = rows[0].split(',').map((h) => h.trim().toLowerCase())
      const parsedData: StreamData[] = []

      for (let i = 1; i < rows.length; i++) {
        const values = rows[i].split(',').map((v) => v.trim())
        const rowObj: Record<string, string> = {}

        headers.forEach((header, index) => {
          rowObj[header] = values[index] || ''
        })

        parsedData.push({
          date: rowObj.date || rowObj.data || '',
          views: Number(rowObj.views || rowObj.visualizacoes) || 0,
          leads: Number(rowObj.leads) || 0,
          conversion: Number(rowObj.conversion || rowObj.conversao) || 0,
          revenue: Number(rowObj.revenue || rowObj.faturamento) || 0,
          sales: Number(rowObj.sales || rowObj.vendas || rowObj.leads) || 0,
          presenter: rowObj.presenter || rowObj.apresentador || 'Desconhecido',
          retention: Number(rowObj.retention || rowObj.retencao) || 0,
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

    const intervalId = setInterval(() => {
      fetchData()
    }, 30000)

    return () => {
      clearInterval(intervalId)
    }
  }, [fetchData])

  return { data, kpis, isLoading, error }
}
