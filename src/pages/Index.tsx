import { Dashboard } from '@/components/Dashboard'
import { DASHBOARDS } from '@/config/dashboards'

export default function Index() {
  const { csvUrl, icon } = DASHBOARDS.onboarding

  return (
    <Dashboard
      csvUrl={csvUrl}
      title="Live de Onboarding"
      fullTitle="Dashboard da Live de Onboarding"
      icon={icon}
    />
  )
}
