import { Entry } from '@/services/api'
import { calculateMetrics } from '@/lib/metrics'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart'

interface Props {
  yearEntries: Entry[]
}

export function MonthlyEvolutionChart({ yearEntries }: Props) {
  const monthlyData = Array.from({ length: 12 }, (_, i) => {
    const monthEntries = yearEntries.filter((e) => parseISO(e.data).getMonth() === i)
    const metrics = calculateMetrics(monthEntries)
    return {
      month: format(new Date(2000, i, 1), 'MMM', { locale: ptBR }),
      Receitas: metrics.faturamento,
      Custos: metrics.custosVariaveis + metrics.despesasFixas,
      Lucro: metrics.resultadoLiquido,
    }
  })

  const config = {
    Receitas: { label: 'Receitas', color: '#10b981' },
    Custos: { label: 'Custos/Despesas', color: '#f43f5e' },
    Lucro: { label: 'Lucro Líquido', color: '#3b82f6' },
  }

  return (
    <div className="h-[300px] w-full">
      <ChartContainer config={config} className="h-full w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
            <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 12 }}
              tickFormatter={(v) => `R$${v / 1000}k`}
            />
            <Tooltip content={<ChartTooltipContent />} />
            <Legend />
            <Bar dataKey="Receitas" fill="var(--color-Receitas)" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Custos" fill="var(--color-Custos)" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Lucro" fill="var(--color-Lucro)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartContainer>
    </div>
  )
}
