import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { StreamData } from '@/types/stream'

export function StreamTable({ data }: { data: StreamData[] }) {
  if (!data || data.length === 0) return null

  return (
    <div className="glass-panel rounded-2xl overflow-hidden">
      <Table>
        <TableHeader className="bg-secondary/30">
          <TableRow className="border-b border-black/5 dark:border-white/5 hover:bg-transparent">
            <TableHead className="font-semibold py-4 text-label-secondary">Data</TableHead>
            <TableHead className="font-semibold py-4 text-label-secondary text-right">
              Visualizações
            </TableHead>
            <TableHead className="font-semibold py-4 text-label-secondary text-right">
              Leads
            </TableHead>
            <TableHead className="font-semibold py-4 text-label-secondary text-right">
              Conversão
            </TableHead>
            <TableHead className="font-semibold py-4 text-label-secondary text-right">
              Receita
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row, index) => (
            <TableRow
              key={index}
              className="border-b border-black/5 dark:border-white/5 hover:bg-secondary/20 transition-colors"
            >
              <TableCell className="py-4 font-medium">{row.date}</TableCell>
              <TableCell className="py-4 text-right text-muted-foreground">
                {row.views.toLocaleString('pt-BR')}
              </TableCell>
              <TableCell className="py-4 text-right text-muted-foreground">
                {row.leads.toLocaleString('pt-BR')}
              </TableCell>
              <TableCell className="py-4 text-right font-medium text-primary">
                {row.conversion.toFixed(1)}%
              </TableCell>
              <TableCell className="py-4 text-right font-semibold text-success">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                  row.revenue,
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
