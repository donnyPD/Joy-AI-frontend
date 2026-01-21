import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { getMe } from '../features/auth/authApi'
import { getOAuthUrl, disconnectJobber } from '../features/jobber/jobberApi'
const PINK_COLOR = '#E91E63'
const PINK_DARK = '#C2185B'

export default function Integration() {
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [currentStep, setCurrentStep] = useState(0)
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { user, token, isLoading: isAuthLoading } = useAppSelector((state) => state.auth)
  const { isLoading: isConnecting } = useAppSelector((state) => state.jobber || { isLoading: false })

  const isConnected = !!user?.jobberAccessToken
  const hasToken = !!(token || localStorage.getItem('accessToken'))
  const [isUserChecking, setIsUserChecking] = useState(false)
  const hasRequestedUser = useRef(false)
  const isCheckingConnection = isAuthLoading || isUserChecking

  useEffect(() => {
    if (hasToken && !hasRequestedUser.current) {
      hasRequestedUser.current = true
      setIsUserChecking(true)
      dispatch(getMe())
        .finally(() => {
          setIsUserChecking(false)
        })
    }

    const params = new URLSearchParams(window.location.search)
    if (params.get('connected') === 'true') {
      toast.success('Jobber account connected successfully!')
      dispatch(getMe())
      navigate('/intergation', { replace: true })
    }
    if (params.get('error')) {
      const message = decodeURIComponent(params.get('error') || '')
      setError(message)
      toast.error(message)
      navigate('/intergation', { replace: true })
    }
  }, [dispatch, navigate])

  const handleConnectJobber = async () => {
    setError('')
    setSuccess('')
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
    setSuccess('')
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

  const steps = [
    {
      id: 'google',
      title: 'Google Automation',
      description: 'Connect Google to sync your calendars, emails, and automation workflows.'
    },
    {
      id: 'slack',
      title: 'Slack Integration',
      description: 'Get real-time alerts and updates in your Slack workspace.'
    },
    {
      id: 'jobber',
      title: 'Jobber Integration',
      description: 'Connect Jobber to sync clients, quotes, jobs, and more.'
    }
  ]

  const handlePrev = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0))
  }

  const handleNext = () => {
    if (currentStep >= steps.length - 1) {
      navigate('/')
      return
    }
    setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1))
  }

  const handleSkip = () => {
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-[#F7F7F9] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-6xl bg-white rounded-[32px] shadow-[0_20px_60px_rgba(15,23,42,0.08)] border border-[#F0F0F0] overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-[1.1fr,1.9fr]">
          <section className="relative overflow-hidden bg-gradient-to-br from-[#F973A8] via-[#E91E63] to-[#C2185B] text-white p-10 lg:p-12">
            <div className="absolute inset-0 opacity-25">
              <div className="absolute -top-24 -left-20 h-64 w-64 rounded-full bg-white/20 blur-3xl" />
              <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
            </div>
            <div className="relative">
              <div className="flex items-center gap-3">
                <img src="/signup-logo.png" alt="Joy AI" className="h-10 w-10 rounded-xl bg-white/90 p-1.5" />
                <div>
                  <p className="text-xl font-semibold tracking-wide">JOY AI</p>
                  <p className="text-xs uppercase tracking-[0.3em] text-white/70">Integrations</p>
                </div>
              </div>

              <h1 className="mt-10 text-3xl font-semibold leading-tight">
                Connect your tools with Joy AI
              </h1>
              <p className="mt-4 text-sm text-white/80 max-w-sm">
                Follow the quick setup steps to sync your workflow and unlock automated insights.
              </p>

              <div className="mt-10 space-y-4 text-sm text-white/90">
                <div className="flex items-start gap-3">
                  <span className="mt-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/20 text-xs font-semibold">
                    1
                  </span>
                  <p>Connect your Google, Slack, and Jobber accounts securely.</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="mt-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/20 text-xs font-semibold">
                    2
                  </span>
                  <p>Verify permissions and enable real-time automations.</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="mt-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/20 text-xs font-semibold">
                    3
                  </span>
                  <p>Finish setup and start using Joy AI workflows instantly.</p>
                </div>
              </div>
            </div>
          </section>

          <section className="p-8 lg:p-10">
            <div className="flex flex-col gap-3 mb-6">
              <p className="text-xs font-semibold text-[#8A8A8A] tracking-wide uppercase">Integrations</p>
              <h2 className="text-2xl font-semibold text-[#191919]">Connect your tools</h2>
              <p className="text-sm text-[#A0A0A0] max-w-xl">
                Add your integrations step-by-step to automate your workflow and keep everything in sync.
              </p>

              <div className="flex items-center mt-2">
                {steps.map((step, index) => (
                  <div key={step.id} className="flex items-center">
                    <div
                      className={`h-3 w-3 rounded-full border ${
                        index <= currentStep ? 'bg-[#E80379] border-[#E80379]' : 'bg-white border-[#E1E1E1]'
                      }`}
                    />
                    {index < steps.length - 1 && (
                      <div
                        className={`h-[2px] w-10 ${
                          index < currentStep ? 'bg-[#E80379]' : 'bg-[#E7E7E7]'
                        }`}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white border border-[#EFEFEF] rounded-2xl shadow-sm p-6">
          <div className="flex items-start justify-between gap-6 flex-wrap">
            <div>
              <h2 className="text-2xl font-semibold text-[#191919]">{steps[currentStep].title}</h2>
              <p className="text-sm text-[#A0A0A0] mt-2">{steps[currentStep].description}</p>
              {isCheckingConnection && currentStep === 2 && (
                <div className="mt-3 flex items-center text-sm text-[#9B9B9B]">
                  <svg className="animate-spin h-4 w-4 mr-2 text-[#C9C9C9]" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                  </svg>
                  Checking connection status...
                </div>
              )}
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-[#A0A0A0] uppercase tracking-widest">
                Step {currentStep + 1} of {steps.length}
              </span>
              {currentStep === 2 && isConnected && (
                <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                  Connected
                </span>
              )}
            </div>
          </div>

          <div className="mt-8">
            {currentStep === 0 && (
              <div className="border border-[#F2F2F2] rounded-2xl p-6 bg-[#FBFBFD]">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-semibold text-lg"
                      style={{ background: 'linear-gradient(180deg, #FF83AD 0%, #EA1059 100%)' }}
                    >
                      G
                    </div>
                    <div>
                      <p className="text-base font-semibold text-[#191919]">Google Automation</p>
                      <p className="text-sm text-[#A0A0A0]">Calendar + Gmail + Drive workflows</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-medium text-[#A0A0A0] bg-white border border-[#E7E7E7] px-3 py-1 rounded-full">
                      Not connected
                    </span>
                    <button
                      type="button"
                      className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white shadow-sm"
                      style={{ backgroundColor: PINK_COLOR }}
                    >
                      Connect Google
                    </button>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 1 && (
              <div className="border border-[#F2F2F2] rounded-2xl p-6 bg-[#FBFBFD]">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-semibold text-lg bg-[#611F69]">
                      S
                    </div>
                    <div>
                      <p className="text-base font-semibold text-[#191919]">Slack Integration</p>
                      <p className="text-sm text-[#A0A0A0]">Get team alerts in your channels</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-medium text-[#A0A0A0] bg-white border border-[#E7E7E7] px-3 py-1 rounded-full">
                      Not connected
                    </span>
                    <button
                      type="button"
                      className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white shadow-sm"
                      style={{ backgroundColor: PINK_COLOR }}
                    >
                      Connect Slack
                    </button>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="border border-[#F2F2F2] rounded-2xl p-6 bg-[#FBFBFD]">
                {success && (
                  <div className="mb-4 bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-lg text-sm">
                    {success}
                  </div>
                )}

                {error && (
                  <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-semibold text-lg bg-[#0F172A]">
                      J
                    </div>
                    <div>
                      <p className="text-base font-semibold text-[#191919]">Jobber Integration</p>
                      <p className="text-sm text-[#A0A0A0]">Sync clients, quotes, jobs, and webhooks</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {isConnected && (
                      <span className="text-xs font-medium text-green-700 bg-green-100 px-3 py-1 rounded-full">
                        Connected
                      </span>
                    )}
                    <button
                      onClick={handleConnectJobber}
                      disabled={isConnecting || isConnected || isCheckingConnection}
                      className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{ 
                        backgroundColor: isConnected ? '#10B981' : PINK_COLOR,
                        cursor: isConnected ? 'default' : 'pointer'
                      }}
                      onMouseEnter={(e) => {
                        if (!isConnected && !isConnecting) {
                          e.currentTarget.style.backgroundColor = PINK_DARK
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isConnected && !isConnecting) {
                          e.currentTarget.style.backgroundColor = PINK_COLOR
                        }
                      }}
                    >
                      {isCheckingConnection
                        ? 'Checking connection...'
                        : isConnecting
                        ? 'Connecting...'
                        : isConnected
                        ? 'Jobber Account Connected'
                        : 'Connect Jobber'}
                    </button>

                    {isConnected && (
                      <button
                        onClick={handleDisconnectJobber}
                        disabled={isConnecting || isCheckingConnection}
                        className="px-4 py-2.5 text-sm font-semibold rounded-xl border border-[#E1E1E1] text-[#191919] bg-white hover:bg-[#F6F6F6] disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Disconnect
                      </button>
                    )}
                  </div>
                </div>

                {isConnected && (
                  <p className="mt-4 text-sm text-[#A0A0A0]">
                    Your Jobber account is connected. Webhooks are automatically registered and active.
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="mt-10 flex items-center justify-between flex-wrap gap-4">
            <button
              type="button"
              onClick={handlePrev}
              disabled={currentStep === 0}
              className="px-6 py-2.5 rounded-xl text-sm font-semibold border border-[#E3E3E3] text-[#191919] bg-white hover:bg-[#F6F6F6] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleSkip}
                className="px-6 py-2.5 rounded-xl text-sm font-semibold text-[#E80379] border border-[#F3A6C9] bg-[#FFF2F7] hover:bg-[#FFE6F1]"
              >
                Skip
              </button>

              <button
                type="button"
                onClick={handleNext}
                className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white shadow-sm"
                style={{ backgroundColor: PINK_COLOR }}
              >
                {currentStep >= steps.length - 1 ? 'Finish' : 'Next'}
              </button>
            </div>
          </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
