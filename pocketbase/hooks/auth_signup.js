routerAdd('POST', '/backend/v1/auth/signup', (e) => {
  const body = e.requestInfo().body
  if (!body.nome_restaurante || !body.responsavel_nome || !body.email || !body.password) {
    return e.badRequestError('Campos obrigatórios faltando')
  }

  let userRecord
  try {
    $app.runInTransaction((txApp) => {
      const restaurantsCol = txApp.findCollectionByNameOrId('restaurants')
      const restaurant = new Record(restaurantsCol)
      restaurant.set('nome', body.nome_restaurante)
      restaurant.set('responsavel_nome', body.responsavel_nome)
      restaurant.set('email', body.email)
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

      const usersCol = txApp.findCollectionByNameOrId('_pb_users_auth_')
      userRecord = new Record(usersCol)
      userRecord.setEmail(body.email)
      userRecord.setPassword(body.password)
      userRecord.setVerified(true)
      userRecord.set('name', body.responsavel_nome)
      userRecord.set('restaurant_id', restaurant.id)
      userRecord.set('role', 'admin')
      txApp.save(userRecord)
    })
  } catch (err) {
    $app.logger().error('Signup failed', 'error', err.toString())
    return e.badRequestError('Erro ao criar conta. Verifique se o email já está em uso.')
  }

  return e.json(200, { message: 'Conta criada com sucesso', userId: userRecord.id })
})
