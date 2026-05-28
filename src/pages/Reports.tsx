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
    '#10b981',
    '#3b82f6',
    '#f59e0b',
    '#ef4444',
    '#8b5cf6',
    '#ec4899',
    '#64748b',
    '#14b8a6',
    '#f43f5e',
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
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center bg-white p-4 rounded-lg border shadow-sm">
        <h2 className="text-xl font-bold text-slate-800">Relatórios Financeiros</h2>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-0 shadow-subtle">
          <CardHeader>
            <CardTitle className="text-lg text-slate-800">
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
              <div className="h-[350px] flex items-center justify-center text-slate-500">
                Nenhuma despesa registrada no mês atual.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
