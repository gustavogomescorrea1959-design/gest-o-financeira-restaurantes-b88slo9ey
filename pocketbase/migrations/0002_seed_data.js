migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('_pb_users_auth_')
    try {
      app.findAuthRecordByEmail('_pb_users_auth_', 'gustavogomescorrea1959@gmail.com')
      return
    } catch (_) {}

    app.runInTransaction((txApp) => {
      const restaurantsCol = txApp.findCollectionByNameOrId('restaurants')
      const restaurant = new Record(restaurantsCol)
      restaurant.set('nome', 'Restaurante Alecrim')
      restaurant.set('responsavel_nome', 'Gustavo Gomes')
      restaurant.set('email', 'gustavogomescorrea1959@gmail.com')
      txApp.save(restaurant)

      const categories = [
        { grupo: 'Faturamento', nome_exibicao: 'Salão', tipo: 'receita', ordem_visual: 1 },
        { grupo: 'Faturamento', nome_exibicao: 'Delivery', tipo: 'receita', ordem_visual: 2 },
        { grupo: 'CMV', nome_exibicao: 'Alimentos', tipo: 'custo', ordem_visual: 3 },
        { grupo: 'CMV', nome_exibicao: 'Bebidas', tipo: 'custo', ordem_visual: 4 },
        { grupo: 'Despesas Fixas', nome_exibicao: 'Aluguel', tipo: 'despesa', ordem_visual: 5 },
        {
          grupo: 'Despesas Fixas',
          nome_exibicao: 'Energia Elétrica',
          tipo: 'despesa',
          ordem_visual: 6,
        },
        {
          grupo: 'Folha de Pagamento',
          nome_exibicao: 'Salários',
          tipo: 'despesa',
          ordem_visual: 7,
        },
      ]
      const catCol = txApp.findCollectionByNameOrId('financial_categories')
      for (const c of categories) {
        const cat = new Record(catCol)
        cat.set('restaurant_id', restaurant.id)
        cat.set('grupo', c.grupo)
        cat.set('nome_exibicao', c.nome_exibicao)
        cat.set('tipo', c.tipo)
        cat.set('ordem_visual', c.ordem_visual)
        txApp.save(cat)
      }

      const userRecord = new Record(users)
      userRecord.setEmail('gustavogomescorrea1959@gmail.com')
      userRecord.setPassword('Skip@Pass')
      userRecord.setVerified(true)
      userRecord.set('name', 'Gustavo Admin')
      userRecord.set('restaurant_id', restaurant.id)
      userRecord.set('role', 'admin')
      txApp.save(userRecord)
    })
  },
  (app) => {
    try {
      const u = app.findAuthRecordByEmail('_pb_users_auth_', 'gustavogomescorrea1959@gmail.com')
      app.delete(u)
    } catch (_) {}
  },
)
