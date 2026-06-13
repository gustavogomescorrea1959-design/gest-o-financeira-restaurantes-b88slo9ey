import pb from '@/lib/pocketbase/client'
import { RecordModel } from 'pocketbase'

export interface Category extends RecordModel {
  grupo: string
  subgrupo: string
  nome_exibicao: string
  tipo: 'receita' | 'custo' | 'despesa' | 'investimento' | 'resultado'
  ordem_visual: number
}

export interface Entry extends RecordModel {
  categoria_id: string
  data: string
  valor: number
  tipo_movimentacao: 'entrada' | 'saida'
  observacao: string
  expand?: { categoria_id: Category }
}

export interface Budget extends RecordModel {
  categoria_id: string
  mes_referencia: string
  valor_orcado: number
  expand?: { categoria_id: Category }
}

export interface BankBalance extends RecordModel {
  data: string
  saldo_caixa: number
  saldo_banco: number
  total_caixas_fisicos: number
}

export interface DashboardMetrics {
  faturamento: number
  totalEntradas: number
  totalSaidas: number
  saldoDia: number
  cmv: number
  margemContribuicao: number
  resultadoOperacional: number
  custosVariaveis: number
  despesasFixas: number
  despesasNaoOperacionais: number
  receitasNaoOperacionais: number
}

export const api = {
  getDashboardMetrics: (startDate: string, endDate: string): Promise<DashboardMetrics> =>
    pb.send('/backend/v1/dashboard-metrics', {
      method: 'GET',
      params: { startDate, endDate },
    }),
  getRecentEntries: () =>
    pb
      .collection<Entry>('daily_entries')
      .getList(1, 10, { expand: 'categoria_id', sort: '-data,-created' }),
  getLatestBalance: () =>
    pb
      .collection<BankBalance>('bank_balances')
      .getList(1, 1, { sort: '-data,-created' })
      .then((res) => res.items[0]),
  createBalance: (data: Partial<BankBalance>) =>
    pb
      .collection('bank_balances')
      .create({ ...data, restaurant_id: pb.authStore.record?.restaurant_id }),
  getCategories: () =>
    pb.collection<Category>('financial_categories').getFullList({ sort: 'ordem_visual' }),
  getAllEntries: () =>
    pb.collection<Entry>('daily_entries').getFullList({ expand: 'categoria_id', sort: '-data' }),
  createEntry: (data: Partial<Entry>) =>
    pb
      .collection('daily_entries')
      .create({ ...data, restaurant_id: pb.authStore.record?.restaurant_id }),
  deleteEntry: (id: string) => pb.collection('daily_entries').delete(id),
  getBudgets: (year: string) =>
    pb.collection<Budget>('budget_entries').getFullList({
      filter: `mes_referencia ~ '${year}'`,
      expand: 'categoria_id',
    }),
  saveBudget: async (data: Partial<Budget>) => {
    const restaurant_id = pb.authStore.record?.restaurant_id
    try {
      const existing = await pb
        .collection('budget_entries')
        .getFirstListItem(
          `categoria_id="${data.categoria_id}" && mes_referencia="${data.mes_referencia}"`,
        )
      return pb.collection('budget_entries').update(existing.id, { ...data, restaurant_id })
    } catch {
      return pb.collection('budget_entries').create({ ...data, restaurant_id })
    }
  },
}
