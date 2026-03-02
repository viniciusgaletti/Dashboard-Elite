import { Link, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { NAV_LINKS } from '@/lib/constants'
import { useAuth } from '@/hooks/use-auth'
import { LogOut } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'

export function Sidebar({ className }: { className?: string }) {
  const location = useLocation()
  const { user, signOut } = useAuth()

  return (
    <aside
      className={cn(
        'w-64 border-r border-black/5 dark:border-white/5 material-regular flex-col justify-between hidden md:flex h-full',
        className,
      )}
    >
      <div className="p-6">
        <div className="flex items-center gap-2 mb-8 px-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-elevation text-white font-bold">
            C.I
          </div>
          <span className="text-headline">Live Dashboard</span>
        </div>

        <nav className="space-y-1">
          {NAV_LINKS.map((link) => {
            const isActive = location.pathname === link.path
            const Icon = link.icon

            return (
              <Link
                key={link.path}
                to={link.path}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-body transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-subtle'
                    : 'text-muted-foreground hover:bg-secondary hover:text-foreground',
                )}
              >
                <Icon className="w-5 h-5" />
                {link.name}
              </Link>
            )
          })}
        </nav>
      </div>

      <div className="p-4 border-t border-black/5 dark:border-white/5">
        <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary cursor-pointer transition-colors">
          <Avatar>
            <AvatarImage src={`https://img.usecurling.com/ppl/thumbnail?seed=${user?.id}`} />
            <AvatarFallback>{user?.email?.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate">{user?.email?.split('@')[0]}</p>
            <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={signOut}
            className="shrink-0 text-muted-foreground hover:text-destructive"
          >
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </aside>
  )
}
