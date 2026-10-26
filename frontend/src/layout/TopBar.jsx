import GlobalSearch from '../components/GlobalSearch'
import DateRangeFilter from '../components/DateRangeFilter'
import RoleSwitcher from '../components/RoleSwitcher'

const AICTE_EMBLEM =
  'https://lh3.googleusercontent.com/aida/AEtjO1VcU9fmE9fjbEjikpaXcXCMTfZhY89Mh3S1SuctGSkCNyRljIBJLVsyRJRNkp4RqjSSCa5P0k-tGfd5WsLy8ZyAvq_jkUeHCvOv4X6C63craeODWIF7TltJ1Jz_qpx8EzA3hYnSOY9tyyTebJHiia5BjSVKoDW0Tnu_qx_lF2J-uaOpHfBkyxiRCtN2yuNLgKqDL7k5Qdk4OUtk1dAn0w9-VeYGYTNbLZDw-PHqskAabKxuJ-RNtn1m'

export default function TopBar({ sidebarCollapsed }) {
  return (
    <header
      className={`fixed top-0 right-0 h-16 bg-surface-container-lowest/90 backdrop-blur-xl z-40 shadow-[0_1px_8px_rgba(0,0,0,0.04)] border-b border-outline-variant/15 transition-all duration-200 ${
        sidebarCollapsed ? 'left-20' : 'left-64'
      }`}
    >
      <div className="h-16 w-full px-6 flex items-center justify-between gap-4">
        {/* Left & Search Container */}
        <div className="flex items-center gap-4 flex-1 max-w-2xl">
          <img
            alt="AICTE Emblem"
            className="h-8 w-auto object-contain hidden sm:block"
            src={AICTE_EMBLEM}
          />
          <span className="text-[14px] text-primary font-bold hidden md:inline whitespace-nowrap">
            AICTE SANGAM
          </span>
          <GlobalSearch />
        </div>

        {/* Right Tools & Role Switcher */}
        <div className="flex items-center gap-3">
          <DateRangeFilter />
          <div className="h-6 w-px bg-outline-variant/30 hidden sm:block"></div>
          <RoleSwitcher />
        </div>
      </div>
    </header>
  )
}
