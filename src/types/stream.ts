export interface StreamData {
  date: string
  views: number
  leads: number
  conversion: number
  revenue: number
  sales: number
  presenter: string
  retention: number
}

export interface KPIData {
  faturamentoTotal: number
  totalVendas: number
  faturamentoPorLive: number
  conversaoMedia: number
  melhorDia: string
  totalLives: number
  mediaVendasPorLive: number
  retencaoMedia: number
  recordeVendas: number
  recordeVendasApresentador: string
  recordeVendasData: string
  recordeConversao: number
  recordeConversaoApresentador: string
  recordeConversaoData: string
}

export interface StreamSummary {
  totalViews: number
  totalLeads: number
  averageConversion: number
  totalRevenue: number
}

export interface FilterState {
  dataInicio: Date | null
  dataFim: Date | null
  apresentadores: string[]
  diaSemana: string
  comparisonEnabled: boolean
  weeklyComparisonEnabled: boolean
  weeklyComparisonDay: string
  weeklyComparisonSelectedDates: string[]
}

export interface KPIComparison {
  previousValue: number
  variation: number
}

export interface HostKPIData {
  host: string
  conversaoMedia: number
  faturamentoTotal: number
  totalVendas: number
}

export interface WeekdayKPIData {
  weekday: string
  dayIndex: number
  conversaoMedia: number
  faturamentoTotal: number
}
