migrate((app) => {
  const categories = [
    { grupo: 'FATURAMENTO DIA', subgrupo: 'Salão', nome: 'Alimentos', tipo: 'receita', ordem: 1 },
    { grupo: 'FATURAMENTO DIA', subgrupo: 'Salão', nome: 'Bebidas', tipo: 'receita', ordem: 2 },
    { grupo: 'FATURAMENTO DIA', subgrupo: 'Delivery', nome: 'Ifood', tipo: 'receita', ordem: 3 },
    {
      grupo: 'CUSTOS VARIÁVEIS',
      subgrupo: 'CMV',
      nome: 'Insumos Alimentos',
      tipo: 'custo',
      ordem: 4,
    },
    {
      grupo: 'CUSTOS VARIÁVEIS',
      subgrupo: 'CMV',
      nome: 'Insumos Bebidas',
      tipo: 'custo',
      ordem: 5,
    },
    {
      grupo: 'CUSTOS VARIÁVEIS',
      subgrupo: 'Descartáveis',
      nome: 'Embalagens',
      tipo: 'custo',
      ordem: 6,
    },
    {
      grupo: 'CUSTOS VARIÁVEIS',
      subgrupo: 'Impostos',
      nome: 'Simples Nacional',
      tipo: 'custo',
      ordem: 7,
    },
    {
      grupo: 'CUSTOS VARIÁVEIS',
      subgrupo: 'Custos de Vendas',
      nome: 'Taxa Ifood',
      tipo: 'custo',
      ordem: 8,
    },
    {
      grupo: 'CUSTOS VARIÁVEIS',
      subgrupo: 'Custos de Vendas',
      nome: 'Taxa Cartão',
      tipo: 'custo',
      ordem: 9,
    },
    { grupo: 'DESPESAS FIXAS', subgrupo: 'Pessoal', nome: 'Salários', tipo: 'despesa', ordem: 10 },
    { grupo: 'DESPESAS FIXAS', subgrupo: 'Pessoal', nome: 'Encargos', tipo: 'despesa', ordem: 11 },
    { grupo: 'DESPESAS FIXAS', subgrupo: 'Ocupação', nome: 'Aluguel', tipo: 'despesa', ordem: 12 },
    {
      grupo: 'DESPESAS FIXAS',
      subgrupo: 'Ocupação',
      nome: 'Condomínio',
      tipo: 'despesa',
      ordem: 13,
    },
    { grupo: 'DESPESAS FIXAS', subgrupo: 'Utilidades', nome: 'Água', tipo: 'despesa', ordem: 14 },
    { grupo: 'DESPESAS FIXAS', subgrupo: 'Utilidades', nome: 'Luz', tipo: 'despesa', ordem: 15 },
    {
      grupo: 'DESPESAS FIXAS',
      subgrupo: 'Administrativo',
      nome: 'Contabilidade',
      tipo: 'despesa',
      ordem: 16,
    },
    {
      grupo: 'DESPESAS NÃO OPERACIONAIS',
      subgrupo: 'Financeiras',
      nome: 'Juros',
      tipo: 'despesa',
      ordem: 17,
    },
    {
      grupo: 'RECEITAS NÃO OPERACIONAIS',
      subgrupo: 'Rendimentos',
      nome: 'Aplicações',
      tipo: 'receita',
      ordem: 18,
    },
  ]
  const col = app.findCollectionByNameOrId('financial_categories')

  const adminEmail = 'gustavogomescorrea1959@gmail.com'
  let user
  try {
    user = app.findAuthRecordByEmail('_pb_users_auth_', adminEmail)
  } catch (_) {
    return
  }

  const restaurantId = user.get('restaurant_id')
  if (!restaurantId) return

  for (const cat of categories) {
    try {
      app.findFirstRecordByFilter(
        'financial_categories',
        `nome_exibicao='${cat.nome}' && subgrupo='${cat.subgrupo}' && grupo='${cat.grupo}' && restaurant_id='${restaurantId}'`,
      )
    } catch (_) {
      const record = new Record(col)
      record.set('grupo', cat.grupo)
      record.set('subgrupo', cat.subgrupo)
      record.set('nome_exibicao', cat.nome)
      record.set('tipo', cat.tipo)
      record.set('ordem_visual', cat.ordem)
      record.set('restaurant_id', restaurantId)
      app.save(record)
    }
  }
})
