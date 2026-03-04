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
import { ShoppingBag, Trash2 } from 'lucide-react'
import { Sale } from '@/types/goals'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface SalesTableProps {
  sales: Sale[]
  isLoading: boolean
  onDeleteSale?: (id: string) => void
}

const formatCurrency = (val: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)

export function SalesTable({ sales, isLoading, onDeleteSale }: SalesTableProps) {
  if (isLoading) {
    return <Skeleton className="w-full h-96 rounded-2xl glass-panel" />
  }

  if (sales.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 glass-panel rounded-2xl text-center">
        <ShoppingBag className="w-12 h-12 text-muted-foreground mb-4 opacity-50" />
        <h3 className="text-headline mb-2">Nenhuma venda registrada</h3>
        <p className="text-body text-muted-foreground max-w-sm">
          Ainda não há vendas registradas no período. Comece adicionando uma nova venda.
        </p>
      </div>
    )
  }

  return (
    <div className="glass-panel rounded-2xl overflow-hidden">
      <Table>
        <TableHeader className="bg-secondary/30">
          <TableRow className="border-b border-black/5 dark:border-white/5 hover:bg-transparent">
            <TableHead className="font-semibold py-4 text-label-secondary uppercase text-xs tracking-wider">
              Data
            </TableHead>
            <TableHead className="font-semibold py-4 text-label-secondary uppercase text-xs tracking-wider">
              Produto
            </TableHead>
            <TableHead className="font-semibold py-4 text-label-secondary uppercase text-xs tracking-wider text-center">
              Qtd
            </TableHead>
            <TableHead className="font-semibold py-4 text-label-secondary uppercase text-xs tracking-wider">
              Vendedor
            </TableHead>
            <TableHead className="font-semibold py-4 text-label-secondary uppercase text-xs tracking-wider text-right">
              Valor
            </TableHead>
            <TableHead className="font-semibold py-4 text-label-secondary uppercase text-xs tracking-wider text-center">
              Obs.
            </TableHead>
            <TableHead className="font-semibold py-4 text-label-secondary uppercase text-xs tracking-wider text-center">
              Ações
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sales.map((sale) => (
            <TableRow
              key={sale.id}
              className="border-b border-black/5 dark:border-white/5 hover:bg-secondary/20 transition-colors"
            >
              <TableCell className="py-4 whitespace-nowrap">
                {format(parseISO(sale.sale_date), 'dd/MM/yyyy', { locale: ptBR })}
              </TableCell>
              <TableCell className="py-4 font-medium">{sale.product_name}</TableCell>
              <TableCell className="py-4 text-center text-muted-foreground">
                {sale.quantity}
              </TableCell>
              <TableCell className="py-4 text-muted-foreground">
                {sale.seller_name || '—'}
              </TableCell>
              <TableCell className={cn('py-4 text-right font-semibold text-success')}>
                {formatCurrency(sale.sale_value)}
              </TableCell>
              <TableCell className="py-4 text-center text-muted-foreground text-sm">
                {sale.notes || '—'}
              </TableCell>
              <TableCell className="py-4 text-center">
                {onDeleteSale && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    onClick={() => onDeleteSale(sale.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
