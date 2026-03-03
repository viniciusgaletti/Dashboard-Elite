import { Area, AreaChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StreamData } from '@/types/stream'

export function ConversionAreaChart({ data }: { data: StreamData[] }) {
  if (!data || data.length === 0) return null

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
      <Card className="glass-panel border-0">
        <CardHeader>
          <CardTitle className="text-headline">Visualizações e Leads (Conversão)</CardTitle>
        </CardHeader>
        <CardContent className="pb-4">
          <ChartContainer
            config={{
              views: { label: 'Visualizações', color: '#D9B979' },
              leads: { label: 'Leads', color: '#D9B979' },
            }}
            className="h-[300px] w-full"
          >
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#D9B979" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#D9B979" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke="hsl(var(--border))" strokeOpacity={0.1} />
                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                  dy={10}
                />
                <YAxis
                  yAxisId="left"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                />
                <ChartTooltip
                  content={
                    <ChartTooltipContent className="glass-panel border-0 shadow-elevation [&_.font-mono]:!text-[#D9B979]" />
                  }
                  cursor={{ stroke: '#D9B979', strokeWidth: 1, strokeDasharray: '4 4' }}
                />
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="views"
                  stroke="#D9B979"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorViews)"
                  activeDot={{ r: 6, fill: '#D9B979', stroke: 'var(--background)', strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card className="glass-panel border-0">
        <CardHeader>
          <CardTitle className="text-headline">Receita Total</CardTitle>
        </CardHeader>
        <CardContent className="pb-4">
          <ChartContainer
            config={{ revenue: { label: 'Receita', color: '#D9B979' } }}
            className="h-[300px] w-full"
          >
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#D9B979" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#D9B979" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke="hsl(var(--border))" strokeOpacity={0.1} />
                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                  tickFormatter={(val) => `R$ ${(val / 1000).toFixed(0)}k`}
                />
                <ChartTooltip
                  content={
                    <ChartTooltipContent className="glass-panel border-0 shadow-elevation [&_.font-mono]:!text-[#D9B979]" />
                  }
                  cursor={{ stroke: '#D9B979', strokeWidth: 1, strokeDasharray: '4 4' }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#D9B979"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorRev)"
                  activeDot={{ r: 6, fill: '#D9B979', stroke: 'var(--background)', strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  )
}
