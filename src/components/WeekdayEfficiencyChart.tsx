import { Bar, BarChart, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart'
import { WeekdayKPIData } from '@/types/stream'

export function WeekdayEfficiencyChart({ data }: { data: WeekdayKPIData[] }) {
  if (!data || data.length === 0) return null

  return (
    <Card className="glass-panel border-0 hover:shadow-elevation transition-all">
      <CardHeader>
        <CardTitle className="text-headline text-lg">
          Eficiência por Dia da Semana (Conversão)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{ conversaoMedia: { label: 'Conversão', color: 'hsl(var(--success))' } }}
          className="h-[300px] w-full"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, bottom: 0, left: -20 }}>
              <XAxis
                dataKey="weekday"
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                dy={10}
              />
              <YAxis hide />
              <Tooltip
                cursor={{ fill: 'var(--secondary)' }}
                content={<ChartTooltipContent formatter={(val) => `${Number(val).toFixed(1)}%`} />}
              />
              <Bar
                dataKey="conversaoMedia"
                fill="var(--color-conversaoMedia)"
                radius={[4, 4, 0, 0]}
                barSize={40}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
