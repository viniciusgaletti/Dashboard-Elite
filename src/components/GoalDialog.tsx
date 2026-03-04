import { useState } from 'react'
import { toast } from 'sonner'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'

interface GoalDialogProps {
    isOpen: boolean
    onOpenChange: (open: boolean) => void
    currentMonth: number
    currentYear: number
    currentTarget: number
    onSave: (month: number, year: number, target: number) => Promise<{ error: string | null }>
}

const MONTHS = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
]

export function GoalDialog({
    isOpen,
    onOpenChange,
    currentMonth,
    currentYear,
    currentTarget,
    onSave,
}: GoalDialogProps) {
    const [month, setMonth] = useState(currentMonth)
    const [year, setYear] = useState(currentYear)
    const [target, setTarget] = useState(currentTarget > 0 ? currentTarget.toString() : '')
    const [isSaving, setIsSaving] = useState(false)

    const handleSave = async () => {
        const val = parseFloat(target.replace(/[^\d.,]/g, '').replace(',', '.'))
        if (isNaN(val) || val <= 0) {
            toast.error('Informe um valor válido para a meta.')
            return
        }
        setIsSaving(true)
        const { error } = await onSave(month, year, val)
        setIsSaving(false)
        if (error) {
            toast.error(error)
        } else {
            toast.success('Meta salva com sucesso!')
            onOpenChange(false)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[400px]">
                <DialogHeader>
                    <DialogTitle>Definir Meta Mensal</DialogTitle>
                    <DialogDescription>
                        Configure a meta de faturamento para o mês selecionado.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Mês</Label>
                            <Select value={month.toString()} onValueChange={(v) => setMonth(parseInt(v))}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {MONTHS.map((m, i) => (
                                        <SelectItem key={i} value={(i + 1).toString()}>
                                            {m}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Ano</Label>
                            <Select value={year.toString()} onValueChange={(v) => setYear(parseInt(v))}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {[2025, 2026, 2027].map((y) => (
                                        <SelectItem key={y} value={y.toString()}>
                                            {y}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Meta de Faturamento (R$)</Label>
                        <Input
                            type="text"
                            inputMode="decimal"
                            placeholder="Ex: 1.000.000"
                            value={target}
                            onChange={(e) => setTarget(e.target.value)}
                            className="text-lg font-semibold"
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancelar
                    </Button>
                    <Button onClick={handleSave} disabled={isSaving}>
                        {isSaving ? 'Salvando...' : 'Salvar Meta'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
