import { Bar, BarChart, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart'
import { HostKPIData } from '@/types/stream'

export function HostPerformanceChart({ data }: { data: HostKPIData[] }) {
  if (!data || data.length === 0) return null

  return (
    <Card className="glass-panel border-0 hover:shadow-elevation transition-all">
      <CardHeader>
        <CardTitle className="text-headline text-lg">
          Performance por Apresentador (Conversão)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{ conversaoMedia: { label: 'Conversão', color: 'hsl(var(--primary))' } }}
          className="h-[300px] w-full"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical" margin={{ left: 0, right: 20 }}>
              <XAxis type="number" hide />
              <YAxis
                dataKey="host"
                type="category"
                axisLine={false}
                tickLine={false}
                width={110}
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
              />
              <Tooltip
                cursor={{ fill: 'var(--secondary)' }}
                content={<ChartTooltipContent formatter={(val) => `${Number(val).toFixed(1)}%`} />}
              />
              <Bar
                dataKey="conversaoMedia"
                fill="var(--color-conversaoMedia)"
                radius={[0, 4, 4, 0]}
                barSize={32}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
