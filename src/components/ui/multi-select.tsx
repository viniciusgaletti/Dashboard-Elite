import React from 'react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ChevronDown } from 'lucide-react'

interface MultiSelectProps {
  options: string[]
  selected: string[]
  onChange: (selected: string[]) => void
  placeholder?: string
}

export function MultiSelect({
  options,
  selected,
  onChange,
  placeholder = 'Selecione...',
}: MultiSelectProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="w-full justify-between font-normal bg-background/50 border-input hover:bg-secondary/50"
        >
          <span className="truncate">
            {selected.length > 0 ? `${selected.length} selecionados` : placeholder}
          </span>
          <ChevronDown className="h-4 w-4 opacity-50 shrink-0" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[240px] p-0 border-border/50 glass-panel shadow-xl"
        align="start"
      >
        <ScrollArea className="h-64 p-4">
          <div className="space-y-3">
            {options.map((opt) => (
              <div key={opt} className="flex items-center space-x-2">
                <Checkbox
                  id={opt}
                  checked={selected.includes(opt)}
                  onCheckedChange={(c) => {
                    if (c) onChange([...selected, opt])
                    else onChange(selected.filter((x) => x !== opt))
                  }}
                />
                <label
                  htmlFor={opt}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  {opt}
                </label>
              </div>
            ))}
            {options.length === 0 && (
              <div className="text-sm text-muted-foreground text-center py-4">
                Nenhum item disponível
              </div>
            )}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  )
}
