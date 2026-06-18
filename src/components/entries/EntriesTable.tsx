import { Entry } from '@/services/api'
import { format, parseISO } from 'date-fns'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Trash2, ArrowUpDown } from 'lucide-react'
import { useState } from 'react'

interface Props {
  entries: Entry[]
  onDelete: (id: string) => void
}

export function EntriesTable({ entries, onDelete }: Props) {
  const [sortField, setSortField] = useState<'data' | 'valor'>('data')
  const [sortDesc, setSortDesc] = useState(true)

  const sorted = [...entries].sort((a, b) => {
    if (sortField === 'data') {
      return sortDesc ? b.data.localeCompare(a.data) : a.data.localeCompare(b.data)
    } else {
      return sortDesc ? b.valor - a.valor : a.valor - b.valor
    }
  })

  const toggleSort = (field: 'data' | 'valor') => {
    if (sortField === field) setSortDesc(!sortDesc)
    else {
      setSortField(field)
      setSortDesc(true)
    }
  }

  return (
    <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
      <Table>
        <TableHeader className="bg-muted">
          <TableRow>
            <TableHead className="py-3 w-[120px]">
              <Button
                variant="ghost"
                onClick={() => toggleSort('data')}
                className="font-semibold p-0 h-auto"
              >
                Data <ArrowUpDown className="ml-2 w-3 h-3" />
              </Button>
            </TableHead>
            <TableHead className="font-semibold py-3">Classificação</TableHead>
            <TableHead className="font-semibold py-3">Detalhes</TableHead>
            <TableHead className="text-right py-3 w-[150px]">
              <Button
                variant="ghost"
                onClick={() => toggleSort('valor')}
                className="font-semibold p-0 h-auto"
              >
                Valor <ArrowUpDown className="ml-2 w-3 h-3" />
              </Button>
            </TableHead>
            <TableHead className="w-[60px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sorted.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                Nenhum lançamento encontrado.
              </TableCell>
            </TableRow>
          ) : (
            sorted.map((e) => (
              <TableRow key={e.id} className="group hover:bg-muted/30">
                <TableCell className="font-medium">
                  {format(parseISO(e.data), 'dd/MM/yyyy')}
                </TableCell>
                <TableCell>
                  <div className="font-semibold">{e.expand?.categoria_id?.nome_exibicao}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {e.expand?.categoria_id?.grupo} &gt; {e.expand?.categoria_id?.subgrupo}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm">{e.observacao || '-'}</div>
                  {e.forma_pagamento && (
                    <div className="text-xs text-muted-foreground mt-0.5">
                      Pagamento: {e.forma_pagamento}
                    </div>
                  )}
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
                    onClick={() => onDelete(e.id)}
                    className="text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
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
  )
}
