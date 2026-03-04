import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { StreamData, KPIData, FilterState } from '@/types/stream'
import { formatCurrency, formatNumber, formatPercent, calculateKPIs } from '@/lib/data-utils'
import { supabase } from '@/lib/supabase/client'

// ─── Layout constants ─────────────────────────────────────────────────────────
const PAGE_W = 210
const PAGE_H = 297
const MARGIN = 15
const CONTENT_W = PAGE_W - MARGIN * 2  // 180mm

// ─── Brand palette [r, g, b] ──────────────────────────────────────────────────
const C = {
  bg:        [15, 15, 15]    as const,
  card:      [26, 26, 26]    as const,
  border:    [42, 42, 42]    as const,
  gold:      [217, 185, 121] as const,
  white:     [255, 255, 255] as const,
  muted:     [136, 136, 136] as const,
  rowEven:   [20, 20, 20]    as const,
  rowOdd:    [26, 26, 26]    as const,
  tableHead: [30, 26, 16]    as const,
  success:   [34, 197, 94]   as const,
  indigo:    [99, 102, 241]  as const,
  orange:    [249, 115, 22]  as const,
  yellow:    [234, 179, 8]   as const,
}

type RGB = readonly [number, number, number]

// ─── Primitive helpers ────────────────────────────────────────────────────────
function fill(doc: jsPDF, c: RGB) { doc.setFillColor(c[0], c[1], c[2]) }
function draw(doc: jsPDF, c: RGB) { doc.setDrawColor(c[0], c[1], c[2]) }
function color(doc: jsPDF, c: RGB) { doc.setTextColor(c[0], c[1], c[2]) }

function fillPage(doc: jsPDF) {
  fill(doc, C.bg)
  doc.rect(0, 0, PAGE_W, PAGE_H, 'F')
}

// ─── Header ───────────────────────────────────────────────────────────────────
function drawHeader(doc: jsPDF, title: string, filterState: FilterState) {
  fill(doc, C.card)
  doc.rect(0, 0, PAGE_W, 32, 'F')

  // Gold accent line at bottom of header
  fill(doc, C.gold)
  doc.rect(0, 30.5, PAGE_W, 1.5, 'F')

  // Brand name
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8)
  color(doc, C.gold)
  doc.text('ELITE INSIGHTS', MARGIN, 11)

  // Dashboard title
  doc.setFontSize(15)
  color(doc, C.white)
  doc.text(title, MARGIN, 23)

  // Export date (right aligned)
  const dateStr = `Exportado em ${format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}`
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7.5)
  color(doc, C.muted)
  doc.text(dateStr, PAGE_W - MARGIN, 11, { align: 'right' })

  // Filter period
  if (filterState.dataInicio || filterState.dataFim) {
    const start = filterState.dataInicio ? format(filterState.dataInicio, 'dd/MM/yyyy') : '...'
    const end = filterState.dataFim ? format(filterState.dataFim, 'dd/MM/yyyy') : '...'
    doc.text(`Período: ${start} → ${end}`, PAGE_W - MARGIN, 20, { align: 'right' })
  }
}

// ─── Section title bar ────────────────────────────────────────────────────────
function drawSectionTitle(doc: jsPDF, text: string, y: number): number {
  fill(doc, C.card)
  doc.rect(MARGIN, y, CONTENT_W, 10, 'F')
  fill(doc, C.gold)
  doc.rect(MARGIN, y, 3, 10, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8.5)
  color(doc, C.gold)
  doc.text(text, MARGIN + 7, y + 6.5)
  return y + 14
}

