import { useState, useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { getMe } from '../features/auth/authApi'
import { getOAuthUrl, disconnectJobber } from '../features/jobber/jobberApi'
import { Settings as SettingsIcon, ChevronRight, ChevronDown } from 'lucide-react'
import toast from 'react-hot-toast'
import SidebarLayout from '../components/SidebarLayout'
import TeamMemberTypesManager from '../components/TeamMemberTypesManager'
import TeamMemberStatusesManager from '../components/TeamMemberStatusesManager'

const PINK_COLOR = '#E91E63'
const PINK_DARK = '#C2185B'

type IntegrationSubsection = 'google' | 'slack' | 'jobber'
type OptionSubsection = 'types' | 'statuses'
type MainSection = 'automations' | 'option-management'

export default function Settings() {
  const dispatch = useAppDispatch()
  const { user } = useAppSelector((state) => state.auth)
  const { isLoading: isConnecting } = useAppSelector((state) => state.jobber || { isLoading: false })
  
  const [mainSection, setMainSection] = useState<MainSection>('automations')
  const [activeSubsection, setActiveSubsection] = useState<IntegrationSubsection>('jobber')
  const [activeOptionSubsection, setActiveOptionSubsection] = useState<OptionSubsection>('types')
  const [isAutomationsExpanded, setIsAutomationsExpanded] = useState(true)
  const [isOptionManagementExpanded, setIsOptionManagementExpanded] = useState(true)
  const [error, setError] = useState('')
  const [isCheckingConnection, setIsCheckingConnection] = useState(false)

  const isJobberConnected = !!user?.jobberAccessToken

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
                {/* Automations Section */}
                <div>
                  <button
                    onClick={() => {
                      setIsAutomationsExpanded(!isAutomationsExpanded)
                      if (!isAutomationsExpanded) {
                        setMainSection('automations')
                      }
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium text-gray-900 bg-blue-50 hover:bg-blue-100 transition-colors"
                  >
                    <span>Automations</span>
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
                          setMainSection('automations')
                          setActiveSubsection('google')
                        }}
                        className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                          mainSection === 'automations' && activeSubsection === 'google'
                            ? 'bg-blue-100 text-blue-600'
                            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                        }`}
                      >
                        Google Automation
                      </button>
                      <button
                        onClick={() => {
                          setMainSection('automations')
                          setActiveSubsection('slack')
                        }}
                        className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                          mainSection === 'automations' && activeSubsection === 'slack'
                            ? 'bg-blue-100 text-blue-600'
                            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                        }`}
                      >
                        Slack Integration
                      </button>
                      <button
                        onClick={() => {
                          setMainSection('automations')
                          setActiveSubsection('jobber')
                        }}
                        className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                          mainSection === 'automations' && activeSubsection === 'jobber'
                            ? 'bg-blue-100 text-blue-600'
                            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                        }`}
                      >
                        Jobber Integration
                      </button>
                    </div>
                  )}
                </div>

                {/* Option Management Section */}
                <div>
                  <button
                    onClick={() => {
                      setIsOptionManagementExpanded(!isOptionManagementExpanded)
                      if (!isOptionManagementExpanded) {
                        setMainSection('option-management')
                      }
                    }}
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
                        onClick={() => {
                          setMainSection('option-management')
                          setActiveOptionSubsection('types')
                        }}
                        className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                          mainSection === 'option-management' && activeOptionSubsection === 'types'
                            ? 'bg-blue-100 text-blue-600'
                            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                        }`}
                      >
                        Team Member Types
                      </button>
                      <button
                        onClick={() => {
                          setMainSection('option-management')
                          setActiveOptionSubsection('statuses')
                        }}
                        className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                          mainSection === 'option-management' && activeOptionSubsection === 'statuses'
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
            <div className="p-6">
              {mainSection === 'automations' && activeSubsection === 'google' && (
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

              {mainSection === 'automations' && activeSubsection === 'slack' && (
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

              {mainSection === 'automations' && activeSubsection === 'jobber' && (
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

              {mainSection === 'option-management' && activeOptionSubsection === 'types' && <TeamMemberTypesManager />}
              {mainSection === 'option-management' && activeOptionSubsection === 'statuses' && <TeamMemberStatusesManager />}
            </div>
          </main>
        </div>
      </div>
    </SidebarLayout>
  )
}
