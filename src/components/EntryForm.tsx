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
import { toast } from 'sonner'

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
    valor: undefined,
    observacao: '',
    categoria_id: '',
  })

  const [selectedGroup, setSelectedGroup] = useState<string>('')
  const [selectedSubgroup, setSelectedSubgroup] = useState<string>('')

  useEffect(() => {
    if (open) {
      api
        .getCategories()
        .then(setCategories)
        .catch(() => toast.error('Falha ao carregar categorias.'))
      setFormData({
        data: format(new Date(), 'yyyy-MM-dd'),
        tipo_movimentacao: 'saida',
        valor: undefined,
        observacao: '',
        categoria_id: '',
      })
      setSelectedGroup('')
      setSelectedSubgroup('')
    }
  }, [open])

  const groups = Array.from(new Set(categories.map((c) => c.grupo)))
  const subgroups = Array.from(
    new Set(categories.filter((c) => c.grupo === selectedGroup).map((c) => c.subgrupo)),
  )
  const accounts = categories.filter(
    (c) => c.grupo === selectedGroup && c.subgrupo === selectedSubgroup,
  )

  const handleGroupChange = (val: string) => {
    setSelectedGroup(val)
    setSelectedSubgroup('')
    setFormData({ ...formData, categoria_id: '' })
  }

  const handleSubgroupChange = (val: string) => {
    setSelectedSubgroup(val)
    setFormData({ ...formData, categoria_id: '' })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.categoria_id) {
      toast.error('Você deve selecionar uma Conta (Nível 3) para o lançamento.')
      return
    }

    try {
      await api.createEntry({
        ...formData,
        data: new Date(formData.data + 'T12:00:00.000Z').toISOString(),
      })
      toast.success('Lançamento salvo com sucesso!', { duration: 3000 })
      onSuccess()
      onOpenChange(false)
    } catch (err) {
      console.error(err)
      toast.error('Erro ao salvar lançamento.')
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-foreground">Novo Lançamento</SheetTitle>
        </SheetHeader>
        <form onSubmit={handleSubmit} className="space-y-5 mt-6">
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
                  className="flex items-center justify-center px-4 py-3 border border-border rounded-lg cursor-pointer hover:bg-primary/5 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/10 peer-data-[state=checked]:text-primary text-foreground transition-all duration-150 font-semibold shadow-sm"
                >
                  Entrada (+)
                </Label>
              </div>
              <div className="flex-1">
                <RadioGroupItem value="saida" id="saida" className="peer sr-only" />
                <Label
                  htmlFor="saida"
                  className="flex items-center justify-center px-4 py-3 border border-border rounded-lg cursor-pointer hover:bg-accent/5 peer-data-[state=checked]:border-accent peer-data-[state=checked]:bg-accent/10 peer-data-[state=checked]:text-accent text-foreground transition-all duration-150 font-semibold shadow-sm"
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
              className="transition-all duration-150"
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
              className="transition-all duration-150"
            />
          </div>

          <div className="space-y-2">
            <Label>Grupo (Nível 1)</Label>
            <Select value={selectedGroup} onValueChange={handleGroupChange} required>
              <SelectTrigger className="transition-all duration-150">
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
            <Label>Categoria (Nível 2)</Label>
            <Select
              value={selectedSubgroup}
              onValueChange={handleSubgroupChange}
              disabled={!selectedGroup}
              required
            >
              <SelectTrigger className="transition-all duration-150">
                <SelectValue placeholder="Selecione a categoria" />
              </SelectTrigger>
              <SelectContent>
                {subgroups.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Conta (Nível 3)</Label>
            <Select
              value={formData.categoria_id}
              onValueChange={(val) => setFormData({ ...formData, categoria_id: val })}
              disabled={!selectedSubgroup}
              required
            >
              <SelectTrigger className="transition-all duration-150">
                <SelectValue placeholder="Selecione a conta" />
              </SelectTrigger>
              <SelectContent>
                {accounts.map((a) => (
                  <SelectItem key={a.id} value={a.id}>
                    {a.nome_exibicao}
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
              className="transition-all duration-150"
            />
          </div>

          <Button
            type="submit"
            className="w-full h-12 text-base shadow-sm mt-4 transition-all duration-150 hover:bg-primary/90"
          >
            Salvar Lançamento
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  )
}
