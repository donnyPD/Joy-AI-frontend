import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { logout } from '../features/auth/authSlice'
import { getMe } from '../features/auth/authApi'
import { getOAuthUrl, disconnectJobber } from '../features/jobber/jobberApi'

const PINK_COLOR = '#E91E63'
const PINK_DARK = '#C2185B'

export default function Settings() {
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { user } = useAppSelector((state) => state.auth)
  const { isLoading: isConnecting } = useAppSelector((state) => state.jobber || { isLoading: false })

  const isConnected = !!user?.jobberAccessToken

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('connected') === 'true') {
      toast.success('Jobber account connected successfully!')
      dispatch(getMe())
      navigate('/settings', { replace: true })
    }
    if (params.get('error')) {
      const message = decodeURIComponent(params.get('error') || '')
      setError(message)
      toast.error(message)
      navigate('/settings', { replace: true })
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
            {/* Logo and Navigation */}
            <div className="flex items-center space-x-8">
              <div className="flex items-center space-x-2">
                <span className="text-xl font-bold text-gray-900">JOY AI</span>
              </div>
              <button
                onClick={() => navigate('/dashboard')}
                className="text-gray-700 hover:text-gray-900 font-medium"
              >
                Dashboard
              </button>
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center space-x-4">
              <button
                onClick={handleSignOut}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 border border-gray-300 rounded-lg hover:border-gray-400 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Global Settings</h1>
          <p className="text-gray-600 mt-2">Manage your account and integrations</p>
        </div>

        {/* Jobber Connection Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Jobber Integration</h2>
              <p className="text-gray-600">
                Connect your Jobber account to sync clients, quotes, jobs, and more
              </p>
            </div>
            {isConnected && (
              <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
                Connected
              </span>
            )}
          </div>

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

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleConnectJobber}
              disabled={isConnecting || isConnected}
              className="px-6 py-3 text-white font-semibold rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg"
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
              {isConnecting
                ? 'Connecting...'
                : isConnected
                ? 'Jobber Account Connected'
                : 'Connect my Jobber account'}
            </button>

            {isConnected && (
              <button
                onClick={handleDisconnectJobber}
                disabled={isConnecting}
                className="px-6 py-3 font-semibold rounded-xl border border-gray-300 text-gray-800 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Disconnect Jobber
              </button>
            )}
          </div>

          {isConnected && (
            <p className="mt-4 text-sm text-gray-500">
              Your Jobber account is connected. Webhooks are automatically registered and active.
            </p>
          )}
        </div>

        {/* Account Settings Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Account Settings</h2>
          <p className="text-gray-600 mb-4">Manage your account preferences and security</p>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-gray-200">
              <div>
                <h3 className="font-medium text-gray-900">Email Notifications</h3>
                <p className="text-sm text-gray-500">Receive email updates about your account</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-gray-200">
              <div>
                <h3 className="font-medium text-gray-900">Two-Factor Authentication</h3>
                <p className="text-sm text-gray-500">Add an extra layer of security to your account</p>
              </div>
              <button className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50">
                Enable
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
