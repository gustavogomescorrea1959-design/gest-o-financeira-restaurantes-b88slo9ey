import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, AlertCircle, DollarSign, Calculator, Percent } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SummaryCardsProps {
  metrics: ReturnType<typeof import('@/lib/metrics').calculateMetrics>
}

export function SummaryCards({ metrics }: SummaryCardsProps) {
  const formatCurrency = (val: number) =>
    `R$ ${val.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

  const cmvColor =
    metrics.cmvGeral > 35
      ? 'text-red-500'
      : metrics.cmvGeral >= 30
        ? 'text-yellow-500'
        : 'text-green-500'
  const cmvBg =
    metrics.cmvGeral > 35
      ? 'bg-red-500/10 border-red-500/20'
      : metrics.cmvGeral >= 30
        ? 'bg-yellow-500/10 border-yellow-500/20'
        : 'bg-green-500/10 border-green-500/20'

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <Card className="border shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Receita Total (Faturamento)
          </CardTitle>
          <TrendingUp className="w-4 h-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(metrics.faturamento)}</div>
        </CardContent>
      </Card>

      <Card className="border shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Margem de Contribuição
          </CardTitle>
          <Calculator className="w-4 h-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(metrics.margemContribuicao)}</div>
        </CardContent>
      </Card>

      <Card
        className={cn(
          'border shadow-sm transition-colors',
          metrics.resultadoOperacional >= 0 ? 'bg-primary/5' : 'bg-destructive/5',
        )}
      >
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-foreground">Lucro Operacional</CardTitle>
          <DollarSign
            className={cn(
              'w-4 h-4',
              metrics.resultadoOperacional >= 0 ? 'text-primary' : 'text-destructive',
            )}
          />
        </CardHeader>
        <CardContent>
          <div
            className={cn(
              'text-2xl font-bold',
              metrics.resultadoOperacional >= 0 ? 'text-primary' : 'text-destructive',
            )}
          >
            {formatCurrency(metrics.resultadoOperacional)}
          </div>
        </CardContent>
      </Card>

      <Card className={cn('border shadow-sm transition-colors', cmvBg)}>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-foreground">CMV Geral %</CardTitle>
          <AlertCircle className={cn('w-4 h-4', cmvColor)} />
        </CardHeader>
        <CardContent>
          <div className={cn('text-2xl font-bold', cmvColor)}>{metrics.cmvGeral.toFixed(1)}%</div>
          <p className="text-xs text-muted-foreground mt-1">
            Meta: &lt; 30% | Atual: {formatCurrency(metrics.custosVariaveis)}
          </p>
        </CardContent>
      </Card>

      <Card className="border shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            CMV Matéria Prima %
          </CardTitle>
          <Percent className="w-4 h-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.cmvMaterial.toFixed(1)}%</div>
          <p className="text-xs text-muted-foreground mt-1">
            Gasto: {formatCurrency(metrics.custosMateriaPrima)}
          </p>
        </CardContent>
      </Card>

      <Card className="border shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Despesas Fixas
          </CardTitle>
          <DollarSign className="w-4 h-4 text-accent" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(metrics.despesasFixas)}</div>
        </CardContent>
      </Card>
    </div>
  )
}
