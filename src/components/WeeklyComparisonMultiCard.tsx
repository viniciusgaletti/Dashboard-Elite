import { useState } from 'react'
import {
  Area,
  AreaChart,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { StreamData } from '@/types/stream'
import { formatCurrency, formatPercent, formatNumber } from '@/lib/data-utils'
import { Calendar, TrendingUp, TrendingDown } from 'lucide-react'
import { cn } from '@/lib/utils'

const DAYS_MAP: Record<string, string> = {
  '0': 'Domingo',
  '1': 'Segunda',
  '2': 'Terça',
  '3': 'Quarta',
  '4': 'Quinta',
  '5': 'Sexta',
  '6': 'Sábado',
}

type MetricKey = 'revenue' | 'sales' | 'conversion' | 'retention' | 'views'

const METRICS: { key: MetricKey; label: string }[] = [
  { key: 'revenue', label: 'Faturamento' },
  { key: 'sales', label: 'Vendas' },
  { key: 'conversion', label: 'Conversão' },
  { key: 'retention', label: 'Retenção' },
  { key: 'views', label: 'Pico' },
]

function formatMetricValue(key: MetricKey, value: number): string {
  switch (key) {
    case 'revenue':
      return formatCurrency(value)
    case 'conversion':
    case 'retention':
      return formatPercent(value)
    default:
      return formatNumber(value)
  }
}

function VariationBadge({ current, previous }: { current: number; previous: number }) {
  if (previous === 0) return null
  const variation = ((current - previous) / previous) * 100
  const isPositive = variation >= 0
  return (
    <span
      className={cn(
        'inline-flex items-center gap-0.5 text-[11px] font-semibold ml-1.5',
        isPositive ? 'text-emerald-400' : 'text-red-400',
      )}
    >
      {isPositive ? (
        <TrendingUp className="w-3 h-3" />
      ) : (
        <TrendingDown className="w-3 h-3" />
      )}
      {isPositive ? '+' : ''}
      {variation.toFixed(1)}%
    </span>
  )
}

function ComparisonCard({
  entry,
  isNewest,
  referenceEntry,
}: {
  entry: StreamData
  isNewest: boolean
  referenceEntry?: StreamData
}) {
  return (
    <div className="glass-panel rounded-2xl p-5 relative overflow-hidden border border-border/30">
      {isNewest && (
        <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-primary/80 via-primary to-primary/80" />
      )}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-primary" />
          <span className="text-sm font-semibold text-foreground">{entry.date}</span>
        </div>
        {isNewest && (
          <span className="text-[10px] font-semibold uppercase tracking-wider bg-primary/15 text-primary px-2.5 py-1 rounded-full">
            Mais recente
          </span>
        )}
      </div>
      <p className="text-xs text-muted-foreground mb-4">{entry.presenter}</p>
      <div className="space-y-3">
        {METRICS.map(({ key, label }) => (
          <div key={key} className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">{label}</span>
            <div className="flex items-center">
              <span className="text-sm font-semibold text-foreground tabular-nums">
                {formatMetricValue(key, entry[key])}
              </span>
              {isNewest && referenceEntry && (
                <VariationBadge current={entry[key]} previous={referenceEntry[key]} />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function TrendChart({
  data,
  activeMetric,
}: {
  data: StreamData[]
  activeMetric: MetricKey
}) {
  const chartData = [...data].reverse()
  const metricLabel = METRICS.find((m) => m.key === activeMetric)?.label || ''

  const formatTick = (val: number) => {
    switch (activeMetric) {
      case 'revenue':
        return `${(val / 1000).toFixed(0)}k`
      case 'conversion':
      case 'retention':
        return `${val.toFixed(0)}%`
      default:
        return formatNumber(val)
    }
  }

  const formatTooltipVal = (val: number) => {
    return formatMetricValue(activeMetric, val)
  }

  return (
    <ChartContainer
      config={{ [activeMetric]: { label: metricLabel, color: '#D9B979' } }}
      className="h-[200px] w-full"
    >
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
          <defs>
            <linearGradient id="colorTrend" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#D9B979" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#D9B979" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke="hsl(var(--border))" strokeOpacity={0.1} />
          <XAxis
            dataKey="date"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
            dy={10}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
            tickFormatter={formatTick}
          />
          <ChartTooltip
            content={
              <ChartTooltipContent
                className="glass-panel border-0 shadow-elevation [&_.font-mono]:!text-[#D9B979]"
                formatter={(val) => formatTooltipVal(Number(val))}
              />
            }
            cursor={{ stroke: '#D9B979', strokeWidth: 1, strokeDasharray: '4 4' }}
          />
          <Area
            type="monotone"
            dataKey={activeMetric}
            stroke="#D9B979"
            strokeWidth={2.5}
            fillOpacity={1}
            fill="url(#colorTrend)"
            activeDot={{
              r: 5,
              fill: '#D9B979',
              stroke: 'var(--background)',
              strokeWidth: 2,
            }}
            dot={{
              r: 4,
              fill: '#D9B979',
              stroke: 'var(--background)',
              strokeWidth: 2,
            }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}

export function WeeklyComparisonMultiCard({
  data,
  selectedDay,
}: {
  data: StreamData[]
  selectedDay: string
}) {
  const [activeMetric, setActiveMetric] = useState<MetricKey>('revenue')

  if (!data || data.length === 0) return null

  const dayLabel = DAYS_MAP[selectedDay] || selectedDay

  const displayCards = data.slice(0, 2)
  const hasMoreWeeks = data.length > 2

  return (
    <div className="mb-8 animate-fade-in space-y-5">
      <Card className="glass-panel border-0 overflow-hidden">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10">
              <Calendar className="w-4 h-4 text-primary" />
            </div>
            <div>
              <CardTitle className="text-headline text-lg">
                Comparativo Semanal: {dayLabel}
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                {data.length} semana{data.length !== 1 ? 's' : ''} selecionada{data.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Side by side comparison cards — max 2 */}
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
            {displayCards.map((entry, idx) => (
              <ComparisonCard
                key={entry.date}
                entry={entry}
                isNewest={idx === 0}
                referenceEntry={idx === 0 && displayCards.length > 1 ? displayCards[1] : undefined}
              />
            ))}
          </div>
          {hasMoreWeeks && (
            <p className="text-[11px] text-muted-foreground text-center">
              +{data.length - 2} semana{data.length - 2 !== 1 ? 's' : ''} no gráfico de tendência abaixo
            </p>
          )}

          {/* Trend chart section */}
          {data.length > 1 && (
            <div className="space-y-4 pt-4 border-t border-border/20">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <h4 className="text-sm font-medium text-muted-foreground">
                  Tendência ao longo do tempo
                </h4>
                <div className="flex flex-wrap gap-1">
                  {METRICS.map(({ key, label }) => (
                    <button
                      key={key}
                      onClick={() => setActiveMetric(key)}
                      className={cn(
                        'px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all duration-200',
                        activeMetric === key
                          ? 'bg-primary/15 text-primary shadow-sm'
                          : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50',
                      )}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              <TrendChart data={data} activeMetric={activeMetric} />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
