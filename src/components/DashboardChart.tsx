import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Area, AreaChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { format, subDays, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export function DashboardChart() {
  const [data, setData] = useState<{ date: string; revenue: number; rawDate: string }[]>([])

  useEffect(() => {
    const fetchChartData = async () => {
      const thirtyDaysAgo = format(subDays(new Date(), 14), 'yyyy-MM-dd') // Show last 14 days for better fit

      const { data: sales } = await supabase
        .from('sales')
        .select('sale_value, sale_date')
        .gte('sale_date', thirtyDaysAgo)
        .order('sale_date', { ascending: true })

      if (!sales) return

      // Aggregate by date
      const aggregated: Record<string, number> = {}
      sales.forEach((s) => {
        aggregated[s.sale_date] = (aggregated[s.sale_date] || 0) + Number(s.sale_value)
      })

      // Fill missing days
      const finalData = []
      for (let i = 14; i >= 0; i--) {
        const d = format(subDays(new Date(), i), 'yyyy-MM-dd')
        finalData.push({
          rawDate: d,
          date: format(parseISO(d), 'dd MMM', { locale: ptBR }),
          revenue: aggregated[d] || 0,
        })
      }
      setData(finalData)
    }

    fetchChartData()
  }, [])

  if (data.length === 0) return null

  return (
    <Card className="shadow-elevation border-0 bg-card">
      <CardHeader>
        <CardTitle className="text-headline">Faturamento (Últimos 15 dias)</CardTitle>
      </CardHeader>
      <CardContent className="pb-4">
        <ChartContainer
          config={{ revenue: { label: 'Faturamento', color: 'hsl(var(--primary))' } }}
          className="h-[300px] w-full"
        >
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-revenue)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="var(--color-revenue)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="hsl(var(--border))"
                opacity={0.4}
              />
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
                content={<ChartTooltipContent />}
                cursor={{ stroke: 'hsl(var(--primary))', strokeWidth: 1, strokeDasharray: '4 4' }}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="var(--color-revenue)"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorRev)"
                activeDot={{ r: 6, fill: 'var(--color-revenue)', stroke: '#fff', strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
