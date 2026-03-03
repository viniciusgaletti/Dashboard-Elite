import { Dashboard } from '@/components/Dashboard'
import { DASHBOARDS } from '@/config/dashboards'

export default function Index() {
  const { csvUrl, icon } = DASHBOARDS.onboarding

  return (
    <Dashboard
      csvUrl={csvUrl}
      title="live de leads"
      fullTitle="Dashboard da live de leads"
      icon={icon}
    />
  )
}
