import { useState, useEffect } from 'react'
import { useNavigate, Link, useSearchParams } from 'react-router-dom'
import { useAppDispatch } from '../store/hooks'
import { logout } from '../features/auth/authSlice'
import { Settings as SettingsIcon, ChevronRight, ChevronDown, Users, Sliders, BarChart3 } from 'lucide-react'
import TeamMemberTypesManager from '../components/TeamMemberTypesManager'
import TeamMemberStatusesManager from '../components/TeamMemberStatusesManager'
import CustomMetricDefinitionsManager from '../components/CustomMetricDefinitionsManager'

type OptionSubsection = 'types' | 'statuses'
type TeamSection = 'option-management' | 'metrics'

export default function Settings() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const [searchParams] = useSearchParams()
  const [activeSubsection, setActiveSubsection] = useState<OptionSubsection>('types')
  const [activeTeamSection, setActiveTeamSection] = useState<TeamSection>('option-management')
  const [isTeamExpanded, setIsTeamExpanded] = useState(true)
  const [isOptionManagementExpanded, setIsOptionManagementExpanded] = useState(true)
  const [isMetricsExpanded, setIsMetricsExpanded] = useState(false)

  // Handle URL query parameter to auto-select Metrics section
  useEffect(() => {
    const section = searchParams.get('section')
    if (section === 'metrics') {
      setActiveTeamSection('metrics')
      setIsMetricsExpanded(true)
      setIsOptionManagementExpanded(false)
      setIsTeamExpanded(true)
    }
  }, [searchParams])

  const handleSignOut = () => {
    dispatch(logout())
    navigate('/signin')
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
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
                className="p-2 text-[#E91E63] hover:text-[#C2185B] transition-colors"
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
                <SettingsIcon className="h-5 w-5 text-[#E91E63]" />
                <h1 className="text-xl font-semibold text-gray-900">Settings</h1>
              </div>

              <nav className="space-y-1">
                {/* Team Section */}
                <div>
                  <button
                    onClick={() => setIsTeamExpanded(!isTeamExpanded)}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium text-gray-900 bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      <span>Team</span>
                    </div>
                    {isTeamExpanded ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </button>
                  {isTeamExpanded && (
                    <div className="pl-4 mt-1 space-y-1">
                      {/* Option Management Section */}
                      <div>
                        <button
                          onClick={() => {
                            setIsOptionManagementExpanded(!isOptionManagementExpanded)
                            if (!isOptionManagementExpanded) {
                              setActiveTeamSection('option-management')
                              setIsMetricsExpanded(false)
                            }
                          }}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                            activeTeamSection === 'option-management'
                              ? 'text-[#E91E63] bg-gray-100'
                              : 'text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <Sliders className="h-4 w-4" />
                            <span>Option Management</span>
                          </div>
                          {isOptionManagementExpanded ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                      {/* Metrics Section */}
                      <div>
                        <button
                          onClick={() => {
                            setIsMetricsExpanded(!isMetricsExpanded)
                            if (!isMetricsExpanded) {
                              setActiveTeamSection('metrics')
                              setIsOptionManagementExpanded(false)
                            }
                          }}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                            activeTeamSection === 'metrics'
                              ? 'text-[#E91E63] bg-gray-100'
                              : 'text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <BarChart3 className="h-4 w-4" />
                            <span>Metrics</span>
                          </div>
                          {isMetricsExpanded ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </nav>
            </div>
          </aside>

          {/* Main Content Area */}
          <main className="flex-1 min-w-0">
            {/* Horizontal Navbar for Option Management Subsections */}
            {activeTeamSection === 'option-management' && isOptionManagementExpanded && (
              <div className="mb-6 border-b border-gray-200">
                <nav className="flex space-x-8" aria-label="Option Management Tabs">
                  <button
                    onClick={() => setActiveSubsection('types')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeSubsection === 'types'
                        ? 'border-[#E91E63] text-[#E91E63]'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    Team Member Types
                  </button>
                  <button
                    onClick={() => setActiveSubsection('statuses')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeSubsection === 'statuses'
                        ? 'border-[#E91E63] text-[#E91E63]'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    Status Types
                  </button>
                </nav>
              </div>
            )}
            {/* Render content based on active section */}
            {activeTeamSection === 'option-management' && (
              <>
                {activeSubsection === 'types' && <TeamMemberTypesManager />}
                {activeSubsection === 'statuses' && <TeamMemberStatusesManager />}
              </>
            )}
            {activeTeamSection === 'metrics' && isMetricsExpanded && (
              <CustomMetricDefinitionsManager />
            )}
          </main>
        </div>
      </div>
    </div>
  )
}
