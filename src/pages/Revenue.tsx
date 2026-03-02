import { useEffect, useState, useMemo } from 'react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Plus, Target, DollarSign } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Card, CardContent } from '@/components/ui/card'
import { SalesTable } from '@/components/SalesTable'
import { SaleRegistrationDialog } from '@/components/SaleRegistrationDialog'
import { useGoals } from '@/hooks/use-goals'
import { useRevenue } from '@/hooks/use-revenue'

export default function Revenue() {
  const { goals, fetchGoals } = useGoals()
  const { sales, fetchSales, isLoadingSales, insertSale } = useRevenue()
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  useEffect(() => {
    fetchGoals()
    fetchSales()
  }, [fetchGoals, fetchSales])

  const { progress, currentSales, targetValue } = useMemo(() => {
    const currentMonth = new Date().getMonth() + 1
    const currentYear = new Date().getFullYear()
    const currentGoal = goals.find((g) => g.month === currentMonth && g.year === currentYear)
    const target = currentGoal?.target_value || 0

    const monthSales = sales
      .filter((s) => {
        const d = new Date(s.sale_date)
        return d.getMonth() + 1 === currentMonth && d.getFullYear() === currentYear
      })
      .reduce((acc, curr) => acc + curr.sale_value, 0)

    const prog = target > 0 ? Math.min((monthSales / target) * 100, 100) : 0
    return { progress: prog, currentSales: monthSales, targetValue: target }
  }, [goals, sales])

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)

  return (
    <div className="space-y-8 animate-fade-in-up pb-12">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h2 className="text-large-title text-3xl">Gestão de Receita</h2>
          <p className="text-body text-muted-foreground mt-1">
            Acompanhe suas metas e registre novas vendas.
          </p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)} className="w-full sm:w-auto">
          <Plus className="w-4 h-4 mr-2" /> Registrar Venda
        </Button>
      </div>

      <Card className="glass-panel border-0">
        <CardContent className="p-6 md:p-8">
          <div className="flex flex-col md:flex-row gap-8 items-center">
            <div className="w-full md:w-1/3 flex flex-col space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-secondary text-primary">
                  <Target className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-caption text-muted-foreground uppercase tracking-wider font-semibold">
                    Progresso da Meta
                  </p>
                  <p className="text-body font-medium">
                    {format(new Date(), 'MMMM, yyyy', { locale: ptBR })}
                  </p>
                </div>
              </div>
              <div>
                <span className="text-large-title">{progress.toFixed(1)}%</span>
                <span className="text-body text-muted-foreground ml-2">alcançado</span>
              </div>
            </div>

            <div className="w-full md:w-2/3 space-y-4">
              <div className="flex justify-between text-sm font-medium">
                <span className="flex items-center text-success">
                  <DollarSign className="w-4 h-4 mr-1" /> {formatCurrency(currentSales)}
                </span>
                <span className="text-muted-foreground">
                  Meta: {targetValue > 0 ? formatCurrency(targetValue) : 'Não definida'}
                </span>
              </div>
              <Progress value={progress} className="h-4 rounded-full" />
              {targetValue === 0 && (
                <p className="text-caption text-orange-500 text-right">
                  Configure uma meta mensal nas configurações para habilitar o acompanhamento.
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h3 className="text-headline">Últimas Vendas</h3>
        <SalesTable sales={sales} isLoading={isLoadingSales} />
      </div>

      <SaleRegistrationDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onInsertSale={insertSale}
      />
    </div>
  )
}
