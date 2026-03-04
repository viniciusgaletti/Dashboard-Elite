import { useRef, useCallback } from 'react'

export interface PerformanceAlert {
    id: string
    type: 'goal_reached' | 'revenue_record' | 'conversion_record'
    title: string
    description: string
    timestamp: Date
}

const STORAGE_KEYS = {
    maxLiveRevenue: 'dashboard-max-live-revenue',
    maxConversion: 'dashboard-max-conversion',
}

function playNotificationSound() {
    if (localStorage.getItem('dashboard-notif-sound') === 'off') return
    try {
        const ctx = new AudioContext()
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.type = 'sine'
        osc.frequency.setValueAtTime(880, ctx.currentTime)
        osc.frequency.setValueAtTime(1100, ctx.currentTime + 0.1)
        osc.frequency.setValueAtTime(1320, ctx.currentTime + 0.2)
        gain.gain.setValueAtTime(0.3, ctx.currentTime)
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5)
        osc.start(ctx.currentTime)
        osc.stop(ctx.currentTime + 0.5)
    } catch {
        // Audio not supported
    }
}

export function usePerformanceNotifications() {
    const alertsRef = useRef<PerformanceAlert[]>([])
    const goalReachedRef = useRef(false)

    const addAlert = useCallback((alert: Omit<PerformanceAlert, 'id' | 'timestamp'>) => {
        const newAlert: PerformanceAlert = {
            ...alert,
            id: crypto.randomUUID(),
            timestamp: new Date(),
        }
        alertsRef.current = [newAlert, ...alertsRef.current].slice(0, 50)
        playNotificationSound()
        return newAlert
    }, [])

    const checkGoalReached = useCallback(
        (realizedTotal: number, targetValue: number) => {
            if (targetValue <= 0) return null
            const progress = (realizedTotal / targetValue) * 100
            if (progress >= 100 && !goalReachedRef.current) {
                goalReachedRef.current = true
                return addAlert({
                    type: 'goal_reached',
                    title: '🎯 Meta Atingida!',
                    description: `Faturamento atingiu ${progress.toFixed(1)}% da meta mensal!`,
                })
            }
            // Reset if we go below threshold (e.g., month change)
            if (progress < 100) goalReachedRef.current = false
            return null
        },
        [addAlert],
    )

    const checkRevenueRecord = useCallback(
        (currentLiveRevenue: number, liveDate: string) => {
            if (currentLiveRevenue <= 0) return null
            const stored = parseFloat(localStorage.getItem(STORAGE_KEYS.maxLiveRevenue) || '0')
            if (currentLiveRevenue > stored) {
                localStorage.setItem(STORAGE_KEYS.maxLiveRevenue, currentLiveRevenue.toString())
                if (stored > 0) {
                    return addAlert({
                        type: 'revenue_record',
                        title: '🏆 Novo Recorde de Faturamento!',
                        description: `Live de ${liveDate}: R$ ${currentLiveRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
                    })
                }
            }
            return null
        },
        [addAlert],
    )

    const checkConversionRecord = useCallback(
        (currentConversion: number, liveDate: string) => {
            if (currentConversion <= 0) return null
            const stored = parseFloat(localStorage.getItem(STORAGE_KEYS.maxConversion) || '0')
            if (currentConversion > stored) {
                localStorage.setItem(STORAGE_KEYS.maxConversion, currentConversion.toString())
                if (stored > 0) {
                    return addAlert({
                        type: 'conversion_record',
                        title: '🔥 Novo Recorde de Conversão!',
                        description: `Live de ${liveDate}: ${currentConversion.toFixed(2)}% de conversão!`,
                    })
                }
            }
            return null
        },
        [addAlert],
    )

    return {
        alerts: alertsRef,
        checkGoalReached,
        checkRevenueRecord,
        checkConversionRecord,
    }
}
