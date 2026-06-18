import { calculateMetrics } from '@/lib/metrics'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface Props {
  m1: ReturnType<typeof calculateMetrics>
  m2: ReturnType<typeof calculateMetrics>
  date1: Date
  date2: Date
}

export function DreComparisonTable({ m1, m2, date1, date2 }: Props) {
  const fmt = (val: number) =>
    `R$ ${val.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

  const getDelta = (v1: number, v2: number) => {
    if (v1 === 0) return 0
    return ((v2 - v1) / v1) * 100
  }

  const lines = [
    { name: 'Receita Bruta (Faturamento)', v1: m1.faturamento, v2: m2.faturamento, isTotal: true },
    { name: '(-) Custos com Matéria Prima', v1: m1.custosMateriaPrima, v2: m2.custosMateriaPrima },
    {
      name: '(-) Outros Custos Variáveis',
      v1: m1.custosVariaveisOutros,
      v2: m2.custosVariaveisOutros,
    },
    {
      name: '(=) Margem de Contribuição',
      v1: m1.margemContribuicao,
      v2: m2.margemContribuicao,
      isTotal: true,
    },
    { name: '(-) Despesas Fixas', v1: m1.despesasFixas, v2: m2.despesasFixas },
    {
      name: '(=) Lucro Operacional',
      v1: m1.resultadoOperacional,
      v2: m2.resultadoOperacional,
      isTotal: true,
    },
    {
      name: '(+) Receitas Não Operacionais',
      v1: m1.receitasNaoOperacionais,
      v2: m2.receitasNaoOperacionais,
    },
    {
      name: '(-) Despesas Não Operacionais',
      v1: m1.despesasNaoOperacionais,
      v2: m2.despesasNaoOperacionais,
    },
    {
      name: '(=) Resultado Final',
      v1: m1.resultadoLiquido,
      v2: m2.resultadoLiquido,
      isFinal: true,
    },
  ]

  return (
    <div className="overflow-x-auto bg-card rounded-xl border shadow-sm">
      <div className="min-w-[700px]">
        <div className="flex justify-between py-3 px-6 bg-muted/80 font-bold text-foreground border-b">
          <div className="w-1/2">Indicador</div>
          <div className="w-1/6 text-right capitalize">
            {format(date1, 'MMM yyyy', { locale: ptBR })}
          </div>
          <div className="w-1/6 text-right capitalize">
            {format(date2, 'MMM yyyy', { locale: ptBR })}
          </div>
          <div className="w-1/6 text-right">Variação (%)</div>
        </div>
        {lines.map((row, i) => {
          const delta = getDelta(row.v1, row.v2)
          const deltaColor =
            delta > 0
              ? row.name.includes('(-)')
                ? 'text-red-500'
                : 'text-green-500'
              : delta < 0
                ? row.name.includes('(-)')
                  ? 'text-green-500'
                  : 'text-red-500'
                : 'text-muted-foreground'

          return (
            <div
              key={i}
              className={`flex justify-between py-3 px-6 transition-colors border-b last:border-0
              ${
                row.isFinal
                  ? 'bg-primary text-primary-foreground font-bold'
                  : row.isTotal
                    ? 'bg-muted font-bold text-foreground'
                    : 'text-muted-foreground hover:bg-muted/50'
              }`}
            >
              <div className="w-1/2">{row.name}</div>
              <div className="w-1/6 text-right">{fmt(row.v1)}</div>
              <div className="w-1/6 text-right">{fmt(row.v2)}</div>
              <div className={`w-1/6 text-right font-semibold ${row.isFinal ? '' : deltaColor}`}>
                {delta > 0 ? '+' : ''}
                {delta.toFixed(1)}%
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
