import { useEffect, useState, useMemo } from 'react'
import { api, Entry } from '@/services/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { format, subMonths, parseISO, isSameMonth } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend } from 'recharts'
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart'
import { ArrowDownIcon, ArrowUpIcon, DollarSign, Wallet, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Link } from 'react-router-dom'
import { useRealtime } from '@/hooks/use-realtime'

export default function Dashboard() {
  const [entries, setEntries] = useState<Entry[]>([])

  const loadData = async () => {
    try {
      const data = await api.getAllEntries()
      setEntries(data)
    } catch {
      /* intentionally ignored */
    }
  }

  useEffect(() => {
    loadData()
  }, [])
  useRealtime('daily_entries', () => {
    loadData()
  })

  const currentMonthEntries = useMemo(() => {
    const now = new Date()
    return entries.filter((e) => isSameMonth(parseISO(e.data), now))
  }, [entries])

  const { faturamento, despesas } = useMemo(() => {
    let faturamento = 0
    let despesas = 0
    currentMonthEntries.forEach((e) => {
      if (e.tipo_movimentacao === 'entrada') faturamento += e.valor
      else despesas += e.valor
    })
    return { faturamento, despesas }
  }, [currentMonthEntries])

  const resultado = faturamento - despesas

  const chartData = useMemo(() => {
    const data = []
    for (let i = 5; i >= 0; i--) {
      const m = subMonths(new Date(), i)
      const monthStr = format(m, 'MMM/yy', { locale: ptBR })
      let rec = 0
      let des = 0
      entries.forEach((e) => {
        if (isSameMonth(parseISO(e.data), m)) {
          if (e.tipo_movimentacao === 'entrada') rec += e.valor
          else des += e.valor
        }
      })
      data.push({ name: monthStr, Receitas: rec, Despesas: des })
    }
    return data
  }, [entries])

  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center animate-fade-in">
        <div className="w-24 h-24 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-6">
          <TrendingUp className="w-12 h-12" />
        </div>
        <h2 className="text-3xl font-extrabold text-foreground mb-2">Bem-vindo ao GestãoRest!</h2>
        <p className="text-muted-foreground mb-8 max-w-md text-lg">
          Parece que você ainda não tem dados registrados. Que tal começar fazendo o seu primeiro
          lançamento?
        </p>
        <Button asChild size="lg" className="shadow-md">
          <Link to="/lancamentos">Fazer Primeiro Lançamento</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border border-border shadow-elevation rounded-xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Faturamento do Mês
            </CardTitle>
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <ArrowUpIcon className="w-4 h-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">
              R$ {faturamento.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>
        <Card className="border border-border shadow-elevation rounded-xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Custos / Despesas
            </CardTitle>
            <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center">
              <ArrowDownIcon className="w-4 h-4 text-accent" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">
              R$ {despesas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>
        <Card className="border border-border shadow-elevation rounded-xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Resultado Líquido
            </CardTitle>
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <DollarSign className="w-4 h-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div
              className={`text-3xl font-bold ${resultado >= 0 ? 'text-primary' : 'text-accent'}`}
            >
              {resultado >= 0 ? '+' : ''} R${' '}
              {resultado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>
        <Card className="border border-border shadow-elevation rounded-xl bg-sidebar text-sidebar-foreground">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold text-muted uppercase tracking-wider">
              Saldo em Caixa
            </CardTitle>
            <Wallet className="w-5 h-5 text-primary-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              R$ {resultado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted/70 mt-2">Saldo estimado atual</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-7">
        <Card className="md:col-span-4 border border-border shadow-elevation rounded-xl">
          <CardHeader>
            <CardTitle className="text-lg text-foreground">
              Evolução Financeira (Últimos 6 meses)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                Receitas: { label: 'Receitas', color: 'hsl(var(--primary))' },
                Despesas: { label: 'Despesas', color: 'hsl(var(--accent))' },
              }}
              className="h-[350px] w-full"
            >
              <BarChart data={chartData} margin={{ top: 20, right: 0, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis
                  dataKey="name"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: '#64748B' }}
                  dy={10}
                />
                <YAxis
                  tickFormatter={(val) => `R$ ${val}`}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: '#64748B' }}
                />
                <Tooltip content={<ChartTooltipContent />} cursor={{ fill: '#F1F5F9' }} />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                <Bar
                  dataKey="Receitas"
                  fill="var(--color-Receitas)"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={40}
                />
                <Bar
                  dataKey="Despesas"
                  fill="var(--color-Despesas)"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={40}
                />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="md:col-span-3 border border-border shadow-elevation flex flex-col rounded-xl">
          <CardHeader>
            <CardTitle className="text-lg text-foreground">Lançamentos Recentes</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col">
            <div className="space-y-6 flex-1">
              {entries.slice(0, 5).map((e) => (
                <div key={e.id} className="flex items-center justify-between group">
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-2.5 h-2.5 rounded-full ${e.tipo_movimentacao === 'entrada' ? 'bg-primary' : 'bg-accent'}`}
                    />
                    <div>
                      <p className="font-bold text-sm text-foreground leading-none">
                        {e.expand?.categoria_id?.nome_exibicao || 'Categoria'}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1.5">
                        {format(parseISO(e.data), 'dd/MM/yyyy')}
                      </p>
                    </div>
                  </div>
                  <div
                    className={`font-bold text-sm ${e.tipo_movimentacao === 'entrada' ? 'text-primary' : 'text-accent'}`}
                  >
                    {e.tipo_movimentacao === 'entrada' ? '+' : '-'} R${' '}
                    {e.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-8 pt-4 border-t border-border">
              <Button
                variant="ghost"
                className="w-full text-primary hover:text-primary hover:bg-primary/5"
                asChild
              >
                <Link to="/lancamentos">Ver Todos os Lançamentos</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
