routerAdd(
  'GET',
  '/backend/v1/dashboard-metrics',
  (e) => {
    const restaurantId = e.auth?.get('restaurant_id')
    if (!restaurantId) return e.unauthorizedError('auth required')

    const startDate = e.request.url.query().get('startDate')
    const endDate = e.request.url.query().get('endDate')

    let dateFilter = ''
    if (startDate && endDate) {
      dateFilter = ` && data >= '${startDate}' && data <= '${endDate}'`
    }

    const entries = $app.findRecordsByFilter(
      'daily_entries',
      `restaurant_id = '${restaurantId}'${dateFilter}`,
      '',
      10000,
      0,
    )

    $apis.enrichRecords(e, entries, 'categoria_id')

    let faturamento = 0
    let cmv = 0
    let descartaveis = 0
    let impostos = 0
    let custosVendas = 0
    let despesasFixas = 0
    let despesasNaoOperacionais = 0
    let receitasNaoOperacionais = 0
    let totalEntradas = 0
    let totalSaidas = 0

    for (const entry of entries) {
      const val = entry.getFloat('valor')
      const tipo = entry.getString('tipo_movimentacao')
      const cat = entry.expandedOne('categoria_id')
      if (!cat) continue

      const grupo = cat.getString('grupo')
      const subgrupo = cat.getString('subgrupo')

      if (tipo === 'entrada') totalEntradas += val
      if (tipo === 'saida') totalSaidas += val

      if (grupo === 'FATURAMENTO DIA') {
        faturamento += val
      } else if (grupo === 'CUSTOS VARIÁVEIS') {
        if (subgrupo === 'CMV') cmv += val
        else if (subgrupo === 'Descartáveis') descartaveis += val
        else if (subgrupo === 'Impostos') impostos += val
        else if (subgrupo === 'Custos de Vendas') custosVendas += val
      } else if (grupo === 'DESPESAS FIXAS') {
        despesasFixas += val
      } else if (grupo === 'DESPESAS NÃO OPERACIONAIS') {
        despesasNaoOperacionais += val
      } else if (grupo === 'RECEITAS NÃO OPERACIONAIS') {
        receitasNaoOperacionais += val
      }
    }

    const custosVariaveis = cmv + descartaveis + impostos + custosVendas
    const margemContribuicao = faturamento - custosVariaveis
    const resultadoOperacional = margemContribuicao - despesasFixas
    const saldoDia = totalEntradas - totalSaidas

    return e.json(200, {
      faturamento,
      totalEntradas,
      totalSaidas,
      saldoDia,
      cmv,
      margemContribuicao,
      resultadoOperacional,
      custosVariaveis,
      despesasFixas,
      despesasNaoOperacionais,
      receitasNaoOperacionais,
    })
  },
  $apis.requireAuth(),
)
