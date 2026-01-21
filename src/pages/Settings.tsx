import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAppDispatch } from '../store/hooks'
import { logout } from '../features/auth/authSlice'
import { Settings as SettingsIcon, ChevronRight, ChevronDown } from 'lucide-react'
import TeamMemberTypesManager from '../components/TeamMemberTypesManager'
import TeamMemberStatusesManager from '../components/TeamMemberStatusesManager'

type OptionSubsection = 'types' | 'statuses'

export default function Settings() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const [activeSubsection, setActiveSubsection] = useState<OptionSubsection>('types')
  const [isOptionManagementExpanded, setIsOptionManagementExpanded] = useState(true)

  const handleSignOut = () => {
    dispatch(logout())
    navigate('/signin')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <Link to="/dashboard" className="text-xl font-bold text-gray-900">
                JOY AI
              </Link>
              <Link to="/clients" className="text-gray-700 hover:text-gray-900 font-medium">
                Clients
              </Link>
              <Link to="/quotes" className="text-gray-700 hover:text-gray-900 font-medium">
                Quotes
              </Link>
              <Link to="/jobs" className="text-gray-700 hover:text-gray-900 font-medium">
                Jobs
              </Link>
              <Link to="/operations" className="text-gray-700 hover:text-gray-900 font-medium">
                Operations
              </Link>
              <Link to="/services" className="text-gray-700 hover:text-gray-900 font-medium">
                Services
              </Link>
            </div>
            <div className="flex items-center gap-3">
              <Link
                to="/settings"
                className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
                title="Settings"
              >
                <SettingsIcon className="w-5 h-5" />
              </Link>
              <button
                onClick={handleSignOut}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-joy-pink border border-gray-300 rounded-lg hover:border-joy-pink transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Sidebar */}
          <aside className="w-64 flex-shrink-0">
            <div className="sticky top-20">
              <div className="flex items-center gap-2 mb-6">
                <SettingsIcon className="h-5 w-5 text-gray-700" />
                <h1 className="text-xl font-semibold text-gray-900">Settings</h1>
              </div>

              <nav className="space-y-1">
                {/* Option Management Section */}
                <div>
                  <button
                    onClick={() => setIsOptionManagementExpanded(!isOptionManagementExpanded)}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium text-gray-900 bg-blue-50 hover:bg-blue-100 transition-colors"
                  >
                    <span>Option Management</span>
                    {isOptionManagementExpanded ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </button>
                  {isOptionManagementExpanded && (
                    <div className="pl-4 mt-1 space-y-1">
                      <button
                        onClick={() => setActiveSubsection('types')}
                        className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                          activeSubsection === 'types'
                            ? 'bg-blue-100 text-blue-600'
                            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                        }`}
                      >
                        Team Member Types
                      </button>
                      <button
                        onClick={() => setActiveSubsection('statuses')}
                        className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                          activeSubsection === 'statuses'
                            ? 'bg-blue-100 text-blue-600'
                            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                        }`}
                      >
                        Status Types
                      </button>
                    </div>
                  )}
                </div>
              </nav>
            </div>
          </aside>

          {/* Main Content Area */}
          <main className="flex-1 min-w-0">
            {activeSubsection === 'types' && <TeamMemberTypesManager />}
            {activeSubsection === 'statuses' && <TeamMemberStatusesManager />}
          </main>
        </div>
      </div>
    </div>
  )
}
