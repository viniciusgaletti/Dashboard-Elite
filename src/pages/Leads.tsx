import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, Plus, Phone, Mail } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

const MOCK_LEADS = [
  {
    id: 1,
    name: 'Marcos Almeida',
    company: 'Tech Corp',
    status: 'Em Negociação',
    value: 'R$ 15.000',
    seed: 21,
  },
  {
    id: 2,
    name: 'Ana Costa',
    company: 'Design Studio',
    status: 'Novo',
    value: 'R$ 5.400',
    seed: 44,
  },
  {
    id: 3,
    name: 'Carlos Lima',
    company: 'Logistics SA',
    status: 'Fechado',
    value: 'R$ 22.000',
    seed: 33,
  },
  {
    id: 4,
    name: 'Beatriz Silva',
    company: 'Marketing Co',
    status: 'Frio',
    value: 'R$ 3.000',
    seed: 15,
  },
]

export default function Leads() {
  return (
    <div className="space-y-6 animate-fade-in-up pb-8">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar leads..."
            className="pl-10 h-11 rounded-xl bg-secondary/50 border-0"
          />
        </div>
        <Button className="rounded-xl h-11 px-6 w-full sm:w-auto">
          <Plus className="w-4 h-4 mr-2" /> Novo Lead
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {MOCK_LEADS.map((lead) => (
          <Card
            key={lead.id}
            className="shadow-subtle hover:shadow-elevation transition-all border-0 cursor-pointer"
          >
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <Avatar className="w-12 h-12">
                  <AvatarImage src={`https://img.usecurling.com/ppl/thumbnail?seed=${lead.seed}`} />
                  <AvatarFallback>{lead.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <span
                  className={`text-[10px] uppercase font-bold px-2 py-1 rounded-full ${
                    lead.status === 'Fechado'
                      ? 'bg-success/10 text-success'
                      : lead.status === 'Novo'
                        ? 'bg-primary/10 text-primary'
                        : 'bg-secondary text-muted-foreground'
                  }`}
                >
                  {lead.status}
                </span>
              </div>
              <h3 className="text-headline mb-1">{lead.name}</h3>
              <p className="text-body text-muted-foreground mb-4">{lead.company}</p>

              <div className="flex justify-between items-center border-t border-border pt-4">
                <span className="font-semibold text-primary">{lead.value}</span>
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full bg-secondary">
                    <Phone className="w-3.5 h-3.5 text-muted-foreground" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full bg-secondary">
                    <Mail className="w-3.5 h-3.5 text-muted-foreground" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
