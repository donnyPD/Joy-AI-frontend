import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { signIn, getMe } from '../../features/auth/authApi'
import { clearError } from '../../features/auth/authSlice'

const PINK_COLOR = '#E80379'
const PINK_DARK = '#EA1059'
const ERROR_COLOR = '#DE2928'

export default function SignIn() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  
  // Focus states
  const [focusedField, setFocusedField] = useState<string | null>(null)
  
  // Validation states
  const [emailError, setEmailError] = useState('')
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set())
  
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { isLoading, error, isAuthenticated, user } = useAppSelector((state) => state.auth)

  useEffect(() => {
    dispatch(clearError())
  }, [dispatch])

  useEffect(() => {
    if (isAuthenticated && user && !isLoading) {
      navigate('/choose-plan')
    }
  }, [isAuthenticated, user, isLoading, navigate])

  // Email validation
  const validateEmail = (emailValue: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (emailValue && !emailRegex.test(emailValue)) {
      setEmailError('Please enter a valid email address')
      return false
    }
    setEmailError('')
    return true
  }

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setEmail(value)
    if (touchedFields.has('email')) {
      validateEmail(value)
    }
  }

  const handleEmailBlur = () => {
    setTouchedFields(prev => new Set(prev).add('email'))
    validateEmail(email)
  }

  const handleFieldFocus = (fieldName: string) => {
    setFocusedField(fieldName)
  }

  const handleFieldBlur = (fieldName: string) => {
    setFocusedField(null)
    setTouchedFields(prev => new Set(prev).add(fieldName))
    if (fieldName === 'email') {
      validateEmail(email)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    dispatch(clearError())
    
    if (!validateEmail(email)) {
      return
    }
    
    // Sign in first
    const signInResult = await dispatch(signIn({ email, password }))
    
    // If sign in successful, immediately fetch full user data (including jobber token)
    if (signIn.fulfilled.match(signInResult)) {
      await dispatch(getMe())
    }
  }

  const getInputBorderColor = (fieldName: string, hasError: boolean = false) => {
    if (hasError) return ERROR_COLOR
    if (focusedField === fieldName) return PINK_COLOR
    return '#E7E7E7'
  }

  const getInputShadow = (fieldName: string, hasError: boolean = false) => {
    if (hasError && focusedField === fieldName) {
      return `0px 0px 0px 2px rgba(222, 41, 40, 0.25)`
    }
    if (focusedField === fieldName) {
      return `0px 0px 0px 2px rgba(232, 3, 121, 0.25)`
    }
    return 'none'
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#FDFDFD]">
      {/* Left Panel - White Background with Form */}
      <div className="w-full lg:w-1/2 flex flex-col items-center bg-white px-8 sm:px-12 py-6">
        {/* Logo at top center */}
        <div className="w-full flex justify-center mb-8">
          <div className="flex items-center gap-3">
            <div 
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{
                background: 'linear-gradient(180deg, #FF83AD 0%, #EA1059 100%)',
                boxShadow: '0px 0px 0px 1px #E60953, 0px 2px 5px -1px rgba(224, 36, 99, 0.3), inset 0px 1px 2px rgba(255, 255, 255, 0.65), inset 0px -1px 2.5px 0.25px #B9003E'
              }}
            >
              <img 
                src="/signup-logo.png" 
                alt="Logo" 
                className="w-6 h-6"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>
            <span className="text-xl font-semibold text-[#191919]">Joy AI</span>
          </div>
        </div>

        {/* Main Container */}
        <div className="w-full max-w-[440px] flex flex-col gap-6">
          {/* Title Container */}
          <div className="flex flex-col gap-3">
            <h1 className="text-[32px] font-medium text-[#191919] text-center leading-[40px]">
              Welcome back
            </h1>
            <p className="text-base text-[#A0A0A0] text-center leading-6">
              Sign in to your account to continue
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Email Input */}
            <div className="relative">
              <div 
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl transition-all"
                style={{
                  border: `1px solid ${getInputBorderColor('email', !!emailError)}`,
                  boxShadow: getInputShadow('email', !!emailError),
                  backgroundColor: '#FFFFFF'
                }}
              >
                {/* Mail Icon */}
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z" stroke="#B2B2B2" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="L22 6L12 13L2 6" stroke="#B2B2B2" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                
                <input
                  type="email"
                  value={email}
                  onChange={handleEmailChange}
                  onFocus={() => handleFieldFocus('email')}
                  onBlur={(e) => {
                    handleEmailBlur()
                    handleFieldBlur('email')
                  }}
                  placeholder="Enter your email"
                  className="flex-1 text-sm font-medium placeholder:text-[#B2B2B2] outline-none bg-transparent"
                  style={{ color: emailError ? ERROR_COLOR : '#191919' }}
                  autoComplete="email"
                  required
                />
              </div>
              {(focusedField === 'email' || email) && (
                <div 
                  className="absolute -top-3 left-[38px] px-1 bg-white z-10"
                  style={{ background: 'linear-gradient(180deg, #FDFDFD 50%, #FFFFFF 50%)' }}
                >
                  <span 
                    className="text-xs font-medium"
                    style={{ color: emailError ? ERROR_COLOR : '#B2B2B2' }}
                  >
                    Enter your email
                  </span>
                </div>
              )}
              {emailError && (
                <div className="flex items-center gap-1 mt-2">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 9V13M12 17H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke={ERROR_COLOR} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span className="text-xs font-medium" style={{ color: ERROR_COLOR }}>
                    {emailError}
                  </span>
                </div>
              )}
            </div>

            {/* Password Input */}
            <div className="relative">
              <div 
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl transition-all"
                style={{
                  border: `1px solid ${getInputBorderColor('password')}`,
                  boxShadow: getInputShadow('password'),
                  backgroundColor: '#FFFFFF'
                }}
              >
                {/* Lock Icon */}
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M19 11H5C3.89543 11 3 11.8954 3 13V20C3 21.1046 3.89543 22 5 22H19C20.1046 22 21 21.1046 21 20V13C21 11.8954 20.1046 11 19 11Z" stroke="#B2B2B2" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M7 11V7C7 5.67392 7.52678 4.40215 8.46447 3.46447C9.40215 2.52678 10.6739 2 12 2C13.3261 2 14.5979 2.52678 15.5355 3.46447C16.4732 4.40215 17 5.67392 17 7V11" stroke="#B2B2B2" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => handleFieldFocus('password')}
                  onBlur={() => handleFieldBlur('password')}
                  placeholder="Enter your password"
                  className="flex-1 text-sm font-medium text-[#191919] placeholder:text-[#B2B2B2] outline-none bg-transparent"
                  autoComplete="current-password"
                  required
                />
                
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="p-1.5 rounded-xl hover:bg-[#F5F5F5] transition-colors"
                >
                  {showPassword ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12C23 12 19 20 12 20C5 20 1 12 1 12Z" stroke="#191919" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" stroke="#191919" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M17.94 17.94C16.2306 19.243 14.1491 19.9649 12 20C5 20 1 12 1 12C2.24389 9.68192 3.96914 7.65663 6.06 6.06M9.9 4.24C10.5883 4.0789 11.2931 3.99836 12 4C19 4 23 12 23 12C22.393 13.1356 21.6691 14.2047 20.84 15.19M14.12 14.12C13.8454 14.4148 13.5141 14.6512 13.1462 14.8151C12.7782 14.9791 12.3809 15.0673 11.9781 15.0744C11.5753 15.0815 11.1747 15.0074 10.8016 14.8565C10.4286 14.7056 10.0887 14.4811 9.80385 14.1962C9.51897 13.9113 9.29441 13.5714 9.14351 13.1984C8.9926 12.8253 8.91853 12.4247 8.92564 12.0219C8.93275 11.6191 9.02091 11.2218 9.18488 10.8538C9.34884 10.4859 9.58525 10.1546 9.88 9.88" stroke="#191919" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M1 1L23 23" stroke="#191919" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </button>
              </div>
              {(focusedField === 'password' || password) && (
                <div 
                  className="absolute -top-3 left-[38px] px-1 bg-white z-10"
                  style={{ background: 'linear-gradient(180deg, #FDFDFD 50%, #FFFFFF 50%)' }}
                >
                  <span className="text-xs font-medium text-[#B2B2B2]">Enter your password</span>
                </div>
              )}
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between pl-2">
              <div className="flex items-center gap-2">
                <div className="relative">
                  <input
                    type="checkbox"
                    id="rememberMe"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="sr-only"
                  />
                  <label
                    htmlFor="rememberMe"
                    className={`w-5 h-5 rounded-md border flex items-center justify-center cursor-pointer transition-all ${
                      rememberMe ? 'border-transparent' : 'border-[#D4D4D4]'
                    }`}
                    style={{
                      backgroundColor: rememberMe ? PINK_COLOR : 'transparent'
                    }}
                  >
                    {rememberMe && (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M20 6L9 17L4 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </label>
                </div>
                <label htmlFor="rememberMe" className="text-sm font-medium text-[#B2B2B2] cursor-pointer">
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
              className="w-full flex items-center justify-center gap-2 py-2.5 px-3.5 rounded-xl text-sm font-semibold text-white transition-all"
              style={{
                backgroundColor: PINK_COLOR,
                opacity: isLoading ? 0.6 : 1,
                cursor: isLoading ? 'not-allowed' : 'pointer'
              }}
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Sign Up Link */}
            <div className="flex items-center justify-center gap-1">
              <span className="text-sm font-medium text-[#ADADAD]">
                Don't have an account?
              </span>
              <Link 
                to="/signup" 
                className="text-sm font-semibold hover:underline transition-colors"
                style={{ color: PINK_COLOR }}
              >
                Sign Up
              </Link>
            </div>
          </form>
        </div>
      </div>

      {/* Right Panel - Pink Background with Banner */}
      <div className="w-full lg:w-1/2 p-4 sm:p-6">
        <div 
          className="w-full h-full min-h-[420px] rounded-3xl overflow-hidden relative"
          style={{ backgroundColor: PINK_COLOR }}
        >
          <img 
            src="/signup-banner.png" 
            alt="Cleaning business illustration" 
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        </div>
      </div>
    </div>
  )
}
