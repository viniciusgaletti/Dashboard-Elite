import { Area, AreaChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Line } from 'recharts'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StreamData } from '@/types/stream'
import { parseDateStr } from '@/lib/data-utils'

interface ChartDataPoint {
  date: string
  revenue: number
  conversion: number
  prevRevenue?: number
  prevConversion?: number
}

export function ConversionAreaChart({
  data,
  previousData,
  comparisonEnabled,
}: {
  data: StreamData[]
  previousData?: StreamData[]
  comparisonEnabled?: boolean
}) {
  if (!data || data.length === 0) return null

  const showComparison = comparisonEnabled && previousData && previousData.length > 0

  // Merge current and previous data by index (not date) for overlay
  const chartData: ChartDataPoint[] = data.map((d, idx) => ({
    date: d.date,
    revenue: d.revenue,
    conversion: d.conversion,
    prevRevenue: showComparison && previousData[idx] ? previousData[idx].revenue : undefined,
    prevConversion: showComparison && previousData[idx] ? previousData[idx].conversion : undefined,
  }))

  // If previous has more data points, add them too
  if (showComparison && previousData.length > data.length) {
    for (let i = data.length; i < previousData.length; i++) {
      chartData.push({
        date: previousData[i].date,
        revenue: 0,
        conversion: 0,
        prevRevenue: previousData[i].revenue,
        prevConversion: previousData[i].conversion,
      })
    }
  }

  // Sort chronologically: oldest → newest (left to right)
  chartData.sort((a, b) => parseDateStr(a.date).getTime() - parseDateStr(b.date).getTime())

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
      <Card className="glass-panel border-0">
        <CardHeader>
          <CardTitle className="text-headline">Evolução do Faturamento</CardTitle>
        </CardHeader>
        <CardContent className="pb-4">
          <ChartContainer
            config={{
              revenue: { label: 'Faturamento', color: '#319C8A' },
              ...(showComparison
                ? { prevRevenue: { label: 'Período Anterior', color: '#319C8A' } }
                : {}),
            }}
            className="h-[300px] w-full"
          >
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#319C8A" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#319C8A" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke="hsl(var(--border))" strokeOpacity={0.1} />
                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                  dy={10}
                  interval="preserveStartEnd"
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                  tickFormatter={(val) => `R$ ${(val / 1000).toFixed(0)}k`}
                />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      className="glass-panel border-0 shadow-elevation [&_.font-mono]:!text-[#319C8A]"
                      formatter={(val) =>
                        `R$ ${Number(val).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
                      }
                    />
                  }
                  cursor={{ stroke: '#319C8A', strokeWidth: 1, strokeDasharray: '4 4' }}
                />
                {showComparison && (
                  <Line
                    type="monotone"
                    dataKey="prevRevenue"
                    stroke="#319C8A"
                    strokeWidth={2}
                    strokeDasharray="6 4"
                    strokeOpacity={0.4}
                    dot={false}
                    activeDot={false}
                    connectNulls
                    name="Período Anterior"
                  />
                )}
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#319C8A"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorRevenue)"
                  activeDot={{ r: 6, fill: '#319C8A', stroke: 'var(--background)', strokeWidth: 2 }}
                  name="Faturamento"
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartContainer>
          {showComparison && (
            <div className="flex items-center gap-4 mt-3 px-1">
              <div className="flex items-center gap-1.5">
                <div className="w-4 h-0.5 bg-[#319C8A] rounded" />
                <span className="text-[10px] text-muted-foreground">Atual</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div
                  className="w-4 h-0.5 bg-[#319C8A]/40 rounded"
                  style={{ borderTop: '2px dashed rgba(49,156,138,0.4)' }}
                />
                <span className="text-[10px] text-muted-foreground">Anterior</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="glass-panel border-0">
        <CardHeader>
          <CardTitle className="text-headline">Evolução da Taxa de Conversão</CardTitle>
        </CardHeader>
        <CardContent className="pb-4">
          <ChartContainer
            config={{
              conversion: { label: 'Conversão', color: '#319C8A' },
              ...(showComparison
                ? { prevConversion: { label: 'Período Anterior', color: '#319C8A' } }
                : {}),
            }}
            className="h-[300px] w-full"
          >
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorConversion" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#319C8A" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#319C8A" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke="hsl(var(--border))" strokeOpacity={0.1} />
                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                  dy={10}
                  interval="preserveStartEnd"
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                  tickFormatter={(val) => `${val.toFixed(0)}%`}
                />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      className="glass-panel border-0 shadow-elevation [&_.font-mono]:!text-[#319C8A]"
                      formatter={(val) => `${Number(val).toFixed(1)}%`}
                    />
                  }
                  cursor={{ stroke: '#319C8A', strokeWidth: 1, strokeDasharray: '4 4' }}
                />
                {showComparison && (
                  <Line
                    type="monotone"
                    dataKey="prevConversion"
                    stroke="#319C8A"
                    strokeWidth={2}
                    strokeDasharray="6 4"
                    strokeOpacity={0.4}
                    dot={false}
                    activeDot={false}
                    connectNulls
                    name="Período Anterior"
                  />
                )}
                <Area
                  type="monotone"
                  dataKey="conversion"
                  stroke="#319C8A"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorConversion)"
                  activeDot={{ r: 6, fill: '#319C8A', stroke: 'var(--background)', strokeWidth: 2 }}
                  name="Conversão"
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartContainer>
          {showComparison && (
            <div className="flex items-center gap-4 mt-3 px-1">
              <div className="flex items-center gap-1.5">
                <div className="w-4 h-0.5 bg-[#319C8A] rounded" />
                <span className="text-[10px] text-muted-foreground">Atual</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div
                  className="w-4 h-0.5 bg-[#319C8A]/40 rounded"
                  style={{ borderTop: '2px dashed rgba(49,156,138,0.4)' }}
                />
                <span className="text-[10px] text-muted-foreground">Anterior</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