// ─── KPI grid ─────────────────────────────────────────────────────────────────
function drawKPIs(doc: jsPDF, kpis: KPIData, startY: number): number {
  const items: Array<{
    label: string
    value: string
    subtitle?: string
    accent: RGB
  }> = [
    { label: 'Faturamento Total',   value: formatCurrency(kpis.faturamentoTotal),    accent: C.success },
    { label: 'Total de Vendas',     value: formatNumber(kpis.totalVendas),            accent: C.indigo },
    { label: 'Fat. Médio por Live', value: formatCurrency(kpis.faturamentoPorLive),   accent: C.success },
    { label: 'Conversão Média',     value: formatPercent(kpis.conversaoMedia),        accent: C.orange },
    { label: 'Melhor Dia',          value: kpis.melhorDia,                            accent: C.gold },
    { label: 'Total de Lives',      value: formatNumber(kpis.totalLives),             accent: C.indigo },
    { label: 'Média Vendas/Live',   value: formatNumber(kpis.mediaVendasPorLive),     accent: C.indigo },
    { label: 'Retenção Média',      value: formatPercent(kpis.retencaoMedia),         accent: C.gold },
    {
      label: 'Recorde Vendas',
      value: formatNumber(kpis.recordeVendas),
      subtitle: `${kpis.recordeVendasApresentador} • ${kpis.recordeVendasData}`,
      accent: C.yellow,
    },
    {
      label: 'Recorde Conversão',
      value: formatPercent(kpis.recordeConversao),
      subtitle: `${kpis.recordeConversaoApresentador} • ${kpis.recordeConversaoData}`,
      accent: C.yellow,
    },
  ]

  const COLS = 3
  const GAP = 4
  const CARD_W = (CONTENT_W - GAP * (COLS - 1)) / COLS
  const CARD_H = 28
  const ROW_H = CARD_H + GAP

  // Section label
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8.5)
  color(doc, C.gold)
  doc.text('INDICADORES DE PERFORMANCE', MARGIN, startY)
  let y = startY + 5

  for (let i = 0; i < items.length; i++) {
    const col = i % COLS
    const row = Math.floor(i / COLS)
    const x = MARGIN + col * (CARD_W + GAP)
    const cardY = y + row * ROW_H

    // Card background
    fill(doc, C.card)
    doc.roundedRect(x, cardY, CARD_W, CARD_H, 2, 2, 'F')

    // Left accent bar
    fill(doc, items[i].accent)
    doc.roundedRect(x, cardY, 3, CARD_H, 1, 1, 'F')

    // Label
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(6.5)
    color(doc, C.muted)
    doc.text(items[i].label.toUpperCase(), x + 7, cardY + 8)

    // Value
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(11)
    color(doc, C.white)
    doc.text(items[i].value, x + 7, cardY + 18)

    // Subtitle (records)
    if (items[i].subtitle) {
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(6)
      color(doc, C.muted)
      const sub = items[i].subtitle!
      // Truncate if too wide
      const maxW = CARD_W - 10
      const truncated = doc.getTextWidth(sub) > maxW
        ? sub.substring(0, Math.floor(sub.length * maxW / doc.getTextWidth(sub))) + '…'
        : sub
      doc.text(truncated, x + 7, cardY + 25)
    }
  }

  const rows = Math.ceil(items.length / COLS)
  return y + rows * ROW_H + 4
}

// ─── Data table ───────────────────────────────────────────────────────────────
function drawTable(doc: jsPDF, data: StreamData[], startY: number): void {
  const cols = [
    { header: 'Data',         w: 22 },
    { header: 'Apresentador', w: 36 },
    { header: 'Pico',         w: 18 },
    { header: 'Leads',        w: 18 },
    { header: 'Retenção',     w: 20 },
    { header: 'Vendas',       w: 18 },
    { header: 'Conversão',    w: 22 },
    { header: 'Receita',      w: 26 },
  ]
  // Total: 22+36+18+18+20+18+22+26 = 180 ✓

  const ROW_H = 6.5
  const HEADER_H = 8

  let y = startY

  // Section label
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8.5)
  color(doc, C.gold)
  doc.text('DETALHAMENTO POR DIA', MARGIN, y)
  y += 5

  // Header row
  fill(doc, C.tableHead)
  doc.rect(MARGIN, y, CONTENT_W, HEADER_H, 'F')

  let x = MARGIN
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(6.5)
  color(doc, C.gold)
  for (const col of cols) {
    doc.text(col.header, x + 2, y + 5.5)
    x += col.w
  }
  y += HEADER_H

  // Data rows
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(6.5)

  for (let i = 0; i < data.length; i++) {
    if (y + ROW_H > PAGE_H - 12) {
      doc.addPage()
      fillPage(doc)
      y = MARGIN
    }

    // Row background
    fill(doc, i % 2 === 0 ? C.rowEven : C.rowOdd)
    doc.rect(MARGIN, y, CONTENT_W, ROW_H, 'F')

    // Row data
    color(doc, C.white)
    x = MARGIN
    const values = [
      data[i].date,
      data[i].presenter,
      formatNumber(data[i].views),
      formatNumber(data[i].leads),
      formatPercent(data[i].retention),
      formatNumber(data[i].sales),
      formatPercent(data[i].conversion),
      formatCurrency(data[i].revenue),
    ]
    for (let j = 0; j < cols.length; j++) {
      const val = values[j]
      const maxW = cols[j].w - 4
      const tw = doc.getTextWidth(val)
      const truncated = tw > maxW
        ? val.substring(0, Math.floor(val.length * maxW / tw)) + '…'
        : val
      doc.text(truncated, x + 2, y + 4.6)
      x += cols[j].w
    }
    y += ROW_H
  }

  // Bottom border
  draw(doc, C.border)
  doc.setLineWidth(0.3)
  doc.line(MARGIN, y, PAGE_W - MARGIN, y)
}

// ─── Page footer ─────────────────────────────────────────────────────────────
function drawFooter(doc: jsPDF) {
  const totalPages = doc.getNumberOfPages()
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7)
    color(doc, C.muted)
    doc.text('Gerado por Elite Insights', MARGIN, PAGE_H - 6)
    doc.text(`Página ${i} de ${totalPages}`, PAGE_W - MARGIN, PAGE_H - 6, { align: 'right' })
  }
}

