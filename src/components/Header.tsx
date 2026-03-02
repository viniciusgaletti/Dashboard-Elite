import { useLocation } from 'react-router-dom'
import { NAV_LINKS } from '@/lib/constants'
import { Bell } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'

export function Header() {
  const location = useLocation()
  const { user } = useAuth()

  const currentLink = NAV_LINKS.find((l) => l.path === location.pathname)
  const title = currentLink ? currentLink.name : 'Dashboard'

  return (
    <header className="sticky top-0 z-40 material-regular px-6 py-4 flex items-center justify-between border-b border-black/5 dark:border-white/5">
      <h1 className="text-large-title transition-all duration-300">{title}</h1>

      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="rounded-full bg-secondary/50">
          <Bell className="w-5 h-5" />
        </Button>
        <Avatar className="md:hidden">
          <AvatarImage src={`https://img.usecurling.com/ppl/thumbnail?seed=${user?.id}`} />
          <AvatarFallback>{user?.email?.charAt(0).toUpperCase()}</AvatarFallback>
        </Avatar>
      </div>
    </header>
  )
}
