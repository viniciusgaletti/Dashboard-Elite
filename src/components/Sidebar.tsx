import { Link, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { NAV_LINKS } from '@/lib/constants'
import { useAuth } from '@/hooks/use-auth'
import { LogOut, ChevronsLeft, ChevronsRight } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { useSidebar } from '@/hooks/use-sidebar'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

export function Sidebar({ className }: { className?: string }) {
  const location = useLocation()
  const { user, signOut } = useAuth()
  const { isCollapsed, toggleSidebar } = useSidebar()

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          'border-r border-black/5 dark:border-white/5 material-regular flex-col justify-between hidden md:flex h-full transition-all duration-300 ease-out overflow-hidden',
          isCollapsed ? 'w-[72px]' : 'w-64',
          className,
        )}
      >
        <div className={cn('p-6 transition-all duration-300', isCollapsed && 'px-3 py-6')}>
          {/* Logo */}
          <div
            className={cn(
              'flex items-center gap-2 mb-8 transition-all duration-300',
              isCollapsed ? 'justify-center px-0' : 'px-2',
            )}
          >
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-elevation text-white font-bold shrink-0 text-xs">
              C.I
            </div>
            <span
              className={cn(
                'text-headline whitespace-nowrap transition-all duration-300',
                isCollapsed ? 'w-0 opacity-0 overflow-hidden' : 'w-auto opacity-100',
              )}
            >
              Live Dashboard
            </span>
          </div>

          {/* Navigation */}
          <nav className="space-y-1">
            {NAV_LINKS.map((link) => {
              const isActive = location.pathname === link.path
              const Icon = link.icon

              const linkContent = (
                <Link
                  key={link.path}
                  to={link.path}
                  className={cn(
                    'flex items-center gap-3 rounded-lg text-body transition-all duration-200',
                    isCollapsed ? 'px-0 py-2.5 justify-center' : 'px-3 py-2.5',
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-subtle'
                      : 'text-muted-foreground hover:bg-secondary hover:text-foreground',
                  )}
                >
                  <Icon className="w-5 h-5 shrink-0" />
                  <span
                    className={cn(
                      'whitespace-nowrap transition-all duration-300',
                      isCollapsed ? 'w-0 opacity-0 overflow-hidden' : 'w-auto opacity-100',
                    )}
                  >
                    {link.name}
                  </span>
                </Link>
              )

              if (isCollapsed) {
                return (
                  <Tooltip key={link.path}>
                    <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                    <TooltipContent side="right" sideOffset={8}>
                      {link.name}
                    </TooltipContent>
                  </Tooltip>
                )
              }

              return linkContent
            })}
          </nav>
        </div>

        {/* Collapse toggle */}
        <div className="px-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleSidebar}
            className={cn(
              'w-full flex items-center gap-2 text-muted-foreground hover:text-foreground transition-all duration-200 mb-2',
              isCollapsed ? 'justify-center px-0' : 'justify-start px-3',
            )}
          >
            {isCollapsed ? (
              <ChevronsRight className="w-4 h-4 shrink-0" />
            ) : (
              <>
                <ChevronsLeft className="w-4 h-4 shrink-0" />
                <span className="text-xs">Minimizar</span>
              </>
            )}
          </Button>
        </div>

        {/* User section */}
        <div
          className={cn(
            'border-t border-black/5 dark:border-white/5 transition-all duration-300',
            isCollapsed ? 'p-2' : 'p-4',
          )}
        >
          <div
            className={cn(
              'flex items-center gap-3 rounded-lg hover:bg-secondary cursor-pointer transition-all duration-200',
              isCollapsed ? 'justify-center p-2' : 'p-2',
            )}
          >
            <Tooltip>
              <TooltipTrigger asChild>
                <Avatar className="shrink-0">
                  <AvatarImage src={`https://img.usecurling.com/ppl/thumbnail?seed=${user?.id}`} />
                  <AvatarFallback>{user?.email?.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
              </TooltipTrigger>
              {isCollapsed && (
                <TooltipContent side="right" sideOffset={8}>
                  <p className="font-semibold">{user?.email?.split('@')[0]}</p>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                </TooltipContent>
              )}
            </Tooltip>
            <div
              className={cn(
                'flex-1 min-w-0 transition-all duration-300',
                isCollapsed ? 'w-0 opacity-0 overflow-hidden hidden' : 'w-auto opacity-100',
              )}
            >
              <p className="text-sm font-semibold truncate">{user?.email?.split('@')[0]}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
            </div>
            {!isCollapsed && (
              <Button
                variant="ghost"
                size="icon"
                onClick={signOut}
                className="shrink-0 text-muted-foreground hover:text-destructive"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </aside>
    </TooltipProvider>
  )
}
