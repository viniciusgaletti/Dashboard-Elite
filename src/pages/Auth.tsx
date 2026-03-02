import { useState } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('admin@example.com')
  const [password, setPassword] = useState('password123')
  const [loading, setLoading] = useState(false)
  const { signIn, signUp } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    if (isLogin) {
      const { error } = await signIn(email, password)
      if (error) toast.error(error.message)
      else toast.success('Bem-vindo de volta!')
    } else {
      const { error } = await signUp(email, password)
      if (error) toast.error(error.message)
      else toast.success('Conta criada com sucesso! Verifique seu email.')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary/50 p-4">
      <Card className="w-full max-w-md shadow-elevation border-0 bg-background/80 backdrop-blur-xl animate-fade-in-up">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto w-12 h-12 bg-primary rounded-xl flex items-center justify-center shadow-lg text-white font-bold text-xl mb-2">
            C.I
          </div>
          <CardTitle className="text-large-title">{isLogin ? 'Entrar' : 'Criar Conta'}</CardTitle>
          <CardDescription className="text-body">
            {isLogin ? 'Use suas credenciais para acessar' : 'Preencha os dados para iniciar'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="nome@exemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-secondary/50 border-transparent focus-visible:ring-primary h-12 px-4 rounded-xl"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-secondary/50 border-transparent focus-visible:ring-primary h-12 px-4 rounded-xl"
                required
              />
            </div>
            <Button
              type="submit"
              className="w-full h-12 rounded-xl text-md mt-6"
              disabled={loading}
            >
              {loading ? 'Carregando...' : isLogin ? 'Entrar no Dashboard' : 'Cadastrar'}
            </Button>
            <div className="text-center mt-4">
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="text-sm text-primary hover:underline"
              >
                {isLogin ? 'Não tem uma conta? Cadastre-se' : 'Já tem uma conta? Entre'}
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
