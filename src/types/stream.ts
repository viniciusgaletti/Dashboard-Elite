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
