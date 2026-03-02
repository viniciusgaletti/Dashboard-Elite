import { HeroGreeting } from '@/components/HeroGreeting'
import { DashboardStats } from '@/components/DashboardStats'
import { DashboardChart } from '@/components/DashboardChart'

export default function Index() {
  return (
    <div className="animate-fade-in-up h-full flex flex-col">
      <HeroGreeting />
      <DashboardStats />
      <DashboardChart />
    </div>
  )
}
