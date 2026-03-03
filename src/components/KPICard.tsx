import { Card, CardContent } from '@/components/ui/card'
import { LucideIcon, ArrowUp, ArrowDown } from 'lucide-react'
import { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

interface KPICardProps {
  title: string
  value: string | number
  icon?: LucideIcon
  subtitle?: string
  trend?: ReactNode
  colorClass?: string
  comparison?: { previousValue: number; variation: number }
  tooltip?: string
}

export function KPICard({
  title,
  value,
  icon: Icon,
  subtitle,
  trend,
  colorClass = 'text-primary',
  comparison,
  tooltip,
}: KPICardProps) {
  const card = (
    <Card className="glass-panel border-0 hover:shadow-elevation transition-all duration-300 ease-out flex flex-col justify-between min-h-[140px] w-full overflow-hidden cursor-default">
      <CardContent className="p-4 sm:p-5 flex flex-col justify-between h-full min-w-0">
        <div className="flex justify-between items-start min-w-0 gap-2">
          <p className="text-caption font-medium text-muted-foreground truncate min-w-0 flex-1">
            {title}
          </p>
          {Icon && (
            <div className={cn('p-1.5 sm:p-2 rounded-xl bg-secondary/50 shrink-0', colorClass)}>
              <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          )}
        </div>

        <div className="flex-1 flex flex-col justify-end mt-3 space-y-1 min-w-0 w-full">
          <div className="w-full min-w-0">
            <p className="font-display font-bold tracking-tighter text-foreground kpi-value truncate">
              {value}
            </p>
          </div>
          {subtitle && (
            <p className="text-xs text-muted-foreground font-medium truncate min-w-0">{subtitle}</p>
          )}
          {trend && <div className="mt-1.5 min-w-0">{trend}</div>}

          {comparison && (
            <div
              className={cn(
                'flex items-center gap-1 text-xs font-semibold animate-fade-in',
                comparison.variation >= 0 ? 'text-success' : 'text-destructive',
              )}
            >
              {comparison.variation >= 0 ? (
                <ArrowUp className="w-3 h-3" />
              ) : (
                <ArrowDown className="w-3 h-3" />
              )}
              {Math.abs(comparison.variation).toFixed(1)}%{' '}
              <span className="text-muted-foreground font-medium ml-1">vs. anterior</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )

  if (!tooltip) return card

  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>{card}</TooltipTrigger>
        <TooltipContent
          side="bottom"
          sideOffset={8}
          className="glass-panel border-0 shadow-elevation max-w-[260px] text-xs leading-relaxed p-3"
        >
          {tooltip}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
