routerAdd(
  'GET',
  '/backend/v1/dashboard-metrics',
  (e) => {
    const restaurantId = e.auth?.getString('restaurant_id')
    if (!restaurantId) {
      return e.unauthorizedError('Not authenticated')
    }

    const startDate = e.request.url.query().get('startDate')
    const endDate = e.request.url.query().get('endDate')

    let dateFilter = ''
    if (startDate) {
      dateFilter += ` && data >= '${startDate}'`
    }
    if (endDate) {
      dateFilter += ` && data <= '${endDate}'`
    }

    const entries = $app.findRecordsByFilter(
      'daily_entries',
      `restaurant_id = '${restaurantId}'${dateFilter}`,
      '-data',
      10000,
      0,
    )

    const categories = $app.findRecordsByFilter(
      'financial_categories',
      `restaurant_id = '${restaurantId}'`,
      '',
      1000,
      0,
    )

    const catMap = {}
    for (const cat of categories) {
      catMap[cat.id] = {
        grupo: cat.getString('grupo') || '',
      }
    }

    let faturamento = 0
    let totalEntradas = 0
    let totalSaidas = 0
    let cmv = 0
    let descartaveis = 0
    let impostos = 0
    let custosVendas = 0
    let despesasFixas = 0

    for (const entry of entries) {
      const val = entry.getFloat('valor')
      const catId = entry.getString('categoria_id')
      const tipoMov = entry.getString('tipo_movimentacao')
      const cat = catMap[catId]

      if (!cat) continue

      if (tipoMov === 'entrada') {
        totalEntradas += val
      } else {
        totalSaidas += val
      }

      const rawGrupo = cat.grupo.toLowerCase().trim()
      const grupo = rawGrupo
        .replace(/[áàãâä]/g, 'a')
        .replace(/[éèêë]/g, 'e')
        .replace(/[íìîï]/g, 'i')
        .replace(/[óòõôö]/g, 'o')
        .replace(/[úùûü]/g, 'u')
        .replace(/[ç]/g, 'c')

      if (grupo === 'faturamento') {
        faturamento += val
      } else if (grupo === 'cmv') {
        cmv += val
      } else if (grupo === 'descartaveis') {
        descartaveis += val
      } else if (grupo === 'impostos') {
        impostos += val
      } else if (grupo === 'custos de vendas' || grupo === 'custo de vendas') {
        custosVendas += val
      } else if (grupo === 'despesas fixas' || grupo === 'despesa fixa') {
        despesasFixas += val
      }
    }

    const margemContribuicao = faturamento - (cmv + descartaveis + impostos + custosVendas)
    const resultadoOperacional = margemContribuicao - despesasFixas

    return e.json(200, {
      faturamento,
      totalEntradas,
      totalSaidas,
      saldoDia: totalEntradas - totalSaidas,
      cmv,
      margemContribuicao,
      resultadoOperacional,
    })
  },
  $apis.requireAuth(),
)
