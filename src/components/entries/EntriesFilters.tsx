import { Category } from '@/services/api'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FilterX } from 'lucide-react'

interface Props {
  categories: Category[]
  filters: {
    grupo: string
    subgrupo: string
    categoria_id: string
    search: string
  }
  setFilters: (f: any) => void
}

export function EntriesFilters({ categories, filters, setFilters }: Props) {
  const groups = Array.from(new Set(categories.map((c) => c.grupo)))
  const subgroups = Array.from(
    new Set(
      categories
        .filter((c) => filters.grupo === 'all' || c.grupo === filters.grupo)
        .map((c) => c.subgrupo),
    ),
  )
  const accounts = categories.filter(
    (c) =>
      (filters.grupo === 'all' || c.grupo === filters.grupo) &&
      (filters.subgrupo === 'all' || c.subgrupo === filters.subgrupo),
  )

  const clear = () => setFilters({ grupo: 'all', subgrupo: 'all', categoria_id: 'all', search: '' })

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 bg-muted/30 p-4 rounded-lg border">
      <Input
        placeholder="Buscar observação..."
        value={filters.search}
        onChange={(e) => setFilters({ ...filters, search: e.target.value })}
      />
      <Select
        value={filters.grupo}
        onValueChange={(v) =>
          setFilters({ ...filters, grupo: v, subgrupo: 'all', categoria_id: 'all' })
        }
      >
        <SelectTrigger>
          <SelectValue placeholder="Grupo" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos os Grupos</SelectItem>
          {groups.map((g) => (
            <SelectItem key={g} value={g}>
              {g}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select
        value={filters.subgrupo}
        onValueChange={(v) => setFilters({ ...filters, subgrupo: v, categoria_id: 'all' })}
        disabled={filters.grupo === 'all'}
      >
        <SelectTrigger>
          <SelectValue placeholder="Categoria" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas Categorias</SelectItem>
          {subgroups.map((s) => (
            <SelectItem key={s} value={s}>
              {s}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select
        value={filters.categoria_id}
        onValueChange={(v) => setFilters({ ...filters, categoria_id: v })}
        disabled={filters.subgrupo === 'all'}
      >
        <SelectTrigger>
          <SelectValue placeholder="Conta" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas as Contas</SelectItem>
          {accounts.map((a) => (
            <SelectItem key={a.id} value={a.id}>
              {a.nome_exibicao}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button variant="outline" onClick={clear} className="w-full gap-2">
        <FilterX className="w-4 h-4" /> Limpar
      </Button>
    </div>
  )
}
