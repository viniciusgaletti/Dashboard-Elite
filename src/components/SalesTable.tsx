import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Skeleton } from '@/components/ui/skeleton'
import { ShoppingBag } from 'lucide-react'
import { Sale } from '@/types/goals'

interface SalesTableProps {
  sales: Sale[]
  isLoading: boolean
}

export function SalesTable({ sales, isLoading }: SalesTableProps) {
  if (isLoading) {
    return <Skeleton className="w-full h-96 rounded-2xl glass-panel" />
  }

  if (sales.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 glass-panel rounded-2xl text-center">
        <ShoppingBag className="w-12 h-12 text-muted-foreground mb-4 opacity-50" />
        <h3 className="text-headline mb-2">Nenhuma venda registrada</h3>
        <p className="text-body text-muted-foreground max-w-sm">
          Ainda não há dados financeiros. Comece adicionando uma nova venda para acompanhar seu
          progresso.
        </p>
      </div>
    )
  }

  return (
    <div className="glass-panel rounded-2xl overflow-hidden">
      <Table>
        <TableHeader className="bg-secondary/30">
          <TableRow className="border-b border-black/5 dark:border-white/5 hover:bg-transparent">
            <TableHead className="font-semibold py-4 text-label-secondary">Data</TableHead>
            <TableHead className="font-semibold py-4 text-label-secondary">Produto</TableHead>
            <TableHead className="font-semibold py-4 text-label-secondary text-right">
              Qtd
            </TableHead>
            <TableHead className="font-semibold py-4 text-label-secondary text-right">
              Valor
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sales.map((sale) => (
            <TableRow
              key={sale.id}
              className="border-b border-black/5 dark:border-white/5 hover:bg-secondary/20 transition-colors"
            >
              <TableCell className="py-4">
                {format(parseISO(sale.sale_date), 'dd MMM, yyyy', { locale: ptBR })}
              </TableCell>
              <TableCell className="py-4 font-medium">{sale.product_name}</TableCell>
              <TableCell className="py-4 text-right text-muted-foreground">
                {sale.quantity}
              </TableCell>
              <TableCell className="py-4 text-right font-semibold text-success">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                  sale.sale_value,
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
