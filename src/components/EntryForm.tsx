import { useState, useEffect } from 'react'
import { api, Category, Entry } from '@/services/api'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { format } from 'date-fns'

interface EntryFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function EntryForm({ open, onOpenChange, onSuccess }: EntryFormProps) {
  const [categories, setCategories] = useState<Category[]>([])
  const [formData, setFormData] = useState<Partial<Entry>>({
    data: format(new Date(), 'yyyy-MM-dd'),
    tipo_movimentacao: 'saida',
    valor: 0,
    observacao: '',
  })
  const [selectedGroup, setSelectedGroup] = useState<string>('')

  useEffect(() => {
    if (open) {
      api.getCategories().then(setCategories)
      setFormData({
        data: format(new Date(), 'yyyy-MM-dd'),
        tipo_movimentacao: 'saida',
        valor: undefined,
        observacao: '',
      })
      setSelectedGroup('')
    }
  }, [open])

  const groups = Array.from(new Set(categories.map((c) => c.grupo)))
  const filteredCategories = categories.filter((c) => c.grupo === selectedGroup)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await api.createEntry({
        ...formData,
        data: new Date(formData.data + 'T12:00:00.000Z').toISOString(),
      })
      onSuccess()
      onOpenChange(false)
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Novo Lançamento</SheetTitle>
        </SheetHeader>
        <form onSubmit={handleSubmit} className="space-y-6 mt-6">
          <div className="space-y-3">
            <Label className="text-muted-foreground text-sm uppercase tracking-wider">
              Tipo de Lançamento
            </Label>
            <RadioGroup
              value={formData.tipo_movimentacao}
              onValueChange={(val) =>
                setFormData({ ...formData, tipo_movimentacao: val as 'entrada' | 'saida' })
              }
              className="flex gap-4"
            >
              <div className="flex-1">
                <RadioGroupItem value="entrada" id="entrada" className="peer sr-only" />
                <Label
                  htmlFor="entrada"
                  className="flex items-center justify-center px-4 py-3 border border-border rounded-lg cursor-pointer hover:bg-primary/5 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/10 peer-data-[state=checked]:text-primary text-foreground transition-all font-semibold"
                >
                  Entrada (+)
                </Label>
              </div>
              <div className="flex-1">
                <RadioGroupItem value="saida" id="saida" className="peer sr-only" />
                <Label
                  htmlFor="saida"
                  className="flex items-center justify-center px-4 py-3 border border-border rounded-lg cursor-pointer hover:bg-accent/5 peer-data-[state=checked]:border-accent peer-data-[state=checked]:bg-accent/10 peer-data-[state=checked]:text-accent text-foreground transition-all font-semibold"
                >
                  Saída (-)
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label>Data</Label>
            <Input
              type="date"
              value={formData.data}
              onChange={(e) => setFormData({ ...formData, data: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Valor (R$)</Label>
            <Input
              type="number"
              step="0.01"
              min="0.01"
              value={formData.valor || ''}
              onChange={(e) => setFormData({ ...formData, valor: parseFloat(e.target.value) })}
              required
              placeholder="0,00"
            />
          </div>

          <div className="space-y-2">
            <Label>Grupo</Label>
            <Select value={selectedGroup} onValueChange={setSelectedGroup} required>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o grupo" />
              </SelectTrigger>
              <SelectContent>
                {groups.map((g) => (
                  <SelectItem key={g} value={g}>
                    {g}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Categoria</Label>
            <Select
              value={formData.categoria_id}
              onValueChange={(val) => setFormData({ ...formData, categoria_id: val })}
              disabled={!selectedGroup}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione a categoria" />
              </SelectTrigger>
              <SelectContent>
                {filteredCategories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.nome_exibicao}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Observação (Opcional)</Label>
            <Input
              value={formData.observacao}
              onChange={(e) => setFormData({ ...formData, observacao: e.target.value })}
              placeholder="Ex: Pagamento de fornecedor X"
            />
          </div>

          <Button type="submit" className="w-full h-12 text-base shadow-sm mt-4">
            Salvar Lançamento
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  )
}
