import { useState, useEffect, useMemo } from 'react'
import { api, Entry } from '@/services/api'
import { useRealtime } from '@/hooks/use-realtime'
import { format, parseISO, isSameMonth } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { EntryForm } from '@/components/EntryForm'
import { Plus, Trash2, ChevronLeft, ChevronRight } from 'lucide-react'
import { toast } from '@/hooks/use-toast'

export default function Entries() {
  const [entries, setEntries] = useState<Entry[]>([])
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [loadingError, setLoadingError] = useState(false)

  const loadData = async () => {
    try {
      setLoadingError(false)
      const data = await api.getAllEntries()
      setEntries(data)
    } catch {
      setLoadingError(true)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  useRealtime('daily_entries', () => {
    loadData()
  })

  const filteredEntries = useMemo(() => {
    return entries.filter((e) => isSameMonth(parseISO(e.data), currentDate))
  }, [entries, currentDate])

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este lançamento?')) {
      try {
        await api.deleteEntry(id)
        toast({ title: 'Excluído com sucesso' })
      } catch (err) {
        toast({ title: 'Erro ao excluir', variant: 'destructive' })
      }
    }
  }

  const prevMonth = () =>
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  const nextMonth = () =>
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center bg-card p-6 rounded-xl border border-border shadow-sm gap-4">
        <h2 className="text-2xl font-bold text-foreground">Lançamentos Diários</h2>

        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center bg-muted/50 rounded-lg p-1 border">
            <Button
              variant="ghost"
              size="icon"
              onClick={prevMonth}
              className="h-8 w-8 transition-colors duration-150"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="w-32 text-center font-semibold capitalize text-foreground">
              {format(currentDate, 'MMMM yyyy', { locale: ptBR })}
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={nextMonth}
              className="h-8 w-8 transition-colors duration-150"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
          <Button
            onClick={() => setIsFormOpen(true)}
            className="shadow-sm transition-all duration-150 hover:bg-primary/90 w-full sm:w-auto"
          >
            <Plus className="w-4 h-4 mr-2" /> Novo
          </Button>
        </div>
      </div>

      {loadingError && (
        <div className="p-4 bg-destructive/10 text-destructive border border-destructive/20 rounded-lg flex flex-col items-center justify-center space-y-2">
          <p>Não foi possivel carregar os dados. Tente novamente.</p>
          <Button variant="outline" onClick={loadData}>
            Tentar Novamente
          </Button>
        </div>
      )}

      {/* Desktop Table */}
      <div className="hidden md:block bg-card rounded-xl shadow-sm border border-border overflow-hidden">
        <Table>
          <TableHeader className="bg-primary hover:bg-primary">
            <TableRow className="hover:bg-transparent">
              <TableHead className="text-primary-foreground font-semibold py-3">Data</TableHead>
              <TableHead className="text-primary-foreground font-semibold py-3">
                Classificação (Grupo &gt; Conta)
              </TableHead>
              <TableHead className="text-primary-foreground font-semibold py-3">
                Observação
              </TableHead>
              <TableHead className="text-right text-primary-foreground font-semibold py-3">
                Valor
              </TableHead>
              <TableHead className="w-[60px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredEntries.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-12">
                  Nenhum lançamento encontrado para este mês.
                </TableCell>
              </TableRow>
            ) : (
              filteredEntries.map((e, index) => (
                <TableRow
                  key={e.id}
                  className={`group transition-colors duration-150 ${index % 2 === 0 ? 'bg-background' : 'bg-muted/20'}`}
                >
                  <TableCell className="text-foreground font-medium">
                    {format(parseISO(e.data), 'dd/MM/yyyy')}
                  </TableCell>
                  <TableCell>
                    <div className="font-semibold text-foreground">
                      {e.expand?.categoria_id?.nome_exibicao}
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5 uppercase tracking-wider">
                      {e.expand?.categoria_id?.grupo} &gt; {e.expand?.categoria_id?.subgrupo}
                    </div>
                  </TableCell>
                  <TableCell
                    className="text-foreground truncate max-w-[200px]"
                    title={e.observacao}
                  >
                    {e.observacao || '-'}
                  </TableCell>
                  <TableCell
                    className={`text-right font-bold ${e.tipo_movimentacao === 'entrada' ? 'text-primary' : 'text-accent'}`}
                  >
                    {e.tipo_movimentacao === 'entrada' ? '+' : '-'} R${' '}
                    {e.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(e.id)}
                      className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all duration-150"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-4">
        {filteredEntries.length === 0 ? (
          <div className="text-center text-muted-foreground py-12 bg-card rounded-xl border">
            Nenhum lançamento encontrado para este mês.
          </div>
        ) : (
          filteredEntries.map((e) => (
            <div
              key={e.id}
              className="bg-card p-4 rounded-xl border shadow-sm flex flex-col gap-2 relative transition-all duration-150 hover:shadow-md"
            >
              <div className="flex justify-between items-start pr-8">
                <span className="text-sm font-semibold text-foreground">
                  {format(parseISO(e.data), 'dd/MM/yyyy')}
                </span>
                <span
                  className={`font-bold ${e.tipo_movimentacao === 'entrada' ? 'text-primary' : 'text-accent'}`}
                >
                  {e.tipo_movimentacao === 'entrada' ? '+' : '-'} R${' '}
                  {e.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div>
                <div className="font-bold text-foreground">
                  {e.expand?.categoria_id?.nome_exibicao}
                </div>
                <div className="text-xs text-muted-foreground uppercase">
                  {e.expand?.categoria_id?.grupo} &gt; {e.expand?.categoria_id?.subgrupo}
                </div>
              </div>
              {e.observacao && (
                <div className="text-sm text-muted-foreground italic mt-1 bg-muted/30 p-2 rounded-md border">
                  {e.observacao}
                </div>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleDelete(e.id)}
                className="absolute top-2 right-2 text-muted-foreground hover:text-destructive h-8 w-8 transition-colors duration-150"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))
        )}
      </div>

      <EntryForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSuccess={() => toast({ title: 'Lançamento registrado com sucesso!' })}
      />
    </div>
  )
}
