import { Entry } from '@/services/api'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart'

interface Props {
  entries: Entry[]
}

export function DistributionChart({ entries }: Props) {
  const dataMap: Record<string, number> = {}

  entries.forEach((e) => {
    const cat = e.expand?.categoria_id
    if (!cat || e.tipo_movimentacao === 'entrada') return
    const group = cat.grupo || 'Outros'
    dataMap[group] = (dataMap[group] || 0) + e.valor
  })

  const data = Object.entries(dataMap)
    .map(([name, value]) => ({ name, value }))
    .filter((d) => d.value > 0)
    .sort((a, b) => b.value - a.value)

  const COLORS = ['#f43f5e', '#f97316', '#eab308', '#84cc16', '#3b82f6', '#8b5cf6', '#d946ef']

  const config = data.reduce((acc, curr, i) => {
    acc[curr.name] = { label: curr.name, color: COLORS[i % COLORS.length] }
    return acc
  }, {} as any)

  if (data.length === 0) {
    return (
      <div className="h-[300px] flex items-center justify-center text-muted-foreground">
        Sem saídas no período
      </div>
    )
  }

  return (
    <div className="h-[300px] w-full">
      <ChartContainer config={config} className="h-full w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={5}
              dataKey="value"
            >
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<ChartTooltipContent />} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </ChartContainer>
    </div>
  )
}
