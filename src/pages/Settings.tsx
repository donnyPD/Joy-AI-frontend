import { useState, useEffect } from 'react'
import { useNavigate, Link, useSearchParams } from 'react-router-dom'
import { useAppDispatch } from '../store/hooks'
import { logout } from '../features/auth/authSlice'
import { Settings as SettingsIcon, ChevronRight, ChevronDown, Users, Sliders, BarChart3, Zap, Briefcase, BookOpen, Calendar, Bell, Info, FileText, Globe } from 'lucide-react'
import TeamMemberTypesManager from '../components/TeamMemberTypesManager'
import TeamMemberStatusesManager from '../components/TeamMemberStatusesManager'
import CustomMetricDefinitionsManager from '../components/CustomMetricDefinitionsManager'

type OptionSubsection = 'types' | 'statuses'
type TeamSection = 'metrics' | 'automations' | 'team-members'
type ServiceSection = 'scheduling' | 'notifications'
type KnowledgeBaseSection = 'fallback-response' | 'response-format'
type MainSection = 'global-settings' | 'team' | 'service' | 'knowledge-base'
type MetricsTab = 'add-metrics' | 'delivery-channel' | 'message-template'

export default function Settings() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const [searchParams] = useSearchParams()
  const [activeSubsection, setActiveSubsection] = useState<OptionSubsection>('types')
  const [activeMainSection, setActiveMainSection] = useState<MainSection>('global-settings')
  const [activeTeamSection, setActiveTeamSection] = useState<TeamSection>('team-members')
  const [activeServiceSection, setActiveServiceSection] = useState<ServiceSection>('scheduling')
  const [activeKnowledgeBaseSection, setActiveKnowledgeBaseSection] = useState<KnowledgeBaseSection>('fallback-response')
  
  const [isTeamExpanded, setIsTeamExpanded] = useState(true)
  const [isServiceExpanded, setIsServiceExpanded] = useState(false)
  const [isKnowledgeBaseExpanded, setIsKnowledgeBaseExpanded] = useState(false)
  
  const [isTeamMembersExpanded, setIsTeamMembersExpanded] = useState(true)
  const [isMetricsExpanded, setIsMetricsExpanded] = useState(false)
  const [isAutomationsExpanded, setIsAutomationsExpanded] = useState(false)
  const [activeMetricsTab, setActiveMetricsTab] = useState<MetricsTab>('add-metrics')

  // Helper function to parse hash and update state
  const parseHashAndUpdateState = (hash: string) => {
    // Remove the # symbol
    const hashValue = hash.replace('#', '')
    if (!hashValue) {
      // Default to global-settings if no hash
      setActiveMainSection('global-settings')
      return
    }

    const parts = hashValue.split('-')
    
    // Handle global-settings
    if (hashValue === 'global-settings') {
      setActiveMainSection('global-settings')
      return
    }

    // Handle team sections
    if (parts[0] === 'team') {
      setActiveMainSection('team')
      setIsTeamExpanded(true)
      
      if (parts[1] === 'metrics') {
        setActiveTeamSection('metrics')
        setIsMetricsExpanded(true)
        setIsTeamMembersExpanded(false)
        setIsAutomationsExpanded(false)
        
        // Handle metrics tabs
        if (parts[2] === 'add' && parts[3] === 'metrics') {
          setActiveMetricsTab('add-metrics')
        } else if (parts[2] === 'delivery' && parts[3] === 'channel') {
          setActiveMetricsTab('delivery-channel')
        } else if (parts[2] === 'message' && parts[3] === 'template') {
          setActiveMetricsTab('message-template')
        }
      } else if (parts[1] === 'automations') {
        setActiveTeamSection('automations')
        setIsAutomationsExpanded(true)
        setIsTeamMembersExpanded(false)
        setIsMetricsExpanded(false)
      } else if (parts[1] === 'team' && parts[2] === 'members') {
        setActiveTeamSection('team-members')
        setIsTeamMembersExpanded(true)
        setIsMetricsExpanded(false)
        setIsAutomationsExpanded(false)
        
        // Handle team members subsections
        if (parts[3] === 'types') {
          setActiveSubsection('types')
        } else if (parts[3] === 'statuses') {
          setActiveSubsection('statuses')
        }
      }
      return
    }

    // Handle service sections
    if (parts[0] === 'service') {
      setActiveMainSection('service')
      setIsServiceExpanded(true)
      
      if (parts[1] === 'scheduling') {
        setActiveServiceSection('scheduling')
      } else if (parts[1] === 'notifications') {
        setActiveServiceSection('notifications')
      }
      return
    }

    // Handle knowledge-base sections
    if (parts[0] === 'knowledge' && parts[1] === 'base') {
      setActiveMainSection('knowledge-base')
      setIsKnowledgeBaseExpanded(true)
      
      if (parts[2] === 'fallback' && parts[3] === 'response') {
        setActiveKnowledgeBaseSection('fallback-response')
      } else if (parts[2] === 'response' && parts[3] === 'format') {
        setActiveKnowledgeBaseSection('response-format')
      }
      return
    }
  }

  // Handle URL hash parameter for navigation
  useEffect(() => {
    // Check for hash on mount
    const hash = window.location.hash
    if (hash) {
      parseHashAndUpdateState(hash)
    } else {
      // Default to global-settings if no hash
      setActiveMainSection('global-settings')
    }

    // Listen for hash changes
    const handleHashChange = () => {
      const newHash = window.location.hash
      if (newHash) {
        parseHashAndUpdateState(newHash)
      }
    }

    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  // Handle URL query parameter to auto-select Metrics section (backward compatibility)
  useEffect(() => {
    const section = searchParams.get('section')
    if (section === 'metrics') {
      window.location.hash = 'team-metrics'
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
                {/* Global Settings Section */}
                <div>
                  <button
                    onClick={() => {
                      setActiveMainSection('global-settings')
                      window.location.hash = 'global-settings'
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      activeMainSection === 'global-settings'
                        ? 'text-gray-900 bg-blue-50 hover:bg-blue-100'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      <span>Global Settings</span>
                    </div>
                  </button>
                </div>

                {/* Team Section */}
                <div>
                  <button
                    onClick={() => {
                      setIsTeamExpanded(!isTeamExpanded)
                      if (!isTeamExpanded) {
                        setActiveMainSection('team')
                        window.location.hash = 'team-team-members'
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
                            window.location.hash = 'team-metrics-add-metrics'
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
                            window.location.hash = 'team-automations'
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
                            window.location.hash = 'team-team-members-types'
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
                        window.location.hash = 'service-scheduling'
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
                            window.location.hash = 'service-scheduling'
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
                            window.location.hash = 'service-notifications'
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
                        window.location.hash = 'knowledge-base-fallback-response'
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
                            window.location.hash = 'knowledge-base-fallback-response'
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
                            window.location.hash = 'knowledge-base-response-format'
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
            {/* Global Settings Section Content */}
            {activeMainSection === 'global-settings' && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Global Settings</h2>
                <p className="text-gray-600">Global settings will be available here.</p>
              </div>
            )}

            {/* Team Section Content */}
            {activeMainSection === 'team' && (
              <>
                {/* Team Members - Horizontal Navbar for Subsections */}
                {activeTeamSection === 'team-members' && isTeamMembersExpanded && (
                  <div className="mb-6 border-b border-gray-200">
                    <nav className="flex space-x-8" aria-label="Team Members Tabs">
                      <button
                        onClick={() => {
                          setActiveSubsection('types')
                          window.location.hash = 'team-team-members-types'
                        }}
                        className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                          activeSubsection === 'types'
                            ? 'border-blue-500 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        Team Member Types
                      </button>
                      <button
                        onClick={() => {
                          setActiveSubsection('statuses')
                          window.location.hash = 'team-team-members-statuses'
                        }}
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
                  <>
                    {/* Metrics Tabs Navigation */}
                    <div className="mb-6 border-b border-gray-200">
                      <nav className="flex space-x-8" aria-label="Metrics Tabs">
                        <button
                          onClick={() => {
                            setActiveMetricsTab('add-metrics')
                            window.location.hash = 'team-metrics-add-metrics'
                          }}
                          className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                            activeMetricsTab === 'add-metrics'
                              ? 'border-blue-500 text-blue-600'
                              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                          }`}
                        >
                          Add Metrics
                        </button>
                        <button
                          onClick={() => {
                            setActiveMetricsTab('delivery-channel')
                            window.location.hash = 'team-metrics-delivery-channel'
                          }}
                          className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                            activeMetricsTab === 'delivery-channel'
                              ? 'border-blue-500 text-blue-600'
                              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                          }`}
                        >
                          Delivery Channel
                        </button>
                        <button
                          onClick={() => {
                            setActiveMetricsTab('message-template')
                            window.location.hash = 'team-metrics-message-template'
                          }}
                          className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                            activeMetricsTab === 'message-template'
                              ? 'border-blue-500 text-blue-600'
                              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                          }`}
                        >
                          Configure Message Template
                        </button>
                      </nav>
                    </div>
                    {/* Metrics Tab Content */}
                    {activeMetricsTab === 'add-metrics' && (
                      <CustomMetricDefinitionsManager />
                    )}
                    {activeMetricsTab === 'delivery-channel' && (
                      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">Delivery Channel</h2>
                        <p className="text-gray-600">Delivery channel settings will be available here.</p>
                      </div>
                    )}
                    {activeMetricsTab === 'message-template' && (
                      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">Configure Message Template</h2>
                        <p className="text-gray-600">Message template configuration will be available here.</p>
                      </div>
                    )}
                  </>
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
