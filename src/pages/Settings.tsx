import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { LogOut, Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'

import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useAuth } from '@/hooks/use-auth'
import { getProfile, updateProfile } from '@/services/profiles'

export default function Settings() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const { theme, setTheme } = useTheme()

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(true)

  useEffect(() => {
    async function fetchProfileData() {
      if (!user) return

      setIsFetching(true)
      const { data, error } = await getProfile(user.id)

      if (!error && data) {
        setFirstName(data.first_name || '')
        setLastName(data.last_name || '')
      }
      setIsFetching(false)
    }

    fetchProfileData()
  }, [user])

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setIsLoading(true)
    const { error } = await updateProfile(user.id, {
      first_name: firstName,
      last_name: lastName,
    })

    setIsLoading(false)

    if (error) {
      toast.error('Erro ao atualizar perfil. Tente novamente.')
    } else {
      toast.success('Perfil atualizado com sucesso!')
    }
  }

  const handleSignOut = async () => {
    await signOut()
    navigate('/auth')
  }

  const isDark =
    theme === 'dark' ||
    (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)

  return (
    <div className="space-y-8 animate-fade-in-up pb-12 max-w-3xl mx-auto">
      <div>
        <h2 className="text-large-title text-3xl">Configurações</h2>
        <p className="text-body text-muted-foreground mt-1">
          Gerencie seu perfil e preferências do aplicativo.
        </p>
      </div>

      <div className="space-y-8">
        <section>
          <h3 className="text-headline mb-3 px-1 text-label-secondary uppercase text-sm tracking-wider">
            Perfil
          </h3>
          <Card className="glass-panel border-0 overflow-hidden">
            <CardContent className="p-0">
              <form onSubmit={handleUpdateProfile} className="p-6 space-y-6">
                <div className="flex items-center gap-4 mb-2">
                  <Avatar className="w-16 h-16 shadow-sm">
                    <AvatarImage
                      src={`https://img.usecurling.com/ppl/thumbnail?seed=${user?.id}`}
                    />
                    <AvatarFallback className="text-xl bg-primary text-primary-foreground">
                      {firstName
                        ? firstName.charAt(0).toUpperCase()
                        : user?.email?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-lg text-label-primary">{user?.email}</p>
                    <p className="text-sm text-muted-foreground">
                      ID: {user?.id.substring(0, 8)}...
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label htmlFor="firstName" className="text-label-primary font-medium ml-1">
                      Nome
                    </Label>
                    <Input
                      id="firstName"
                      placeholder="Seu nome"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      disabled={isFetching}
                      className="bg-background/50 backdrop-blur-sm focus-visible:bg-background"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName" className="text-label-primary font-medium ml-1">
                      Sobrenome
                    </Label>
                    <Input
                      id="lastName"
                      placeholder="Seu sobrenome"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      disabled={isFetching}
                      className="bg-background/50 backdrop-blur-sm focus-visible:bg-background"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <Button
                    type="submit"
                    disabled={isLoading || isFetching}
                    className="px-8 min-w-[150px]"
                  >
                    {isLoading ? 'Salvando...' : 'Salvar Alterações'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </section>

        <section>
          <h3 className="text-headline mb-3 px-1 text-label-secondary uppercase text-sm tracking-wider">
            Aparência
          </h3>
          <Card className="glass-panel border-0 overflow-hidden">
            <CardContent className="p-0">
              <div className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-secondary text-primary">
                      {isDark ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                    </div>
                    <div>
                      <p className="font-medium text-label-primary">Modo Escuro</p>
                      <p className="text-sm text-muted-foreground">
                        Alterne entre o tema claro e escuro
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={theme === 'dark'}
                    onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
                    className="data-[state=checked]:bg-success"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        <section>
          <h3 className="text-headline mb-3 px-1 text-label-secondary uppercase text-sm tracking-wider">
            Conta
          </h3>
          <Card className="glass-panel border-0 overflow-hidden">
            <CardContent className="p-0">
              <div className="p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <p className="font-medium text-label-primary">Sair da Conta</p>
                  <p className="text-sm text-muted-foreground max-w-md mt-1">
                    Você precisará fazer login novamente para acessar o dashboard.
                  </p>
                </div>
                <Button
                  variant="destructive"
                  onClick={handleSignOut}
                  className="w-full sm:w-auto shrink-0"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sair da Conta
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  )
}
