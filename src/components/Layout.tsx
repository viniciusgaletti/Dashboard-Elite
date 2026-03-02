import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { TabBar } from './TabBar'
import { Header } from './Header'

export default function Layout() {
  return (
    <div className="flex h-screen w-full bg-secondary/30 dark:bg-background overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-8 pb-24 md:pb-8">
          <div className="max-w-6xl mx-auto h-full">
            <Outlet />
          </div>
        </main>
      </div>
      <TabBar />
    </div>
  )
}
