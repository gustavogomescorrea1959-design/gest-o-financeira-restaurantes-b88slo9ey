import { useEffect, useState } from 'react'
import { api, BankBalance } from '@/services/api'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { PlusCircle, Pencil, Trash2 } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { BalanceForm } from '@/components/BalanceForm'
import { useRealtime } from '@/hooks/use-realtime'
import { toast } from 'sonner'
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
import { Skeleton } from '@/components/ui/skeleton'

export default function Balances() {
  const [balances, setBalances] = useState<BankBalance[]>([])
  const [loading, setLoading] = useState(true)
  const [formOpen, setFormOpen] = useState(false)
  const [editingBalance, setEditingBalance] = useState<BankBalance | null>(null)

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [balanceToDelete, setBalanceToDelete] = useState<string | null>(null)

  const loadData = async (silent = false) => {
    try {
      if (!silent) setLoading(true)
      const data = await api.getAllBalances()
      setBalances(data)
    } catch (err) {
      if (!silent) toast.error('Erro ao carregar saldos.')
    } finally {
      if (!silent) setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  useRealtime('bank_balances', () => {
    loadData(true)
  })

  const handleEdit = (b: BankBalance) => {
    setEditingBalance(b)
    setFormOpen(true)
  }

  const handleDeleteClick = (id: string) => {
    setBalanceToDelete(id)
    setDeleteConfirmOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!balanceToDelete) return
    try {
      await api.deleteBalance(balanceToDelete)
      toast.success('Registro excluído com sucesso.')
    } catch (err) {
      toast.error('Erro ao excluir registro.')
    } finally {
      setDeleteConfirmOpen(false)
      setBalanceToDelete(null)
    }
  }

  const formatCurrency = (val: number) =>
    `R$ ${val.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

  return (
    <div className="space-y-6 animate-fade-in pb-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground tracking-tight">Gestão de Saldos</h2>
          <p className="text-muted-foreground">
            Acompanhe e gerencie os saldos diários de caixa e banco
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingBalance(null)
            setFormOpen(true)
          }}
          className="gap-2"
        >
          <PlusCircle className="w-4 h-4" />
          Registrar Saldo
        </Button>
      </div>

      <Card className="border shadow-sm rounded-xl">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">Histórico de Saldos</CardTitle>
          <CardDescription>Visualização em ordem cronológica</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-x-auto">
            <Table className="min-w-[600px]">
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead className="text-right">Caixa (Sistema)</TableHead>
                  <TableHead className="text-right">Banco</TableHead>
                  <TableHead className="text-right">Caixa Físico</TableHead>
                  <TableHead className="text-right">Diferença</TableHead>
                  <TableHead className="w-[100px] text-center">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell>
                        <Skeleton className="h-4 w-24" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-20 ml-auto" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-20 ml-auto" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-20 ml-auto" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-20 ml-auto" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-8 w-16 mx-auto" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : balances.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                      Nenhum saldo registrado.
                    </TableCell>
                  </TableRow>
                ) : (
                  balances.map((b) => {
                    const diff = b.total_caixas_fisicos - b.saldo_caixa
                    return (
                      <TableRow key={b.id}>
                        <TableCell className="font-medium whitespace-nowrap">
                          {format(parseISO(b.data), 'dd/MM/yyyy')}
                        </TableCell>
                        <TableCell className="text-right whitespace-nowrap">
                          {formatCurrency(b.saldo_caixa)}
                        </TableCell>
                        <TableCell className="text-right whitespace-nowrap">
                          {formatCurrency(b.saldo_banco)}
                        </TableCell>
                        <TableCell className="text-right whitespace-nowrap">
                          {formatCurrency(b.total_caixas_fisicos)}
                        </TableCell>
                        <TableCell
                          className={`text-right font-semibold whitespace-nowrap ${diff < 0 ? 'text-destructive' : diff > 0 ? 'text-green-600' : 'text-muted-foreground'}`}
                        >
                          {diff > 0 ? '+' : ''}
                          {formatCurrency(diff)}
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-center gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEdit(b)}
                              className="h-8 w-8 text-muted-foreground hover:text-primary"
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteClick(b.id)}
                              className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <BalanceForm
        open={formOpen}
        onOpenChange={setFormOpen}
        onSuccess={loadData}
        initialData={editingBalance}
      />

      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir registro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O registro de saldos será removido permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
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
