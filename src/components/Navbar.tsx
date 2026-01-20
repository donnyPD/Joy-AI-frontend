import { Link, useNavigate } from 'react-router-dom'
import { useAppDispatch } from '../store/hooks'
import { logout } from '../features/auth/authSlice'

const logo = '/logo.png' // Placeholder - update this path when logo is added

export default function Navbar() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()

  const handleSignOut = () => {
    dispatch(logout())
    navigate('/signin')
  }

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Navigation */}
          <div className="flex items-center space-x-8">
            <Link to="/dashboard" className="flex items-center space-x-2 cursor-pointer hover:opacity-80 transition-opacity">
              <img src={logo} alt="Joy AI" className="h-8 w-auto" />
              <span className="text-xl font-bold text-gray-900">JOY AI</span>
            </Link>
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
  )
}
