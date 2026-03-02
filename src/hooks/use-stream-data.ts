import { useState, useEffect } from 'react'
import { StreamData } from '@/types/stream'

interface UseStreamDataReturn {
  data: StreamData[]
  isLoading: boolean
  error: string | null
}

export const useStreamData = (url: string): UseStreamDataReturn => {
  const [data, setData] = useState<StreamData[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    const fetchData = async () => {
      if (!url) {
        if (isMounted) setIsLoading(false)
        return
      }

      try {
        if (isMounted) {
          setIsLoading(true)
          setError(null)
        }

        const response = await fetch(url)
        if (!response.ok) {
          throw new Error('Falha ao buscar o arquivo CSV')
        }

        const text = await response.text()
        const rows = text.split('\n').filter((row) => row.trim().length > 0)

        if (rows.length < 2) {
          if (isMounted) setData([])
          return
        }

        const headers = rows[0].split(',').map((h) => h.trim())
        const parsedData: StreamData[] = []

        for (let i = 1; i < rows.length; i++) {
          const values = rows[i].split(',').map((v) => v.trim())
          const rowObj: Record<string, string> = {}

          headers.forEach((header, index) => {
            rowObj[header] = values[index]
          })

          parsedData.push({
            date: rowObj.date || '',
            views: Number(rowObj.views) || 0,
            leads: Number(rowObj.leads) || 0,
            conversion: Number(rowObj.conversion) || 0,
            revenue: Number(rowObj.revenue) || 0,
          })
        }

        if (isMounted) {
          setData(parsedData)
        }
      } catch (err) {
        if (isMounted) {
          setError('Erro ao carregar dados')
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    fetchData()

    return () => {
      isMounted = false
    }
  }, [url])

  return { data, isLoading, error }
}
