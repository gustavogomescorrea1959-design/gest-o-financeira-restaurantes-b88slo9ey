import { useEffect, useState, useMemo } from 'react'
import { api, Entry, Category } from '@/services/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { format, startOfMonth, endOfMonth } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { ChevronLeft, ChevronRight, Calculator, CheckCircle2 } from 'lucide-react'
import { useRealtime } from '@/hooks/use-realtime'
import { Skeleton } from '@/components/ui/skeleton'

export default function Analysis() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [entries, setEntries] = useState<Entry[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  const loadData = async () => {
    try {
      setLoading(true)
      const startDate = startOfMonth(currentDate).toISOString()
      const endDate = endOfMonth(currentDate).toISOString()

      const [entriesData, catsData] = await Promise.all([
        api.getEntriesByDateRange(startDate, endDate),
        api.getCategories(),
      ])

      setEntries(entriesData)
      setCategories(catsData)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [currentDate])

  useRealtime('daily_entries', () => {
    loadData()
  })
  useRealtime('financial_categories', () => {
    loadData()
  })

  const prevMonth = () =>
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  const nextMonth = () =>
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))

  const formatCurrency = (val: number) =>
    `R$ ${val.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

  const analysisData = useMemo(() => {
    const data: Record<
      string,
      Record<string, Record<string, { total: number; entries: Entry[] }>>
    > = {}
    let totalEntradas = 0
    let totalSaidas = 0

    categories.forEach((cat) => {
      if (!data[cat.tipo]) data[cat.tipo] = {}
      if (!data[cat.tipo][cat.grupo]) data[cat.tipo][cat.grupo] = {}
      if (!data[cat.tipo][cat.grupo][cat.nome_exibicao]) {
        data[cat.tipo][cat.grupo][cat.nome_exibicao] = { total: 0, entries: [] }
      }
    })

    entries.forEach((entry) => {
      const cat = entry.expand?.categoria_id
      if (!cat) return

      if (!data[cat.tipo]) data[cat.tipo] = {}
      if (!data[cat.tipo][cat.grupo]) data[cat.tipo][cat.grupo] = {}
      if (!data[cat.tipo][cat.grupo][cat.nome_exibicao]) {
        data[cat.tipo][cat.grupo][cat.nome_exibicao] = { total: 0, entries: [] }
      }

      data[cat.tipo][cat.grupo][cat.nome_exibicao].entries.push(entry)
      data[cat.tipo][cat.grupo][cat.nome_exibicao].total += entry.valor

      if (entry.tipo_movimentacao === 'entrada') {
        totalEntradas += entry.valor
      } else {
        totalSaidas += entry.valor
      }
    })

    return { data, totalEntradas, totalSaidas, saldoLivre: totalEntradas - totalSaidas }
  }, [entries, categories])

  const renderGroup = (
    tipo: string,
    tipoLabel: string,
    bgColorClass: string,
    textColorClass: string,
  ) => {
    const groups = analysisData.data[tipo]
    if (!groups || Object.keys(groups).length === 0) return null

    let tipoTotal = 0
    const groupElements = Object.entries(groups).map(([grupoName, categorias]) => {
      let grupoTotal = 0
      const catElements = Object.entries(categorias).map(([catName, catData]) => {
        if (catData.total === 0) return null
        grupoTotal += catData.total
        return (
          <div
            key={catName}
            className="flex justify-between items-center py-2 border-b border-border/40 last:border-0 pl-4"
          >
            <span className="text-sm text-muted-foreground">{catName}</span>
            <span className="text-sm font-medium">{formatCurrency(catData.total)}</span>
          </div>
        )
      })

      tipoTotal += grupoTotal

      if (grupoTotal === 0) return null

      return (
        <div key={grupoName} className="mb-4 last:mb-0">
          <div className="flex justify-between items-center py-2 bg-muted/30 px-3 rounded-md mb-2">
            <span className="font-semibold text-sm text-foreground">{grupoName}</span>
            <span className="font-bold text-sm text-foreground">{formatCurrency(grupoTotal)}</span>
          </div>
          <div className="pl-2">{catElements}</div>
        </div>
      )
    })

    if (tipoTotal === 0) return null

    return (
      <Card className="border shadow-sm mb-6">
        <CardHeader className={`pb-3 border-b ${bgColorClass}`}>
          <CardTitle
            className={`text-base uppercase tracking-wider ${textColorClass} flex justify-between`}
          >
            <span>{tipoLabel}</span>
            <span>{formatCurrency(tipoTotal)}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">{groupElements}</CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-8 animate-fade-in pb-8">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center bg-card p-6 rounded-xl border shadow-sm gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Análise & Fechamento</h2>
          <p className="text-muted-foreground text-sm">
            Reconciliação e demonstrativo detalhado do período
          </p>
        </div>

        <div className="flex items-center bg-muted/50 rounded-lg p-1 border">
          <Button variant="ghost" size="icon" onClick={prevMonth} className="h-8 w-8">
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="w-40 text-center font-semibold capitalize text-foreground">
            {format(currentDate, 'MMMM yyyy', { locale: ptBR })}
          </span>
          <Button variant="ghost" size="icon" onClick={nextMonth} className="h-8 w-8">
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="border shadow-sm bg-primary/5">
              <CardContent className="p-6 flex flex-col items-center justify-center text-center">
                <span className="text-sm font-medium text-muted-foreground mb-1">
                  Total Entradas
                </span>
                <span className="text-2xl font-bold text-primary">
                  {formatCurrency(analysisData.totalEntradas)}
                </span>
              </CardContent>
            </Card>
            <Card className="border shadow-sm bg-accent/5">
              <CardContent className="p-6 flex flex-col items-center justify-center text-center">
                <span className="text-sm font-medium text-muted-foreground mb-1">Total Saídas</span>
                <span className="text-2xl font-bold text-accent">
                  {formatCurrency(analysisData.totalSaidas)}
                </span>
              </CardContent>
            </Card>
            <Card
              className={`border shadow-sm ${analysisData.saldoLivre >= 0 ? 'bg-primary/10' : 'bg-destructive/10'}`}
            >
              <CardContent className="p-6 flex flex-col items-center justify-center text-center">
                <span className="text-sm font-medium text-muted-foreground mb-1">
                  Saldo do Período
                </span>
                <span
                  className={`text-2xl font-bold ${analysisData.saldoLivre >= 0 ? 'text-primary' : 'text-destructive'}`}
                >
                  {formatCurrency(analysisData.saldoLivre)}
                </span>
              </CardContent>
            </Card>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-foreground">
                <CheckCircle2 className="w-5 h-5 text-primary" />
                Receitas e Resultados
              </h3>
              {renderGroup('receita', 'Receitas', 'bg-primary/5 border-primary/20', 'text-primary')}
              {renderGroup(
                'resultado',
                'Resultado Não Operacional',
                'bg-primary/5 border-primary/20',
                'text-primary',
              )}
            </div>
            <div>
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-foreground">
                <Calculator className="w-5 h-5 text-accent" />
                Custos e Despesas
              </h3>
              {renderGroup(
                'custo',
                'Custos (CMV & Variáveis)',
                'bg-accent/5 border-accent/20',
                'text-accent',
              )}
              {renderGroup(
                'despesa',
                'Despesas Fixas',
                'bg-accent/5 border-accent/20',
                'text-accent',
              )}
              {renderGroup(
                'investimento',
                'Investimentos',
                'bg-blue-500/5 border-blue-500/20',
                'text-blue-600',
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
