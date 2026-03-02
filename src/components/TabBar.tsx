import { Link, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { NAV_LINKS } from '@/lib/constants'

export function TabBar({ className }: { className?: string }) {
  const location = useLocation()

  return (
    <nav
      className={cn(
        'fixed bottom-0 w-full material-regular border-t border-black/5 dark:border-white/5 pb-safe pt-2 px-4 flex justify-between items-center z-50 md:hidden',
        className,
      )}
    >
      {NAV_LINKS.map((link) => {
        const isActive = location.pathname === link.path
        const Icon = link.icon

        return (
          <Link
            key={link.path}
            to={link.path}
            className={cn(
              'flex flex-col items-center gap-1 min-w-[64px] pb-2 transition-colors',
              isActive ? 'text-primary' : 'text-muted-foreground',
            )}
          >
            <Icon className="w-6 h-6" />
            <span className="text-[10px] font-medium">{link.name}</span>
          </Link>
        )
      })}
    </nav>
  )
}
