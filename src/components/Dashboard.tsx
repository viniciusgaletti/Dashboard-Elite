import { useEffect } from 'react'
import { toast } from 'sonner'
import {
  FileSpreadsheet,
  Users,
  TrendingUp,
  DollarSign,
  LucideIcon,
  Target,
  Calendar,
  Video,
  Award,
  Activity,
} from 'lucide-react'

import { Skeleton } from '@/components/ui/skeleton'
import { KPICard } from '@/components/KPICard'
import { ConversionAreaChart } from '@/components/ConversionAreaChart'
import { StreamTable } from '@/components/StreamTable'
import { useStreamData } from '@/hooks/use-stream-data'

interface DashboardProps {
  csvUrl: string
  title: string
  fullTitle: string
  icon: LucideIcon
}

export function Dashboard({ csvUrl, title, fullTitle, icon: Icon }: DashboardProps) {
  const { data, kpis, isLoading, error } = useStreamData(csvUrl)

  useEffect(() => {
    if (error) toast.error(error)
  }, [error])

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)
  const formatPercent = (val: number) => `${val.toFixed(1)}%`
  const formatNumber = (val: number) =>
    new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1 }).format(val)

  return (
    <div className="animate-fade-in-up h-full flex flex-col space-y-8 pb-12">
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between glass-panel p-6 rounded-2xl">
        <div className="w-full space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary text-primary-foreground shadow-sm">
              <Icon className="w-5 h-5" />
            </div>
            <h2 className="text-large-title text-2xl">{fullTitle}</h2>
          </div>
          <p className="text-body text-muted-foreground">
            Monitore os resultados das suas transmissões e campanhas de {title.toLowerCase()}.
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <Skeleton key={i} className="h-32 rounded-2xl glass-panel" />
            ))}
          </div>
          <Skeleton className="h-[400px] rounded-2xl glass-panel w-full" />
        </div>
      ) : data.length === 0 || !kpis ? (
        <div className="flex flex-col items-center justify-center py-20 glass-panel rounded-2xl text-center">
          <FileSpreadsheet className="w-16 h-16 text-muted-foreground mb-6 opacity-40" />
          <h3 className="text-large-title text-2xl mb-2">Nenhum dado carregado</h3>
          <p className="text-body text-muted-foreground max-w-md">
            Não foi possível carregar os dados para o dashboard. O arquivo pode estar vazio ou
            indisponível.
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <KPICard
              title="Faturamento Total"
              value={formatCurrency(kpis.faturamentoTotal)}
              icon={DollarSign}
              colorClass="text-success"
            />
            <KPICard
              title="Total de Vendas"
              value={formatNumber(kpis.totalVendas)}
              icon={Target}
              colorClass="text-primary"
            />
            <KPICard
              title="Fat. Médio por Live"
              value={formatCurrency(kpis.faturamentoPorLive)}
              icon={DollarSign}
              colorClass="text-success"
            />
            <KPICard
              title="Conversão Média"
              value={formatPercent(kpis.conversaoMedia)}
              icon={TrendingUp}
              colorClass="text-orange-500"
            />
            <KPICard
              title="Melhor Dia"
              value={kpis.melhorDia}
              icon={Calendar}
              colorClass="text-accent"
            />
            <KPICard
              title="Total de Lives"
              value={formatNumber(kpis.totalLives)}
              icon={Video}
              colorClass="text-primary"
            />
            <KPICard
              title="Média Vendas/Live"
              value={formatNumber(kpis.mediaVendasPorLive)}
              icon={Activity}
              colorClass="text-primary"
            />
            <KPICard
              title="Retenção Média"
              value={formatPercent(kpis.retencaoMedia)}
              icon={Users}
              colorClass="text-accent"
            />
            <KPICard
              title="Recorde Vendas"
              value={formatNumber(kpis.recordeVendas)}
              subtitle={`${kpis.recordeVendasApresentador} • ${kpis.recordeVendasData}`}
              icon={Award}
              colorClass="text-yellow-500"
            />
            <KPICard
              title="Recorde Conversão"
              value={formatPercent(kpis.recordeConversao)}
              subtitle={`${kpis.recordeConversaoApresentador} • ${kpis.recordeConversaoData}`}
              icon={Award}
              colorClass="text-yellow-500"
            />
          </div>

          <ConversionAreaChart data={data} />

          <div className="space-y-4">
            <h3 className="text-headline text-xl font-semibold">Detalhamento por Dia</h3>
            <StreamTable data={data} />
          </div>
        </>
      )}
    </div>
  )
}
