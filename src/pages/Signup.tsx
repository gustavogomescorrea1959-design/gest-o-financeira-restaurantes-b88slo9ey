import { useState } from 'react'
import { useNavigate, Link, Navigate } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

export default function Signup() {
  const [formData, setFormData] = useState({
    nome_restaurante: '',
    responsavel_nome: '',
    email: '',
    password: '',
  })
  const [error, setError] = useState('')
  const [loadingForm, setLoadingForm] = useState(false)
  const { signUp, isAuthenticated, loading } = useAuth()
  const navigate = useNavigate()

  if (!loading && isAuthenticated) {
    return <Navigate to="/" replace />
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoadingForm(true)
    const res = await signUp(formData)
    setLoadingForm(false)
    if (res.error) setError('Erro ao criar conta. Email já em uso?')
    else navigate('/')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-md border-0 shadow-elevation">
        <CardHeader className="text-center space-y-2 pb-8">
          <div className="text-3xl font-extrabold text-emerald-600 mb-2">GestãoRest</div>
          <CardTitle className="text-xl text-slate-800">Criar nova conta</CardTitle>
          <CardDescription>Configure o seu restaurante para começar.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label className="text-slate-600">Nome do Restaurante</Label>
              <Input
                value={formData.nome_restaurante}
                onChange={(e) => setFormData({ ...formData, nome_restaurante: e.target.value })}
                required
                className="h-11"
                placeholder="Pizzaria Bella"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-600">Seu Nome</Label>
              <Input
                value={formData.responsavel_nome}
                onChange={(e) => setFormData({ ...formData, responsavel_nome: e.target.value })}
                required
                className="h-11"
                placeholder="João Silva"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-600">E-mail</Label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                className="h-11"
                placeholder="seu@email.com"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-600">Senha</Label>
              <Input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                minLength={8}
                className="h-11"
                placeholder="Mínimo 8 caracteres"
              />
            </div>
            {error && <p className="text-sm text-red-500 text-center font-medium">{error}</p>}
            <Button
              type="submit"
              className="w-full h-11 text-base bg-emerald-600 hover:bg-emerald-700 transition-colors"
              disabled={loadingForm}
            >
              {loadingForm ? 'Criando...' : 'Cadastrar Restaurante'}
            </Button>
          </form>
          <div className="mt-8 text-center text-sm text-slate-500">
            Já possui conta?{' '}
            <Link
              to="/login"
              className="text-emerald-600 hover:text-emerald-700 font-semibold hover:underline"
            >
              Faça login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
