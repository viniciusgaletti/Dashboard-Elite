export interface StreamData {
  date: string
  views: number
  leads: number
  conversion: number
  revenue: number
}

export interface StreamSummary {
  totalViews: number
  totalLeads: number
  averageConversion: number
  totalRevenue: number
}
