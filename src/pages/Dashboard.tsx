import { Link, useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { logout } from '../features/auth/authSlice'
// TODO: Add your logo PNG file to src/assets/logo.png
// import logo from '../assets/logo.png'
const logo = '/logo.png' // Placeholder - update this path when logo is added

export default function Dashboard() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { user } = useAppSelector((state) => state.auth)

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
                <img src={logo} alt="Joy AI" className="h-8 w-auto" />
                <span className="text-xl font-bold text-gray-900">JOY AI</span>
              </div>
              <div className="hidden md:flex space-x-6">
                <Link to="/clients" className="text-gray-700 hover:text-joy-pink font-medium">
                  Clients
                </Link>
                <Link to="/quotes" className="text-gray-700 hover:text-joy-pink font-medium">
                  Quotes
                </Link>
                <Link to="/jobs" className="text-gray-700 hover:text-joy-pink font-medium">
                  Jobs
                </Link>
              </div>
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center space-x-4">
              <input
                type="text"
                placeholder="Search charts..."
                className="hidden md:block px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-joy-pink focus:border-transparent"
              />
              <button className="p-2 text-gray-600 hover:text-gray-900">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  />
                </svg>
              </button>
              <button
                onClick={() => navigate('/settings')}
                className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
                title="Settings"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </button>
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
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">JOY 2026</h1>
          <p className="text-gray-600 mt-1">Business Performance Dashboard - {user?.name || 'User'}</p>
        </div>

        {/* Month Filters */}
        <div className="flex flex-wrap gap-2 mb-6">
          {['All Months', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map(
            (month) => (
              <button
                key={month}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  month === 'All Months'
                    ? 'bg-joy-pink text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:border-joy-pink hover:text-joy-pink'
                }`}
              >
                {month}
              </button>
            )
          )}
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Gross Revenue */}
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <div className="p-3 bg-green-100 rounded-lg">
                <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.31-8.86c-1.77-.45-2.34-.94-2.34-1.67 0-.84.79-1.43 2.1-1.43 1.38 0 1.9.66 1.9 1.79h1.52c0-1.93-1.52-3.13-3.42-3.13-1.93 0-3.58 1.04-3.58 2.81 0 1.78 1.39 2.45 2.85 2.92 1.49.48 1.78 1.05 1.78 1.86 0 .99-.8 1.38-2.1 1.38-1.61 0-2.25-.72-2.25-1.84H6.04c0 2.05 1.58 3.26 3.96 3.26 2.34 0 3.9-1.16 3.9-2.9 0-1.87-1.34-2.57-2.49-2.97z" />
                </svg>
              </div>
              <span className="text-sm text-green-600 font-medium">+8.6%</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">$1258K</h3>
            <p className="text-sm text-gray-600">Gross Revenue</p>
            <p className="text-xs text-gray-500 mt-1">Total (All Months)</p>
          </div>

          {/* Active Recurring */}
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <div className="p-3 bg-purple-100 rounded-lg">
                <svg className="w-6 h-6 text-purple-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M16 7C16 9.20914 14.2091 11 12 11C9.79086 11 8 9.20914 8 7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7Z" />
                  <path d="M12 14C8.13401 14 5 17.134 5 21H19C19 17.134 15.866 14 12 14Z" />
                </svg>
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">3.1K</h3>
            <p className="text-sm text-gray-600">Active Recurring</p>
            <p className="text-xs text-gray-500 mt-1">Total (All Months)</p>
          </div>

          {/* Total Leads */}
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <div className="p-3 bg-purple-100 rounded-lg">
                <svg className="w-6 h-6 text-purple-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
                </svg>
              </div>
              <span className="text-sm text-purple-600 font-medium">+38.1%</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">3.1K</h3>
            <p className="text-sm text-gray-600">Total Leads</p>
            <p className="text-xs text-gray-500 mt-1">Total (All Months)</p>
          </div>

          {/* Total Cleanings */}
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <svg className="w-6 h-6 text-yellow-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                </svg>
              </div>
              <span className="text-sm text-purple-600 font-medium">+7.9%</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">6K</h3>
            <p className="text-sm text-gray-600">Total Cleanings</p>
            <p className="text-xs text-gray-500 mt-1">Total (All Months)</p>
          </div>
        </div>
      </main>
    </div>
  )
}
