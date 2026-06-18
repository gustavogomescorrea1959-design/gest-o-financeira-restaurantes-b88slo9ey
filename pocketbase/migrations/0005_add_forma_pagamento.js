migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('daily_entries')
    if (!col.fields.getByName('forma_pagamento')) {
      col.fields.add(
        new SelectField({
          name: 'forma_pagamento',
          values: [
            'Dinheiro',
            'PIX',
            'Cartão de Crédito',
            'Cartão de Débito',
            'Transferência',
            'Boleto',
            'Outros',
          ],
          maxSelect: 1,
        }),
      )
      app.save(col)
    }
  },
  (app) => {
    const col = app.findCollectionByNameOrId('daily_entries')
    if (col.fields.getByName('forma_pagamento')) {
      col.fields.removeByName('forma_pagamento')
      app.save(col)
    }
  },
)
