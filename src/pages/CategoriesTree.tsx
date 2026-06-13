import { useEffect, useState } from 'react'
import { api, Category } from '@/services/api'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Card, CardContent } from '@/components/ui/card'
import { Layers, FolderTree, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function CategoriesTree() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loadingError, setLoadingError] = useState(false)

  const loadData = () => {
    setLoadingError(false)
    api
      .getCategories()
      .then(setCategories)
      .catch(() => setLoadingError(true))
  }

  useEffect(() => {
    loadData()
  }, [])

  const tree: Record<string, Record<string, Category[]>> = {}
  categories.forEach((cat) => {
    if (!tree[cat.grupo]) tree[cat.grupo] = {}
    if (!tree[cat.grupo][cat.subgrupo]) tree[cat.grupo][cat.subgrupo] = []
    tree[cat.grupo][cat.subgrupo].push(cat)
  })

  return (
    <div className="space-y-8 animate-fade-in max-w-4xl mx-auto">
      <div className="bg-card p-6 rounded-xl border shadow-sm">
        <h2 className="text-2xl font-bold flex items-center gap-2 text-foreground">
          <Layers className="text-primary" />
          Estrutura de Categorias
        </h2>
        <p className="text-muted-foreground mt-2">
          Visualize a hierarquia de contas (Grupo &gt; Categoria &gt; Conta).
        </p>
      </div>

      {loadingError && (
        <div className="p-4 bg-destructive/10 text-destructive border border-destructive/20 rounded-lg flex flex-col items-center justify-center space-y-2">
          <p>Não foi possivel carregar os dados. Tente novamente.</p>
          <Button variant="outline" onClick={loadData}>
            Tentar Novamente
          </Button>
        </div>
      )}

      <Card className="border shadow-sm rounded-xl overflow-hidden">
        <CardContent className="p-6 bg-background">
          {categories.length === 0 && !loadingError ? (
            <div className="text-center text-muted-foreground py-8">
              Nenhuma categoria encontrada.
            </div>
          ) : (
            <Accordion type="multiple" className="w-full space-y-4">
              {Object.entries(tree).map(([grupo, subgrupos]) => (
                <AccordionItem
                  key={grupo}
                  value={grupo}
                  className="border rounded-lg px-4 bg-card shadow-sm transition-all duration-150"
                >
                  <AccordionTrigger className="hover:no-underline font-bold text-lg text-primary py-4">
                    {grupo}
                  </AccordionTrigger>
                  <AccordionContent className="pt-2 pb-4">
                    <Accordion
                      type="multiple"
                      className="w-full space-y-3 pl-4 border-l-2 border-primary/20"
                    >
                      {Object.entries(subgrupos).map(([subgrupo, contas]) => (
                        <AccordionItem key={subgrupo} value={subgrupo} className="border-none">
                          <AccordionTrigger className="hover:no-underline py-2 font-semibold text-accent flex gap-2 justify-start">
                            <FolderTree className="w-4 h-4" /> {subgrupo}
                          </AccordionTrigger>
                          <AccordionContent>
                            <ul className="pl-6 space-y-2 mt-2">
                              {contas.map((conta) => (
                                <li
                                  key={conta.id}
                                  className="flex items-center gap-2 text-sm text-foreground bg-muted/30 px-3 py-2 rounded-md border border-border/50 hover:bg-muted/50 transition-colors duration-150"
                                >
                                  <FileText className="w-4 h-4 text-muted-foreground" />
                                  {conta.nome_exibicao}
                                  <span className="ml-auto text-xs font-medium text-muted-foreground uppercase bg-background px-2 py-1 rounded shadow-sm">
                                    {conta.tipo}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
