import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import TopBar from './TopBar'

export default function AppLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  return (
    <div className="bg-background min-h-screen text-on-surface antialiased flex">
      {/* Sidebar Navigation */}
      <Sidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col min-h-screen transition-all duration-200 ${
          sidebarCollapsed ? 'pl-20' : 'pl-64'
        }`}
      >
        <TopBar sidebarCollapsed={sidebarCollapsed} />
        <main className="relative w-full pt-16 px-6 py-6 bg-surface flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
