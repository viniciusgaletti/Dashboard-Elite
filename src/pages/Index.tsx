import { Dashboard } from '@/components/Dashboard'
import { DASHBOARDS } from '@/config/dashboards'

export default function Index() {
  const { csvUrl, title, fullTitle, icon } = DASHBOARDS.onboarding

  return <Dashboard csvUrl={csvUrl} title={title} fullTitle={fullTitle} icon={icon} />
}
