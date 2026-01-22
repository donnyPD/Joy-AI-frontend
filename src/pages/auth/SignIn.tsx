import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock, Eye, EyeOff, Check, AlertCircle } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { signIn, getMe } from '../../features/auth/authApi'
import { clearError } from '../../features/auth/authSlice'

const PINK_COLOR = '#E80379'
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
      if (user.isSubscribed) {
        navigate('/dashboard')
      } else {
        navigate('/choose-plan')
      }
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
            <img 
              src="/signup-logo.png" 
              alt="Logo" 
              className="w-9 h-9"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
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
                <Mail className="w-[22px] h-[22px] text-[#B2B2B2]" />
                
                <input
                  type="email"
                  value={email}
                  onChange={handleEmailChange}
                  onFocus={() => handleFieldFocus('email')}
                  onBlur={() => {
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
                  <AlertCircle className="w-4 h-4" style={{ color: ERROR_COLOR }} />
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
                <Lock className="w-[22px] h-[22px] text-[#B2B2B2]" />
                
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
                    <Eye className="w-5 h-5 text-[#191919]" />
                  ) : (
                    <EyeOff className="w-5 h-5 text-[#191919]" />
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
                      <Check className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
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
