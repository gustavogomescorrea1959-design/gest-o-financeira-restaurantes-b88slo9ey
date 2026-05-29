import { useEffect, useState, useMemo } from 'react'
import { api, Entry } from '@/services/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { format, parseISO, isSameMonth } from 'date-fns'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart'
import { useRealtime } from '@/hooks/use-realtime'

export default function Reports() {
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

  // Group by category for current month despesas
  const expensesByCategory = useMemo(() => {
    const now = new Date()
    const expenses = entries.filter(
      (e) => isSameMonth(parseISO(e.data), now) && e.tipo_movimentacao === 'saida',
    )

    const grouped = expenses.reduce(
      (acc, curr) => {
        const catName = curr.expand?.categoria_id?.nome_exibicao || 'Outros'
        acc[catName] = (acc[catName] || 0) + curr.valor
        return acc
      },
      {} as Record<string, number>,
    )

    return Object.entries(grouped)
      .map(([name, value]) => ({ name, value, fill: `var(--color-${name.replace(/\s+/g, '')})` }))
      .sort((a, b) => b.value - a.value)
  }, [entries])

  const COLORS = [
    '#2D5016', // Moss Green
    '#C75B2A', // Burnt Orange
    '#3D2B1F', // Dark Brown
    '#4A7C25', // Lighter Green
    '#D97A4D', // Lighter Orange
    '#5C4533', // Lighter Brown
    '#1B330B', // Darker Green
    '#A34117', // Darker Orange
    '#80624C', // Tan
  ]

  const chartConfig = useMemo(() => {
    const config: Record<string, { label: string; color: string }> = {}
    expensesByCategory.forEach((item, index) => {
      config[item.name.replace(/\s+/g, '')] = {
        label: item.name,
        color: COLORS[index % COLORS.length],
      }
    })
    return config
  }, [expensesByCategory])

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex justify-between items-center bg-card p-6 rounded-xl border border-border shadow-elevation">
        <h2 className="text-2xl font-bold text-foreground">Relatórios Financeiros</h2>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border border-border shadow-elevation rounded-xl">
          <CardHeader>
            <CardTitle className="text-lg text-foreground">
              Despesas por Categoria (Mês Atual)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {expensesByCategory.length > 0 ? (
              <ChartContainer config={chartConfig} className="h-[350px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={expensesByCategory}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={120}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {expensesByCategory.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<ChartTooltipContent />} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
            ) : (
              <div className="h-[350px] flex items-center justify-center text-muted-foreground">
                Nenhuma despesa registrada no mês atual.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
