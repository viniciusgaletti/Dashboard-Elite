import { createContext, useContext, ReactNode } from 'react'
import { usePerformanceNotifications, PerformanceAlert } from '@/hooks/use-performance-notifications'

interface NotificationsContextValue {
    alertsRef: React.MutableRefObject<PerformanceAlert[]>
    checkGoalReached: (realizedTotal: number, targetValue: number) => PerformanceAlert | null
    checkRevenueRecord: (currentLiveRevenue: number, liveDate: string) => PerformanceAlert | null
    checkConversionRecord: (currentConversion: number, liveDate: string) => PerformanceAlert | null
}

const NotificationsContext = createContext<NotificationsContextValue | null>(null)

export function NotificationsProvider({ children }: { children: ReactNode }) {
    const { alerts, checkGoalReached, checkRevenueRecord, checkConversionRecord } = usePerformanceNotifications()
    const value: NotificationsContextValue = {
        alertsRef: alerts,
        checkGoalReached,
        checkRevenueRecord,
        checkConversionRecord,
    }
    return (
        <NotificationsContext.Provider value={value}>
            {children}
        </NotificationsContext.Provider>
    )
}

export function useNotifications() {
    const ctx = useContext(NotificationsContext)
    if (!ctx) throw new Error('useNotifications must be used within NotificationsProvider')
    return ctx
}
