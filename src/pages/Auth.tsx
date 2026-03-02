import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'

const translateError = (message: string) => {
  const msg = message.toLowerCase()
  if (msg.includes('invalid login credentials')) return 'Email ou senha incorretos.'
  if (msg.includes('user already registered')) return 'Este email já está em uso.'
  if (msg.includes('password should be at least 6 characters'))
    return 'A senha deve ter pelo menos 6 caracteres.'
  return 'Ocorreu um erro inesperado. Tente novamente.'
}

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loadingSubmit, setLoadingSubmit] = useState(false)
  const { signIn, signUp, session } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (session) {
      navigate('/', { replace: true })
    }
  }, [session, navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) {
      toast.error('Preencha todos os campos.')
      return
    }

    setLoadingSubmit(true)

    if (isLogin) {
      const { error } = await signIn(email, password)
      if (error) {
        toast.error(translateError(error.message))
      } else {
        toast.success('Bem-vindo de volta!')
      }
    } else {
      const { error } = await signUp(email, password)
      if (error) {
        toast.error(translateError(error.message))
      } else {
        toast.success('Conta criada com sucesso!')
      }
    }
    setLoadingSubmit(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary/30 p-4">
      <Card className="w-full max-w-md glass-panel border-0 shadow-elevation animate-fade-in-up">
        <CardHeader className="text-center space-y-3 pb-6">
          <div className="mx-auto w-14 h-14 bg-primary rounded-2xl flex items-center justify-center shadow-md text-white font-bold text-2xl mb-2">
            C.I
          </div>
          <CardTitle className="text-large-title text-3xl tracking-tight">
            {isLogin ? 'Bem-vindo' : 'Criar Conta'}
          </CardTitle>
          <CardDescription className="text-body text-muted-foreground">
            {isLogin
              ? 'Use suas credenciais para acessar o painel'
              : 'Preencha os dados para iniciar sua jornada'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-label-primary font-medium ml-1">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="nome@exemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-background/50 backdrop-blur-sm border-white/10 focus-visible:bg-background"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-label-primary font-medium ml-1">
                Senha
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-background/50 backdrop-blur-sm border-white/10 focus-visible:bg-background"
                required
              />
            </div>
            <Button
              type="submit"
              className="w-full h-12 rounded-[12px] text-[17px] mt-6 font-semibold shadow-sm"
              disabled={loadingSubmit}
            >
              {loadingSubmit ? 'Aguarde...' : isLogin ? 'Entrar no Dashboard' : 'Cadastrar'}
            </Button>
            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
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
