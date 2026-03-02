import { useState, useMemo, useEffect } from 'react'
import { toast } from 'sonner'
import { FileSpreadsheet, Eye, Users, TrendingUp, DollarSign, DownloadCloud } from 'lucide-react'

import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { KPICard } from '@/components/KPICard'
import { ConversionAreaChart } from '@/components/ConversionAreaChart'
import { StreamTable } from '@/components/StreamTable'
import { useStreamData } from '@/hooks/use-stream-data'

export default function Index() {
  const [urlInput, setUrlInput] = useState('')
  const [activeUrl, setActiveUrl] = useState('')
  const { data, isLoading, error } = useStreamData(activeUrl)

  useEffect(() => {
    if (error) toast.error(error)
  }, [error])

  const handleLoadCsv = () => {
    if (!urlInput.trim()) {
      toast.error('Por favor, insira uma URL válida.')
      return
    }
    setActiveUrl(urlInput)
  }

  const totals = useMemo(() => {
    if (!data || data.length === 0) return { views: 0, leads: 0, conversion: 0, revenue: 0 }
    return data.reduce(
      (acc, curr) => ({
        views: acc.views + curr.views,
        leads: acc.leads + curr.leads,
        conversion: acc.conversion + curr.conversion,
        revenue: acc.revenue + curr.revenue,
      }),
      { views: 0, leads: 0, conversion: 0, revenue: 0 },
    )
  }, [data])

  const avgConversion = data.length > 0 ? (totals.conversion / data.length).toFixed(1) : '0.0'
  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)

  return (
    <div className="animate-fade-in-up h-full flex flex-col space-y-8 pb-12">
      <div className="flex flex-col md:flex-row gap-4 items-end md:items-center justify-between glass-panel p-6 rounded-2xl">
        <div className="w-full md:w-2/3 space-y-1">
          <h2 className="text-large-title text-2xl">Dashboard de Performance</h2>
          <p className="text-body text-muted-foreground">
            Monitore os resultados das suas transmissões e campanhas.
          </p>
        </div>
        <div className="flex w-full md:w-auto gap-2">
          <Input
            placeholder="URL do arquivo CSV..."
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleLoadCsv()}
            className="w-full md:w-[300px]"
          />
          <Button onClick={handleLoadCsv}>
            <DownloadCloud className="w-4 h-4 mr-2" /> Carregar
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-32 rounded-2xl glass-panel" />
            ))}
          </div>
          <Skeleton className="h-[400px] rounded-2xl glass-panel w-full" />
        </div>
      ) : data.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 glass-panel rounded-2xl text-center">
          <FileSpreadsheet className="w-16 h-16 text-muted-foreground mb-6 opacity-40" />
          <h3 className="text-large-title text-2xl mb-2">Nenhum dado carregado</h3>
          <p className="text-body text-muted-foreground max-w-md">
            Insira uma URL de CSV para visualizar os dados do dashboard. O arquivo deve conter
            colunas de data, visualizações, leads, conversão e receita.
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <KPICard
              title="Visualizações"
              value={totals.views.toLocaleString('pt-BR')}
              icon={Eye}
              colorClass="text-primary"
            />
            <KPICard
              title="Leads"
              value={totals.leads.toLocaleString('pt-BR')}
              icon={Users}
              colorClass="text-accent"
            />
            <KPICard
              title="Taxa de Conversão"
              value={`${avgConversion}%`}
              icon={TrendingUp}
              colorClass="text-orange-500"
            />
            <KPICard
              title="Receita Total"
              value={formatCurrency(totals.revenue)}
              icon={DollarSign}
              colorClass="text-success"
            />
          </div>

          <ConversionAreaChart data={data} />

          <div className="space-y-4">
            <h3 className="text-headline">Detalhamento por Dia</h3>
            <StreamTable data={data} />
          </div>
        </>
      )}
    </div>
  )
}
