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
        <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-6">
          <TrendingUp className="w-12 h-12" />
        </div>
        <h2 className="text-3xl font-extrabold text-slate-800 mb-2">Bem-vindo ao GestãoRest!</h2>
        <p className="text-slate-600 mb-8 max-w-md text-lg">
          Parece que você ainda não tem dados registrados. Que tal começar fazendo o seu primeiro
          lançamento?
        </p>
        <Button asChild size="lg" className="bg-emerald-600 hover:bg-emerald-700 shadow-md">
          <Link to="/lancamentos">Fazer Primeiro Lançamento</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-0 shadow-subtle">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold text-slate-600 uppercase tracking-wider">
              Faturamento do Mês
            </CardTitle>
            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
              <ArrowUpIcon className="w-4 h-4 text-emerald-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-800">
              R$ {faturamento.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-subtle">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold text-slate-600 uppercase tracking-wider">
              Custos / Despesas
            </CardTitle>
            <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
              <ArrowDownIcon className="w-4 h-4 text-red-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-800">
              R$ {despesas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-subtle">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold text-slate-600 uppercase tracking-wider">
              Resultado Líquido
            </CardTitle>
            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
              <DollarSign className="w-4 h-4 text-indigo-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div
              className={`text-3xl font-bold ${resultado >= 0 ? 'text-emerald-600' : 'text-red-600'}`}
            >
              {resultado >= 0 ? '+' : ''} R${' '}
              {resultado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-subtle bg-slate-800 text-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
              Saldo em Caixa
            </CardTitle>
            <Wallet className="w-5 h-5 text-emerald-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              R$ {resultado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-slate-400 mt-2">Saldo estimado atual</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-7">
        <Card className="md:col-span-4 border-0 shadow-subtle">
          <CardHeader>
            <CardTitle className="text-lg text-slate-800">
              Evolução Financeira (Últimos 6 meses)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                Receitas: { label: 'Receitas', color: 'hsl(var(--primary))' },
                Despesas: { label: 'Despesas', color: 'hsl(var(--destructive))' },
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

        <Card className="md:col-span-3 border-0 shadow-subtle flex flex-col">
          <CardHeader>
            <CardTitle className="text-lg text-slate-800">Lançamentos Recentes</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col">
            <div className="space-y-5 flex-1">
              {entries.slice(0, 5).map((e) => (
                <div key={e.id} className="flex items-center justify-between group">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-2 h-2 rounded-full ${e.tipo_movimentacao === 'entrada' ? 'bg-emerald-500' : 'bg-red-500'}`}
                    />
                    <div>
                      <p className="font-semibold text-sm text-slate-800 leading-none">
                        {e.expand?.categoria_id?.nome_exibicao || 'Categoria'}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        {format(parseISO(e.data), 'dd/MM/yyyy')}
                      </p>
                    </div>
                  </div>
                  <div
                    className={`font-bold text-sm ${e.tipo_movimentacao === 'entrada' ? 'text-emerald-600' : 'text-red-600'}`}
                  >
                    {e.tipo_movimentacao === 'entrada' ? '+' : '-'} R${' '}
                    {e.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 pt-4 border-t border-slate-100">
              <Button
                variant="ghost"
                className="w-full text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
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
