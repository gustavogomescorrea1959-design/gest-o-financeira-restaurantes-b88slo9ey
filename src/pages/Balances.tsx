import { useEffect, useState } from 'react'
import pb from '@/lib/pocketbase/client'
import { useAuth } from '@/hooks/use-auth'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, Trash2, Edit } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { toast } from 'sonner'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useRealtime } from '@/hooks/use-realtime'
import { Skeleton } from '@/components/ui/skeleton'

export default function Balances() {
  const { user } = useAuth()
  const [balances, setBalances] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const [formOpen, setFormOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    data: format(new Date(), 'yyyy-MM-dd'),
    saldo_caixa: 0,
    saldo_banco: 0,
    total_caixas_fisicos: 0,
  })

  const [deleteId, setDeleteId] = useState<string | null>(null)

  const loadData = async () => {
    try {
      setLoading(true)
      const records = await pb.collection('bank_balances').getFullList({
        sort: '-data',
      })
      setBalances(records)
    } catch (err) {
      toast.error('Erro ao carregar saldos')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  useRealtime('bank_balances', () => {
    loadData()
  })

  const openNew = () => {
    setEditingId(null)
    setFormData({
      data: format(new Date(), 'yyyy-MM-dd'),
      saldo_caixa: 0,
      saldo_banco: 0,
      total_caixas_fisicos: 0,
    })
    setFormOpen(true)
  }

  const openEdit = (record: any) => {
    setEditingId(record.id)
    setFormData({
      data: record.data.split(' ')[0].split('T')[0],
      saldo_caixa: record.saldo_caixa,
      saldo_banco: record.saldo_banco,
      total_caixas_fisicos: record.total_caixas_fisicos,
    })
    setFormOpen(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const data = {
        restaurant_id: user?.restaurant_id,
        data: new Date(formData.data + 'T12:00:00.000Z').toISOString(),
        saldo_caixa: formData.saldo_caixa,
        saldo_banco: formData.saldo_banco,
        total_caixas_fisicos: formData.total_caixas_fisicos,
      }

      if (editingId) {
        await pb.collection('bank_balances').update(editingId, data)
        toast.success('Saldo atualizado com sucesso!')
      } else {
        await pb.collection('bank_balances').create(data)
        toast.success('Saldo criado com sucesso!')
      }
      setFormOpen(false)
      loadData()
    } catch (err) {
      toast.error('Erro ao salvar saldo')
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      await pb.collection('bank_balances').delete(deleteId)
      toast.success('Saldo excluído com sucesso!')
      loadData()
    } catch (err) {
      toast.error('Erro ao excluir saldo')
    } finally {
      setDeleteId(null)
    }
  }

  const fmtCurrency = (val: number) =>
    val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Gestão de Saldos</h2>
          <p className="text-muted-foreground">
            Adicione, edite ou remova os saldos bancários e de caixa.
          </p>
        </div>
        <Button onClick={openNew} className="gap-2 w-full sm:w-auto">
          <Plus className="w-4 h-4" /> Novo Saldo
        </Button>
      </div>

      <Card className="border shadow-sm">
        <CardContent className="p-0 overflow-x-auto">
          <Table className="min-w-[600px]">
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Saldo Caixa</TableHead>
                <TableHead>Saldo Banco</TableHead>
                <TableHead>Caixas Físicos</TableHead>
                <TableHead className="w-[100px] text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <Skeleton className="h-4 w-20" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-24" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-24" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-24" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-8 w-16 float-right" />
                    </TableCell>
                  </TableRow>
                ))
              ) : balances.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    Nenhum saldo registrado.
                  </TableCell>
                </TableRow>
              ) : (
                balances.map((b) => (
                  <TableRow key={b.id} className="hover:bg-muted/30">
                    <TableCell className="font-medium">
                      {format(parseISO(b.data), 'dd/MM/yyyy')}
                    </TableCell>
                    <TableCell>{fmtCurrency(b.saldo_caixa || 0)}</TableCell>
                    <TableCell>{fmtCurrency(b.saldo_banco || 0)}</TableCell>
                    <TableCell>{fmtCurrency(b.total_caixas_fisicos || 0)}</TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(b)}>
                          <Edit className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => setDeleteId(b.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Editar Saldo' : 'Novo Saldo'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-5 mt-4">
            <div className="space-y-2">
              <Label>Data de Referência</Label>
              <Input
                type="date"
                value={formData.data}
                onChange={(e) => setFormData({ ...formData, data: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Saldo de Caixa (R$)</Label>
              <Input
                type="number"
                step="0.01"
                value={formData.saldo_caixa}
                onChange={(e) =>
                  setFormData({ ...formData, saldo_caixa: parseFloat(e.target.value) || 0 })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Saldo em Banco (R$)</Label>
              <Input
                type="number"
                step="0.01"
                value={formData.saldo_banco}
                onChange={(e) =>
                  setFormData({ ...formData, saldo_banco: parseFloat(e.target.value) || 0 })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Total em Caixas Físicos (R$)</Label>
              <Input
                type="number"
                step="0.01"
                value={formData.total_caixas_fisicos}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    total_caixas_fisicos: parseFloat(e.target.value) || 0,
                  })
                }
                required
              />
            </div>
            <DialogFooter className="gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setFormOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit">Salvar</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir saldo?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O registro de saldo será permanentemente removido do
              sistema.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
