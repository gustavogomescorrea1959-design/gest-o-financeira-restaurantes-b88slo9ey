import { useState, useEffect, useMemo } from 'react'
import { api, Entry, Category } from '@/services/api'
import { useRealtime } from '@/hooks/use-realtime'
import { format, startOfMonth, endOfMonth } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Button } from '@/components/ui/button'
import { EntryForm } from '@/components/EntryForm'
import { Plus, ChevronLeft, ChevronRight } from 'lucide-react'
import { toast } from '@/hooks/use-toast'
import { EntriesFilters } from '@/components/entries/EntriesFilters'
import { EntriesTable } from '@/components/entries/EntriesTable'

export default function Entries() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [entries, setEntries] = useState<Entry[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [filters, setFilters] = useState({
    grupo: 'all',
    subgrupo: 'all',
    categoria_id: 'all',
    search: '',
  })

  const loadData = async () => {
    const start = startOfMonth(currentDate).toISOString()
    const end = endOfMonth(currentDate).toISOString()
    const [e, c] = await Promise.all([api.getEntriesByDateRange(start, end), api.getCategories()])
    setEntries(e)
    setCategories(c)
  }

  useEffect(() => {
    loadData()
  }, [currentDate])
  useRealtime('daily_entries', () => {
    loadData()
  })

  const filteredEntries = useMemo(() => {
    return entries.filter((e) => {
      const cat = e.expand?.categoria_id
      if (!cat) return false
      if (filters.grupo !== 'all' && cat.grupo !== filters.grupo) return false
      if (filters.subgrupo !== 'all' && cat.subgrupo !== filters.subgrupo) return false
      if (filters.categoria_id !== 'all' && cat.id !== filters.categoria_id) return false
      if (filters.search && !e.observacao?.toLowerCase().includes(filters.search.toLowerCase()))
        return false
      return true
    })
  }, [entries, filters])

  const handleDelete = async (id: string) => {
    if (confirm('Excluir este lançamento?')) {
      try {
        await api.deleteEntry(id)
        toast({ title: 'Excluído com sucesso' })
      } catch {
        toast({ title: 'Erro ao excluir', variant: 'destructive' })
      }
    }
  }

  return (
    <div className="space-y-6 animate-fade-in pb-8">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center bg-card p-4 rounded-xl border shadow-sm gap-4">
        <h2 className="text-2xl font-bold text-foreground">Lançamentos</h2>
        <div className="flex items-center gap-4">
          <div className="flex items-center bg-muted/50 rounded-lg p-1 border">
            <Button
              variant="ghost"
              size="icon"
              onClick={() =>
                setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
              }
              className="h-8 w-8"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="w-32 text-center font-semibold capitalize">
              {format(currentDate, 'MMM yyyy', { locale: ptBR })}
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() =>
                setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
              }
              className="h-8 w-8"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
          <Button onClick={() => setIsFormOpen(true)} className="gap-2">
            <Plus className="w-4 h-4" /> Novo
          </Button>
        </div>
      </div>

      <EntriesFilters categories={categories} filters={filters} setFilters={setFilters} />
      <EntriesTable entries={filteredEntries} onDelete={handleDelete} />
      <EntryForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSuccess={() => toast({ title: 'Salvo com sucesso' })}
      />
    </div>
  )
}
