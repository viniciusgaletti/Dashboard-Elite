import { useRef, useState } from 'react'
import { FileDown, Loader2, ChevronDown, LayoutGrid } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  exportDashboardPDF,
  exportConsolidatedPDF,
  type ExportDashboardPDFParams,
} from '@/lib/pdf-export'
import { KPIData, StreamData, FilterState } from '@/types/stream'

interface ExportButtonProps {
  title: string
  kpis: KPIData | null
  data: StreamData[]
  chartsRef: React.RefObject<HTMLDivElement | null>
  filterState: FilterState
  isLoading: boolean
}

export function ExportButton({
  title,
  kpis,
  data,
  chartsRef,
  filterState,
  isLoading,
}: ExportButtonProps) {
  const [exporting, setExporting] = useState<'dashboard' | 'consolidated' | null>(null)

  const disabled = isLoading || !kpis || data.length === 0

  async function handleDashboard() {
    if (!kpis) return
    setExporting('dashboard')
    try {
      await exportDashboardPDF({
        title,
        kpis,
        data,
        chartsEl: chartsRef.current ?? null,
        filterState,
      })
      toast.success('PDF exportado com sucesso!')
    } catch {
      toast.error('Erro ao gerar o PDF. Tente novamente.')
    } finally {
      setExporting(null)
    }
  }

  async function handleConsolidated() {
    setExporting('consolidated')
    try {
      await exportConsolidatedPDF()
      toast.success('Relatório Geral exportado!')
    } catch {
      toast.error('Erro ao gerar o Relatório Geral.')
    } finally {
      setExporting(null)
    }
  }

  const isExporting = exporting !== null

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          disabled={disabled || isExporting}
          className="gap-2 border-border/50 bg-card/50 hover:bg-card hover:border-primary/40 text-sm font-medium"
        >
          {isExporting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <FileDown className="w-4 h-4" />
          )}
          {isExporting
            ? exporting === 'consolidated'
              ? 'Gerando Geral…'
              : 'Gerando PDF…'
            : 'Exportar'}
          {!isExporting && <ChevronDown className="w-3.5 h-3.5 opacity-60" />}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuItem
          onClick={handleDashboard}
          disabled={disabled || isExporting}
          className="gap-2 cursor-pointer"
        >
          <FileDown className="w-4 h-4 text-primary" />
          <div>
            <p className="text-sm font-medium">Este Dashboard</p>
            <p className="text-xs text-muted-foreground">KPIs + gráficos + tabela</p>
          </div>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={handleConsolidated}
          disabled={isExporting}
          className="gap-2 cursor-pointer"
        >
          <LayoutGrid className="w-4 h-4 text-yellow-500" />
          <div>
            <p className="text-sm font-medium">Relatório Geral</p>
            <p className="text-xs text-muted-foreground">Onboarding + Leads</p>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
