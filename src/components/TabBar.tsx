import { Link, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { NAV_LINKS } from '@/lib/constants'

export function TabBar({ className }: { className?: string }) {
  const location = useLocation()

  return (
    <nav
      className={cn(
        'fixed bottom-0 w-full material-regular border-t border-black/5 dark:border-white/5 pb-safe pt-2.5 px-2 flex justify-around items-center z-50 md:hidden',
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
              'flex flex-col items-center gap-0.5 min-w-[60px] py-1.5 pb-2.5 rounded-lg transition-colors',
              isActive ? 'text-primary' : 'text-muted-foreground',
            )}
          >
            <Icon className="w-5 h-5" />
            <span className="text-[11px] font-medium leading-tight">{link.name}</span>
          </Link>
        )
      })}
    </nav>
  )
}
