import { DollarSign, Settings } from 'lucide-react'
import { DASHBOARDS } from '@/config/dashboards'

export const NAV_LINKS = [
  {
    name: DASHBOARDS.onboarding.title,
    path: DASHBOARDS.onboarding.path,
    icon: DASHBOARDS.onboarding.icon,
  },
  { name: DASHBOARDS.leads.title, path: DASHBOARDS.leads.path, icon: DASHBOARDS.leads.icon },
  { name: 'Faturamento & Metas', path: '/faturamento', icon: DollarSign },
  { name: 'Configurações', path: '/settings', icon: Settings },
]
