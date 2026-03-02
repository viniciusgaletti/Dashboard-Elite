import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Progress } from '@/components/ui/progress'
import { DollarSign, Target, Package, TrendingUp } from 'lucide-react'
import { format } from 'date-fns'

export function DashboardStats() {
  const [stats, setStats] = useState({
    today: 0,
    goal: 0,
    monthProgress: 0,
    products: 0,
    conversion: 14.5,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      const today = format(new Date(), 'yyyy-MM-dd')
      const currentMonth = new Date().getMonth() + 1
      const currentYear = new Date().getFullYear()

      // Parallel fetching for performance
      const [salesRes, goalsRes, productsRes] = await Promise.all([
        supabase.from('sales').select('sale_value, sale_date'),
        supabase
          .from('monthly_goals')
          .select('target_value')
          .eq('month', currentMonth)
          .eq('year', currentYear)
          .limit(1)
          .maybeSingle(),
        supabase.from('products').select('id', { count: 'exact' }),
      ])

      const sales = salesRes.data || []
      const todaySales = sales
        .filter((s) => s.sale_date === today)
        .reduce((acc, curr) => acc + Number(curr.sale_value), 0)
      const monthSales = sales
        .filter((s) => s.sale_date.startsWith(format(new Date(), 'yyyy-MM')))
        .reduce((acc, curr) => acc + Number(curr.sale_value), 0)

      const goal = Number(goalsRes.data?.target_value || 10000) // Default to 10k if no goal
      const progress = Math.min((monthSales / goal) * 100, 100)

      setStats({
        today: todaySales,
        goal: goal,
        monthProgress: progress,
        products: productsRes.count || 0,
        conversion: 14.5, // Mock conversion rate as requested by specs
      })
      setLoading(false)
    }

    fetchStats()
  }, [])

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-32 rounded-2xl" />
        ))}
      </div>
    )
  }

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)

  const CARDS = [
    {
      title: 'Vendas de Hoje',
      value: formatCurrency(stats.today),
      icon: DollarSign,
      color: 'text-primary',
    },
    {
      title: 'Meta Mensal',
      value: `${stats.monthProgress.toFixed(1)}%`,
      icon: Target,
      color: 'text-success',
      extra: <Progress value={stats.monthProgress} className="h-2 mt-3" />,
    },
    {
      title: 'Produtos Ativos',
      value: stats.products.toString(),
      icon: Package,
      color: 'text-accent',
    },
    {
      title: 'Conversão',
      value: `${stats.conversion}%`,
      icon: TrendingUp,
      color: 'text-orange-500',
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {CARDS.map((card, i) => (
        <Card
          key={i}
          className="shadow-subtle border-0 bg-card hover:shadow-elevation transition-all duration-300"
        >
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-caption mb-1">{card.title}</p>
                <h3 className="text-headline text-2xl font-bold">{card.value}</h3>
              </div>
              <div className={`p-2 rounded-lg bg-secondary ${card.color}`}>
                <card.icon className="w-5 h-5" />
              </div>
            </div>
            {card.extra}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
