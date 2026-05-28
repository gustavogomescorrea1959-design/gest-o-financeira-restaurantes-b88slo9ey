import { useState } from 'react'
import { useNavigate, Link, Navigate } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const { signIn, isAuthenticated, loading } = useAuth()
  const navigate = useNavigate()

  if (!loading && isAuthenticated) {
    return <Navigate to="/" replace />
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    const res = await signIn(email, password)
    if (res.error) setError('Credenciais inválidas.')
    else navigate('/')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-sm border-0 shadow-elevation">
        <CardHeader className="text-center space-y-2 pb-8">
          <div className="text-3xl font-extrabold text-emerald-600 mb-2">GestãoRest</div>
          <CardTitle className="text-xl text-slate-800">Bem-vindo de volta</CardTitle>
          <CardDescription>Faça login para acessar o painel.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label className="text-slate-600">E-mail</Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="seu@email.com"
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-600">Senha</Label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="h-11"
              />
            </div>
            {error && <p className="text-sm text-red-500 text-center font-medium">{error}</p>}
            <Button
              type="submit"
              className="w-full h-11 text-base bg-emerald-600 hover:bg-emerald-700 transition-colors"
            >
              Entrar
            </Button>
          </form>
          <div className="mt-8 text-center text-sm text-slate-500">
            Não tem uma conta?{' '}
            <Link
              to="/signup"
              className="text-emerald-600 hover:text-emerald-700 font-semibold hover:underline"
            >
              Cadastrar restaurante
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
