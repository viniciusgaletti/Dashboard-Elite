import React, { useState, useMemo } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import { StreamData } from '@/types/stream'
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react'
import { cn } from '@/lib/utils'

type SortConfig = {
  key: keyof StreamData | null
  direction: 'asc' | 'desc' | null
}

const ROWS_PER_PAGE = 10

export function StreamTable({ data }: { data: StreamData[] }) {
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: null, direction: null })
  const [currentPage, setCurrentPage] = useState(1)

  const handleSort = (key: keyof StreamData) => {
    let direction: 'asc' | 'desc' | null = 'asc'
    if (sortConfig.key === key) {
      if (sortConfig.direction === 'asc') direction = 'desc'
      else if (sortConfig.direction === 'desc') direction = null
    }
    setSortConfig({ key: direction ? key : null, direction })
    setCurrentPage(1)
  }

  const sortedData = useMemo(() => {
    if (!sortConfig.key || !sortConfig.direction) return data

    return [...data].sort((a, b) => {
      const aVal = a[sortConfig.key!]
      const bVal = b[sortConfig.key!]

      if (sortConfig.key === 'date') {
        const [aD, aM, aY] = String(aVal).split('/')
        const [bD, bM, bY] = String(bVal).split('/')
        const dateA = new Date(Number(aY), Number(aM) - 1, Number(aD)).getTime()
        const dateB = new Date(Number(bY), Number(bM) - 1, Number(bD)).getTime()

        if (isNaN(dateA) || isNaN(dateB)) {
          const strA = String(aVal).toLowerCase()
          const strB = String(bVal).toLowerCase()
          if (strA < strB) return sortConfig.direction === 'asc' ? -1 : 1
          if (strA > strB) return sortConfig.direction === 'asc' ? 1 : -1
          return 0
        }

        return sortConfig.direction === 'asc' ? dateA - dateB : dateB - dateA
      }

      if (typeof aVal === 'string' && typeof bVal === 'string') {
        const cmp = aVal.localeCompare(bVal)
        return sortConfig.direction === 'asc' ? cmp : -cmp
      }

      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1
      return 0
    })
  }, [data, sortConfig])

  const totalPages = Math.ceil(sortedData.length / ROWS_PER_PAGE)
  const paginatedData = sortedData.slice(
    (currentPage - 1) * ROWS_PER_PAGE,
    currentPage * ROWS_PER_PAGE,
  )

  if (!data || data.length === 0) return null

  const headers: { label: string; key: keyof StreamData; align?: 'left' | 'right' }[] = [
    { label: 'Data', key: 'date', align: 'left' },
    { label: 'Apresentador', key: 'presenter', align: 'left' },
    { label: 'Pico', key: 'views', align: 'right' },
    { label: 'Retenção', key: 'retention', align: 'right' },
    { label: 'Vendas', key: 'sales', align: 'right' },
    { label: 'Conversão', key: 'conversion', align: 'right' },
    { label: 'Receita', key: 'revenue', align: 'right' },
  ]

  return (
    <div className="glass-panel rounded-2xl overflow-hidden flex flex-col">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-secondary/30">
            <TableRow className="border-b border-black/5 dark:border-white/5 hover:bg-transparent">
              {headers.map((header) => (
                <TableHead
                  key={header.key}
                  className={cn(
                    'font-semibold py-4 text-muted-foreground cursor-pointer select-none transition-colors hover:text-foreground',
                    header.align === 'right' && 'text-right',
                  )}
                  onClick={() => handleSort(header.key)}
                >
                  <div
                    className={cn(
                      'flex items-center gap-1',
                      header.align === 'right' && 'justify-end',
                    )}
                  >
                    {header.label}
                    {sortConfig.key === header.key ? (
                      sortConfig.direction === 'asc' ? (
                        <ArrowUp className="w-4 h-4" />
                      ) : (
                        <ArrowDown className="w-4 h-4" />
                      )
                    ) : (
                      <ArrowUpDown className="w-4 h-4 opacity-20" />
                    )}
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.map((row, index) => (
              <TableRow
                key={index}
                className="border-b border-black/5 dark:border-white/5 hover:bg-secondary/20 transition-colors"
              >
                <TableCell className="py-4 font-medium truncate max-w-[120px]">
                  {row.date}
                </TableCell>
                <TableCell className="py-4 text-muted-foreground truncate max-w-[160px]">
                  {row.presenter}
                </TableCell>
                <TableCell className="py-4 text-right text-muted-foreground">
                  {row.views.toLocaleString('pt-BR')}
                </TableCell>
                <TableCell className="py-4 text-right text-muted-foreground">
                  {row.retention.toFixed(1)}%
                </TableCell>
                <TableCell className="py-4 text-right text-muted-foreground">
                  {row.sales.toLocaleString('pt-BR')}
                </TableCell>
                <TableCell className="py-4 text-right font-medium text-primary">
                  {row.conversion.toFixed(1)}%
                </TableCell>
                <TableCell className="py-4 text-right font-semibold text-success">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                    row.revenue,
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="py-4 border-t border-black/5 dark:border-white/5 bg-secondary/10">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(e) => {
                    e.preventDefault()
                    setCurrentPage((p) => Math.max(1, p - 1))
                  }}
                  className={cn(
                    currentPage === 1 && 'pointer-events-none opacity-50 cursor-not-allowed',
                  )}
                />
              </PaginationItem>

              {Array.from({ length: totalPages }).map((_, i) => {
                if (
                  totalPages > 5 &&
                  i !== 0 &&
                  i !== totalPages - 1 &&
                  Math.abs(currentPage - 1 - i) > 1
                ) {
                  if (i === 1 && currentPage > 3) {
                    return (
                      <PaginationItem key={i}>
                        <PaginationEllipsis />
                      </PaginationItem>
                    )
                  }
                  if (i === totalPages - 2 && currentPage < totalPages - 2) {
                    return (
                      <PaginationItem key={i}>
                        <PaginationEllipsis />
                      </PaginationItem>
                    )
                  }
                  return null
                }

                return (
                  <PaginationItem key={i}>
                    <PaginationLink
                      href="#"
                      isActive={currentPage === i + 1}
                      onClick={(e) => {
                        e.preventDefault()
                        setCurrentPage(i + 1)
                      }}
                    >
                      {i + 1}
                    </PaginationLink>
                  </PaginationItem>
                )
              })}

              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(e) => {
                    e.preventDefault()
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }}
                  className={cn(
                    currentPage === totalPages &&
                      'pointer-events-none opacity-50 cursor-not-allowed',
                  )}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  )
}