// ─── Public: export individual dashboard ─────────────────────────────────────
export interface ExportDashboardPDFParams {
  title: string
  kpis: KPIData
  data: StreamData[]
  chartsEl: HTMLElement | null
  filterState: FilterState
}

export async function exportDashboardPDF({
  title,
  kpis,
  data,
  chartsEl,
  filterState,
}: ExportDashboardPDFParams): Promise<void> {
  const doc = new jsPDF({ unit: 'mm', format: 'a4', compress: true })

  fillPage(doc)
  drawHeader(doc, title, filterState)

  let y = 38

  y = drawKPIs(doc, kpis, y)

  // Charts via html2canvas
  if (chartsEl) {
    try {
      const canvas = await html2canvas(chartsEl, {
        backgroundColor: '#0F0F0F',
        scale: 1,
        useCORS: true,
        logging: false,
        imageTimeout: 0,
      })
      const imgData = canvas.toDataURL('image/jpeg', 0.65)
      const imgH = (canvas.height * CONTENT_W) / canvas.width

      if (y + imgH + 14 > PAGE_H - 12) {
        doc.addPage()
        fillPage(doc)
        y = MARGIN
      }

      doc.setFont('helvetica', 'bold')
      doc.setFontSize(8.5)
      color(doc, C.gold)
      doc.text('GRÁFICOS', MARGIN, y)
      y += 4

      doc.addImage(imgData, 'JPEG', MARGIN, y, CONTENT_W, imgH)
      y += imgH + 8
    } catch {
      // Charts unavailable — continue without them
    }
  }

  if (y + 30 > PAGE_H - 12) {
    doc.addPage()
    fillPage(doc)
    y = MARGIN
  }

  drawTable(doc, data, y)
  drawFooter(doc)

  const safe = title.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '')
  doc.save(`${safe}_${format(new Date(), 'yyyy-MM-dd')}.pdf`)
}

// ─── Public: export consolidated PDF ─────────────────────────────────────────
export async function exportConsolidatedPDF(): Promise<void> {
  const [onRes, leadsRes] = await Promise.all([
    supabase.from('live_sessions').select('*').eq('dashboard_key', 'onboarding').order('date', { ascending: false }),
    supabase.from('live_sessions').select('*').eq('dashboard_key', 'leads').order('date', { ascending: false }),
  ])

  const toStream = (rows: typeof onRes.data): StreamData[] =>
    (rows ?? []).map((r) => ({
      date: r.date,
      views: Number(r.views),
      leads: Number(r.leads),
      conversion: Number(r.conversion),
      revenue: Number(r.revenue),
      sales: Number(r.sales),
      presenter: r.presenter,
      retention: Number(r.retention),
    }))

  const onboardingData = toStream(onRes.data)
  const leadsData = toStream(leadsRes.data)
  const allData = [
    ...onboardingData.map((r) => ({ ...r, presenter: `[Onb] ${r.presenter}` })),
    ...leadsData.map((r) => ({ ...r, presenter: `[Leads] ${r.presenter}` })),
  ]

  const onKPIs = calculateKPIs(onboardingData)
  const ldKPIs = calculateKPIs(leadsData)
  const allKPIs = calculateKPIs(allData)
  if (!onKPIs || !ldKPIs || !allKPIs) return

  const emptyFilter: FilterState = {
    dataInicio: null,
    dataFim: null,
    apresentadores: [],
    diaSemana: 'all',
    comparisonEnabled: false,
    weeklyComparisonEnabled: false,
    weeklyComparisonDay: 'all',
    weeklyComparisonSelectedDates: [],
  }

  const doc = new jsPDF({ unit: 'mm', format: 'a4', compress: true })

  // Page 1 — Onboarding KPIs
  fillPage(doc)
  drawHeader(doc, 'Relatório Geral — Elite Insights', emptyFilter)
  let y = 38
  y = drawSectionTitle(doc, 'LIVE DE ONBOARDING', y)
  y = drawKPIs(doc, onKPIs, y)

  // Page 2 — Leads KPIs
  doc.addPage()
  fillPage(doc)
  y = MARGIN
  y = drawSectionTitle(doc, 'LIVE LEADS', y)
  y = drawKPIs(doc, ldKPIs, y)

  // Page 3 — Consolidated KPIs
  doc.addPage()
  fillPage(doc)
  y = MARGIN
  y = drawSectionTitle(doc, 'TOTAIS CONSOLIDADOS', y)
  y = drawKPIs(doc, allKPIs, y)

  if (y + 30 > PAGE_H - 12) {
    doc.addPage()
    fillPage(doc)
    y = MARGIN
  }

  // Full table (all sessions)
  drawTable(doc, allData, y)
  drawFooter(doc)

  doc.save(`Relatorio_Geral_${format(new Date(), 'yyyy-MM-dd')}.pdf`)
}
