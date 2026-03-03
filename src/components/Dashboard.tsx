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
import { FilterBar } from '@/components/FilterBar'
import { HostPerformanceChart } from '@/components/HostPerformanceChart'
import { WeekdayEfficiencyChart } from '@/components/WeekdayEfficiencyChart'
import { HostComparisonCard } from '@/components/HostComparisonCard'
import { WeeklyComparisonMultiCard } from '@/components/WeeklyComparisonMultiCard'
import { useStreamData } from '@/hooks/use-stream-data'
import { useDashboardAnalytics } from '@/hooks/use-dashboard-analytics'
import { formatCurrency, formatNumber, formatPercent } from '@/lib/data-utils'

interface DashboardProps {
  csvUrl: string
  title: string
  fullTitle: string
  icon: LucideIcon
}

export function Dashboard({ csvUrl, title, fullTitle, icon: Icon }: DashboardProps) {
  const { rawData, data, kpis, isLoading, error, filterState, setFilterState, availableHosts } =
    useStreamData(csvUrl)
  const { kpiComparisons, hostPerformance, weekdayEfficiency, weeklyComparisonData } =
    useDashboardAnalytics(rawData, data, filterState, kpis)

  useEffect(() => {
    if (error) toast.error(error)
  }, [error])

  return (
    <main className="animate-fade-in-up container max-w-[1600px] w-full py-6 md:py-8 space-y-6 md:space-y-8 relative">
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

      <FilterBar
        filterState={filterState}
        setFilterState={setFilterState}
        availableHosts={availableHosts}
      />

      {isLoading ? (
        <div className="space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4 md:gap-6">
            {Array.from({ length: 10 }).map((_, i) => (
              <Skeleton key={i} className="h-40 rounded-2xl glass-panel" />
            ))}
          </div>
          <Skeleton className="h-[400px] rounded-2xl glass-panel w-full" />
        </div>
      ) : data.length === 0 || !kpis ? (
        <div className="flex flex-col items-center justify-center py-20 glass-panel rounded-2xl text-center">
          <FileSpreadsheet className="w-16 h-16 text-muted-foreground mb-6 opacity-40" />
          <h3 className="text-large-title text-2xl mb-2">Nenhum dado encontrado</h3>
          <p className="text-body text-muted-foreground max-w-md">
            Não foi possível encontrar dados para os filtros selecionados ou o arquivo está vazio.
          </p>
        </div>
      ) : (
        <>
          {filterState.comparisonEnabled && filterState.apresentadores.length !== 1 && (
            <HostComparisonCard data={hostPerformance} />
          )}

          {filterState.weeklyComparisonEnabled && filterState.weeklyComparisonDay !== 'all' && (
            <WeeklyComparisonMultiCard data={weeklyComparisonData} />
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4 md:gap-6">
            <KPICard
              title="Faturamento Total"
              value={formatCurrency(kpis.faturamentoTotal)}
              icon={DollarSign}
              colorClass="text-success"
              comparison={kpiComparisons?.faturamentoTotal}
            />
            <KPICard
              title="Total de Vendas"
              value={formatNumber(kpis.totalVendas)}
              icon={Target}
              colorClass="text-primary"
              comparison={kpiComparisons?.totalVendas}
            />
            <KPICard
              title="Fat. Médio por Live"
              value={formatCurrency(kpis.faturamentoPorLive)}
              icon={DollarSign}
              colorClass="text-success"
              comparison={kpiComparisons?.faturamentoPorLive}
            />
            <KPICard
              title="Conversão Média"
              value={formatPercent(kpis.conversaoMedia)}
              icon={TrendingUp}
              colorClass="text-orange-500"
              comparison={kpiComparisons?.conversaoMedia}
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
              comparison={kpiComparisons?.totalLives}
            />
            <KPICard
              title="Média Vendas/Live"
              value={formatNumber(kpis.mediaVendasPorLive)}
              icon={Activity}
              colorClass="text-primary"
              comparison={kpiComparisons?.mediaVendasPorLive}
            />
            <KPICard
              title="Retenção Média"
              value={formatPercent(kpis.retencaoMedia)}
              icon={Users}
              colorClass="text-accent"
              comparison={kpiComparisons?.retencaoMedia}
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

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <HostPerformanceChart data={hostPerformance} />
            <WeekdayEfficiencyChart data={weekdayEfficiency} />
          </div>

          <ConversionAreaChart data={data} />

          <div className="space-y-4">
            <h3 className="text-headline text-xl font-semibold">Detalhamento por Dia</h3>
            <StreamTable data={data} />
          </div>
        </>
      )}
    </main>
  )
}
