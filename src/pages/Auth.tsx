import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { BarChart3, TrendingUp, Users, DollarSign, Lock } from 'lucide-react'

const translateError = (message: string) => {
  const msg = message.toLowerCase()
  if (msg.includes('invalid login credentials')) return 'Email ou senha incorretos.'
  if (msg.includes('email not confirmed')) return 'Email não confirmado. Verifique seu inbox.'
  return 'Ocorreu um erro inesperado. Tente novamente.'
}

export default function Auth() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loadingSubmit, setLoadingSubmit] = useState(false)
  const { signIn, session } = useAuth()
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
    const { error } = await signIn(email, password)
    if (error) {
      toast.error(translateError(error.message))
    } else {
      toast.success('Bem-vindo de volta!')
    }
    setLoadingSubmit(false)
  }

  return (
    <div className="min-h-screen flex">
      {/* Left — Login Form */}
      <div className="flex-1 flex flex-col justify-center items-center px-6 sm:px-12 lg:px-20 bg-background">
        <div className="w-full max-w-[420px] space-y-8">
          {/* Logo + Brand */}
          <div className="flex items-center gap-3">
            <img
              src="/adapta-logo.png"
              alt="Elite Insights"
              className="w-10 h-10 rounded-xl object-cover"
            />
            <span className="text-xl font-bold tracking-tight">Elite Insights</span>
          </div>

          {/* Heading */}
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">Bem-vindo de volta</h1>
            <p className="text-muted-foreground">Insira suas credenciais para acessar o painel.</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="font-medium">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="seunome@empresa.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 bg-secondary/40 border-border/50 focus-visible:bg-background"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="font-medium">
                Senha
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-12 bg-secondary/40 border-border/50 focus-visible:bg-background"
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full h-12 rounded-xl text-base font-semibold shadow-sm"
              disabled={loadingSubmit}
            >
              {loadingSubmit ? 'Entrando...' : 'Entrar'}
            </Button>
          </form>

          {/* Footer */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground pt-4">
            <Lock className="w-3.5 h-3.5" />
            <span>Sistema interno — Acesso restrito a colaboradores autorizados.</span>
          </div>
        </div>
      </div>

      {/* Right — Hero Visual */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute top-0 left-0 w-full h-full"
            style={{
              backgroundImage:
                'radial-gradient(circle at 25% 25%, white 1px, transparent 1px), radial-gradient(circle at 75% 75%, white 1px, transparent 1px)',
              backgroundSize: '50px 50px',
            }}
          />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center px-12 xl:px-16 text-white max-w-xl mx-auto">
          <h2 className="text-4xl xl:text-5xl font-bold leading-tight mb-4">
            Gerencie seus resultados com inteligência.
          </h2>
          <p className="text-white/70 text-lg mb-12">
            Acompanhe métricas, vendas e metas em tempo real para tomar decisões mais rápidas e
            assertivas.
          </p>

          {/* Feature cards */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 border border-white/10">
              <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center mb-3">
                <BarChart3 className="w-5 h-5" />
              </div>
              <p className="font-semibold text-sm">Dashboard em Tempo Real</p>
              <p className="text-white/60 text-xs mt-1">Dados atualizados ao vivo</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 border border-white/10">
              <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center mb-3">
                <TrendingUp className="w-5 h-5" />
              </div>
              <p className="font-semibold text-sm">Metas & Faturamento</p>
              <p className="text-white/60 text-xs mt-1">Acompanhe o progresso</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 border border-white/10">
              <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center mb-3">
                <Users className="w-5 h-5" />
              </div>
              <p className="font-semibold text-sm">Ranking de Vendedores</p>
              <p className="text-white/60 text-xs mt-1">Performance da equipe</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 border border-white/10">
              <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center mb-3">
                <DollarSign className="w-5 h-5" />
              </div>
              <p className="font-semibold text-sm">Mix de Produtos</p>
              <p className="text-white/60 text-xs mt-1">Gestão inteligente</p>
            </div>
          </div>
        </div>

        {/* Decorative gradient orbs */}
        <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-purple-500/30 rounded-full blur-3xl" />
        <div className="absolute -top-16 -left-16 w-48 h-48 bg-blue-400/20 rounded-full blur-3xl" />
      </div>
    </div>
  )
}
