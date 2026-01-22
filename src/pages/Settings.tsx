import { useState, useEffect } from 'react'
import { useNavigate, Link, useSearchParams } from 'react-router-dom'
import { useAppDispatch } from '../store/hooks'
import { logout } from '../features/auth/authSlice'
import { Settings as SettingsIcon, ChevronRight, ChevronDown, Users, Sliders, BarChart3, Zap, Briefcase, BookOpen, Calendar, Bell, Info, FileText } from 'lucide-react'
import TeamMemberTypesManager from '../components/TeamMemberTypesManager'
import TeamMemberStatusesManager from '../components/TeamMemberStatusesManager'
import CustomMetricDefinitionsManager from '../components/CustomMetricDefinitionsManager'

type OptionSubsection = 'types' | 'statuses'
type TeamSection = 'metrics' | 'automations' | 'team-members'
type ServiceSection = 'scheduling' | 'notifications'
type KnowledgeBaseSection = 'fallback-response' | 'response-format'
type MainSection = 'team' | 'service' | 'knowledge-base'

export default function Settings() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const [searchParams] = useSearchParams()
  const [activeSubsection, setActiveSubsection] = useState<OptionSubsection>('types')
  const [activeMainSection, setActiveMainSection] = useState<MainSection>('team')
  const [activeTeamSection, setActiveTeamSection] = useState<TeamSection>('team-members')
  const [activeServiceSection, setActiveServiceSection] = useState<ServiceSection>('scheduling')
  const [activeKnowledgeBaseSection, setActiveKnowledgeBaseSection] = useState<KnowledgeBaseSection>('fallback-response')
  
  const [isTeamExpanded, setIsTeamExpanded] = useState(true)
  const [isServiceExpanded, setIsServiceExpanded] = useState(false)
  const [isKnowledgeBaseExpanded, setIsKnowledgeBaseExpanded] = useState(false)
  
  const [isTeamMembersExpanded, setIsTeamMembersExpanded] = useState(true)
  const [isMetricsExpanded, setIsMetricsExpanded] = useState(false)
  const [isAutomationsExpanded, setIsAutomationsExpanded] = useState(false)

  // Handle URL query parameter to auto-select Metrics section
  useEffect(() => {
    const section = searchParams.get('section')
    if (section === 'metrics') {
      setActiveMainSection('team')
      setActiveTeamSection('metrics')
      setIsMetricsExpanded(true)
      setIsTeamMembersExpanded(false)
      setIsAutomationsExpanded(false)
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
                {/* Team Section */}
                <div>
                  <button
                    onClick={() => {
                      setIsTeamExpanded(!isTeamExpanded)
                      if (!isTeamExpanded) {
                        setActiveMainSection('team')
                      }
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      activeMainSection === 'team'
                        ? 'text-gray-900 bg-blue-50 hover:bg-blue-100'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
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
                      {/* Metrics Section - First */}
                      <div>
                        <button
                          onClick={() => {
                            // Only expand if currently collapsed
                            if (!isMetricsExpanded) {
                              setIsMetricsExpanded(true)
                            }
                            // Always activate the section when clicked
                            setActiveMainSection('team')
                            setActiveTeamSection('metrics')
                            setIsTeamMembersExpanded(false)
                            setIsAutomationsExpanded(false)
                          }}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                            activeMainSection === 'team' && activeTeamSection === 'metrics'
                              ? 'text-gray-900 bg-gray-100'
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
                      {/* Automations Section */}
                      <div>
                        <button
                          onClick={() => {
                            // Only expand if currently collapsed
                            if (!isAutomationsExpanded) {
                              setIsAutomationsExpanded(true)
                            }
                            // Always activate the section when clicked
                            setActiveMainSection('team')
                            setActiveTeamSection('automations')
                            setIsTeamMembersExpanded(false)
                            setIsMetricsExpanded(false)
                          }}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                            activeMainSection === 'team' && activeTeamSection === 'automations'
                              ? 'text-gray-900 bg-gray-100'
                              : 'text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <Zap className="h-4 w-4" />
                            <span>Automations</span>
                          </div>
                          {isAutomationsExpanded ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                      {/* Team Members Section (renamed from Option Management) */}
                      <div>
                        <button
                          onClick={() => {
                            // Only expand if currently collapsed
                            if (!isTeamMembersExpanded) {
                              setIsTeamMembersExpanded(true)
                            }
                            // Always activate the section when clicked
                            setActiveMainSection('team')
                            setActiveTeamSection('team-members')
                            setIsMetricsExpanded(false)
                            setIsAutomationsExpanded(false)
                          }}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                            activeMainSection === 'team' && activeTeamSection === 'team-members'
                              ? 'text-gray-900 bg-gray-100'
                              : 'text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <Sliders className="h-4 w-4" />
                            <span>Team Members</span>
                          </div>
                          {isTeamMembersExpanded ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Service Section */}
                <div>
                  <button
                    onClick={() => {
                      setIsServiceExpanded(!isServiceExpanded)
                      if (!isServiceExpanded) {
                        setActiveMainSection('service')
                      }
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      activeMainSection === 'service'
                        ? 'text-gray-900 bg-blue-50 hover:bg-blue-100'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Briefcase className="h-4 w-4" />
                      <span>Service</span>
                    </div>
                    {isServiceExpanded ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </button>
                  {isServiceExpanded && (
                    <div className="pl-4 mt-1 space-y-1">
                      {/* Scheduling Section */}
                      <div>
                        <button
                          onClick={() => {
                            setActiveMainSection('service')
                            setActiveServiceSection('scheduling')
                          }}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                            activeMainSection === 'service' && activeServiceSection === 'scheduling'
                              ? 'text-gray-900 bg-gray-100'
                              : 'text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span>Scheduling</span>
                          </div>
                        </button>
                      </div>
                      {/* Notifications Section */}
                      <div>
                        <button
                          onClick={() => {
                            setActiveMainSection('service')
                            setActiveServiceSection('notifications')
                          }}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                            activeMainSection === 'service' && activeServiceSection === 'notifications'
                              ? 'text-gray-900 bg-gray-100'
                              : 'text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <Bell className="h-4 w-4" />
                            <span>Notifications</span>
                          </div>
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Knowledge Base Section */}
                <div>
                  <button
                    onClick={() => {
                      setIsKnowledgeBaseExpanded(!isKnowledgeBaseExpanded)
                      if (!isKnowledgeBaseExpanded) {
                        setActiveMainSection('knowledge-base')
                      }
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      activeMainSection === 'knowledge-base'
                        ? 'text-gray-900 bg-blue-50 hover:bg-blue-100'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4" />
                      <span>Knowledge Base</span>
                    </div>
                    {isKnowledgeBaseExpanded ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </button>
                  {isKnowledgeBaseExpanded && (
                    <div className="pl-4 mt-1 space-y-1">
                      {/* Fallback Response Section */}
                      <div>
                        <button
                          onClick={() => {
                            setActiveMainSection('knowledge-base')
                            setActiveKnowledgeBaseSection('fallback-response')
                          }}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                            activeMainSection === 'knowledge-base' && activeKnowledgeBaseSection === 'fallback-response'
                              ? 'text-gray-900 bg-gray-100'
                              : 'text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <Info className="h-4 w-4" />
                            <span>Fallback Response</span>
                          </div>
                        </button>
                      </div>
                      {/* Response Format Section */}
                      <div>
                        <button
                          onClick={() => {
                            setActiveMainSection('knowledge-base')
                            setActiveKnowledgeBaseSection('response-format')
                          }}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                            activeMainSection === 'knowledge-base' && activeKnowledgeBaseSection === 'response-format'
                              ? 'text-gray-900 bg-gray-100'
                              : 'text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            <span>Response Format</span>
                          </div>
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
            {/* Team Section Content */}
            {activeMainSection === 'team' && (
              <>
                {/* Team Members - Horizontal Navbar for Subsections */}
                {activeTeamSection === 'team-members' && isTeamMembersExpanded && (
                  <div className="mb-6 border-b border-gray-200">
                    <nav className="flex space-x-8" aria-label="Team Members Tabs">
                      <button
                        onClick={() => setActiveSubsection('types')}
                        className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                          activeSubsection === 'types'
                            ? 'border-blue-500 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        Team Member Types
                      </button>
                      <button
                        onClick={() => setActiveSubsection('statuses')}
                        className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                          activeSubsection === 'statuses'
                            ? 'border-blue-500 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        Status Types
                      </button>
                    </nav>
                  </div>
                )}
                {/* Render Team content based on active section */}
                {activeTeamSection === 'team-members' && (
                  <>
                    {activeSubsection === 'types' && <TeamMemberTypesManager />}
                    {activeSubsection === 'statuses' && <TeamMemberStatusesManager />}
                  </>
                )}
                {activeTeamSection === 'metrics' && isMetricsExpanded && (
                  <CustomMetricDefinitionsManager />
                )}
                {activeTeamSection === 'automations' && isAutomationsExpanded && (
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Automations</h2>
                    <p className="text-gray-600">Automation settings will be available here.</p>
                  </div>
                )}
              </>
            )}

            {/* Service Section Content */}
            {activeMainSection === 'service' && (
              <>
                {activeServiceSection === 'scheduling' && (
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Scheduling</h2>
                    <p className="text-gray-600">Scheduling settings will be available here.</p>
                  </div>
                )}
                {activeServiceSection === 'notifications' && (
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Notifications</h2>
                    <p className="text-gray-600">Notification settings will be available here.</p>
                  </div>
                )}
              </>
            )}

            {/* Knowledge Base Section Content */}
            {activeMainSection === 'knowledge-base' && (
              <>
                {activeKnowledgeBaseSection === 'fallback-response' && (
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Fallback Response</h2>
                    <p className="text-gray-600">Fallback response settings will be available here.</p>
                  </div>
                )}
                {activeKnowledgeBaseSection === 'response-format' && (
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Response Format</h2>
                    <p className="text-gray-600">Response format settings will be available here.</p>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}
