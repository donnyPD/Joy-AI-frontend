import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { logout } from '../features/auth/authSlice'

const logo = '/logo.png' // Placeholder - update this path when logo is added

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { user } = useAppSelector((state) => state.auth)

  const handleSignOut = () => {
    dispatch(logout())
    navigate('/signin')
  }

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-2">
            <Link to="/" className="flex items-center space-x-2 cursor-pointer hover:opacity-80 transition-opacity">
              <img src={logo} alt="Joy AI" className="h-8 w-auto" />
              <span className="text-xl font-bold text-gray-900">JOY AI</span>
            </Link>
          </div>

          <div className="flex items-center gap-2 relative">
            <button
              type="button"
              className="flex items-center gap-2 rounded-full border border-gray-200 px-2 py-1 hover:border-gray-300 transition-colors"
              aria-label="Profile menu"
              aria-expanded={isMenuOpen}
              onClick={() => setIsMenuOpen((prev) => !prev)}
            >
              <div className="h-8 w-8 rounded-full bg-[#FCE4EC] text-[#E91E63] text-sm font-semibold flex items-center justify-center">
                {(user?.name?.trim()?.[0] || 'U').toUpperCase()}
              </div>
              <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {isMenuOpen && (
              <div className="absolute right-0 top-12 w-40 bg-white border border-gray-200 rounded-xl shadow-lg py-2 z-10">
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
