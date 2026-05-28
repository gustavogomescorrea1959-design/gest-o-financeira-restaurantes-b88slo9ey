import React, { useState, useEffect } from 'react'
import { api, Category, Budget as BudgetType } from '@/services/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from '@/hooks/use-toast'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function Budget() {
  const [categories, setCategories] = useState<Category[]>([])
  const [budgets, setBudgets] = useState<BudgetType[]>([])
  const [year, setYear] = useState(new Date().getFullYear().toString())

  const loadData = async () => {
    try {
      const cats = await api.getCategories()
      setCategories(cats)
      const buds = await api.getBudgets(year)
      setBudgets(buds)
    } catch {
      /* intentionally ignored */
    }
  }

  useEffect(() => {
    loadData()
  }, [year])

  const months = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12']
  const groups = Array.from(new Set(categories.map((c) => c.grupo)))

  const getBudgetValue = (catId: string, month: string) => {
    const b = budgets.find(
      (b) => b.categoria_id === catId && b.mes_referencia === `${year}-${month}`,
    )
    return b ? b.valor_orcado : ''
  }

  const handleBlur = async (catId: string, month: string, value: string) => {
    const val = parseFloat(value)
    if (isNaN(val) && value !== '') return

    const finalVal = isNaN(val) ? 0 : val
    try {
      await api.saveBudget({
        categoria_id: catId,
        mes_referencia: `${year}-${month}`,
        valor_orcado: finalVal,
      })
      toast({ title: 'Orçamento atualizado' })
      loadData()
    } catch (e) {
      toast({ title: 'Erro ao salvar', variant: 'destructive' })
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center bg-white p-4 rounded-lg border shadow-sm">
        <h2 className="text-xl font-bold text-slate-800">Orçamento Financeiro</h2>
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setYear((parseInt(year) - 1).toString())}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="font-bold text-lg text-slate-800 min-w-[60px] text-center">{year}</span>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setYear((parseInt(year) + 1).toString())}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border overflow-x-auto">
        <table className="w-full text-sm text-left border-collapse">
          <thead className="bg-slate-50 border-b">
            <tr>
              <th className="p-4 font-semibold text-slate-700 min-w-[250px] border-r">Categoria</th>
              {months.map((m) => (
                <th key={m} className="p-4 font-semibold text-slate-700 text-center min-w-[120px]">
                  {m}/{year}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {groups.map((g) => (
              <React.Fragment key={g}>
                <tr className="bg-slate-100 border-b">
                  <td
                    colSpan={13}
                    className="p-3 px-4 font-bold text-slate-800 uppercase tracking-wider text-xs"
                  >
                    {g}
                  </td>
                </tr>
                {categories
                  .filter((c) => c.grupo === g)
                  .map((c) => (
                    <tr key={c.id} className="border-b hover:bg-slate-50 transition-colors">
                      <td className="p-3 pl-8 text-slate-700 font-medium border-r">
                        {c.nome_exibicao}
                      </td>
                      {months.map((m) => (
                        <td key={m} className="p-1">
                          <Input
                            type="number"
                            defaultValue={getBudgetValue(c.id, m)}
                            onBlur={(e) => {
                              if (e.target.value !== getBudgetValue(c.id, m).toString()) {
                                handleBlur(c.id, m, e.target.value)
                              }
                            }}
                            className="h-10 text-right bg-transparent border-transparent hover:border-emerald-200 focus:border-emerald-500 focus:ring-emerald-500 rounded-none shadow-none font-mono text-slate-700"
                            placeholder="0,00"
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
