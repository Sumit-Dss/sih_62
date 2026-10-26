import { NavLink } from 'react-router-dom'

const AICTE_EMBLEM =
  'https://lh3.googleusercontent.com/aida/AEtjO1VcU9fmE9fjbEjikpaXcXCMTfZhY89Mh3S1SuctGSkCNyRljIBJLVsyRJRNkp4RqjSSCa5P0k-tGfd5WsLy8ZyAvq_jkUeHCvOv4X6C63craeODWIF7TltJ1Jz_qpx8EzA3hYnSOY9tyyTebJHiia5BjSVKoDW0Tnu_qx_lF2J-uaOpHfBkyxiRCtN2yuNLgKqDL7k5Qdk4OUtk1dAn0w9-VeYGYTNbLZDw-PHqskAabKxuJ-RNtn1m'

export default function Sidebar({ collapsed, setCollapsed }) {
  const navItems = [
    { label: 'Home', path: '/', icon: 'dashboard' },
    { label: 'Cases', path: '/cases', icon: 'assignment' },
    { label: 'Institutions', path: '/institutions', icon: 'account_balance' },
    { label: 'Alerts', path: '/alerts', icon: 'notifications_active' },
    { label: 'Reports', path: '/reports', icon: 'bar_chart' },
  ]

  return (
    <aside
      className={`fixed left-0 top-0 h-full bg-primary-container text-on-primary z-50 flex flex-col justify-between shadow-[0_1px_8px_rgba(0,0,0,0.08)] transition-all duration-200 ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      <div className="flex flex-col">
        {/* Sidebar Brand Header */}
        <div className="h-16 px-4 flex items-center justify-between bg-primary/20">
          <div className="flex items-center gap-2 overflow-hidden">
            <img
              alt="AICTE Emblem"
              className="h-8 w-auto object-contain shrink-0"
              src={AICTE_EMBLEM}
            />
            {!collapsed && (
              <div className="flex flex-col">
                <span className="text-[13px] tracking-wider text-on-primary leading-tight uppercase font-bold">
                  AICTE SANGAM
                </span>
                <span className="text-[10px] text-on-primary-container leading-none">
                  Complaint Monitoring
                </span>
              </div>
            )}
          </div>
          <button
            aria-label="Collapse sidebar"
            onClick={() => setCollapsed?.(!collapsed)}
            className="text-on-primary-container hover:text-on-primary p-1 transition-colors rounded"
            type="button"
          >
            <span className="material-symbols-outlined text-[20px]">
              {collapsed ? 'menu' : 'menu_open'}
            </span>
          </button>
        </div>

        {/* Navigation Menu Links */}
        <nav className="flex flex-col gap-1 px-2 mt-3">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 transition-all text-[13px] ${
                  isActive
                    ? 'border-l-[3px] border-secondary-container bg-primary text-on-primary font-semibold rounded-r-lg shadow-inner'
                    : 'text-on-primary-container hover:bg-primary/40 hover:text-on-primary font-normal rounded-r-lg'
                } ${collapsed ? 'justify-center px-0' : ''}`
              }
              title={collapsed ? item.label : undefined}
            >
              <span className="material-symbols-outlined text-[20px] shrink-0">
                {item.icon}
              </span>
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          ))}
        </nav>
      </div>

      {!collapsed && (
        <div className="p-4 text-[10px] text-on-primary-container/80 border-t border-primary/20">
          AICTE National Grievance Grid
          <br />
          v26.4 • SIH 2026
        </div>
      )}
    </aside>
  )
}
