import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { LogOut, Moon, Sun, Monitor, Camera, Users, Plus, Trash2 } from 'lucide-react'
import { useTheme } from 'next-themes'

import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Switch } from '@/components/ui/switch'
import { useAuth } from '@/hooks/use-auth'
import { useSellers } from '@/hooks/use-sellers'
import { getProfile, updateProfile } from '@/services/profiles'
import { supabase } from '@/lib/supabase/client'

export default function Settings() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const { theme, setTheme } = useTheme()

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(true)
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)

  // Sellers management
  const { sellers, insertSeller, updateSeller, deleteSeller } = useSellers()
  const [newSellerName, setNewSellerName] = useState('')
  const [isAddingSeller, setIsAddingSeller] = useState(false)

  // Notification preferences
  const [notifSound, setNotifSound] = useState(() => {
    return localStorage.getItem('dashboard-notif-sound') !== 'off'
  })

  const handleToggleNotifSound = (checked: boolean) => {
    setNotifSound(checked)
    localStorage.setItem('dashboard-notif-sound', checked ? 'on' : 'off')
  }

  const handleAddSeller = async () => {
    if (!newSellerName.trim()) return
    setIsAddingSeller(true)
    const { error } = await insertSeller(newSellerName)
    setIsAddingSeller(false)
    if (error) toast.error(error)
    else {
      toast.success('Vendedor adicionado!')
      setNewSellerName('')
    }
  }

  const handleToggleSeller = async (id: string, active: boolean) => {
    const { error } = await updateSeller(id, { active: !active })
    if (error) toast.error(error)
  }

  const handleDeleteSeller = async (id: string) => {
    const { error } = await deleteSeller(id)
    if (error) toast.error(error)
    else toast.success('Vendedor removido.')
  }

  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    async function fetchProfileData() {
      if (!user) return

      setIsFetching(true)
      const { data, error } = await getProfile(user.id)

      if (!error && data) {
        setFirstName(data.first_name || '')
        setLastName(data.last_name || '')
        setAvatarUrl(data.avatar_url || '')
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

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user) return

    // Validate file
    const validTypes = ['image/jpeg', 'image/png']
    if (!validTypes.includes(file.type)) {
      toast.error('Apenas imagens JPEG ou PNG são aceitas.')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('A imagem deve ter no máximo 5MB.')
      return
    }

    setIsUploadingAvatar(true)

    try {
      const ext = file.type === 'image/png' ? 'png' : 'jpg'
      const filePath = `${user.id}.${ext}`

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true })

      if (uploadError) throw uploadError

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from('avatars').getPublicUrl(filePath)

      const urlWithTimestamp = `${publicUrl}?t=${Date.now()}`

      // Update profile
      const { error: updateError } = await updateProfile(user.id, {
        avatar_url: urlWithTimestamp,
      })

      if (updateError) throw updateError

      setAvatarUrl(urlWithTimestamp)
      toast.success('Foto atualizada com sucesso!')
    } catch {
      toast.error(
        'Erro ao atualizar foto. Verifique se o bucket "avatars" existe no Supabase Storage.',
      )
    } finally {
      setIsUploadingAvatar(false)
    }
  }

  const handleSignOut = async () => {
    await signOut()
    navigate('/auth')
  }

  const getInitials = () => {
    if (firstName) return firstName.charAt(0).toUpperCase()
    return user?.email?.charAt(0).toUpperCase() || '?'
  }

  const displayAvatarUrl = avatarUrl || `https://img.usecurling.com/ppl/thumbnail?seed=${user?.id}`

  return (
    <div className="space-y-8 animate-fade-in-up pb-12 max-w-3xl mx-auto">
      <div>
        <h2 className="text-large-title text-3xl">Configurações</h2>
        <p className="text-body text-muted-foreground mt-1">
          Gerencie seu perfil e preferências do aplicativo.
        </p>
      </div>

      <div className="space-y-8">
        {/* Profile */}
        <section>
          <h3 className="text-headline mb-3 px-1 text-label-secondary uppercase text-sm tracking-wider">
            Perfil
          </h3>
          <Card className="glass-panel border-0 overflow-hidden">
            <CardContent className="p-0">
              <form onSubmit={handleUpdateProfile} className="p-6 space-y-6">
                <div className="flex items-center gap-4 mb-2">
                  <div className="relative group">
                    <Avatar className="w-16 h-16 shadow-sm">
                      <AvatarImage src={displayAvatarUrl} />
                      <AvatarFallback className="text-xl bg-primary text-primary-foreground">
                        {getInitials()}
                      </AvatarFallback>
                    </Avatar>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploadingAvatar}
                      className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    >
                      <Camera className="w-5 h-5 text-white" />
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png"
                      onChange={handleAvatarUpload}
                      className="hidden"
                    />
                  </div>
                  <div>
                    <p className="font-semibold text-lg text-label-primary">{user?.email}</p>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploadingAvatar}
                      className="text-sm text-primary hover:underline cursor-pointer"
                    >
                      {isUploadingAvatar ? 'Enviando...' : 'Alterar foto'}
                    </button>
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

        {/* Appearance */}
        <section>
          <h3 className="text-headline mb-3 px-1 text-label-secondary uppercase text-sm tracking-wider">
            Aparência
          </h3>
          <Card className="glass-panel border-0 overflow-hidden">
            <CardContent className="p-0">
              <div className="p-4 sm:p-6">
                <p className="font-medium text-label-primary mb-1">Tema</p>
                <p className="text-sm text-muted-foreground mb-4">
                  Escolha como o dashboard será exibido.
                </p>
                <div className="flex gap-2">
                  <Button
                    variant={theme === 'light' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setTheme('light')}
                    className="gap-2 flex-1"
                  >
                    <Sun className="w-4 h-4" />
                    Light
                  </Button>
                  <Button
                    variant={theme === 'dark' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setTheme('dark')}
                    className="gap-2 flex-1"
                  >
                    <Moon className="w-4 h-4" />
                    Dark
                  </Button>
                  <Button
                    variant={theme === 'system' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setTheme('system')}
                    className="gap-2 flex-1"
                  >
                    <Monitor className="w-4 h-4" />
                    Sistema
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Sellers Management */}
        <section>
          <h3 className="text-headline mb-3 px-1 text-label-secondary uppercase text-sm tracking-wider">
            Gestão de Vendedores
          </h3>
          <Card className="glass-panel border-0 overflow-hidden">
            <CardContent className="p-0">
              <div className="p-4 sm:p-6 space-y-4">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-muted-foreground" />
                  <p className="font-medium text-label-primary">Equipe de Vendas</p>
                </div>
                <p className="text-sm text-muted-foreground">
                  Adicione ou desative vendedores. Vendedores inativos não aparecem no formulário de registro de vendas.
                </p>

                {/* Add new seller */}
                <div className="flex gap-2">
                  <Input
                    placeholder="Nome do novo vendedor"
                    value={newSellerName}
                    onChange={(e) => setNewSellerName(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleAddSeller() }}
                    className="flex-1"
                  />
                  <Button
                    size="sm"
                    onClick={handleAddSeller}
                    disabled={isAddingSeller || !newSellerName.trim()}
                    className="gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    Adicionar
                  </Button>
                </div>

                {/* Sellers list */}
                <div className="divide-y divide-black/5 dark:divide-white/5 rounded-lg border border-black/5 dark:border-white/5 overflow-hidden">
                  {sellers.map((seller) => (
                    <div key={seller.id} className="flex items-center justify-between px-4 py-3 hover:bg-secondary/30 transition-colors">
                      <div className="flex items-center gap-3 min-w-0">
                        <Switch
                          checked={seller.active}
                          onCheckedChange={() => handleToggleSeller(seller.id, seller.active)}
                        />
                        <span className={`text-sm font-medium truncate ${!seller.active ? 'text-muted-foreground line-through' : ''}`}>
                          {seller.name}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive shrink-0"
                        onClick={() => handleDeleteSeller(seller.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                  {sellers.length === 0 && (
                    <p className="text-center text-sm text-muted-foreground py-6">
                      Nenhum vendedor cadastrado.
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Notifications */}
        <section>
          <h3 className="text-headline mb-3 px-1 text-label-secondary uppercase text-sm tracking-wider">
            Notificações
          </h3>
          <Card className="glass-panel border-0 overflow-hidden">
            <CardContent className="p-0">
              <div className="p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <p className="font-medium text-label-primary">Som de Alerta</p>
                  <p className="text-sm text-muted-foreground max-w-md mt-1">
                    Toque um som quando a meta mensal for batida ou um novo recorde for registrado.
                  </p>
                </div>
                <Switch
                  checked={notifSound}
                  onCheckedChange={handleToggleNotifSound}
                />
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Account */}
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
