import { useState, useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { getMe } from '../features/auth/authApi'
import { getOAuthUrl, disconnectJobber } from '../features/jobber/jobberApi'
import { Settings as SettingsIcon, ChevronRight, ChevronDown, Users, Sliders, BarChart3, Zap, Briefcase, BookOpen, Calendar, Bell, Info, FileText, Globe, Save, MessageSquare, Package } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import SidebarLayout from '../components/SidebarLayout'
import TeamMemberTypesManager from '../components/TeamMemberTypesManager'
import TeamMemberStatusesManager from '../components/TeamMemberStatusesManager'
import CustomMetricDefinitionsManager from '../components/CustomMetricDefinitionsManager'
import InventoryCustomFields from '../components/InventoryCustomFields'
import InventoryFormConfig from '../components/InventoryFormConfig'
import InventoryDefaultValues from '../components/InventoryDefaultValues'
import { useNotificationMessage, useUpdateNotificationMessage } from '../features/settings/settingsApi'

const PINK_COLOR = '#E91E63'
const PINK_DARK = '#C2185B'

const DEFAULT_NOTIFICATION_MESSAGE = `Hey Ziah, our cleaning tech <name> has just crossed the threshold for unpassed metrics. They recorded <metrics> during <month_year>.

This summary covers all the metrics they have triggered:
<ai_summary>

*Please reach out to them to schedule a 1:1 call no later than <add 2 days hence, in weekday>.*`

const AVAILABLE_VARIABLES = [
  { placeholder: '<name>', description: 'Team member name' },
  { placeholder: '<metrics>', description: 'Formatted metrics breakdown' },
  { placeholder: '<month_year>', description: 'Current month and year' },
  { placeholder: '<ai_summary>', description: 'AI-generated summary' },
  { placeholder: '<add 2 days hence, in weekday>', description: 'Next business day' },
  { placeholder: '<threshold>', description: 'Threshold value' },
  { placeholder: '<incident_count>', description: 'Total incident count' },
]

function MessageTemplateEditor() {
  const { data, isLoading } = useNotificationMessage()
  const updateMutation = useUpdateNotificationMessage()
  const [messageTemplate, setMessageTemplate] = useState<string>(DEFAULT_NOTIFICATION_MESSAGE)

  useEffect(() => {
    if (data?.value) {
      setMessageTemplate(data.value)
    }
  }, [data])

  const handleSave = () => {
    updateMutation.mutate(messageTemplate)
  }

  const insertVariable = (variable: string) => {
    const textarea = document.getElementById('message-template-textarea') as HTMLTextAreaElement
    if (textarea) {
      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      const textBefore = messageTemplate.substring(0, start)
      const textAfter = messageTemplate.substring(end)
      setMessageTemplate(textBefore + variable + textAfter)
      // Set cursor position after inserted variable
      setTimeout(() => {
        textarea.focus()
        textarea.setSelectionRange(start + variable.length, start + variable.length)
      }, 0)
    } else {
      setMessageTemplate(messageTemplate + variable)
    }
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-center py-8">
          <div className="text-gray-500">Loading...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-start gap-3 mb-6">
        <div className="rounded-lg bg-purple-100 p-2">
          <MessageSquare className="h-5 w-5 text-purple-600" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-1">Message Template</h2>
          <p className="text-sm text-gray-600">Customize the notification message template</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="message-template-textarea" className="block text-sm font-medium text-gray-700">
            Notification Message
          </label>
          <textarea
            id="message-template-textarea"
            rows={12}
            className="w-full px-3 py-2 border border-gray-300 bg-white rounded-md text-sm font-mono resize-y focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={messageTemplate}
            onChange={(e) => setMessageTemplate(e.target.value)}
            placeholder={DEFAULT_NOTIFICATION_MESSAGE}
          />
            </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-sm font-medium text-gray-700 mb-3">Available Variables:</p>
          <div className="flex flex-wrap gap-2">
            {AVAILABLE_VARIABLES.map((variable) => (
              <button
                key={variable.placeholder}
                type="button"
                onClick={() => insertVariable(variable.placeholder)}
                className="px-3 py-1.5 bg-white border border-gray-300 rounded-md text-xs font-mono text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-colors cursor-pointer"
                title={variable.description}
              >
                {variable.placeholder}
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-end">
              <button
            onClick={handleSave}
            disabled={updateMutation.isPending}
            className="flex items-center gap-2 px-4 py-2 bg-pink-600 text-white rounded-lg font-medium hover:bg-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            style={{ backgroundColor: PINK_COLOR }}
            onMouseEnter={(e) => {
              if (!updateMutation.isPending) {
                e.currentTarget.style.backgroundColor = PINK_DARK
              }
            }}
            onMouseLeave={(e) => {
              if (!updateMutation.isPending) {
                e.currentTarget.style.backgroundColor = PINK_COLOR
              }
            }}
          >
            {updateMutation.isPending ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                <span>Save Message Template</span>
              </>
            )}
              </button>
            </div>
          </div>
        </div>
  )
}

type IntegrationSubsection = 'google' | 'slack' | 'jobber'
type OptionSubsection = 'types' | 'statuses'
type MainSection = 'global-settings' | 'automations' | 'team' | 'service' | 'knowledge-base' | 'inventory'
type TeamSection = 'metrics' | 'team-members'
type ServiceSection = 'scheduling' | 'notifications'
type KnowledgeBaseSection = 'fallback-response' | 'response-format'
type InventorySection = 'custom-fields' | 'form-config' | 'default-values'
type MetricsTab = 'add-metrics' | 'delivery-channel' | 'message-template'

export default function Settings() {
  const dispatch = useAppDispatch()
  const { user } = useAppSelector((state) => state.auth)
  const { isLoading: isConnecting } = useAppSelector((state) => state.jobber || { isLoading: false })
  const [searchParams] = useSearchParams()
  
  const [activeMainSection, setActiveMainSection] = useState<MainSection>('global-settings')
  const [activeAutomationSubsection, setActiveAutomationSubsection] = useState<IntegrationSubsection>('jobber')
  const [activeTeamSection, setActiveTeamSection] = useState<TeamSection>('team-members')
  const [activeServiceSection, setActiveServiceSection] = useState<ServiceSection>('scheduling')
  const [activeKnowledgeBaseSection, setActiveKnowledgeBaseSection] = useState<KnowledgeBaseSection>('fallback-response')
  const [activeInventorySection, setActiveInventorySection] = useState<InventorySection>('custom-fields')
  const [activeOptionSubsection, setActiveOptionSubsection] = useState<OptionSubsection>('types')
  const [activeMetricsTab, setActiveMetricsTab] = useState<MetricsTab>('add-metrics')
  
  const [isAutomationsExpanded, setIsAutomationsExpanded] = useState(false)
  const [isTeamExpanded, setIsTeamExpanded] = useState(false)
  const [isServiceExpanded, setIsServiceExpanded] = useState(false)
  const [isKnowledgeBaseExpanded, setIsKnowledgeBaseExpanded] = useState(false)
  const [isInventoryExpanded, setIsInventoryExpanded] = useState(false)
  const [isMetricsExpanded, setIsMetricsExpanded] = useState(false)
  const [isTeamMembersExpanded, setIsTeamMembersExpanded] = useState(false)
  
  const [error, setError] = useState('')
  const [isCheckingConnection, setIsCheckingConnection] = useState(false)

  const isJobberConnected = !!user?.jobberAccessToken

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

    // Handle automations sections
    if (parts[0] === 'automations') {
      setActiveMainSection('automations')
      setIsAutomationsExpanded(true)
      
      if (parts[1] === 'google') {
        setActiveAutomationSubsection('google')
      } else if (parts[1] === 'slack') {
        setActiveAutomationSubsection('slack')
      } else if (parts[1] === 'jobber') {
        setActiveAutomationSubsection('jobber')
      }
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
        
        // Handle metrics tabs
        if (parts[2] === 'add' && parts[3] === 'metrics') {
          setActiveMetricsTab('add-metrics')
        } else if (parts[2] === 'delivery' && parts[3] === 'channel') {
          setActiveMetricsTab('delivery-channel')
        } else if (parts[2] === 'message' && parts[3] === 'template') {
          setActiveMetricsTab('message-template')
        }
      } else if (parts[1] === 'team' && parts[2] === 'members') {
        setActiveTeamSection('team-members')
        setIsTeamMembersExpanded(true)
        setIsMetricsExpanded(false)
        
        // Handle team members subsections
        if (parts[3] === 'types') {
          setActiveOptionSubsection('types')
        } else if (parts[3] === 'statuses') {
          setActiveOptionSubsection('statuses')
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

    // Handle inventory sections
    if (parts[0] === 'inventory') {
      setActiveMainSection('inventory')
      setIsInventoryExpanded(true)
      
      if (parts[1] === 'custom' && parts[2] === 'fields') {
        setActiveInventorySection('custom-fields')
      } else if (parts[1] === 'form' && parts[2] === 'config') {
        setActiveInventorySection('form-config')
      } else if (parts[1] === 'default' && parts[2] === 'values') {
        setActiveInventorySection('default-values')
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

  // Preserve existing Jobber connection useEffect
  useEffect(() => {
    if (user) {
      setIsCheckingConnection(false)
    }

    // Handle Jobber connection callback
    const params = new URLSearchParams(window.location.search)
    if (params.get('connected') === 'true') {
      toast.success('Jobber account connected successfully!')
      dispatch(getMe())
      // Clean URL
      window.history.replaceState({}, '', '/settings')
    }

    // Handle errors
    if (params.get('error')) {
      const message = decodeURIComponent(params.get('error') || '')
      setError(message)
      toast.error(message)
      window.history.replaceState({}, '', '/settings')
    }
  }, [user, dispatch])

  const handleConnectJobber = async () => {
    setError('')
    try {
      const toastId = toast.loading('Opening Jobber authorization...')
      const result = await dispatch(getOAuthUrl()).unwrap()
      if (result?.authUrl) {
        const newTab = window.open(result.authUrl, '_blank', 'noopener,noreferrer')
        if (!newTab) {
          toast.error('Popup blocked. Please allow popups and try again.')
        } else {
          toast.success('Jobber opened in new tab. Complete authorization there.')
        }
      } else {
        setError('Failed to get OAuth URL. Please try again.')
        toast.error('Failed to get OAuth URL. Please try again.')
      }
      toast.dismiss(toastId)
    } catch (err: any) {
      console.error('OAuth URL error:', err)
      setError(err || 'Failed to connect Jobber account. Please try again.')
      toast.error(err || 'Failed to connect Jobber account. Please try again.')
      toast.dismiss()
    }
  }

  const handleDisconnectJobber = async () => {
    setError('')
    try {
      const toastId = toast.loading('Disconnecting Jobber...')
      await dispatch(disconnectJobber()).unwrap()
      await dispatch(getMe())
      toast.success('Jobber disconnected. You can connect again now.')
      toast.dismiss(toastId)
    } catch (err: any) {
      console.error('Disconnect error:', err)
      toast.error(err || 'Failed to disconnect Jobber')
      toast.dismiss()
    }
  }

  const handleConnectGoogle = () => {
    toast('Google integration coming soon!')
  }

  const handleConnectSlack = () => {
    toast('Slack integration coming soon!')
  }

  return (
    <SidebarLayout>
      <div className="bg-white rounded-2xl border border-[#EFEFEF] shadow-sm">
        <div className="flex gap-8 p-6">
          {/* Settings Sidebar */}
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
                        ? 'text-gray-900 bg-pink-50 hover:bg-pink-100'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      <span>Global Settings</span>
                    </div>
                  </button>
                </div>

                {/* Automations Section */}
                <div>
                  <button
                    onClick={() => {
                      setIsAutomationsExpanded(!isAutomationsExpanded)
                      if (!isAutomationsExpanded) {
                        setActiveMainSection('automations')
                        window.location.hash = 'automations-jobber'
                      }
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      activeMainSection === 'automations'
                        ? 'text-gray-900 bg-pink-50 hover:bg-pink-100'
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
                  {isAutomationsExpanded && (
                    <div className="pl-4 mt-1 space-y-1">
                      <button
                        onClick={() => {
                          setActiveMainSection('automations')
                          setActiveAutomationSubsection('google')
                          window.location.hash = 'automations-google'
                        }}
                        className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                          activeMainSection === 'automations' && activeAutomationSubsection === 'google'
                            ? 'bg-pink-100 text-[#E91E63]'
                            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                        }`}
                      >
                        Google Automation
                      </button>
                      <button
                        onClick={() => {
                          setActiveMainSection('automations')
                          setActiveAutomationSubsection('slack')
                          window.location.hash = 'automations-slack'
                        }}
                        className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                          activeMainSection === 'automations' && activeAutomationSubsection === 'slack'
                            ? 'bg-pink-100 text-[#E91E63]'
                            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                        }`}
                      >
                        Slack Integration
                      </button>
                      <button
                        onClick={() => {
                          setActiveMainSection('automations')
                          setActiveAutomationSubsection('jobber')
                          window.location.hash = 'automations-jobber'
                        }}
                        className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                          activeMainSection === 'automations' && activeAutomationSubsection === 'jobber'
                            ? 'bg-pink-100 text-[#E91E63]'
                            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                        }`}
                      >
                        Jobber Integration
                      </button>
                    </div>
                  )}
                </div>

                {/* Team Section */}
                <div>
                  <button
                    onClick={() => {
                      setIsTeamExpanded(!isTeamExpanded)
                      if (!isTeamExpanded) {
                        setActiveMainSection('team')
                        window.location.hash = 'team-team-members-types'
                      }
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      activeMainSection === 'team'
                        ? 'text-gray-900 bg-pink-50 hover:bg-pink-100'
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
                      {/* Metrics Section */}
                      <div>
                        <button
                          onClick={() => {
                            if (!isMetricsExpanded) {
                              setIsMetricsExpanded(true)
                            }
                            setActiveMainSection('team')
                            setActiveTeamSection('metrics')
                            setIsTeamMembersExpanded(false)
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
                      {/* Team Members Section */}
                      <div>
                        <button
                          onClick={() => {
                            if (!isTeamMembersExpanded) {
                              setIsTeamMembersExpanded(true)
                            }
                            setActiveMainSection('team')
                            setActiveTeamSection('team-members')
                            setIsMetricsExpanded(false)
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
                        ? 'text-gray-900 bg-pink-50 hover:bg-pink-100'
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
                        ? 'text-gray-900 bg-pink-50 hover:bg-pink-100'
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

                {/* Inventory Section */}
                <div>
                  <button
                    onClick={() => {
                      setIsInventoryExpanded(!isInventoryExpanded)
                      if (!isInventoryExpanded) {
                        setActiveMainSection('inventory')
                        window.location.hash = 'inventory-custom-fields'
                      }
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      activeMainSection === 'inventory'
                        ? 'text-gray-900 bg-pink-50 hover:bg-pink-100'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4" />
                      <span>Inventory</span>
                    </div>
                    {isInventoryExpanded ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </button>
                  {isInventoryExpanded && (
                    <div className="pl-4 mt-1 space-y-1">
                      <div>
                        <button
                          onClick={() => {
                            setActiveMainSection('inventory')
                            setActiveInventorySection('custom-fields')
                            window.location.hash = 'inventory-custom-fields'
                          }}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                            activeMainSection === 'inventory' && activeInventorySection === 'custom-fields'
                              ? 'text-gray-900 bg-gray-100'
                              : 'text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <Sliders className="h-4 w-4" />
                            <span>Custom Fields</span>
                          </div>
                        </button>
                      </div>
                      <div>
                        <button
                          onClick={() => {
                            setActiveMainSection('inventory')
                            setActiveInventorySection('form-config')
                            window.location.hash = 'inventory-form-config'
                          }}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                            activeMainSection === 'inventory' && activeInventorySection === 'form-config'
                              ? 'text-gray-900 bg-gray-100'
                              : 'text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            <span>Form Configuration</span>
                          </div>
                        </button>
                      </div>
                      <div>
                        <button
                          onClick={() => {
                            setActiveMainSection('inventory')
                            setActiveInventorySection('default-values')
                            window.location.hash = 'inventory-default-values'
                          }}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                            activeMainSection === 'inventory' && activeInventorySection === 'default-values'
                              ? 'text-gray-900 bg-gray-100'
                              : 'text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <Sliders className="h-4 w-4" />
                            <span>Default Values</span>
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
            <div className="p-6">
              {/* Global Settings Section Content */}
              {activeMainSection === 'global-settings' && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Global Settings</h2>
                  <p className="text-gray-600">Global settings will be available here.</p>
                </div>
              )}

              {/* Automations Section Content - PRESERVED EXACTLY AS IS */}
              {activeMainSection === 'automations' && activeAutomationSubsection === 'google' && (
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-2">Google Automation</h2>
                  <p className="text-sm text-gray-600 mb-6">
                    Connect Google to sync your calendars, emails, and automation workflows.
                  </p>
                  <div className="border border-gray-200 rounded-lg p-6 bg-gray-50">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                      <div className="flex items-center gap-4">
                        <div
                          className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-semibold text-lg"
                          style={{ background: 'linear-gradient(180deg, #FF83AD 0%, #EA1059 100%)' }}
                        >
                          G
                        </div>
                        <div>
                          <p className="text-base font-semibold text-gray-900">Google Automation</p>
                          <p className="text-sm text-gray-600">Calendar + Gmail + Drive workflows</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-medium text-gray-600 bg-white border border-gray-300 px-3 py-1 rounded-full">
                          Not connected
                        </span>
                  <button
                          onClick={handleConnectGoogle}
                          className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white shadow-sm hover:opacity-90 transition-opacity"
                          style={{ backgroundColor: PINK_COLOR }}
                        >
                          Connect Google
                  </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeMainSection === 'automations' && activeAutomationSubsection === 'slack' && (
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-2">Slack Integration</h2>
                  <p className="text-sm text-gray-600 mb-6">
                    Get real-time alerts and updates in your Slack workspace.
                  </p>
                  <div className="border border-gray-200 rounded-lg p-6 bg-gray-50">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-semibold text-lg bg-[#611F69]">
                          S
                        </div>
                        <div>
                          <p className="text-base font-semibold text-gray-900">Slack Integration</p>
                          <p className="text-sm text-gray-600">Get team alerts in your channels</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-medium text-gray-600 bg-white border border-gray-300 px-3 py-1 rounded-full">
                          Not connected
                        </span>
                  <button
                          onClick={handleConnectSlack}
                          className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white shadow-sm hover:opacity-90 transition-opacity"
                          style={{ backgroundColor: PINK_COLOR }}
                        >
                          Connect Slack
                  </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeMainSection === 'automations' && activeAutomationSubsection === 'jobber' && (
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-2">Jobber Integration</h2>
                  <p className="text-sm text-gray-600 mb-6">
                    Connect Jobber to sync clients, quotes, jobs, and more.
                  </p>
                  
                  {error && (
                    <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                      {error}
              </div>
            )}

                  <div className="border border-gray-200 rounded-lg p-6 bg-gray-50">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-semibold text-lg bg-[#0F172A]">
                          J
                        </div>
                        <div>
                          <p className="text-base font-semibold text-gray-900">Jobber Integration</p>
                          <p className="text-sm text-gray-600">Sync clients, quotes, jobs, and webhooks</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {isJobberConnected && (
                          <span className="text-xs font-medium text-green-700 bg-green-100 px-3 py-1 rounded-full">
                            Connected
                          </span>
                        )}
                        <button
                          onClick={handleConnectJobber}
                          disabled={isConnecting || isJobberConnected || isCheckingConnection}
                          className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white shadow-sm disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
                          style={{
                            backgroundColor: isJobberConnected ? '#10B981' : PINK_COLOR,
                            cursor: isJobberConnected ? 'default' : 'pointer',
                          }}
                          onMouseEnter={(e) => {
                            if (!isJobberConnected && !isConnecting) {
                              e.currentTarget.style.backgroundColor = PINK_DARK
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!isJobberConnected && !isConnecting) {
                              e.currentTarget.style.backgroundColor = PINK_COLOR
                            }
                          }}
                        >
                          {isCheckingConnection
                            ? 'Checking connection...'
                            : isConnecting
                            ? 'Connecting...'
                            : isJobberConnected
                            ? 'Jobber Account Connected'
                            : 'Connect Jobber'}
                        </button>

                        {isJobberConnected && (
                          <button
                            onClick={handleDisconnectJobber}
                            disabled={isConnecting || isCheckingConnection}
                            className="px-4 py-2.5 text-sm font-semibold rounded-xl border border-gray-300 text-gray-900 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Disconnect
                          </button>
                        )}
                      </div>
                    </div>

                    {isJobberConnected && (
                      <p className="mt-4 text-sm text-gray-600">
                        Your Jobber account is connected. Webhooks are automatically registered and active.
                      </p>
                    )}
                  </div>
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
                            setActiveOptionSubsection('types')
                            window.location.hash = 'team-team-members-types'
                          }}
                          className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                            activeOptionSubsection === 'types'
                              ? 'border-[#E91E63] text-[#E91E63]'
                              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                          }`}
                        >
                          Team Member Types
                        </button>
                        <button
                          onClick={() => {
                            setActiveOptionSubsection('statuses')
                            window.location.hash = 'team-team-members-statuses'
                          }}
                          className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                            activeOptionSubsection === 'statuses'
                              ? 'border-[#E91E63] text-[#E91E63]'
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
                      {activeOptionSubsection === 'types' && <TeamMemberTypesManager />}
                      {activeOptionSubsection === 'statuses' && <TeamMemberStatusesManager />}
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
                                ? 'border-[#E91E63] text-[#E91E63]'
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
                                ? 'border-[#E91E63] text-[#E91E63]'
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
                                ? 'border-[#E91E63] text-[#E91E63]'
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
                        <MessageTemplateEditor />
                      )}
                    </>
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

              {/* Inventory Section Content */}
              {activeMainSection === 'inventory' && (
                <>
                  {activeInventorySection === 'custom-fields' && (
                    <InventoryCustomFields />
                  )}
                  {activeInventorySection === 'form-config' && (
                    <InventoryFormConfig />
                  )}
                  {activeInventorySection === 'default-values' && (
                    <InventoryDefaultValues />
                  )}
                </>
              )}
            </div>
          </main>
        </div>
      </div>
    </SidebarLayout>
  )
}
