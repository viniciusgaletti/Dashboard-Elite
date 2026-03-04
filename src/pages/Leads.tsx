import { Dashboard } from '@/components/Dashboard'
import { DASHBOARDS } from '@/config/dashboards'

export default function Leads() {
  const { key, csvUrl, title, fullTitle, icon } = DASHBOARDS.leads

  return <Dashboard csvUrl={csvUrl} dashboardKey={key} title={title} fullTitle={fullTitle} icon={icon} />
}
