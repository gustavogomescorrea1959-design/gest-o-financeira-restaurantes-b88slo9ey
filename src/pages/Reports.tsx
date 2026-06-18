import { useEffect, useState } from 'react'
import { api, Entry } from '@/services/api'
import { format, startOfMonth, endOfMonth } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, Scale } from 'lucide-react'
import { useRealtime } from '@/hooks/use-realtime'
import { calculateMetrics } from '@/lib/metrics'
import { DreTable } from '@/components/reports/DreTable'
import { DreComparisonTable } from '@/components/reports/DreComparisonTable'
import { Skeleton } from '@/components/ui/skeleton'

export default function Reports() {
  const [date1, setDate1] = useState(new Date())
  const [date2, setDate2] = useState(
    new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1),
  )
  const [entries1, setEntries1] = useState<Entry[]>([])
  const [entries2, setEntries2] = useState<Entry[]>([])
  const [loading, setLoading] = useState(true)
  const [compareMode, setCompareMode] = useState(false)

  const loadData = async () => {
    setLoading(true)
    const [e1, e2] = await Promise.all([
      api.getEntriesByDateRange(startOfMonth(date1).toISOString(), endOfMonth(date1).toISOString()),
      compareMode
        ? api.getEntriesByDateRange(
            startOfMonth(date2).toISOString(),
            endOfMonth(date2).toISOString(),
          )
        : Promise.resolve([]),
    ])
    setEntries1(e1)
    setEntries2(e2)
    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [date1, date2, compareMode])
  useRealtime('daily_entries', () => {
    loadData()
  })

  const m1 = calculateMetrics(entries1)
  const m2 = calculateMetrics(entries2)

  return (
    <div className="space-y-6 animate-fade-in pb-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card p-4 rounded-xl border shadow-sm">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Relatórios Gerenciais (DRE)</h2>
          <p className="text-muted-foreground text-sm">Demonstrativo consolidado de resultados</p>
        </div>
        <Button
          variant={compareMode ? 'default' : 'outline'}
          onClick={() => setCompareMode(!compareMode)}
          className="gap-2"
        >
          <Scale className="w-4 h-4" /> Comparar Períodos
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-muted/30 p-4 rounded-lg border flex items-center justify-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setDate1(new Date(date1.getFullYear(), date1.getMonth() - 1, 1))}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="w-40 text-center font-bold capitalize">
            {format(date1, 'MMMM yyyy', { locale: ptBR })}
          </span>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setDate1(new Date(date1.getFullYear(), date1.getMonth() + 1, 1))}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        {compareMode && (
          <div className="bg-muted/30 p-4 rounded-lg border flex items-center justify-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setDate2(new Date(date2.getFullYear(), date2.getMonth() - 1, 1))}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="w-40 text-center font-bold capitalize">
              {format(date2, 'MMMM yyyy', { locale: ptBR })}
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setDate2(new Date(date2.getFullYear(), date2.getMonth() + 1, 1))}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>

      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      ) : compareMode ? (
        <DreComparisonTable m1={m2} m2={m1} date1={date2} date2={date1} />
      ) : (
        <DreTable metrics={m1} />
      )}
    </div>
  )
}
