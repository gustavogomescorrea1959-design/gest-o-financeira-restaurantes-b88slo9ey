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
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center bg-white p-4 rounded-lg border shadow-sm">
        <h2 className="text-xl font-bold text-slate-800">Lançamentos Financeiros</h2>
        <Button
          onClick={() => setIsFormOpen(true)}
          className="bg-emerald-600 hover:bg-emerald-700 shadow-sm"
        >
          <Plus className="w-4 h-4 mr-2" /> Novo Lançamento
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead className="font-semibold text-slate-700">Data</TableHead>
              <TableHead className="font-semibold text-slate-700">Categoria</TableHead>
              <TableHead className="font-semibold text-slate-700">Observação</TableHead>
              <TableHead className="text-right font-semibold text-slate-700">Valor</TableHead>
              <TableHead className="w-[60px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {entries.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-slate-500 py-12">
                  <div className="flex flex-col items-center">
                    <p className="text-lg font-medium mb-1">Nenhum lançamento encontrado</p>
                    <p className="text-sm">Clique em "Novo Lançamento" para começar.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              entries.map((e) => (
                <TableRow key={e.id} className="group transition-colors hover:bg-slate-50">
                  <TableCell className="text-slate-600">
                    {format(parseISO(e.data), 'dd/MM/yyyy')}
                  </TableCell>
                  <TableCell>
                    <div className="font-medium text-slate-800">
                      {e.expand?.categoria_id?.nome_exibicao}
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      {e.expand?.categoria_id?.grupo}
                    </div>
                  </TableCell>
                  <TableCell className="text-slate-600">{e.observacao || '-'}</TableCell>
                  <TableCell
                    className={`text-right font-bold ${e.tipo_movimentacao === 'entrada' ? 'text-emerald-600' : 'text-red-600'}`}
                  >
                    {e.tipo_movimentacao === 'entrada' ? '+' : '-'} R${' '}
                    {e.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(e.id)}
                      className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all"
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
