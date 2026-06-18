import { calculateMetrics } from '@/lib/metrics'

interface Props {
  metrics: ReturnType<typeof calculateMetrics>
}

export function DreTable({ metrics }: Props) {
  const fmt = (val: number) =>
    `R$ ${val.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

  const lines = [
    { name: 'Receita Bruta (Faturamento)', value: metrics.faturamento, isTotal: true },
    { name: '(-) Custos com Matéria Prima', value: metrics.custosMateriaPrima },
    { name: '(-) Outros Custos Variáveis', value: metrics.custosVariaveisOutros },
    { name: '(=) Margem de Contribuição', value: metrics.margemContribuicao, isTotal: true },
    { name: '(-) Despesas Fixas', value: metrics.despesasFixas },
    { name: '(=) Lucro Operacional', value: metrics.resultadoOperacional, isTotal: true },
    { name: '(+) Receitas Não Operacionais', value: metrics.receitasNaoOperacionais },
    { name: '(-) Despesas Não Operacionais', value: metrics.despesasNaoOperacionais },
    { name: '(=) Resultado Final', value: metrics.resultadoLiquido, isFinal: true },
  ]

  return (
    <div className="overflow-x-auto bg-card rounded-xl border shadow-sm">
      <div className="min-w-[500px]">
        {lines.map((row, i) => (
          <div
            key={i}
            className={`flex justify-between py-3 px-6 transition-colors border-b last:border-0
            ${
              row.isFinal
                ? 'bg-primary text-primary-foreground font-bold text-lg'
                : row.isTotal
                  ? 'bg-muted font-bold text-foreground'
                  : 'text-muted-foreground hover:bg-muted/50'
            }`}
          >
            <span>{row.name}</span>
            <span>{fmt(row.value)}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
