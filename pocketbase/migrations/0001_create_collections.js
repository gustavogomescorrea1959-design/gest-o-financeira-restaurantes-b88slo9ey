migrate(
  (app) => {
    const restaurants = new Collection({
      name: 'restaurants',
      type: 'base',
      listRule: '@request.auth.restaurant_id = id',
      viewRule: '@request.auth.restaurant_id = id',
      createRule: null,
      updateRule: "@request.auth.restaurant_id = id && @request.auth.role = 'admin'",
      deleteRule: null,
      fields: [
        { name: 'nome', type: 'text', required: true },
        { name: 'responsavel_nome', type: 'text', required: true },
        { name: 'email', type: 'email', required: true },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(restaurants)

    const users = app.findCollectionByNameOrId('_pb_users_auth_')
    users.listRule = 'id = @request.auth.id || restaurant_id = @request.auth.restaurant_id'
    users.viewRule = 'id = @request.auth.id || restaurant_id = @request.auth.restaurant_id'
    users.createRule = null
    users.updateRule =
      "id = @request.auth.id || (@request.auth.role = 'admin' && restaurant_id = @request.auth.restaurant_id)"
    users.fields.add(
      new RelationField({
        name: 'restaurant_id',
        collectionId: restaurants.id,
        maxSelect: 1,
        cascadeDelete: true,
      }),
    )
    users.fields.add(
      new SelectField({ name: 'role', values: ['admin', 'colaborador'], maxSelect: 1 }),
    )
    app.save(users)

    const categories = new Collection({
      name: 'financial_categories',
      type: 'base',
      listRule: 'restaurant_id = @request.auth.restaurant_id',
      viewRule: 'restaurant_id = @request.auth.restaurant_id',
      createRule: "restaurant_id = @request.auth.restaurant_id && @request.auth.role = 'admin'",
      updateRule: "restaurant_id = @request.auth.restaurant_id && @request.auth.role = 'admin'",
      deleteRule: "restaurant_id = @request.auth.restaurant_id && @request.auth.role = 'admin'",
      fields: [
        {
          name: 'restaurant_id',
          type: 'relation',
          collectionId: restaurants.id,
          required: true,
          maxSelect: 1,
        },
        { name: 'grupo', type: 'text', required: true },
        { name: 'subgrupo', type: 'text' },
        { name: 'nome_exibicao', type: 'text', required: true },
        {
          name: 'tipo',
          type: 'select',
          values: ['receita', 'custo', 'despesa', 'investimento', 'resultado'],
          maxSelect: 1,
        },
        { name: 'ordem_visual', type: 'number' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(categories)

    const entries = new Collection({
      name: 'daily_entries',
      type: 'base',
      listRule: 'restaurant_id = @request.auth.restaurant_id',
      viewRule: 'restaurant_id = @request.auth.restaurant_id',
      createRule: 'restaurant_id = @request.auth.restaurant_id',
      updateRule: 'restaurant_id = @request.auth.restaurant_id',
      deleteRule: 'restaurant_id = @request.auth.restaurant_id',
      fields: [
        {
          name: 'restaurant_id',
          type: 'relation',
          collectionId: restaurants.id,
          required: true,
          maxSelect: 1,
        },
        {
          name: 'categoria_id',
          type: 'relation',
          collectionId: categories.id,
          required: true,
          maxSelect: 1,
        },
        { name: 'data', type: 'date', required: true },
        { name: 'valor', type: 'number', required: true },
        { name: 'tipo_movimentacao', type: 'select', values: ['entrada', 'saida'], maxSelect: 1 },
        { name: 'observacao', type: 'text' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(entries)

    const budgets = new Collection({
      name: 'budget_entries',
      type: 'base',
      listRule: 'restaurant_id = @request.auth.restaurant_id',
      viewRule: 'restaurant_id = @request.auth.restaurant_id',
      createRule: 'restaurant_id = @request.auth.restaurant_id',
      updateRule: 'restaurant_id = @request.auth.restaurant_id',
      deleteRule: 'restaurant_id = @request.auth.restaurant_id',
      fields: [
        {
          name: 'restaurant_id',
          type: 'relation',
          collectionId: restaurants.id,
          required: true,
          maxSelect: 1,
        },
        {
          name: 'categoria_id',
          type: 'relation',
          collectionId: categories.id,
          required: true,
          maxSelect: 1,
        },
        { name: 'mes_referencia', type: 'text', required: true },
        { name: 'valor_orcado', type: 'number' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(budgets)

    const balances = new Collection({
      name: 'bank_balances',
      type: 'base',
      listRule: 'restaurant_id = @request.auth.restaurant_id',
      viewRule: 'restaurant_id = @request.auth.restaurant_id',
      createRule: 'restaurant_id = @request.auth.restaurant_id',
      updateRule: 'restaurant_id = @request.auth.restaurant_id',
      deleteRule: 'restaurant_id = @request.auth.restaurant_id',
      fields: [
        {
          name: 'restaurant_id',
          type: 'relation',
          collectionId: restaurants.id,
          required: true,
          maxSelect: 1,
        },
        { name: 'data', type: 'date', required: true },
        { name: 'saldo_caixa', type: 'number' },
        { name: 'saldo_banco', type: 'number' },
        { name: 'total_caixas_fisicos', type: 'number' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(balances)
  },
  (app) => {
    app.delete(app.findCollectionByNameOrId('bank_balances'))
    app.delete(app.findCollectionByNameOrId('budget_entries'))
    app.delete(app.findCollectionByNameOrId('daily_entries'))
    app.delete(app.findCollectionByNameOrId('financial_categories'))

    const users = app.findCollectionByNameOrId('_pb_users_auth_')
    users.fields.removeByName('restaurant_id')
    users.fields.removeByName('role')
    app.save(users)

    app.delete(app.findCollectionByNameOrId('restaurants'))
  },
)
