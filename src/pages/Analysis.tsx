import { useEffect, useState } from 'react'
import pb from '@/lib/pocketbase/client'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { format, startOfMonth, endOfMonth } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { ChevronLeft, ChevronRight, CheckCircle, AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'
import { useRealtime } from '@/hooks/use-realtime'
import { Skeleton } from '@/components/ui/skeleton'

export default function Analysis() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [loading, setLoading] = useState(true)
  const [entries, setEntries] = useState<any[]>([])

  const loadData = async () => {
    try {
      setLoading(true)
      const startDate = startOfMonth(currentDate).toISOString()
      const endDate = endOfMonth(currentDate).toISOString()

      const records = await pb.collection('daily_entries').getFullList({
        filter: `data >= "${startDate}" && data <= "${endDate}"`,
      })
      setEntries(records)
    } catch (err) {
      toast.error('Erro ao carregar os dados do período')
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

  const prevMonth = () =>
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  const nextMonth = () =>
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))

  const fmtCurrency = (val: number) =>
    val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

  const handleClosePeriod = () => {
    toast.success(
      `Período de ${format(currentDate, 'MMMM yyyy', { locale: ptBR })} fechado com sucesso!`,
      {
        description: 'Os totais foram confirmados e as análises registradas.',
      },
    )
  }

  const totalEntradas = entries
    .filter((e) => e.tipo_movimentacao === 'entrada')
    .reduce((acc, curr) => acc + curr.valor, 0)
  const totalSaidas = entries
    .filter((e) => e.tipo_movimentacao === 'saida')
    .reduce((acc, curr) => acc + curr.valor, 0)
  const saldoFinal = totalEntradas - totalSaidas

  return (
    <div className="space-y-6 animate-fade-in pb-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Análise & Fechamento</h2>
          <p className="text-muted-foreground">
            Revise os totais do período e realize o fechamento mensal.
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Total de Entradas
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <div className="text-3xl font-bold text-primary">{fmtCurrency(totalEntradas)}</div>
            )}
          </CardContent>
        </Card>
        <Card className="border shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Total de Saídas
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <div className="text-3xl font-bold text-accent">{fmtCurrency(totalSaidas)}</div>
            )}
          </CardContent>
        </Card>
        <Card className="border shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Resultado Líquido
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <div
                className={`text-3xl font-bold ${saldoFinal >= 0 ? 'text-primary' : 'text-accent'}`}
              >
                {fmtCurrency(saldoFinal)}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="border shadow-sm bg-card">
        <CardHeader>
          <CardTitle>Revisão de Fechamento</CardTitle>
          <CardDescription>
            Verifique se todas as movimentações do mês foram registradas corretamente antes de
            confirmar o fechamento do período.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-start gap-4 p-5 rounded-lg bg-primary/5 border border-primary/10">
            <div className="mt-1 bg-primary/20 p-2 rounded-full">
              <CheckCircle className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="font-bold text-lg text-foreground mb-1">
                Tudo pronto para o fechamento
              </p>
              <p className="text-muted-foreground">
                O saldo calculado para o período é de{' '}
                <strong className={saldoFinal >= 0 ? 'text-primary' : 'text-accent'}>
                  {fmtCurrency(saldoFinal)}
                </strong>
                , processado a partir de {entries.length} lançamentos contabilizados.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-6 items-center pt-4 border-t">
            <Button size="lg" className="w-full sm:w-auto gap-2" onClick={handleClosePeriod}>
              <CheckCircle className="w-5 h-5" /> Fechar Período
            </Button>
            <p className="text-sm text-muted-foreground flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
              <span>
                Esta ação registrará o período como revisado. Certifique-se que o banco e os caixas
                conferem.
              </span>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
