import { useState, useEffect } from 'react'
import { api, Entry } from '@/services/api'
import { useRealtime } from '@/hooks/use-realtime'
import { format, parseISO } from 'date-fns'
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
import { Plus, Trash2 } from 'lucide-react'
import { toast } from '@/hooks/use-toast'

export default function Entries() {
  const [entries, setEntries] = useState<Entry[]>([])
  const [isFormOpen, setIsFormOpen] = useState(false)

  const loadData = async () => {
    try {
      const data = await api.getAllEntries()
      setEntries(data)
    } catch {
      /* intentionally ignored */
    }
  }

  useEffect(() => {
    loadData()
  }, [])
  useRealtime('daily_entries', () => {
    loadData()
  })

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

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center bg-card p-6 rounded-xl border border-border shadow-elevation gap-4">
        <h2 className="text-2xl font-bold text-foreground">Lançamentos Financeiros</h2>
        <Button onClick={() => setIsFormOpen(true)} className="shadow-sm w-full sm:w-auto">
          <Plus className="w-4 h-4 mr-2" /> Novo Lançamento
        </Button>
      </div>

      <div className="bg-card rounded-xl shadow-elevation border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Observação</TableHead>
              <TableHead className="text-right">Valor</TableHead>
              <TableHead className="w-[60px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {entries.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center text-muted-foreground py-12 max-md:block"
                >
                  <div className="flex flex-col items-center">
                    <p className="text-lg font-medium mb-1 text-foreground">
                      Nenhum lançamento encontrado
                    </p>
                    <p className="text-sm">Clique em "Novo Lançamento" para começar.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              entries.map((e) => (
                <TableRow key={e.id} className="group">
                  <TableCell data-label="Data" className="text-foreground">
                    {format(parseISO(e.data), 'dd/MM/yyyy')}
                  </TableCell>
                  <TableCell data-label="Categoria">
                    <div className="font-semibold text-foreground">
                      {e.expand?.categoria_id?.nome_exibicao}
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5 uppercase tracking-wider">
                      {e.expand?.categoria_id?.grupo}
                    </div>
                  </TableCell>
                  <TableCell data-label="Observação" className="text-foreground">
                    {e.observacao || '-'}
                  </TableCell>
                  <TableCell
                    data-label="Valor"
                    className={`text-right font-bold ${e.tipo_movimentacao === 'entrada' ? 'text-primary' : 'text-accent'}`}
                  >
                    {e.tipo_movimentacao === 'entrada' ? '+' : '-'} R${' '}
                    {e.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </TableCell>
                  <TableCell data-label="Ação">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(e.id)}
                      className="opacity-100 sm:opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
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

      <EntryForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSuccess={() => toast({ title: 'Lançamento registrado com sucesso!' })}
      />
    </div>
  )
}
