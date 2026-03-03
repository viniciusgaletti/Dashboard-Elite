import { useMemo } from 'react'
import {
  StreamData,
  FilterState,
  KPIData,
  HostKPIData,
  WeekdayKPIData,
  KPIComparison,
} from '@/types/stream'
import { parseDateStr, calculateKPIs } from '@/lib/data-utils'
import { subMonths, format } from 'date-fns'

export interface ComparisonPeriodInfo {
  currentLabel: string
  previousLabel: string
}

export function useDashboardAnalytics(
  rawData: StreamData[],
  filteredData: StreamData[],
  filterState: FilterState,
  currentKpis: KPIData | null,
) {
  const comparisonPeriod = useMemo<ComparisonPeriodInfo | null>(() => {
    if (!filterState.comparisonEnabled || !filterState.dataInicio || !filterState.dataFim)
      return null

    const fmt = (d: Date) => format(d, 'dd/MM')
    const prevStart = subMonths(filterState.dataInicio, 1)
    const prevEnd = subMonths(filterState.dataFim, 1)
    return {
      currentLabel: `${fmt(filterState.dataInicio)} - ${fmt(filterState.dataFim)}`,
      previousLabel: `${fmt(prevStart)} - ${fmt(prevEnd)}`,
    }
  }, [filterState.comparisonEnabled, filterState.dataInicio, filterState.dataFim])

  const previousPeriodData = useMemo<StreamData[]>(() => {
    if (!filterState.comparisonEnabled || !filterState.dataInicio || !filterState.dataFim) return []

    const prevStart = subMonths(filterState.dataInicio, 1)
    const prevEnd = subMonths(filterState.dataFim, 1)

    return rawData
      .filter((row) => {
        const d = parseDateStr(row.date)
        return d >= prevStart && d <= prevEnd
      })
      .sort((a, b) => parseDateStr(a.date).getTime() - parseDateStr(b.date).getTime())
  }, [rawData, filterState.comparisonEnabled, filterState.dataInicio, filterState.dataFim])

  const kpiComparisons = useMemo(() => {
    if (
      !filterState.comparisonEnabled ||
      !filterState.dataInicio ||
      !filterState.dataFim ||
      !currentKpis
    )
      return null

    const prevKpis = calculateKPIs(previousPeriodData)
    const result: Partial<Record<keyof KPIData, KPIComparison>> = {}

    for (const key of Object.keys(currentKpis) as Array<keyof KPIData>) {
      const curr = Number(currentKpis[key]) || 0
      const prev = Number(prevKpis[key]) || 0
      result[key] = {
        previousValue: prev,
        variation: prev === 0 ? 0 : ((curr - prev) / prev) * 100,
      }
    }

    return result as Record<keyof KPIData, KPIComparison>
  }, [previousPeriodData, filterState, currentKpis])

  const hostPerformance = useMemo(() => {
    const hostMap = new Map<string, StreamData[]>()
    filteredData.forEach((row) => {
      if (!hostMap.has(row.presenter)) hostMap.set(row.presenter, [])
      hostMap.get(row.presenter)!.push(row)
    })
    const result: HostKPIData[] = []
    hostMap.forEach((data, host) => {
      const kpis = calculateKPIs(data)
      result.push({
        host,
        conversaoMedia: kpis.conversaoMedia,
        faturamentoTotal: kpis.faturamentoTotal,
        totalVendas: kpis.totalVendas,
      })
    })
    return result.sort((a, b) => b.conversaoMedia - a.conversaoMedia)
  }, [filteredData])

  const weekdayEfficiency = useMemo(() => {
    const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
    const dayMap = new Map<number, StreamData[]>()
    filteredData.forEach((row) => {
      const day = parseDateStr(row.date).getDay()
      if (!dayMap.has(day)) dayMap.set(day, [])
      dayMap.get(day)!.push(row)
    })
    const result: WeekdayKPIData[] = []
    dayMap.forEach((data, dayIndex) => {
      const kpis = calculateKPIs(data)
      result.push({
        weekday: days[dayIndex],
        dayIndex,
        conversaoMedia: kpis.conversaoMedia,
        faturamentoTotal: kpis.faturamentoTotal,
      })
    })
    return result.sort((a, b) => a.dayIndex - b.dayIndex)
  }, [filteredData])

  const availableWeekDates = useMemo(() => {
    if (!filterState.weeklyComparisonEnabled || filterState.weeklyComparisonDay === 'all') return []

    const targetDay = Number(filterState.weeklyComparisonDay)
    return rawData
      .filter((row) => {
        const d = parseDateStr(row.date)
        return d.getDay() === targetDay
      })
      .sort((a, b) => parseDateStr(b.date).getTime() - parseDateStr(a.date).getTime())
      .map((row) => row.date)
  }, [rawData, filterState.weeklyComparisonEnabled, filterState.weeklyComparisonDay])

  const weeklyComparisonData = useMemo(() => {
    if (!filterState.weeklyComparisonEnabled || filterState.weeklyComparisonDay === 'all') return []
    if (filterState.weeklyComparisonSelectedDates.length === 0) return []

    return rawData
      .filter((row) => filterState.weeklyComparisonSelectedDates.includes(row.date))
      .sort((a, b) => parseDateStr(b.date).getTime() - parseDateStr(a.date).getTime())
  }, [rawData, filterState])

  return {
    kpiComparisons,
    comparisonPeriod,
    previousPeriodData,
    hostPerformance,
    weekdayEfficiency,
    weeklyComparisonData,
    availableWeekDates,
  }
}
