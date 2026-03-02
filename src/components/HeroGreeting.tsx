import { useAuth } from '@/hooks/use-auth'

export function HeroGreeting() {
  const { user } = useAuth()
  const firstName = user?.email?.split('@')[0] || 'Usuário'

  return (
    <div className="py-2 mb-6">
      <h2 className="text-body text-muted-foreground">Bem-vindo de volta,</h2>
      <p className="text-large-title mt-1 capitalize">{firstName}!</p>
    </div>
  )
}
