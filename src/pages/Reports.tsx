import { useEffect, useState, useCallback, useRef } from 'react'
import { api, DashboardMetrics, Budget } from '@/services/api'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { format, startOfMonth, endOfMonth } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Button } from '@/components/ui/button'
import {
  ChevronLeft,
  ChevronRight,
  FileText,
  PieChart as PieChartIcon,
  RefreshCw,
} from 'lucide-react'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart'
import { useRealtime } from '@/hooks/use-realtime'
import { Skeleton } from '@/components/ui/skeleton'

export default function Reports() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null)
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [currentDate, setCurrentDate] = useState(new Date())
  const [isLoading, setIsLoading] = useState(true)
  const [isSyncing, setIsSyncing] = useState(false)

  const currentReqRef = useRef(0)

  const loadData = useCallback(
    async (silent = false, retries = 3) => {
      const reqId = ++currentReqRef.current

      if (!silent) setIsLoading(true)
      else setIsSyncing(true)

      try {
        const startDate = startOfMonth(currentDate).toISOString()
        const endDate = endOfMonth(currentDate).toISOString()
        const yearMonth = format(currentDate, 'yyyy-MM')

        const [m, b] = await Promise.all([
          api.getDashboardMetrics(startDate, endDate),
          api.getBudgets(yearMonth),
        ])

        if (currentReqRef.current !== reqId) return

        setMetrics(m)
        setBudgets(b)
      } catch (error: any) {
        if (currentReqRef.current !== reqId) return

        if (retries > 0) {
          setTimeout(() => loadData(silent, retries - 1), 2000)
          return
        }
      } finally {
        if (currentReqRef.current === reqId) {
          setIsLoading(false)
          setIsSyncing(false)
        }
      }
    },
    [currentDate],
  )

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleRealtime = useCallback(() => {
    loadData(true)
  }, [loadData])

  useRealtime('daily_entries', handleRealtime)
  useRealtime('budget_entries', handleRealtime)
  useRealtime('bank_balances', handleRealtime)

  const prevMonth = () =>
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  const nextMonth = () =>
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))

  const fmt = (val: number = 0) =>
    val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

  const dreData = [
    { name: 'Faturamento', value: metrics?.faturamento || 0, isTotal: true },
    { name: '(-) Custos Variáveis', value: metrics?.custosVariaveis || 0 },
    { name: '(=) Margem de Contribuição', value: metrics?.margemContribuicao || 0, isTotal: true },
    { name: '(-) Despesas Fixas', value: metrics?.despesasFixas || 0 },
    { name: '(=) Resultado Operacional', value: metrics?.resultadoOperacional || 0, isTotal: true },
    { name: '(+) Receitas Não Operacionais', value: metrics?.receitasNaoOperacionais || 0 },
    { name: '(-) Despesas Não Operacionais', value: metrics?.despesasNaoOperacionais || 0 },
    {
      name: '(=) Resultado Líquido',
      value:
        (metrics?.resultadoOperacional || 0) +
        (metrics?.receitasNaoOperacionais || 0) -
        (metrics?.despesasNaoOperacionais || 0),
      isTotal: true,
      isFinal: true,
    },
  ]

  const pieData = [
    { name: 'CMV', value: metrics?.cmv || 0 },
    { name: 'Outros Custos Var.', value: (metrics?.custosVariaveis || 0) - (metrics?.cmv || 0) },
    { name: 'Desp. Fixas', value: metrics?.despesasFixas || 0 },
    { name: 'Desp. Não Op.', value: metrics?.despesasNaoOperacionais || 0 },
  ].filter((i) => i.value > 0)

  const COLORS = ['#2D5016', '#C75B2A', '#3D2B1F', '#D97A4D']
  const chartConfig = {
    CMV: { label: 'CMV', color: COLORS[0] },
    OutrosCustosVar: { label: 'Outros Custos Var.', color: COLORS[1] },
    DespFixas: { label: 'Despesas Fixas', color: COLORS[2] },
    DespNaoOp: { label: 'Desp. Não Op.', color: COLORS[3] },
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center bg-card p-6 rounded-xl border shadow-sm gap-4">
        <div className="flex items-center gap-3">
          <div>
            <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
              Relatórios Avançados
              {isSyncing && <RefreshCw className="w-4 h-4 text-muted-foreground animate-spin" />}
            </h2>
            <p className="text-muted-foreground text-sm">DRE, CMV e Análise de Orçamento</p>
          </div>
        </div>

        <div className="flex items-center bg-muted/50 rounded-lg p-1 border">
          <Button
            variant="ghost"
            size="icon"
            onClick={prevMonth}
            disabled={isLoading}
            className="h-8 w-8 transition-colors duration-150"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="w-40 text-center font-semibold capitalize text-foreground">
            {format(currentDate, 'MMMM yyyy', { locale: ptBR })}
          </span>
          <Button
            variant="ghost"
            size="icon"
            onClick={nextMonth}
            disabled={isLoading}
            className="h-8 w-8 transition-colors duration-150"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-8">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="border shadow-sm">
                <CardHeader className="pb-2">
                  <Skeleton className="h-4 w-32" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-24" />
                  <Skeleton className="h-3 w-16 mt-2" />
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            <Card className="md:col-span-2 border shadow-sm">
              <CardHeader>
                <Skeleton className="h-6 w-40" />
                <Skeleton className="h-4 w-64 mt-2" />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <Skeleton key={i} className="h-8 w-full" />
                  ))}
                </div>
              </CardContent>
            </Card>
            <Card className="border shadow-sm">
              <CardHeader>
                <Skeleton className="h-6 w-40" />
              </CardHeader>
              <CardContent className="flex justify-center">
                <Skeleton className="h-[250px] w-[250px] rounded-full" />
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        <>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card className="border shadow-sm transition-shadow hover:shadow-md duration-150">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Faturamento (Receita Bruta)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">{fmt(metrics?.faturamento)}</div>
              </CardContent>
            </Card>
            <Card className="border shadow-sm transition-shadow hover:shadow-md duration-150">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  CMV Total
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-accent">{fmt(metrics?.cmv)}</div>
                <p className="text-xs text-muted-foreground mt-1 font-medium">
                  {metrics?.faturamento
                    ? ((metrics.cmv / metrics.faturamento) * 100).toFixed(1)
                    : 0}
                  % do Faturamento
                </p>
              </CardContent>
            </Card>
            <Card className="border shadow-sm transition-shadow hover:shadow-md duration-150">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Margem de Contribuição
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">
                  {fmt(metrics?.margemContribuicao)}
                </div>
                <p className="text-xs text-muted-foreground mt-1 font-medium">
                  {metrics?.faturamento
                    ? ((metrics.margemContribuicao / metrics.faturamento) * 100).toFixed(1)
                    : 0}
                  % do Faturamento
                </p>
              </CardContent>
            </Card>
            <Card className="border shadow-sm transition-shadow hover:shadow-md duration-150">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Resultado Operacional
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  className={`text-2xl font-bold ${(metrics?.resultadoOperacional || 0) >= 0 ? 'text-primary' : 'text-accent'}`}
                >
                  {fmt(metrics?.resultadoOperacional)}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {/* DRE Panel */}
            <Card className="md:col-span-2 border shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  DRE Gerencial
                </CardTitle>
                <CardDescription>
                  Demonstrativo de Resultados do Exercício formatado por grupos.
                </CardDescription>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                <div className="space-y-1 min-w-[500px]">
                  {dreData.map((row, i) => (
                    <div
                      key={i}
                      className={`flex justify-between py-2 px-3 rounded-md transition-colors duration-150 ${row.isFinal ? 'bg-primary text-primary-foreground font-bold mt-4 shadow-sm' : row.isTotal ? 'bg-muted font-bold text-foreground mt-2' : 'text-muted-foreground hover:bg-muted/50'}`}
                    >
                      <span>{row.name}</span>
                      <span>{fmt(row.value)}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Expenses Pie Chart */}
            <Card className="border shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChartIcon className="w-5 h-5 text-accent" />
                  Composição de Saídas
                </CardTitle>
              </CardHeader>
              <CardContent>
                {pieData.length > 0 ? (
                  <ChartContainer config={chartConfig} className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={90}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip content={<ChartTooltipContent />} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-muted-foreground text-sm border rounded-lg bg-muted/20">
                    Sem dados suficientes para gerar o gráfico.
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {budgets.length > 0 && (
            <Card className="border shadow-sm">
              <CardHeader>
                <CardTitle>Orçado vs Realizado (Amostra)</CardTitle>
                <CardDescription>
                  Resumo dos orçamentos configurados para{' '}
                  {format(currentDate, 'MMMM', { locale: ptBR })}
                </CardDescription>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                <div className="space-y-4 min-w-[400px]">
                  {budgets.map((b) => (
                    <div
                      key={b.id}
                      className="flex justify-between items-center py-2 border-b last:border-0"
                    >
                      <div>
                        <p className="font-semibold text-foreground">
                          {b.expand?.categoria_id?.nome_exibicao}
                        </p>
                        <p className="text-xs text-muted-foreground uppercase">
                          {b.expand?.categoria_id?.grupo}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-foreground">
                          Orçado: {fmt(b.valor_orcado)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  )
}
