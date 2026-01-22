import { useState } from 'react'
import type { ReactNode } from 'react'
import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  FileText,
  Briefcase,
  Settings,
  Package,
  ChevronLeft,
  HelpCircle,
  Activity,
} from 'lucide-react'
import Navbar from './Navbar'

interface SidebarLayoutProps {
  children: ReactNode
}

const navItems = [
  { to: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { to: '/clients', label: 'Clients', icon: Users },
  { to: '/quotes', label: 'Quotes', icon: FileText },
  { to: '/jobs', label: 'Jobs', icon: Briefcase },
  { to: '/operations', label: 'Operations', icon: Activity },
  { to: '/services', label: 'Services', icon: Package },
]

export default function SidebarLayout({ children }: SidebarLayoutProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)

  return (
    <div className="min-h-screen bg-[#F7F7F9]">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          <aside
            className={`bg-white border border-[#EFEFEF] rounded-2xl p-3 shadow-sm transition-all ${
              isCollapsed ? 'w-full lg:w-20' : 'w-full lg:w-60'
            }`}
          >
            <div className="flex items-center justify-between px-2 py-2">
              <span className={`text-xs font-semibold text-[#9B9B9B] ${isCollapsed ? 'hidden' : ''}`}>
                MENU
              </span>
              <button
                type="button"
                onClick={() => setIsCollapsed((prev) => !prev)}
                className="h-8 w-8 flex items-center justify-center rounded-lg border border-[#E7E7E7] hover:bg-[#F7F7F7]"
                aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              >
                <ChevronLeft
                  className={`w-4 h-4 text-[#6B6B6B] transition-transform ${isCollapsed ? 'rotate-180' : ''}`}
                />
              </button>
            </div>

            <div className="space-y-1 mt-2">
              {navItems.map((item) => {
                const Icon = item.icon
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) =>
                      `flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-[#FFE6F1] text-[#E80379]'
                          : 'text-[#5B5B5B] hover:bg-[#F7F7F7]'
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <span
                          className={`h-8 w-8 rounded-lg bg-white border flex items-center justify-center transition-colors ${
                            isActive
                              ? 'border-[#E80379] text-[#E80379]'
                              : 'border-[#E7E7E7] text-[#9B9B9B]'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                        </span>
                        {!isCollapsed && <span>{item.label}</span>}
                      </>
                    )}
                  </NavLink>
                )
              })}
            </div>

            <div className={`mt-6 pt-4 border-t border-[#F0F0F0] ${isCollapsed ? 'flex flex-col items-center gap-2' : 'flex items-center justify-between px-2'}`}>
              <NavLink
                to="/settings"
                className={({ isActive }) =>
                  `${isCollapsed ? 'h-9 w-9' : 'h-9 w-9'} rounded-xl border flex items-center justify-center transition-colors ${
                    isActive
                      ? 'border-[#E80379] text-[#E80379] bg-[#FFE6F1]'
                      : 'border-[#E7E7E7] text-[#8D8D8D] hover:bg-[#F7F7F7]'
                  }`
                }
              >
                {({ isActive }) => (
                  <Settings className={`w-4 h-4 ${isActive ? 'text-[#E80379]' : ''}`} />
                )}
              </NavLink>
              {!isCollapsed && (
                <button className="h-9 w-9 rounded-xl border border-[#E7E7E7] flex items-center justify-center text-[#8D8D8D] hover:bg-[#F7F7F7]">
                  <HelpCircle className="w-4 h-4" />
                </button>
              )}
            </div>
          </aside>

          <section className="flex-1">{children}</section>
        </div>
      </div>
    </div>
  )
}
