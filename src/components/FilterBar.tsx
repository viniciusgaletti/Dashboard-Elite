import React, { useState } from 'react'
import {
  format,
  subDays,
  startOfMonth,
  endOfMonth,
  subMonths,
  startOfDay,
  endOfDay,
} from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { CalendarIcon } from 'lucide-react'

import { FilterState } from '@/types/stream'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { MultiSelect } from '@/components/ui/multi-select'
import { cn } from '@/lib/utils'

const VISIBLE_WEEKS = 8

import { ComparisonPeriodInfo } from '@/hooks/use-dashboard-analytics'

interface FilterBarProps {
  filterState: FilterState
  setFilterState: React.Dispatch<React.SetStateAction<FilterState>>
  availableHosts: string[]
  availableWeekDates: string[]
  comparisonPeriod: ComparisonPeriodInfo | null
}

export function FilterBar({
  filterState,
  setFilterState,
  availableHosts,
  availableWeekDates,
  comparisonPeriod,
}: FilterBarProps) {
  const [showOlderWeeks, setShowOlderWeeks] = useState(false)

  const recentDates = availableWeekDates.slice(0, VISIBLE_WEEKS)
  const olderDates = availableWeekDates.slice(VISIBLE_WEEKS)

  const handlePresetChange = (val: string) => {
    const today = new Date()
    let start = null
    let end = null
    switch (val) {
      case '7d':
        start = subDays(today, 7)
        end = today
        break
      case '15d':
        start = subDays(today, 15)
        end = today
        break
      case '30d':
        start = subDays(today, 30)
        end = today
        break
      case 'mes_atual':
        start = startOfMonth(today)
        end = today
        break
      case 'mes_passado':
        start = startOfMonth(subMonths(today, 1))
        end = endOfMonth(subMonths(today, 1))
        break
      case 'all':
      default:
        break
    }
    setFilterState((p) => ({
      ...p,
      dataInicio: start ? startOfDay(start) : null,
      dataFim: end ? endOfDay(end) : null,
    }))
  }

  const daysOfWeek = [
    { value: 'all', label: 'Todos os dias' },
    { value: '0', label: 'Domingo' },
    { value: '1', label: 'Segunda-feira' },
    { value: '2', label: 'Terça-feira' },
    { value: '3', label: 'Quarta-feira' },
    { value: '4', label: 'Quinta-feira' },
    { value: '5', label: 'Sexta-feira' },
    { value: '6', label: 'Sábado' },
  ]

  const toggleWeekDate = (date: string) => {
    setFilterState((p) => {
      const selected = p.weeklyComparisonSelectedDates
      if (selected.includes(date)) {
        return { ...p, weeklyComparisonSelectedDates: selected.filter((d) => d !== date) }
      }
      return { ...p, weeklyComparisonSelectedDates: [...selected, date] }
    })
  }

  const handleWeeklyDayChange = (v: string) => {
    setFilterState((p) => ({
      ...p,
      weeklyComparisonDay: v,
      weeklyComparisonSelectedDates: [],
    }))
  }

  return (
    <div className="sticky top-4 z-40 w-full glass-panel rounded-2xl p-4 flex flex-col gap-4 shadow-elevation border border-border/50 mb-8 backdrop-blur-2xl">
      <div className="flex flex-wrap gap-4 items-end">
        <div className="space-y-1.5 flex-1 min-w-[160px]">
          <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Período
          </Label>
          <Select onValueChange={handlePresetChange}>
            <SelectTrigger className="bg-background/50">
              <SelectValue placeholder="Selecione..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todo o período</SelectItem>
              <SelectItem value="7d">Últimos 7 dias</SelectItem>
              <SelectItem value="15d">Últimos 15 dias</SelectItem>
              <SelectItem value="30d">Últimos 30 dias</SelectItem>
              <SelectItem value="mes_atual">Este mês</SelectItem>
              <SelectItem value="mes_passado">Mês passado</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5 flex-1 min-w-[140px]">
          <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            De
          </Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  'w-full justify-start text-left font-normal bg-background/50',
                  !filterState.dataInicio && 'text-muted-foreground',
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4 opacity-50" />
                {filterState.dataInicio
                  ? format(filterState.dataInicio, 'dd/MM/yyyy')
                  : 'Selecione'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 glass-panel" align="start">
              <Calendar
                mode="single"
                selected={filterState.dataInicio || undefined}
                onSelect={(d) => setFilterState((p) => ({ ...p, dataInicio: d || null }))}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-1.5 flex-1 min-w-[140px]">
          <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Até
          </Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  'w-full justify-start text-left font-normal bg-background/50',
                  !filterState.dataFim && 'text-muted-foreground',
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4 opacity-50" />
                {filterState.dataFim ? format(filterState.dataFim, 'dd/MM/yyyy') : 'Selecione'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 glass-panel" align="start">
              <Calendar
                mode="single"
                selected={filterState.dataFim || undefined}
                onSelect={(d) => setFilterState((p) => ({ ...p, dataFim: d || null }))}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-1.5 flex-1 min-w-[200px]">
          <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Apresentadores
          </Label>
          <MultiSelect
            options={availableHosts}
            selected={filterState.apresentadores}
            onChange={(ap) => setFilterState((p) => ({ ...p, apresentadores: ap }))}
            placeholder="Todos"
          />
        </div>

        <div className="space-y-1.5 flex-1 min-w-[160px]">
          <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Dia da Semana
          </Label>
          <Select
            value={filterState.diaSemana}
            onValueChange={(v) => setFilterState((p) => ({ ...p, diaSemana: v }))}
          >
            <SelectTrigger className="bg-background/50">
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              {daysOfWeek.map((d) => (
                <SelectItem key={d.value} value={d.value}>
                  {d.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex flex-wrap gap-6 items-center pt-3 border-t border-border/30 mt-1">
        <div className="flex items-center space-x-2">
          <Switch
            id="comp-mensal"
            checked={filterState.comparisonEnabled}
            onCheckedChange={(c) => setFilterState((p) => ({ ...p, comparisonEnabled: c }))}
          />
          <Label htmlFor="comp-mensal" className="cursor-pointer">
            Comparação Mensal
          </Label>
        </div>
        <div className="flex items-center space-x-2">
          <Switch
            id="comp-semanal"
            checked={filterState.weeklyComparisonEnabled}
            onCheckedChange={(c) => setFilterState((p) => ({ ...p, weeklyComparisonEnabled: c }))}
          />
          <Label htmlFor="comp-semanal" className="cursor-pointer">
            Comparação Semanal
          </Label>
        </div>

        {filterState.weeklyComparisonEnabled && (
          <div className="flex items-center space-x-3 ml-auto animate-fade-in">
            <Select value={filterState.weeklyComparisonDay} onValueChange={handleWeeklyDayChange}>
              <SelectTrigger className="bg-background/50 w-[160px] h-8 text-xs">
                <SelectValue placeholder="Dia da semana" />
              </SelectTrigger>
              <SelectContent>
                {daysOfWeek.map((d) => (
                  <SelectItem key={d.value} value={d.value}>
                    {d.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {comparisonPeriod && filterState.comparisonEnabled && (
        <div className="flex items-center gap-2 pt-2 animate-fade-in">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold bg-emerald-500/15 text-emerald-400 px-3 py-1 rounded-full">
            Atual: {comparisonPeriod.currentLabel}
          </span>
          <span className="text-[11px] text-muted-foreground">vs.</span>
          <span className="inline-flex items-center gap-1.5 text-[11px] font-medium bg-secondary/50 text-muted-foreground px-3 py-1 rounded-full">
            {comparisonPeriod.previousLabel}
          </span>
        </div>
      )}

      {filterState.weeklyComparisonEnabled &&
        filterState.weeklyComparisonDay !== 'all' &&
        availableWeekDates.length > 0 && (
          <div className="flex flex-col gap-3 pt-3 border-t border-border/30 animate-fade-in">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-primary bg-primary/10 px-2.5 py-1 rounded-full">
                  {filterState.weeklyComparisonSelectedDates.length} semana
                  {filterState.weeklyComparisonSelectedDates.length !== 1 ? 's' : ''}
                </span>
                <div className="flex gap-1.5 ml-2">
                  <button
                    onClick={() => {
                      const top2 = availableWeekDates.slice(0, 2)
                      setFilterState((p) => ({ ...p, weeklyComparisonSelectedDates: top2 }))
                    }}
                    className="text-[10px] text-muted-foreground hover:text-foreground px-2 py-0.5 rounded bg-secondary/40 hover:bg-secondary transition-colors"
                  >
                    2 mais recentes
                  </button>
                  {filterState.weeklyComparisonSelectedDates.length > 0 && (
                    <button
                      onClick={() =>
                        setFilterState((p) => ({ ...p, weeklyComparisonSelectedDates: [] }))
                      }
                      className="text-[10px] text-muted-foreground hover:text-red-400 px-2 py-0.5 rounded bg-secondary/40 hover:bg-secondary transition-colors"
                    >
                      Limpar
                    </button>
                  )}
                </div>
              </div>
              {availableWeekDates.length > VISIBLE_WEEKS && (
                <button
                  onClick={() => setShowOlderWeeks((v) => !v)}
                  className="text-[10px] font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
                >
                  {showOlderWeeks
                    ? 'Ocultar anteriores'
                    : `Ver anteriores (${availableWeekDates.length - VISIBLE_WEEKS})`}
                  <span
                    className={cn(
                      'transition-transform duration-200 text-[8px]',
                      showOlderWeeks && 'rotate-180',
                    )}
                  >
                    ▼
                  </span>
                </button>
              )}
            </div>

            <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
              {recentDates.map((date, idx) => {
                const isSelected = filterState.weeklyComparisonSelectedDates.includes(date)
                const isNewest = idx === 0
                return (
                  <button
                    key={date}
                    onClick={() => toggleWeekDate(date)}
                    className={cn(
                      'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium transition-all duration-200 whitespace-nowrap flex-shrink-0',
                      isSelected
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground',
                    )}
                  >
                    <span
                      className="inline-block w-1.5 h-1.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: isSelected ? 'currentColor' : 'transparent' }}
                    />
                    {date}
                    {isNewest && <span className="text-[9px] opacity-70">(Atual)</span>}
                  </button>
                )
              })}
            </div>

            {showOlderWeeks && olderDates.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1 border-t border-border/20 animate-fade-in">
                {olderDates.map((date) => {
                  const isSelected = filterState.weeklyComparisonSelectedDates.includes(date)
                  return (
                    <button
                      key={date}
                      onClick={() => toggleWeekDate(date)}
                      className={cn(
                        'inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium transition-all duration-200',
                        isSelected
                          ? 'bg-primary text-primary-foreground shadow-sm'
                          : 'bg-secondary/30 text-muted-foreground hover:bg-secondary hover:text-foreground',
                      )}
                    >
                      {date}
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        )}
    </div>
  )
}
