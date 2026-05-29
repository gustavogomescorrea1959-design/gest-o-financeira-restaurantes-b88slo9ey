import { useEffect, useState, useCallback } from 'react'
import { api, DashboardMetrics, Entry, BankBalance } from '@/services/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  format,
  parseISO,
  startOfDay,
  endOfDay,
  subDays,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
} from 'date-fns'
import {
  ArrowDownIcon,
  ArrowUpIcon,
  DollarSign,
  Wallet,
  RefreshCcw,
  PlusCircle,
  ClipboardList,
  TrendingUp,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useRealtime } from '@/hooks/use-realtime'
import { EntryForm } from '@/components/EntryForm'
import { BalanceForm } from '@/components/BalanceForm'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

type Timeframe = 'today' | 'yesterday' | 'week' | 'month'

const getTimeframeDates = (timeframe: Timeframe) => {
  const now = new Date()
  switch (timeframe) {
    case 'today':
      return { start: startOfDay(now), end: endOfDay(now) }
    case 'yesterday': {
      const yest = subDays(now, 1)
      return { start: startOfDay(yest), end: endOfDay(yest) }
    }
    case 'week':
      return {
        start: startOfWeek(now, { weekStartsOn: 1 }),
        end: endOfWeek(now, { weekStartsOn: 1 }),
      }
    case 'month':
      return { start: startOfMonth(now), end: endOfMonth(now) }
  }
}

