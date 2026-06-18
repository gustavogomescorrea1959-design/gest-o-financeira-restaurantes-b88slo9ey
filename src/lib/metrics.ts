import { Entry } from '@/services/api'

export function calculateMetrics(entries: Entry[]) {
  let faturamento = 0
  let receitasNaoOperacionais = 0
  let custosMateriaPrima = 0
  let custosVariaveisOutros = 0
  let despesasFixas = 0
  let despesasNaoOperacionais = 0

  entries.forEach((e) => {
    const cat = e.expand?.categoria_id
    if (!cat) return
    const val = e.valor

    if (cat.tipo === 'receita') faturamento += val
    else if (cat.tipo === 'resultado') receitasNaoOperacionais += val
    else if (cat.tipo === 'custo') {
      if (cat.subgrupo === 'Custos com Matéria Prima') custosMateriaPrima += val
      else custosVariaveisOutros += val
    } else if (cat.tipo === 'despesa') despesasFixas += val
    else if (cat.tipo === 'investimento') despesasNaoOperacionais += val
  })

  const custosVariaveis = custosMateriaPrima + custosVariaveisOutros
  const margemContribuicao = faturamento - custosVariaveis
  const resultadoOperacional = margemContribuicao - despesasFixas
  const resultadoLiquido = resultadoOperacional + receitasNaoOperacionais - despesasNaoOperacionais

  const cmvGeral = faturamento > 0 ? (custosVariaveis / faturamento) * 100 : 0
  const cmvMaterial = faturamento > 0 ? (custosMateriaPrima / faturamento) * 100 : 0

  return {
    faturamento,
    receitasNaoOperacionais,
    custosMateriaPrima,
    custosVariaveisOutros,
    custosVariaveis,
    despesasFixas,
    despesasNaoOperacionais,
    margemContribuicao,
    resultadoOperacional,
    resultadoLiquido,
    cmvGeral,
    cmvMaterial,
  }
}
