migrate(
  (app) => {
    const restaurants = app.findRecordsByFilter('restaurants', '1=1', '', 1000, 0)
    if (restaurants.length === 0) return

    const categoriesToSeed = [
      ['FATURAMENTO DIA', 'FATURAMENTO DIA', 'receita', ['Dinheiro', 'Entradas Banco']],
      ['Receitas', 'Receitas', 'receita', ['Dinheiro', 'Entradas Banco']],
      [
        'CUSTOS VARIÁVEIS',
        'Custos com Matéria Prima',
        'custo',
        [
          'Aves',
          'Carnes',
          'Frutos do Mar',
          'Feira',
          'Feira Orgânica',
          'Mercado',
          'Laticíneos e Frios',
          'Diversos',
        ],
      ],
      ['CUSTOS VARIÁVEIS', 'Custos com Materiais de Venda Direta', 'custo', ['Bebidas', 'Outros']],
      [
        'CUSTOS VARIÁVEIS',
        'Custo com Materiais de Apoio',
        'custo',
        [
          'Descartáveis de Apoio (Sacos Plásticos, Guardanapo)',
          'Descartáveis: Delivery e Congelados',
        ],
      ],
      [
        'CUSTOS VARIÁVEIS',
        'Impostos e Taxas',
        'custo',
        ['Simples - DAS', 'Vigilância Sanitária - ANVISA', 'Outros Impostos (Bombeiros, etc)'],
      ],
      [
        'CUSTOS VARIÁVEIS',
        'Custos de MKT Variáveis',
        'custo',
        [
          'Anúncios: Meta',
          'Anúncios: Google',
          'Anúncios: Convencionais',
          'Ações e Materiais de Divulgação (Blogueiros, Folhetos, etc)',
        ],
      ],
      [
        'CUSTOS VARIÁVEIS',
        'Custos de Vendas',
        'custo',
        [
          'Plataformas de Vendas (Cardápio Web, Loja Integrada, etc)',
          'Serviço de Entrega (Motoboy)',
          'Comissões e Gratificações de Vendas',
          'Outros Custos de Vendas',
        ],
      ],
      [
        'DESPESAS FIXAS',
        'Ocupação',
        'despesa',
        ['Aluguel do estabelecimento', 'IPTU', 'Outros impostos e taxas'],
      ],
      [
        'DESPESAS FIXAS',
        'Utilidades Públicas',
        'despesa',
        ['Conta de Luz', 'Conta de Água', 'Telefone', 'Conta de Gás'],
      ],
      [
        'DESPESAS FIXAS',
        'Despesas Administrativas',
        'despesa',
        [
          'Material de Escritório / Informática',
          'Sistema Gerencial - ERP',
          'Cursos e Consultorias',
          'Seguro Predial',
          'Associações e Sindicatos (Abrasel)',
          'Outras despesas administrativas',
        ],
      ],
      [
        'DESPESAS FIXAS',
        'Despesas Gerais',
        'despesa',
        [
          'Material de Higiene/Limpeza',
          'Utensílios (Louças, Talheres, Toalhas, Decoração)',
          'Material Gráfico (Comandas, etiquetas para geladeira)',
          'Água Garrafão / Gelo',
          'Diversas (Farmácia, etc)',
        ],
      ],
      [
        'DESPESAS FIXAS',
        'Despesas com Marketing Fixas',
        'despesa',
        [
          'Serviços: Mídias Sociais',
          'Serviços: Gestão Tráfego',
          'Extra de MKT (CRM, Automações, etc)',
        ],
      ],
      [
        'DESPESAS FIXAS',
        'Despesas de Manutenção',
        'despesa',
        ['MNT Predial', 'MNT Máquinas e Equipamentos', 'Outras MNT'],
      ],
      [
        'DESPESAS FIXAS',
        'Serviços Terceirizados',
        'despesa',
        [
          'Contabilidade',
          'Segurança / Alarme',
          'Coleta de Lixo',
          'Dedetização',
          'Assessoria Nutricional',
          'Outras Assessorias (Jurídicas)',
        ],
      ],
      [
        'DESPESAS FIXAS',
        'Despesas com Pessoal',
        'despesa',
        [
          'Salários',
          'Vales: Adiantamentos',
          'Vale-Transporte',
          'Férias',
          'INSS',
          'FGTS',
          'Rescisões (inclusive FGTS da Rescisão)',
          'Exames Médicos (Admissão e Demissão)',
          '13º salário',
          'Gratificação',
          'Contribuição sindical / assistencial',
          'Empresas de Contratação de Estagiários',
          'Sistema de Gestão da Folha (Tangerino)',
          'Cursos e Treinamentos',
          'Uniformes',
          'Outras despesas com DP',
        ],
      ],
      ['DESPESAS FIXAS', 'Retirada dos Sócios', 'despesa', ['Pró-labore 1', 'Pró-labore 2']],
      [
        'DESPESAS FIXAS',
        'Despesas Financeiras',
        'despesa',
        [
          'Despesas Bancárias (Contratos e Taxas)',
          'Impostos: IOF, etc',
          'Custos Financeiros: Juros',
        ],
      ],
      [
        'RECEITAS NÃO OPERACIONAIS',
        'RECEITAS NÃO OPERACIONAIS',
        'resultado',
        [
          'Receitas Extras: Operacionais',
          'Receitas Extras: Jurídicas',
          'Entrada de Empréstimos',
          'Outras Receitas Não Operacionais',
        ],
      ],
      [
        'DESPESAS NÃO OPERACIONAIS',
        'Investimentos',
        'investimento',
        ['Equipamentos', 'Reformas', 'Outros Investimentos Não Operacionais'],
      ],
      [
        'DESPESAS NÃO OPERACIONAIS',
        'Outras Despesas Não Operacionais',
        'investimento',
        [
          'Distribuição de Lucro',
          'Parcelamento Impostos e Taxas Públicas',
          'Multas Diversas',
          'Empréstimos',
          'Dívidas Trabalhistas',
          'Outras Despesas Não Operacionais',
        ],
      ],
    ]

    const col = app.findCollectionByNameOrId('financial_categories')

    for (const restaurant of restaurants) {
      const rId = restaurant.id
      // Get existing categories to map entries to new categories
      const oldCategories = app.findRecordsByFilter(
        'financial_categories',
        'restaurant_id = {:rId}',
        '',
        1000,
        0,
        { rId },
      )

      const newCategoryIds = {}
      let order = 1

      for (const [grupo, subgrupo, tipo, accounts] of categoriesToSeed) {
        for (const account of accounts) {
          const record = new Record(col)
          record.set('restaurant_id', rId)
          record.set('grupo', grupo)
          record.set('subgrupo', subgrupo)
          record.set('nome_exibicao', account)
          record.set('tipo', tipo)
          record.set('ordem_visual', order++)
          app.save(record)

          newCategoryIds[account.toLowerCase()] = record.id
        }
      }

      for (const oldCat of oldCategories) {
        const oldName = oldCat.getString('nome_exibicao').toLowerCase()
        const oldId = oldCat.id

        let targetId = newCategoryIds[oldName]
        if (!targetId) {
          if (oldName.includes('venda') || oldName.includes('faturamento'))
            targetId = newCategoryIds['dinheiro']
          else if (oldName.includes('imposto')) targetId = newCategoryIds['simples - das']
          else if (oldName.includes('salário') || oldName.includes('pessoal'))
            targetId = newCategoryIds['salários']
          else if (oldName.includes('aluguel'))
            targetId = newCategoryIds['aluguel do estabelecimento']
          else if (oldCat.getString('tipo') === 'receita')
            targetId = newCategoryIds['outras receitas não operacionais']
          else targetId = newCategoryIds['diversas (farmácia, etc)']
        }

        if (targetId) {
          app
            .db()
            .newQuery(
              'UPDATE daily_entries SET categoria_id = {:targetId} WHERE categoria_id = {:oldId}',
            )
            .bind({ targetId, oldId })
            .execute()
          app
            .db()
            .newQuery(
              'UPDATE budget_entries SET categoria_id = {:targetId} WHERE categoria_id = {:oldId}',
            )
            .bind({ targetId, oldId })
            .execute()
        }

        try {
          app.delete(oldCat)
        } catch (e) {}
      }
    }
  },
  (app) => {
    // Irreversible due to structural shift mapping
  },
)
