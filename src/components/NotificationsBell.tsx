import { useState, useRef, useEffect } from 'react'
import { Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover'
import type { PerformanceAlert } from '@/hooks/use-performance-notifications'

interface NotificationsBellProps {
    alertsRef: React.MutableRefObject<PerformanceAlert[]>
}

export function NotificationsBell({ alertsRef }: NotificationsBellProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [alerts, setAlerts] = useState<PerformanceAlert[]>([])
    const [unseenCount, setUnseenCount] = useState(0)
    const lastSeenCountRef = useRef(0)

    // Poll the ref to update the displayed alerts (ref is updated by the hook)
    useEffect(() => {
        const interval = setInterval(() => {
            const current = alertsRef.current
            if (current.length !== alerts.length) {
                setAlerts([...current])
                const newCount = current.length - lastSeenCountRef.current
                if (newCount > 0) setUnseenCount(newCount)
            }
        }, 1000)
        return () => clearInterval(interval)
    }, [alertsRef, alerts.length])

    const handleOpen = (open: boolean) => {
        setIsOpen(open)
        if (open) {
            lastSeenCountRef.current = alertsRef.current.length
            setUnseenCount(0)
        }
    }

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    }

    return (
        <Popover open={isOpen} onOpenChange={handleOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="relative rounded-lg text-muted-foreground hover:text-foreground"
                >
                    <Bell className="w-5 h-5" />
                    {unseenCount > 0 && (
                        <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground animate-pulse">
                            {unseenCount > 9 ? '9+' : unseenCount}
                        </span>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="end">
                <div className="p-3 border-b border-black/5 dark:border-white/5">
                    <h4 className="font-semibold text-sm">Alertas de Performance</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">
                        Últimos eventos desta sessão
                    </p>
                </div>
                <div className="max-h-80 overflow-y-auto">
                    {alerts.length === 0 ? (
                        <div className="p-6 text-center">
                            <Bell className="w-8 h-8 mx-auto text-muted-foreground/30 mb-2" />
                            <p className="text-sm text-muted-foreground">
                                Nenhum alerta ainda.
                            </p>
                            <p className="text-xs text-muted-foreground/60 mt-1">
                                Alertas aparecerão quando metas forem batidas ou recordes quebrados.
                            </p>
                        </div>
                    ) : (
                        alerts.map((alert) => (
                            <div
                                key={alert.id}
                                className="px-3 py-3 border-b border-black/5 dark:border-white/5 last:border-0 hover:bg-secondary/30 transition-colors"
                            >
                                <div className="flex items-start justify-between gap-2">
                                    <div className="min-w-0">
                                        <p className="text-sm font-medium">{alert.title}</p>
                                        <p className="text-xs text-muted-foreground mt-0.5">
                                            {alert.description}
                                        </p>
                                    </div>
                                    <span className="text-[10px] text-muted-foreground/60 shrink-0 pt-0.5">
                                        {formatTime(alert.timestamp)}
                                    </span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </PopoverContent>
        </Popover>
    )
}
