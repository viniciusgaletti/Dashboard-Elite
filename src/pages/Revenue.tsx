import { SalesTable } from '@/components/SalesTable'
import { Button } from '@/components/ui/button'
import { Upload, Filter } from 'lucide-react'
import { toast } from 'sonner'

export default function Revenue() {
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      toast.info('Processando arquivo CSV...')
      const reader = new FileReader()
      reader.onload = () => {
        // Basic simulation of parsing and success
        setTimeout(() => {
          toast.success('CSV importado com sucesso! Dados atualizados.')
        }, 1500)
      }
      reader.readAsText(file)
    }
  }

  return (
    <div className="space-y-6 animate-fade-in-up pb-8">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <Button variant="outline" className="rounded-xl h-11 border-black/10 bg-card shadow-subtle">
          <Filter className="w-4 h-4 mr-2 text-muted-foreground" /> Filtrar Mês
        </Button>

        <div className="relative w-full sm:w-auto">
          <input
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            title="Importar CSV"
          />
          <Button className="rounded-xl h-11 px-6 w-full pointer-events-none">
            <Upload className="w-4 h-4 mr-2" /> Importar CSV
          </Button>
        </div>
      </div>

      <SalesTable />
    </div>
  )
}
