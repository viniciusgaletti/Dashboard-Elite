import { Card, CardContent } from '@/components/ui/card'
import { LucideIcon } from 'lucide-react'
import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface KPICardProps {
  title: string
  value: string | number
  icon?: LucideIcon
  subtitle?: string
  trend?: ReactNode
  colorClass?: string
}

export function KPICard({
  title,
  value,
  icon: Icon,
  subtitle,
  trend,
  colorClass = 'text-primary',
}: KPICardProps) {
  return (
    <Card className="glass-panel border-0 hover:shadow-elevation transition-all duration-300 ease-out h-full">
      <CardContent className="p-6 flex flex-col justify-between h-full">
        <div className="flex justify-between items-start mb-4">
          <p className="text-caption font-medium text-muted-foreground">{title}</p>
          {Icon && (
            <div className={cn('p-2 rounded-xl bg-secondary/50', colorClass)}>
              <Icon className="w-4 h-4" />
            </div>
          )}
        </div>
        <div className="space-y-1">
          <h3 className="text-large-title text-2xl tracking-tight font-semibold">{value}</h3>
          {subtitle && <p className="text-xs text-muted-foreground font-medium">{subtitle}</p>}
          {trend && <div className="mt-2">{trend}</div>}
        </div>
      </CardContent>
    </Card>
  )
}