export default function Dashboard() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null)
  const [entries, setEntries] = useState<Entry[]>([])
  const [latestBalance, setLatestBalance] = useState<BankBalance | null>(null)

  const [timeframe, setTimeframe] = useState<Timeframe>('today')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const [entryFormOpen, setEntryFormOpen] = useState(false)
  const [balanceFormOpen, setBalanceFormOpen] = useState(false)

  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      setError(false)
      const { start, end } = getTimeframeDates(timeframe)

      const [metricsData, recentData, balanceData] = await Promise.all([
        api.getDashboardMetrics(start.toISOString(), end.toISOString()),
        api.getRecentEntries(),
        api.getLatestBalance(),
      ])

      setMetrics(metricsData)
      setEntries(recentData.items)
      setLatestBalance(balanceData)
    } catch (err) {
      console.error(err)
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [timeframe])

  useEffect(() => {
    loadData()
  }, [loadData])

  useRealtime('daily_entries', () => {
    loadData()
  })
  useRealtime('bank_balances', () => {
    loadData()
  })

  const formatCurrency = (val: number) =>
    `R$ ${val.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center animate-fade-in">
        <div className="w-24 h-24 bg-destructive/10 text-destructive rounded-full flex items-center justify-center mb-6">
          <RefreshCcw className="w-12 h-12" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Ops! Ocorreu um erro.</h2>
        <p className="text-muted-foreground mb-6">
          Não foi possível carregar os dados. Tente novamente.
        </p>
        <Button onClick={loadData} variant="outline">
          Tentar novamente
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6 md:space-y-8 animate-fade-in pb-8">
      {/* Header and Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">
            Fluxo de Caixa
          </h2>
          <p className="text-muted-foreground">Acompanhe seus resultados em tempo real</p>
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
          {(['today', 'yesterday', 'week', 'month'] as Timeframe[]).map((t) => (
            <Button
              key={t}
              variant={timeframe === t ? 'default' : 'outline'}
              onClick={() => setTimeframe(t)}
              size="sm"
              className="rounded-full px-4"
            >
              {t === 'today' && 'Hoje'}
              {t === 'yesterday' && 'Ontem'}
              {t === 'week' && 'Esta Semana'}
              {t === 'month' && 'Este Mês'}
            </Button>
          ))}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <Card className="border border-border shadow-sm rounded-xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Faturamento
            </CardTitle>
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <div className="text-2xl font-bold text-foreground">
                {formatCurrency(metrics?.faturamento || 0)}
              </div>
            )}
          </CardContent>
        </Card>
        <Card className="border border-border shadow-sm rounded-xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Total Entradas
            </CardTitle>
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <ArrowUpIcon className="w-4 h-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <div className="text-2xl font-bold text-foreground">
                {formatCurrency(metrics?.totalEntradas || 0)}
              </div>
            )}
          </CardContent>
        </Card>
        <Card className="border border-border shadow-sm rounded-xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Total Saídas
            </CardTitle>
            <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center">
              <ArrowDownIcon className="w-4 h-4 text-accent" />
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <div className="text-2xl font-bold text-foreground">
                {formatCurrency(metrics?.totalSaidas || 0)}
              </div>
            )}
          </CardContent>
        </Card>
        <Card
          className={cn(
            'border shadow-sm rounded-xl',
            (metrics?.saldoDia || 0) >= 0
              ? 'border-primary bg-primary/5'
              : 'border-accent bg-accent/5',
          )}
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium uppercase tracking-wider text-foreground">
              Saldo do Período
            </CardTitle>
            <div className="w-8 h-8 rounded-full bg-background flex items-center justify-center shadow-sm">
              <DollarSign
                className={cn(
                  'w-4 h-4',
                  (metrics?.saldoDia || 0) >= 0 ? 'text-primary' : 'text-accent',
                )}
              />
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <div
                className={cn(
                  'text-2xl font-bold',
                  (metrics?.saldoDia || 0) >= 0 ? 'text-primary' : 'text-accent',
                )}
              >
                {formatCurrency(metrics?.saldoDia || 0)}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 md:gap-8 items-start">
        {/* Balances & Operational Metrics */}
        <div className="space-y-6 lg:col-span-1">
          <Card className="border border-border shadow-sm rounded-xl">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg text-foreground flex items-center gap-2">
                <Wallet className="w-5 h-5 text-primary" />
                Gestão de Saldos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))
              ) : (
                <>
                  <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg border border-border/50">
                    <span className="text-sm font-medium text-muted-foreground">
                      Saldo de Caixa
                    </span>
                    <span className="font-bold">
                      {formatCurrency(latestBalance?.saldo_caixa || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg border border-border/50">
                    <span className="text-sm font-medium text-muted-foreground">
                      Saldo em Banco
                    </span>
                    <span className="font-bold">
                      {formatCurrency(latestBalance?.saldo_banco || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg border border-border/50">
                    <span className="text-sm font-medium text-muted-foreground">
                      Caixas Físicos
                    </span>
                    <span className="font-bold">
                      {formatCurrency(latestBalance?.total_caixas_fisicos || 0)}
                    </span>
                  </div>
                </>
              )}
              <Button
                variant="outline"
                className="w-full mt-2 border-primary/20 hover:bg-primary/5 text-primary"
                onClick={() => setBalanceFormOpen(true)}
              >
                Atualizar Saldos
              </Button>
            </CardContent>
          </Card>

          <Card className="border border-border shadow-sm rounded-xl bg-sidebar text-sidebar-foreground">
            <CardHeader>
              <CardTitle className="text-lg text-sidebar-foreground">
                Métricas Operacionais
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full bg-sidebar-accent/50" />
                ))
              ) : (
                <>
                  <div>
                    <div className="flex justify-between text-sm mb-1 text-sidebar-foreground/80">
                      <span>CMV</span>
                      <span>{formatCurrency(metrics?.cmv || 0)}</span>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1 text-sidebar-foreground/80">
                      <span>Margem de Contrib.</span>
                      <span>{formatCurrency(metrics?.margemContribuicao || 0)}</span>
                    </div>
                  </div>
                  <div className="pt-3 border-t border-sidebar-border">
                    <div className="flex justify-between text-sm font-bold">
                      <span>Resultado Operacional</span>
                      <span
                        className={cn(
                          (metrics?.resultadoOperacional || 0) >= 0
                            ? 'text-green-400'
                            : 'text-red-400',
                        )}
                      >
                        {formatCurrency(metrics?.resultadoOperacional || 0)}
                      </span>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Entries */}
        <Card className="border border-border shadow-sm rounded-xl lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between sm:flex-row border-b border-border/40 pb-4">
            <CardTitle className="text-lg text-foreground">Últimos Lançamentos</CardTitle>
            <Button
              onClick={() => setEntryFormOpen(true)}
              size="sm"
              className="hidden sm:flex gap-2"
            >
              <PlusCircle className="w-4 h-4" /> Novo Lançamento
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-6 space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : entries.length === 0 ? (
              <div className="p-12 text-center flex flex-col items-center justify-center text-muted-foreground">
                <ClipboardList className="w-16 h-16 mb-4 text-muted" />
                <p className="mb-4 text-lg">Nenhum lançamento recente encontrado.</p>
                <Button onClick={() => setEntryFormOpen(true)} className="sm:hidden">
                  Fazer primeiro lançamento
                </Button>
              </div>
            ) : (
              <div className="divide-y divide-border/40">
                {entries.map((e) => (
                  <div
                    key={e.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-6 hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className={cn(
                          'w-10 h-10 rounded-full flex items-center justify-center shrink-0 mt-1 sm:mt-0',
                          e.tipo_movimentacao === 'entrada'
                            ? 'bg-primary/10 text-primary'
                            : 'bg-accent/10 text-accent',
                        )}
                      >
                        {e.tipo_movimentacao === 'entrada' ? (
                          <ArrowUpIcon className="w-5 h-5" />
                        ) : (
                          <ArrowDownIcon className="w-5 h-5" />
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">
                          {e.expand?.categoria_id?.nome_exibicao || 'Categoria'}
                        </p>
                        <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                          <span>{format(parseISO(e.data), 'dd/MM/yyyy')}</span>
                          {e.observacao && (
                            <>
                              <span className="w-1 h-1 rounded-full bg-border" />
                              <span className="truncate max-w-[120px] sm:max-w-[200px]">
                                {e.observacao}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div
                      className={cn(
                        'font-bold text-base mt-3 sm:mt-0 sm:text-right pl-14 sm:pl-0',
                        e.tipo_movimentacao === 'entrada' ? 'text-primary' : 'text-accent',
                      )}
                    >
                      {e.tipo_movimentacao === 'entrada' ? '+' : '-'} {formatCurrency(e.valor)}
                    </div>
                  </div>
                ))}
              </div>
            )}
            {/* Mobile fab button */}
            <div className="p-4 sm:hidden border-t border-border/40 bg-muted/20">
              <Button
                onClick={() => setEntryFormOpen(true)}
                className="w-full h-12 shadow-sm gap-2"
              >
                <PlusCircle className="w-5 h-5" /> Novo Lançamento
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <EntryForm open={entryFormOpen} onOpenChange={setEntryFormOpen} onSuccess={loadData} />
      <BalanceForm open={balanceFormOpen} onOpenChange={setBalanceFormOpen} onSuccess={loadData} />
    </div>
  )
}
