import { Card, CardContent } from '@/components/ui/card'
import { LucideIcon, ArrowUp, ArrowDown } from 'lucide-react'
import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface KPICardProps {
  title: string
  value: string | number
  icon?: LucideIcon
  subtitle?: string
  trend?: ReactNode
  colorClass?: string
  comparison?: { previousValue: number; variation: number }
}

export function KPICard({
  title,
  value,
  icon: Icon,
  subtitle,
  trend,
  colorClass = 'text-primary',
  comparison,
}: KPICardProps) {
  return (
    <Card className="glass-panel border-0 hover:shadow-elevation transition-all duration-300 ease-out h-full min-w-0">
      <CardContent className="p-6 flex flex-col justify-between h-full min-w-0">
        <div className="flex justify-between items-start mb-4 min-w-0 gap-2">
          <p className="text-caption font-medium text-muted-foreground truncate min-w-0 flex-1">
            {title}
          </p>
          {Icon && (
            <div className={cn('p-2 rounded-xl bg-secondary/50 shrink-0', colorClass)}>
              <Icon className="w-4 h-4" />
            </div>
          )}
        </div>
        <div className="space-y-1 min-w-0">
          <h3 className="text-2xl lg:text-3xl tracking-tight font-semibold truncate min-w-0">
            {value}
          </h3>
          {subtitle && (
            <p className="text-xs text-muted-foreground font-medium truncate min-w-0">{subtitle}</p>
          )}
          {trend && <div className="mt-2 min-w-0">{trend}</div>}

          {comparison && (
            <div
              className={cn(
                'flex items-center gap-1 text-xs font-semibold mt-2 animate-fade-in',
                comparison.variation >= 0 ? 'text-success' : 'text-destructive',
              )}
            >
              {comparison.variation >= 0 ? (
                <ArrowUp className="w-3 h-3" />
              ) : (
                <ArrowDown className="w-3 h-3" />
              )}
              {Math.abs(comparison.variation).toFixed(1)}%{' '}
              <span className="text-muted-foreground font-medium ml-1">vs ant.</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
