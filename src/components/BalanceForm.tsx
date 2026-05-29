import { useState, useEffect } from 'react'
import { api } from '@/services/api'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { format } from 'date-fns'
import { toast } from 'sonner'

interface BalanceFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function BalanceForm({ open, onOpenChange, onSuccess }: BalanceFormProps) {
  const [formData, setFormData] = useState({
    data: format(new Date(), 'yyyy-MM-dd'),
    saldo_caixa: 0,
    saldo_banco: 0,
    total_caixas_fisicos: 0,
  })

  useEffect(() => {
    if (open) {
      setFormData({
        data: format(new Date(), 'yyyy-MM-dd'),
        saldo_caixa: 0,
        saldo_banco: 0,
        total_caixas_fisicos: 0,
      })
      api
        .getLatestBalance()
        .then((latest) => {
          if (latest) {
            setFormData((prev) => ({
              ...prev,
              saldo_caixa: latest.saldo_caixa || 0,
              saldo_banco: latest.saldo_banco || 0,
              total_caixas_fisicos: latest.total_caixas_fisicos || 0,
            }))
          }
        })
        .catch(() => {})
    }
  }, [open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await api.createBalance({
        data: new Date(formData.data + 'T12:00:00.000Z').toISOString(),
        saldo_caixa: formData.saldo_caixa,
        saldo_banco: formData.saldo_banco,
        total_caixas_fisicos: formData.total_caixas_fisicos,
      })
      toast.success('Saldos atualizados com sucesso!', { duration: 3000 })
      onSuccess()
      onOpenChange(false)
    } catch (err) {
      console.error(err)
      toast.error('Erro ao atualizar saldos.')
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Atualizar Saldos</SheetTitle>
        </SheetHeader>
        <form onSubmit={handleSubmit} className="space-y-6 mt-6">
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
              value={formData.saldo_caixa || ''}
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
              value={formData.saldo_banco || ''}
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
              value={formData.total_caixas_fisicos || ''}
              onChange={(e) =>
                setFormData({ ...formData, total_caixas_fisicos: parseFloat(e.target.value) || 0 })
              }
              required
            />
          </div>
          <Button type="submit" className="w-full h-12 text-base shadow-sm mt-4">
            Salvar Saldos
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  )
}
