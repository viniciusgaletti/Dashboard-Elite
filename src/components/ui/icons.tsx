/* ============================================================
   Adapta icon set — drop-in replacement for lucide-react.
   Every icon follows the Adapta spec: 24x24 grid, 1.5px stroke,
   stroke="currentColor", round caps/joins, no fills.
   API is lucide-compatible (className, size, onClick, ref...),
   so call sites only change the import source.
   Source of truth: design.md (Adapta Design System).
   ============================================================ */
import * as React from 'react'

export type IconProps = React.SVGProps<SVGSVGElement> & { size?: number | string }
export type LucideIcon = React.ForwardRefExoticComponent<
  IconProps & React.RefAttributes<SVGSVGElement>
>

/** Build an Adapta icon component from its inner SVG markup. */
function icon(inner: string): LucideIcon {
  const Comp = React.forwardRef<SVGSVGElement, IconProps>(function AdaptaIcon(
    { size, width, height, ...props },
    ref,
  ) {
    return (
      <svg
        ref={ref}
        xmlns="http://www.w3.org/2000/svg"
        width={size ?? width ?? 24}
        height={size ?? height ?? 24}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        dangerouslySetInnerHTML={{ __html: inner }}
        {...props}
      />
    )
  })
  return Comp
}

/* ─── Navegação & setas ─────────────────────────────────────── */
export const ArrowUp = icon('<path d="M12 19V5M5 12l7-7 7 7"/>')
export const ArrowDown = icon('<path d="M12 5v14M19 12l-7 7-7-7"/>')
export const ArrowUpDown = icon('<path d="M7 16V4M3 8l4-4 4 4M17 8v12M21 16l-4 4-4-4"/>')
export const ChevronDown = icon('<path d="M6 9l6 6 6-6"/>')
export const ChevronsLeft = icon('<path d="M11 6l-6 6 6 6M18 6l-6 6 6 6"/>')
export const ChevronsRight = icon('<path d="M13 6l6 6-6 6M6 6l6 6-6 6"/>')
export const PanelLeftClose = icon(
  '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18M16 9l-3 3 3 3"/>',
)
export const PanelLeftOpen = icon(
  '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18M13 9l3 3-3 3"/>',
)
export const LogOut = icon(
  '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>',
)

/* ─── Ações & estados ───────────────────────────────────────── */
export const Plus = icon('<path d="M12 5v14M5 12h14"/>')
export const X = icon('<path d="M18 6L6 18M6 6l12 12"/>')
export const Trash2 = icon(
  '<path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6M10 11v6M14 11v6"/>',
)
export const Pencil = icon(
  '<path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"/>',
)
export const SlidersHorizontal = icon(
  '<path d="M4 6h12M4 12h8M4 18h4"/><circle cx="18" cy="6" r="2"/><circle cx="14" cy="12" r="2"/><circle cx="10" cy="18" r="2"/>',
)
export const Loader2 = icon('<path d="M21 12a9 9 0 1 1-6.219-8.56"/>')

/* ─── Objetos & conteúdo ────────────────────────────────────── */
export const FileDown = icon(
  '<path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><path d="M14 3v6h6"/><path d="M12 12v6M9 15l3 3 3-3"/>',
)
export const FileSpreadsheet = icon(
  '<path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><path d="M14 3v6h6M8 13h8M8 17h5"/>',
)
export const ClipboardList = icon(
  '<rect x="8" y="2" width="8" height="4" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="M9 12h6M9 16h6M9 8h.01"/>',
)
export const LayoutGrid = icon(
  '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
)
export const ShoppingBag = icon(
  '<path d="M5 8h14l-1 13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1L5 8z"/><path d="M9 8V5a3 3 0 0 1 6 0v3"/>',
)
export const Camera = icon(
  '<path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/>',
)
export const Video = icon(
  '<polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/>',
)

/* ─── Métricas & finanças ───────────────────────────────────── */
export const BarChart3 = icon(
  '<line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>',
)
export const TrendingUp = icon('<path d="M3 17l6-6 4 4 8-8"/><path d="M17 7h4v4"/>')
export const TrendingDown = icon('<path d="M3 7l6 6 4-4 8 8"/><path d="M17 17h4v-4"/>')
export const Activity = icon('<path d="M22 12h-4l-3 9L9 3l-3 9H2"/>')
export const DollarSign = icon(
  '<path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>',
)
export const Target = icon(
  '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5"/>',
)
export const Award = icon(
  '<circle cx="12" cy="8" r="6"/><path d="M8.2 13.5L7 22l5-3 5 3-1.2-8.5"/>',
)
export const Trophy = icon(
  '<path d="M8 21h8M12 17v4M7 4h10v4a5 5 0 0 1-10 0V4z"/><path d="M17 5h3v2a3 3 0 0 1-3 3M7 5H4v2a3 3 0 0 0 3 3"/>',
)

/* ─── Pessoas & comunicação ─────────────────────────────────── */
export const Users = icon(
  '<circle cx="9" cy="8" r="4"/><path d="M15 21a6 6 0 0 0-12 0"/><circle cx="17" cy="6" r="3"/><path d="M22 18a5 5 0 0 0-5-5"/>',
)
export const Bell = icon(
  '<path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 0 1-3.4 0"/>',
)
export const GraduationCap = icon(
  '<path d="M22 10L12 5 2 10l10 5 10-5z"/><path d="M6 12v5c0 1.5 2.7 3 6 3s6-1.5 6-3v-5"/><path d="M22 10v6"/>',
)
export const Megaphone = icon(
  '<path d="M3 10v4a1 1 0 0 0 1 1h3l7 4V5L7 9H4a1 1 0 0 0-1 1z"/><path d="M18 8a4 4 0 0 1 0 8"/>',
)

/* ─── Sistema & estado ──────────────────────────────────────── */
export const Settings = icon(
  '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3h.1a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8v.1a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
)
export const Lock = icon(
  '<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
)
export const Calendar = icon(
  '<rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>',
)
export const Monitor = icon(
  '<rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/>',
)
export const Moon = icon('<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/>')
export const Sun = icon(
  '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
)

/* CalendarIcon — alias usado por date-pickers (mesma arte de Calendar). */
export const CalendarIcon = Calendar
