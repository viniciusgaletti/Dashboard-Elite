import { Dashboard } from '@/components/Dashboard'
import { DASHBOARDS } from '@/config/dashboards'

export default function Leads() {
  const { csvUrl, title, fullTitle, icon } = DASHBOARDS.leads

  return <Dashboard csvUrl={csvUrl} title={title} fullTitle={fullTitle} icon={icon} />
}
