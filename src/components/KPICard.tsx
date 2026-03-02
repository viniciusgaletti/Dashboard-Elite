import { Card, CardContent } from '@/components/ui/card'
import { LucideIcon } from 'lucide-react'
import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface KPICardProps {
  title: string
  value: string | number
  icon: LucideIcon
  trend?: ReactNode
  colorClass?: string
}

export function KPICard({
  title,
  value,
  icon: Icon,
  trend,
  colorClass = 'text-primary',
}: KPICardProps) {
  return (
    <Card className="glass-panel border-0 hover:shadow-elevation transition-all duration-300 ease-out">
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <p className="text-caption font-medium text-muted-foreground">{title}</p>
            <h3 className="text-large-title tracking-tight">{value}</h3>
          </div>
          <div className={cn('p-2.5 rounded-[12px] bg-secondary', colorClass)}>
            <Icon className="w-5 h-5" />
          </div>
        </div>
        {trend && <div className="mt-3">{trend}</div>}
      </CardContent>
    </Card>
  )
}
