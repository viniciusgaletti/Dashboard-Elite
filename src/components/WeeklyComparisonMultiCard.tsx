import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StreamData } from '@/types/stream'
import { formatCurrency } from '@/lib/data-utils'

export function WeeklyComparisonMultiCard({ data }: { data: StreamData[] }) {
  if (!data || data.length === 0) return null

  return (
    <div className="mb-8 animate-fade-in">
      <h3 className="text-headline text-xl font-semibold mb-4 px-1">Histórico Semanal do Dia</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {data.map((d, i) => (
          <Card
            key={i}
            className="glass-panel border-0 hover:shadow-elevation transition-all overflow-hidden relative"
          >
            <div className="absolute top-0 left-0 w-1 h-full bg-accent/50" />
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{d.date}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {d.conversion.toFixed(1)}%{' '}
                <span className="text-xs font-normal text-muted-foreground ml-1">conv.</span>
              </div>
              <div className="text-sm font-medium text-success mt-1">
                {formatCurrency(d.revenue)}
              </div>
              <div className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                <span className="inline-block w-2 h-2 rounded-full bg-primary/50" />
                {d.presenter}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
