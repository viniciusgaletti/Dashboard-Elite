import { useEffect, useState, useMemo } from 'react'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  DollarSign,
  Target,
  Plus,
  Trophy,
  BarChart3,
  Pencil,
  ClipboardList,
  ArrowUpDown,
  Trash2,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { SalesTable } from '@/components/SalesTable'
import { GoalDialog } from '@/components/GoalDialog'
import { useGoals } from '@/hooks/use-goals'
import { useRevenue } from '@/hooks/use-revenue'
import { useLiveRevenue } from '@/hooks/use-live-revenue'
import { DASHBOARDS } from '@/config/dashboards'

const SELLERS = [
  'Felipe Garcia',
  'Felipe Navaar',
  'Ian Ede',
  'Kimberly Prestes',
  'Lucas Dias',
  'Lucas Machado',
  'Lucas Richard',
  'Rodrigo Santos',
  'Vinicius Galetti',
  'Outro',
]

const formatCurrency = (val: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)

export default function Revenue() {
  const { goals, fetchGoals, upsertGoal } = useGoals()
  const {
    sales,
    products,
    isLoadingSales,
    fetchSales,
    fetchProducts,
    insertSale,
    deleteSale,
    insertProduct,
    updateProduct,
    deleteProduct,
  } = useRevenue()

  // Live revenue from CSVs (onboarding + leads)
  const { data: onboardingRevenue } = useLiveRevenue(DASHBOARDS.onboarding.csvUrl)
  const { data: leadsRevenue } = useLiveRevenue(DASHBOARDS.leads.csvUrl)

  const [isGoalDialogOpen, setIsGoalDialogOpen] = useState(false)
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())

  // Sale form state
  const [formProduct, setFormProduct] = useState('')
  const [formQty, setFormQty] = useState('1')
  const [formUnitPrice, setFormUnitPrice] = useState('')
  const [formSeller, setFormSeller] = useState('')
  const [formDate, setFormDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [formNotes, setFormNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Product edit state
  const [editingProductId, setEditingProductId] = useState<string | null>(null)
  const [editProductPrice, setEditProductPrice] = useState('')
  const [newProductName, setNewProductName] = useState('')
  const [newProductPrice, setNewProductPrice] = useState('')
  const [showAddProduct, setShowAddProduct] = useState(false)
  const [productSortMode, setProductSortMode] = useState<
    'price-asc' | 'price-desc' | 'units-asc' | 'units-desc'
  >('price-desc')
  const [isEditingGoal, setIsEditingGoal] = useState(false)
  const [editGoalValue, setEditGoalValue] = useState('')

  useEffect(() => {
    fetchGoals()
    fetchSales()
    fetchProducts()
  }, [fetchGoals, fetchSales, fetchProducts])

  // When product is selected, auto-fill unit price
  useEffect(() => {
    if (formProduct) {
      const product = products.find((p) => p.name === formProduct)
      if (product) {
        setFormUnitPrice(product.price.toString())
      }
    }
  }, [formProduct, products])

  // Derived calculations
  const currentGoal = useMemo(
    () => goals.find((g) => g.month === selectedMonth && g.year === selectedYear),
    [goals, selectedMonth, selectedYear],
  )

  const targetValue = currentGoal?.target_value || 0

  // Filter sales for the selected month/year
  const monthSales = useMemo(
    () =>
      sales.filter((s) => {
        const d = new Date(s.sale_date)
        return d.getMonth() + 1 === selectedMonth && d.getFullYear() === selectedYear
      }),
    [sales, selectedMonth, selectedYear],
  )

  // Revenue from CSV lives for the selected month
  const liveRevenueTotal = useMemo(() => {
    const filterByMonth = (data: typeof onboardingRevenue) =>
      data
        .filter((row) => {
          const parts = row.date.split('/')
          if (parts.length !== 3) return false
          const m = parseInt(parts[1])
          const y = parseInt(parts[2])
          return m === selectedMonth && y === selectedYear
        })
        .reduce((acc, row) => acc + row.revenue, 0)

    return filterByMonth(onboardingRevenue) + filterByMonth(leadsRevenue)
  }, [onboardingRevenue, leadsRevenue, selectedMonth, selectedYear])

  // Manual sales total
  const manualSalesTotal = useMemo(
    () => monthSales.reduce((acc, s) => acc + s.sale_value, 0),
    [monthSales],
  )

  // Total realized (live + manual)
  const realizedTotal = liveRevenueTotal + manualSalesTotal
  const gap = Math.max(targetValue - realizedTotal, 0)
  const progress = targetValue > 0 ? Math.min((realizedTotal / targetValue) * 100, 100) : 0

  // Seller ranking based on monthly sales (manual only)
  const sellerRanking = useMemo(() => {
    const map = new Map<string, number>()
    monthSales.forEach((s) => {
      if (s.seller_name) {
        map.set(s.seller_name, (map.get(s.seller_name) || 0) + s.sale_value)
      }
    })
    return Array.from(map.entries())
      .map(([name, total]) => ({
        name,
        total,
        salesCount: monthSales.filter((s) => s.seller_name === name).length,
      }))
      .sort((a, b) => b.total - a.total)
  }, [monthSales])

  // Product mix with units needed to close the gap
  const productMix = useMemo(() => {
    const items = products.map((p) => {
      const unitsNeeded = p.price > 0 ? Math.ceil(gap / p.price) : 0
      return { ...p, unitsNeeded }
    })

    // Apply sorting
    switch (productSortMode) {
      case 'price-asc':
        items.sort((a, b) => a.price - b.price)
        break
      case 'price-desc':
        items.sort((a, b) => b.price - a.price)
        break
      case 'units-asc':
        items.sort((a, b) => a.unitsNeeded - b.unitsNeeded)
        break
      case 'units-desc':
        items.sort((a, b) => b.unitsNeeded - a.unitsNeeded)
        break
    }
    return items
  }, [products, gap, productSortMode])

  const handleSubmitSale = async () => {
    if (!formProduct) {
      toast.error('Selecione um produto.')
      return
    }
    if (!formSeller) {
      toast.error('Selecione um vendedor.')
      return
    }
    const qty = parseInt(formQty) || 1
    const unitPrice = parseFloat(formUnitPrice.replace(',', '.')) || 0
    if (unitPrice <= 0) {
      toast.error('O valor unitário deve ser maior que 0.')
      return
    }
    const totalValue = qty * unitPrice

    setIsSubmitting(true)
    const { error } = await insertSale({
      product_name: formProduct,
      unit_price: unitPrice,
      sale_value: totalValue,
      quantity: qty,
      seller_name: formSeller,
      sale_date: formDate,
      notes: formNotes,
    })
    setIsSubmitting(false)

    if (error) {
      toast.error(error)
    } else {
      toast.success('Venda registrada com sucesso!')
      setFormProduct('')
      setFormQty('1')
      setFormUnitPrice('')
      setFormSeller('')
      setFormDate(format(new Date(), 'yyyy-MM-dd'))
      setFormNotes('')
    }
  }

  const handleDeleteSale = async (id: string) => {
    const { error } = await deleteSale(id)
    if (error) toast.error(error)
    else toast.success('Venda excluída.')
  }

  const handleGoalSave = async (month: number, year: number, target: number) => {
    const { error } = await upsertGoal(month, year, target)
    return { error }
  }

  const handleSaveProductPrice = async (id: string) => {
    const price = parseFloat(editProductPrice.replace(',', '.'))
    if (isNaN(price) || price < 0) {
      toast.error('Preço inválido')
      return
    }
    const { error } = await updateProduct(id, { price })
    if (error) toast.error(error)
    else toast.success('Preço atualizado!')
    setEditingProductId(null)
  }

  const handleAddProduct = async () => {
    if (!newProductName.trim()) {
      toast.error('Informe o nome do produto.')
      return
    }
    const price = parseFloat(newProductPrice.replace(',', '.')) || 0
    const { error } = await insertProduct({ name: newProductName.trim(), price, is_default: false })
    if (error) toast.error(error)
    else {
      toast.success('Produto adicionado!')
      setNewProductName('')
      setNewProductPrice('')
      setShowAddProduct(false)
    }
  }

  const handleDeleteProduct = async (id: string) => {
    const { error } = await deleteProduct(id)
    if (error) toast.error(error)
    else toast.success('Produto removido.')
  }

  const cycleSortMode = () => {
    setProductSortMode((prev) => {
      switch (prev) {
        case 'price-desc':
          return 'price-asc'
        case 'price-asc':
          return 'units-asc'
        case 'units-asc':
          return 'units-desc'
        case 'units-desc':
          return 'price-desc'
      }
    })
  }

  const sortLabel = (() => {
    switch (productSortMode) {
      case 'price-desc':
        return 'Maior preço'
      case 'price-asc':
        return 'Menor preço'
      case 'units-asc':
        return 'Menor qtd'
      case 'units-desc':
        return 'Maior qtd'
    }
  })()

  const formTotal = (parseInt(formQty) || 0) * (parseFloat(formUnitPrice.replace(',', '.')) || 0)

  const MONTHS = [
    'Janeiro',
    'Fevereiro',
    'Março',
    'Abril',
    'Maio',
    'Junho',
    'Julho',
    'Agosto',
    'Setembro',
    'Outubro',
    'Novembro',
    'Dezembro',
  ]

  return (
    <div className="space-y-6 md:space-y-8 animate-fade-in-up pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between glass-panel p-6 rounded-2xl">
        <div className="w-full space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary text-primary-foreground shadow-sm">
              <DollarSign className="w-5 h-5" />
            </div>
            <h2 className="text-large-title text-2xl">Faturamento & Metas</h2>
          </div>
          <p className="text-body text-muted-foreground">
            Acompanhe vendas, metas e performance da equipe.
          </p>
        </div>
      </div>

      {/* Period Selector */}
      <div className="glass-panel rounded-2xl p-4 flex flex-wrap items-center gap-3">
        <span className="text-sm text-muted-foreground font-medium">Período:</span>
        <Select
          value={selectedMonth.toString()}
          onValueChange={(v) => setSelectedMonth(parseInt(v))}
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {MONTHS.map((m, i) => (
              <SelectItem key={i} value={(i + 1).toString()}>
                {m}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={selectedYear.toString()} onValueChange={(v) => setSelectedYear(parseInt(v))}>
          <SelectTrigger className="w-[100px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {[2025, 2026, 2027].map((y) => (
              <SelectItem key={y} value={y.toString()}>
                {y}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Faturamento vs Meta */}
      <Card className="glass-panel border-0">
        <CardContent className="p-6 md:p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-secondary/50 text-primary">
                <Target className="w-5 h-5" />
              </div>
              <h3 className="text-headline font-semibold uppercase text-sm tracking-wider">
                Faturamento vs Meta
              </h3>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsGoalDialogOpen(true)}
              className="gap-2"
            >
              Definir Meta
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div>
              <p className="text-caption text-muted-foreground mb-1">Realizado</p>
              <p className="text-2xl md:text-3xl font-bold tracking-tight">
                {formatCurrency(realizedTotal)}
              </p>
            </div>
            <div>
              <p className="text-caption text-muted-foreground mb-1">Meta do período</p>
              {isEditingGoal ? (
                <div className="flex items-center gap-2">
                  <span className="text-lg text-muted-foreground font-bold">R$</span>
                  <Input
                    type="text"
                    inputMode="decimal"
                    value={editGoalValue}
                    onChange={(e) => setEditGoalValue(e.target.value)}
                    onKeyDown={async (e) => {
                      if (e.key === 'Enter') {
                        const val = parseFloat(
                          editGoalValue.replace(/[^\d.,]/g, '').replace(',', '.'),
                        )
                        if (!isNaN(val) && val > 0) {
                          await handleGoalSave(selectedMonth, selectedYear, val)
                          setIsEditingGoal(false)
                        }
                      }
                      if (e.key === 'Escape') setIsEditingGoal(false)
                    }}
                    className="text-2xl font-bold w-48 h-10"
                    autoFocus
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={async () => {
                      const val = parseFloat(
                        editGoalValue.replace(/[^\d.,]/g, '').replace(',', '.'),
                      )
                      if (!isNaN(val) && val > 0) {
                        await handleGoalSave(selectedMonth, selectedYear, val)
                        setIsEditingGoal(false)
                      }
                    }}
                  >
                    ✓
                  </Button>
                </div>
              ) : (
                <p
                  className="text-2xl md:text-3xl font-bold tracking-tight text-muted-foreground cursor-pointer hover:text-foreground transition-colors group flex items-center gap-2"
                  onClick={() => {
                    setEditGoalValue(targetValue > 0 ? targetValue.toString() : '')
                    setIsEditingGoal(true)
                  }}
                >
                  {targetValue > 0 ? formatCurrency(targetValue) : 'Clique para definir'}
                  <Pencil className="w-4 h-4 opacity-0 group-hover:opacity-60 transition-opacity" />
                </p>
              )}
            </div>
            <div>
              <p className="text-caption text-muted-foreground mb-1">Faltam</p>
              <p className="text-2xl md:text-3xl font-bold tracking-tight text-destructive">
                {targetValue > 0 ? formatCurrency(gap) : '—'}
              </p>
            </div>
          </div>

          {targetValue > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-caption text-muted-foreground">Progresso</p>
                <p className="text-sm font-semibold">{progress.toFixed(1)}%</p>
              </div>
              <Progress value={progress} className="h-3 rounded-full" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Product Mix + Seller Ranking */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-5">
        {/* Product Mix Calculator */}
        <Card className="glass-panel border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-secondary/50 text-primary">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <h3 className="text-headline font-semibold uppercase text-sm tracking-wider">
                  Calculadora de Mix de Produtos
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={cycleSortMode}
                  className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                >
                  <ArrowUpDown className="w-3.5 h-3.5" />
                  {sortLabel}
                </button>
                {gap > 0 && (
                  <span className="text-xs">
                    Gap:{' '}
                    <span className="text-orange-500 font-semibold">{formatCurrency(gap)}</span>
                  </span>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setShowAddProduct(!showAddProduct)}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {showAddProduct && (
              <div className="flex gap-2 mb-4 pb-4 border-b border-black/5 dark:border-white/5">
                <Input
                  placeholder="Nome do produto"
                  value={newProductName}
                  onChange={(e) => setNewProductName(e.target.value)}
                  className="flex-1"
                />
                <Input
                  placeholder="Preço"
                  value={newProductPrice}
                  onChange={(e) => setNewProductPrice(e.target.value)}
                  className="w-28"
                />
                <Button size="sm" onClick={handleAddProduct}>
                  Adicionar
                </Button>
              </div>
            )}

            <div className="space-y-0.5">
              {productMix.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between py-3 px-3 rounded-xl hover:bg-secondary/30 transition-colors border-b border-black/5 dark:border-white/5 last:border-0"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-sm truncate">{p.name}</p>
                    {p.price >= 1000 && (
                      <p className="text-xs text-muted-foreground">
                        12x de {formatCurrency(p.price / 12)}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    {editingProductId === p.id ? (
                      <div className="flex items-center gap-1">
                        <Input
                          value={editProductPrice}
                          onChange={(e) => setEditProductPrice(e.target.value)}
                          className="w-24 h-7 text-xs"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveProductPrice(p.id)
                            if (e.key === 'Escape') setEditingProductId(null)
                          }}
                          autoFocus
                        />
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 px-2 text-xs"
                          onClick={() => handleSaveProductPrice(p.id)}
                        >
                          ✓
                        </Button>
                      </div>
                    ) : (
                      <>
                        <span className="text-sm text-muted-foreground">
                          {formatCurrency(p.price)}
                        </span>
                        <span className="text-sm font-bold text-primary">{p.unitsNeeded} un.</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-muted-foreground hover:text-primary"
                          onClick={() => {
                            setEditingProductId(p.id)
                            setEditProductPrice(p.price.toString())
                          }}
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-muted-foreground hover:text-destructive"
                          onClick={() => handleDeleteProduct(p.id)}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              ))}

              {products.length === 0 && (
                <p className="text-center text-sm text-muted-foreground py-6">
                  Nenhum produto cadastrado. Clique em + para adicionar.
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Seller Ranking */}
        <Card className="glass-panel border-0">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-xl bg-secondary/50 text-yellow-500">
                <Trophy className="w-5 h-5" />
              </div>
              <h3 className="text-headline font-semibold uppercase text-sm tracking-wider">
                Ranking de Vendedores
              </h3>
            </div>

            <div className="space-y-1">
              {sellerRanking.map((seller, i) => (
                <div
                  key={seller.name}
                  className="flex items-center justify-between py-3 px-2 rounded-lg hover:bg-secondary/30 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                        i === 0
                          ? 'bg-yellow-500/20 text-yellow-500'
                          : i === 1
                            ? 'bg-slate-400/20 text-slate-400'
                            : i === 2
                              ? 'bg-orange-600/20 text-orange-600'
                              : 'bg-secondary text-muted-foreground'
                      }`}
                    >
                      {i + 1}º
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate">{seller.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {seller.salesCount} venda{seller.salesCount !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                  <p className="font-bold text-success shrink-0">{formatCurrency(seller.total)}</p>
                </div>
              ))}

              {sellerRanking.length === 0 && (
                <p className="text-center text-sm text-muted-foreground py-6">
                  Nenhuma venda manual registrada neste mês.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sale Registration Form (inline) */}
      <Card className="glass-panel border-0">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="p-2 rounded-xl bg-secondary/50 text-primary">
              <Plus className="w-5 h-5" />
            </div>
            <h3 className="text-headline font-semibold uppercase text-sm tracking-wider">
              Registrar Venda
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Produto */}
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Produto</Label>
              <Select value={formProduct} onValueChange={setFormProduct}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {products.map((p) => (
                    <SelectItem key={p.id} value={p.name}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Qtd */}
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Qtd</Label>
              <Input
                type="number"
                min="1"
                value={formQty}
                onChange={(e) => setFormQty(e.target.value)}
              />
            </div>

            {/* Valor Unit */}
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Valor Unit. (R$)</Label>
              <Input
                type="text"
                inputMode="decimal"
                placeholder="0,00"
                value={formUnitPrice}
                onChange={(e) => setFormUnitPrice(e.target.value)}
              />
            </div>

            {/* Vendedor */}
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Vendedor</Label>
              <Select value={formSeller} onValueChange={setFormSeller}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {SELLERS.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
            {/* Data */}
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Data</Label>
              <Input type="date" value={formDate} onChange={(e) => setFormDate(e.target.value)} />
            </div>

            {/* Observação */}
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Observação (opcional)</Label>
              <Input
                placeholder="Observação..."
                value={formNotes}
                onChange={(e) => setFormNotes(e.target.value)}
              />
            </div>

            {/* Valor Total */}
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Valor Total</Label>
              <p className="text-lg font-bold text-success h-10 flex items-center">
                {formatCurrency(formTotal)}
              </p>
            </div>

            {/* Submit button */}
            <div className="space-y-1.5 flex items-end">
              <Button className="w-full" onClick={handleSubmitSale} disabled={isSubmitting}>
                {isSubmitting ? 'Registrando...' : 'Adicionar Venda'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sales History */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-secondary/50 text-primary">
            <ClipboardList className="w-5 h-5" />
          </div>
          <h3 className="text-headline font-semibold uppercase text-sm tracking-wider">
            Vendas Registradas ({monthSales.length})
          </h3>
        </div>
        <SalesTable sales={monthSales} isLoading={isLoadingSales} onDeleteSale={handleDeleteSale} />
      </div>

      {/* Goal Dialog */}
      <GoalDialog
        isOpen={isGoalDialogOpen}
        onOpenChange={setIsGoalDialogOpen}
        currentMonth={selectedMonth}
        currentYear={selectedYear}
        currentTarget={targetValue}
        onSave={handleGoalSave}
      />
    </div>
  )
}
