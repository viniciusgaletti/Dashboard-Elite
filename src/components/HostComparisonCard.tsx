import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { HostKPIData } from '@/types/stream'
import { formatCurrency } from '@/lib/data-utils'

export function HostComparisonCard({ data }: { data: HostKPIData[] }) {
  if (!data || data.length < 2) return null

  return (
    <div className="mb-8 animate-fade-in">
      <h3 className="text-headline text-xl font-semibold mb-4 px-1">
        Comparativo de Apresentadores
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {data.map((d, i) => (
          <Card
            key={i}
            className="glass-panel border-white/10 hover:shadow-elevation transition-all"
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold text-foreground line-clamp-1">
                {d.host}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-end">
                  <span className="text-sm font-medium text-muted-foreground">Conversão</span>
                  <span className="font-bold text-lg text-primary">
                    {d.conversaoMedia.toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between items-end">
                  <span className="text-sm font-medium text-muted-foreground">Faturamento</span>
                  <span className="font-bold text-md text-success">
                    {formatCurrency(d.faturamentoTotal)}
                  </span>
                </div>
                <div className="flex justify-between items-end">
                  <span className="text-sm font-medium text-muted-foreground">Vendas</span>
                  <span className="font-bold text-md">{d.totalVendas.toLocaleString('pt-BR')}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
