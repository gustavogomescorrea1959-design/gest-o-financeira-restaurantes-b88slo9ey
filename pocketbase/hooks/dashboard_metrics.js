routerAdd(
  'GET',
  '/backend/v1/metrics',
  (e) => {
    const q = e.requestInfo().query
    const start =
      q.start || new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()
    const end =
      q.end || new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString()

    const restaurantId = e.auth?.get('restaurant_id')
    if (!restaurantId) return e.unauthorizedError('auth required')

    const entries = $app.findRecordsByFilter(
      'daily_entries',
      'restaurant_id = {:rId} && data >= {:start} && data <= {:end}',
      '',
      10000,
      0,
      { rId: restaurantId, start, end },
    )

    let faturamento = 0
    let cmv = 0
    let custosVariaveis = 0
    let despesasFixas = 0
    let receitasNaoOperacionais = 0
    let despesasNaoOperacionais = 0

    let totalEntradas = 0
    let totalSaidas = 0

    for (const entry of entries) {
      const val = entry.getFloat('valor')
      const tipoMov = entry.getString('tipo_movimentacao')
      if (tipoMov === 'entrada') totalEntradas += val
      else if (tipoMov === 'saida') totalSaidas += val

      const catId = entry.getString('categoria_id')
      let cat
      try {
        cat = $app.findRecordById('financial_categories', catId)
      } catch (err) {
        continue
      }

      const tipo = cat.getString('tipo')
      const subgrupo = cat.getString('subgrupo')

      // Match exact rules mapped on migration
      if (tipo === 'receita') {
        faturamento += val
      } else if (tipo === 'custo') {
        custosVariaveis += val
        if (
          subgrupo === 'Custos com Matéria Prima' ||
          subgrupo === 'Custos com Materiais de Venda Direta'
        ) {
          cmv += val
        }
      } else if (tipo === 'despesa') {
        despesasFixas += val
      } else if (tipo === 'resultado') {
        receitasNaoOperacionais += val
      } else if (tipo === 'investimento') {
        despesasNaoOperacionais += val
      }
    }

    const margemContribuicao = faturamento - custosVariaveis
    const resultadoOperacional = margemContribuicao - despesasFixas
    const saldoDia = totalEntradas - totalSaidas

    return e.json(200, {
      faturamento,
      cmv,
      custosVariaveis,
      margemContribuicao,
      despesasFixas,
      resultadoOperacional,
      receitasNaoOperacionais,
      despesasNaoOperacionais,
      totalEntradas,
      totalSaidas,
      saldoDia,
    })
  },
  $apis.requireAuth(),
)
