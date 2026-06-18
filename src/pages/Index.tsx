import { useEffect, useState } from 'react'
import { api, Entry } from '@/services/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { format, startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, PlusCircle } from 'lucide-react'
import { useRealtime } from '@/hooks/use-realtime'
import { EntryForm } from '@/components/EntryForm'
import { Skeleton } from '@/components/ui/skeleton'
import { SummaryCards } from '@/components/dashboard/SummaryCards'
import { MonthlyEvolutionChart } from '@/components/dashboard/MonthlyEvolutionChart'
import { DistributionChart } from '@/components/dashboard/DistributionChart'
import { calculateMetrics } from '@/lib/metrics'

export default function Dashboard() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [entries, setEntries] = useState<Entry[]>([])
  const [yearEntries, setYearEntries] = useState<Entry[]>([])
  const [loading, setLoading] = useState(true)
  const [entryFormOpen, setEntryFormOpen] = useState(false)

  const loadData = async () => {
    try {
      setLoading(true)
      const start = startOfMonth(currentDate).toISOString()
      const end = endOfMonth(currentDate).toISOString()
      const yStart = startOfYear(currentDate).toISOString()
      const yEnd = endOfYear(currentDate).toISOString()

      const [periodData, yearData] = await Promise.all([
        api.getEntriesByDateRange(start, end),
        api.getEntriesByDateRange(yStart, yEnd),
      ])

      setEntries(periodData)
      setYearEntries(yearData)
    } catch (err) {
      console.error(err)
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

  const metrics = calculateMetrics(entries)

  return (
    <div className="space-y-6 animate-fade-in pb-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card p-4 rounded-xl border shadow-sm">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Dashboard Financeiro</h2>
          <p className="text-muted-foreground text-sm">Visão geral e KPIs em tempo real</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center bg-muted/50 rounded-lg p-1 border">
            <Button
              variant="ghost"
              size="icon"
              onClick={() =>
                setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
              }
              className="h-8 w-8"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="w-32 text-center font-semibold capitalize">
              {format(currentDate, 'MMM yyyy', { locale: ptBR })}
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() =>
                setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
              }
              className="h-8 w-8"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
          <Button onClick={() => setEntryFormOpen(true)} className="gap-2">
            <PlusCircle className="w-4 h-4" /> Novo
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      ) : (
        <>
          <SummaryCards metrics={metrics} />

          <div className="grid lg:grid-cols-2 gap-6">
            <Card className="border shadow-sm">
              <CardHeader>
                <CardTitle>Evolução Anual</CardTitle>
              </CardHeader>
              <CardContent>
                <MonthlyEvolutionChart yearEntries={yearEntries} />
              </CardContent>
            </Card>

            <Card className="border shadow-sm">
              <CardHeader>
                <CardTitle>Distribuição de Custos e Despesas</CardTitle>
              </CardHeader>
              <CardContent>
                <DistributionChart entries={entries} />
              </CardContent>
            </Card>
          </div>
        </>
      )}

      <EntryForm open={entryFormOpen} onOpenChange={setEntryFormOpen} onSuccess={loadData} />
    </div>
  )
}
