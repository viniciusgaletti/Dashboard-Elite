import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'

export const ProtectedRoute = () => {
  const { session, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-secondary/30">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4 shadow-sm"></div>
        <span className="text-muted-foreground text-body font-medium animate-pulse">
          Carregando...
        </span>
      </div>
    )
  }

  return session ? <Outlet /> : <Navigate to="/auth" replace />
}
