import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { NAV_LINKS } from '@/lib/constants'
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { useSidebar } from '@/hooks/use-sidebar'
import { NotificationsBell } from '@/components/NotificationsBell'
import { useNotifications } from '@/contexts/notifications-context'
import { supabase } from '@/lib/supabase/client'

export function Header() {
  const location = useLocation()
  const { user } = useAuth()
  const { isCollapsed, toggleSidebar } = useSidebar()
  const { alertsRef } = useNotifications()
  const [avatarUrl, setAvatarUrl] = useState('')

  // Fetch profile avatar + realtime subscription (same pattern as Sidebar)
  useEffect(() => {
    if (!user) return

    const fetchAvatar = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('avatar_url')
        .eq('id', user.id)
        .single()
      if (data?.avatar_url) setAvatarUrl(data.avatar_url)
    }
    fetchAvatar()

    const channel = supabase
      .channel('header-profile')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'profiles', filter: `id=eq.${user.id}` },
        (payload) => {
          const updated = payload.new as { avatar_url?: string }
          if (updated.avatar_url) setAvatarUrl(updated.avatar_url)
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user])

  const displayAvatarUrl = avatarUrl || `https://img.usecurling.com/ppl/thumbnail?seed=${user?.id}`

  const currentLink = NAV_LINKS.find((l) => l.path === location.pathname)
  const title = currentLink ? currentLink.name : 'Dashboard'

  return (
    <header className="sticky top-0 z-40 material-regular px-4 md:px-6 py-3 md:py-4 flex items-center justify-between border-b border-black/5 dark:border-white/5">
      <div className="flex items-center gap-2 md:gap-3 min-w-0">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="hidden md:inline-flex rounded-lg text-muted-foreground hover:text-foreground"
        >
          {isCollapsed ? (
            <PanelLeftOpen className="w-5 h-5" />
          ) : (
            <PanelLeftClose className="w-5 h-5" />
          )}
        </Button>
        <h1 className="text-large-title transition-all duration-300 truncate">{title}</h1>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <NotificationsBell alertsRef={alertsRef} />
        <Avatar className="md:hidden w-8 h-8">
          <AvatarImage src={displayAvatarUrl} />
          <AvatarFallback>{user?.email?.charAt(0).toUpperCase()}</AvatarFallback>
        </Avatar>
      </div>
    </header>
  )
}
