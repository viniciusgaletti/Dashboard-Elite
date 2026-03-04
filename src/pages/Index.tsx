import { Dashboard } from '@/components/Dashboard'
import { DASHBOARDS } from '@/config/dashboards'

export default function Index() {
  const { key, csvUrl, icon } = DASHBOARDS.onboarding

  return (
    <Dashboard
      csvUrl={csvUrl}
      dashboardKey={key}
      title="Live de Onboarding"
      fullTitle="Dashboard da Live de Onboarding"
      icon={icon}
    />
  )
}
