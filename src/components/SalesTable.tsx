import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
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

export function SalesTable() {
  const [sales, setSales] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSales = async () => {
      const { data } = await supabase
        .from('sales')
        .select('*')
        .order('sale_date', { ascending: false })
        .limit(15)

      setSales(data || [])
      setLoading(false)
    }
    fetchSales()
  }, [])

  if (loading) return <Skeleton className="w-full h-96 rounded-2xl" />

  return (
    <div className="bg-card rounded-2xl shadow-elevation overflow-hidden border border-black/5 dark:border-white/5">
      <Table>
        <TableHeader className="bg-secondary/50">
          <TableRow className="border-b-0 hover:bg-transparent">
            <TableHead className="font-semibold py-4">Data</TableHead>
            <TableHead className="font-semibold py-4">Produto</TableHead>
            <TableHead className="font-semibold py-4">Qtd</TableHead>
            <TableHead className="font-semibold py-4 text-right">Valor</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sales.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="h-48 text-center text-muted-foreground">
                Nenhuma venda registrada.
              </TableCell>
            </TableRow>
          ) : (
            sales.map((sale) => (
              <TableRow
                key={sale.id}
                className="border-b border-black/5 dark:border-white/5 hover:bg-secondary/20"
              >
                <TableCell className="py-4">
                  {format(parseISO(sale.sale_date), 'dd MMM, yyyy', { locale: ptBR })}
                </TableCell>
                <TableCell className="py-4 font-medium">{sale.product_name}</TableCell>
                <TableCell className="py-4 text-muted-foreground">{sale.quantity}</TableCell>
                <TableCell className="py-4 text-right font-semibold text-primary">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                    sale.sale_value,
                  )}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
