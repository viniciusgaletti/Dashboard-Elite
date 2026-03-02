import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { AuthProvider } from '@/hooks/use-auth'
import { ThemeProvider } from '@/components/ThemeProvider'

import Auth from '@/pages/Auth'
import Index from '@/pages/Index'
import Leads from '@/pages/Leads'
import Revenue from '@/pages/Revenue'
import Settings from '@/pages/Settings'
import NotFound from '@/pages/NotFound'
import Layout from '@/components/Layout'
import { ProtectedRoute } from '@/components/ProtectedRoute'

const App = () => (
  <ThemeProvider defaultTheme="system" storageKey="kpi-lives-theme" attribute="class">
    <BrowserRouter>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner position="top-center" />
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route element={<ProtectedRoute />}>
              <Route element={<Layout />}>
                <Route path="/" element={<Index />} />
                <Route path="/leads" element={<Leads />} />
                <Route path="/faturamento" element={<Revenue />} />
                <Route path="/settings" element={<Settings />} />
              </Route>
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </TooltipProvider>
      </AuthProvider>
    </BrowserRouter>
  </ThemeProvider>
)

export default App
