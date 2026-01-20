import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { signIn, getMe } from '../../features/auth/authApi'
import { clearError } from '../../features/auth/authSlice'
// TODO: Add your logo PNG file to src/assets/logo.png
// import logo from '../../assets/logo.png'
const logo = '/logo.png' // Placeholder - update this path when logo is added

const PINK_COLOR = '#E91E63'
const PINK_DARK = '#C2185B'

export default function SignIn() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { isLoading, error, isAuthenticated, user } = useAppSelector((state) => state.auth)

  useEffect(() => {
    // Clear any previous errors
    dispatch(clearError())
  }, [dispatch])

  useEffect(() => {
    // Redirect if authenticated, user data is loaded, and not currently loading
    // This ensures we have full user data (including jobber token) before redirecting
    if (isAuthenticated && user && !isLoading) {
      navigate('/dashboard')
    }
  }, [isAuthenticated, user, isLoading, navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    dispatch(clearError())
    
    // Sign in first
    const signInResult = await dispatch(signIn({ email, password }))
    
    // If sign in successful, immediately fetch full user data (including jobber token)
    if (signIn.fulfilled.match(signInResult)) {
      await dispatch(getMe())
    }
  }

  return (
    <div className="min-h-screen flex overflow-hidden bg-gray-50">
      {/* Left Panel - White Background with Form */}
      <div className="w-1/2 flex items-center justify-center bg-white px-12 py-12">
        <div className="w-full max-w-lg">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <img 
              src={logo} 
              alt="Joy AI Logo" 
              className="h-12 w-auto" 
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }} 
            />
          </div>

          {/* Title */}
          <h1 className="text-4xl font-bold text-gray-900 text-center mb-2">
            Welcome back
          </h1>
          <p className="text-base text-gray-600 text-center mb-8">
            Sign in to your account to continue
          </p>

          {/* Form Card */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 text-base border border-gray-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:border-transparent transition-all"
                    style={{ '--tw-ring-color': PINK_COLOR } as React.CSSProperties}
                    placeholder="john@example.com"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 text-base border border-gray-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:border-transparent transition-all"
                    style={{ '--tw-ring-color': PINK_COLOR } as React.CSSProperties}
                    placeholder="••••••••"
                  />
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="rememberMe"
                    name="rememberMe"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 border-gray-300 rounded focus:ring-2"
                    style={{ accentColor: PINK_COLOR }}
                  />
                  <label htmlFor="rememberMe" className="ml-2 text-sm font-medium text-gray-700">
                    Remember me
                  </label>
                </div>
                <Link 
                  to="/forgot-password" 
                  className="text-sm font-medium hover:underline transition-colors"
                  style={{ color: PINK_COLOR }}
                >
                  Forgot password?
                </Link>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full text-white font-semibold text-base py-3.5 px-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg"
                style={{ backgroundColor: PINK_COLOR }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = PINK_DARK}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = PINK_COLOR}
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>
          </div>

          {/* Sign Up Link */}
          <p className="mt-6 text-center text-sm text-gray-600">
            Don't have an account?{' '}
            <Link 
              to="/signup" 
              className="font-semibold hover:underline transition-colors"
              style={{ color: PINK_COLOR }}
            >
              Sign Up
            </Link>
          </p>
        </div>
      </div>

      {/* Right Panel - Pink Background with Marketing Content */}
      <div 
        className="w-1/2 flex items-center justify-center px-12 py-12" 
        style={{ backgroundColor: PINK_COLOR }}
      >
        <div className="max-w-lg text-white">
          {/* Sparkle Icon */}
          <div className="flex justify-center mb-6">
            <svg
              className="w-12 h-12"
              fill="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
            </svg>
          </div>

          {/* Heading */}
          <h2 className="text-4xl font-bold text-center mb-4">
            Transform Your Cleaning Business
          </h2>
          <p className="text-lg text-center text-white/95 mb-10 leading-relaxed">
            Streamline operations, manage your team, and grow your revenue with our comprehensive
            business management platform.
          </p>

          {/* Features */}
          <div className="space-y-8">
            {/* Team Management */}
            <div className="flex items-start">
              <div className="flex-shrink-0 p-3 bg-white/20 rounded-xl">
                <svg
                  className="w-8 h-8"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M16 7C16 9.20914 14.2091 11 12 11C9.79086 11 8 9.20914 8 7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7Z" />
                  <path d="M12 14C8.13401 14 5 17.134 5 21H19C19 17.134 15.866 14 12 14Z" />
                  <path d="M16 11C18.2091 11 20 9.20914 20 7C20 4.79086 18.2091 3 16 3C13.7909 3 12 4.79086 12 7C12 9.20914 13.7909 11 16 11Z" />
                  <path d="M21 21H15C15 18.2386 17.2386 16 20 16C22.7614 16 25 18.2386 25 21H21Z" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-xl font-bold mb-1">Team Management</h3>
                <p className="text-white/90 text-base">Coordinate schedules and track performance</p>
              </div>
            </div>

            {/* Secure & Reliable */}
            <div className="flex items-start">
              <div className="flex-shrink-0 p-3 bg-white/20 rounded-xl">
                <svg
                  className="w-8 h-8"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M12 1L3 5V11C3 16.55 6.84 21.74 12 23C17.16 21.74 21 16.55 21 11V5L12 1ZM12 7C13.4 7 14.8 8.6 14.8 10V11.5C15.4 11.5 16 12.1 16 12.7V16.2C16 16.8 15.4 17.3 14.8 17.3H9.2C8.6 17.3 8 16.7 8 16.2V12.8C8 12.2 8.6 11.6 9.2 11.6V10C9.2 8.6 10.6 7 12 7ZM12 8.2C11.2 8.2 10.5 8.7 10.5 10V11.5H13.5V10C13.5 8.7 12.8 8.2 12 8.2Z" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-xl font-bold mb-1">Secure & Reliable</h3>
                <p className="text-white/90 text-base">Your data is protected with enterprise-grade security</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
