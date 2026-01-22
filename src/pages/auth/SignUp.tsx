import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock, Eye, EyeOff, Check, AlertCircle, User, CheckCircle } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { signUp } from '../../features/auth/authApi'
import { clearError } from '../../features/auth/authSlice'

const PINK_COLOR = '#E80379'
const ERROR_COLOR = '#DE2928'
const SUCCESS_COLOR = '#12C4A1'

interface PasswordRequirements {
  minLength: boolean
  hasNumber: boolean
  hasSpecialChar: boolean
  noSpaces: boolean
}

export default function SignUp() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [agreeToTerms, setAgreeToTerms] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  
  // Focus states
  const [focusedField, setFocusedField] = useState<string | null>(null)
  
  // Validation states
  const [emailError, setEmailError] = useState('')
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set())
  
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { isLoading, error } = useAppSelector((state) => state.auth)

  useEffect(() => {
    dispatch(clearError())
  }, [dispatch])

  // Password requirements validation
  const passwordRequirements: PasswordRequirements = {
    minLength: password.length >= 8,
    hasNumber: /\d/.test(password),
    hasSpecialChar: /[$!@%&]/.test(password),
    noSpaces: !/^\s|\s$/.test(password),
  }

  const allPasswordRequirementsMet = Object.values(passwordRequirements).every(Boolean)
  const passwordsMatch = password === confirmPassword && confirmPassword.length > 0

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

  const isFormValid = 
    name.trim() !== '' &&
    email.trim() !== '' &&
    !emailError &&
    allPasswordRequirementsMet &&
    passwordsMatch &&
    agreeToTerms

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Mark all fields as touched
    setTouchedFields(new Set(['name', 'email', 'password', 'confirmPassword']))
    
    if (!validateEmail(email)) {
      return
    }

    if (!allPasswordRequirementsMet) {
      return
    }

    if (password !== confirmPassword) {
      return
    }

    if (!agreeToTerms) {
      return
    }

    const result = await dispatch(signUp({ name, email, password }))
    
    if (signUp.fulfilled.match(result)) {
      navigate('/signin')
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
              Welcome to <span style={{ color: PINK_COLOR }}>Joy AI</span>
            </h1>
            <p className="text-base text-[#A0A0A0] text-center leading-6">
              Start managing your cleaning business efficiently
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Full Name Input */}
            <div className="relative">
              <div 
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl transition-all"
                style={{
                  border: `1px solid ${getInputBorderColor('name')}`,
                  boxShadow: getInputShadow('name'),
                  backgroundColor: '#FFFFFF'
                }}
              >
                {/* Person Icon */}
                <User className="w-[22px] h-[22px] text-[#B2B2B2]" />
                
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onFocus={() => handleFieldFocus('name')}
                  onBlur={() => handleFieldBlur('name')}
                  placeholder="Enter your full name"
                  className="flex-1 text-sm font-medium text-[#191919] placeholder:text-[#B2B2B2] outline-none bg-transparent"
                  required
                />
              </div>
              {(focusedField === 'name' || name) && (
                <div 
                  className="absolute -top-3 left-[38px] px-1 bg-white z-10"
                  style={{ background: 'linear-gradient(180deg, #FDFDFD 50%, #FFFFFF 50%)' }}
                >
                  <span className="text-xs font-medium text-[#B2B2B2]">Enter your full name</span>
                </div>
              )}
            </div>

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
                  placeholder="Create your password"
                  className="flex-1 text-sm font-medium text-[#191919] placeholder:text-[#B2B2B2] outline-none bg-transparent"
                  autoComplete="new-password"
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
                  <span className="text-xs font-medium text-[#B2B2B2]">Create your password</span>
                </div>
              )}
            </div>

            {/* Confirm Password Input */}
            <div className="relative">
              <div 
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl transition-all"
                style={{
                  border: `1px solid ${getInputBorderColor('confirmPassword')}`,
                  boxShadow: getInputShadow('confirmPassword'),
                  backgroundColor: '#FFFFFF'
                }}
              >
                {/* Lock Icon */}
                <Lock className="w-[22px] h-[22px] text-[#B2B2B2]" />
                
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  onFocus={() => handleFieldFocus('confirmPassword')}
                  onBlur={() => handleFieldBlur('confirmPassword')}
                  placeholder="Confirm password"
                  className="flex-1 text-sm font-medium text-[#191919] placeholder:text-[#B2B2B2] outline-none bg-transparent"
                  autoComplete="new-password"
                  required
                />
                
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="p-1.5 rounded-xl hover:bg-[#F5F5F5] transition-colors"
                >
                  {showConfirmPassword ? (
                    <Eye className="w-5 h-5 text-[#191919]" />
                  ) : (
                    <EyeOff className="w-5 h-5 text-[#191919]" />
                  )}
                </button>
              </div>
              {(focusedField === 'confirmPassword' || confirmPassword) && (
                <div 
                  className="absolute -top-3 left-[38px] px-1 bg-white z-10"
                  style={{ background: 'linear-gradient(180deg, #FDFDFD 50%, #FFFFFF 50%)' }}
                >
                  <span className="text-xs font-medium" style={{ color: PINK_COLOR }}>Confirm password</span>
                </div>
              )}
            </div>

            {/* Password Requirements */}
            <div className="flex flex-col gap-1.5 pl-2">
              <h3 className="text-sm font-medium text-[#191919] leading-5">
                Password must include:
              </h3>
              <div className="flex flex-col gap-1.5">
                {[
                  { key: 'minLength', text: 'At least 8 characters', met: passwordRequirements.minLength },
                  { key: 'hasNumber', text: 'At least 1 number', met: passwordRequirements.hasNumber },
                  { key: 'hasSpecialChar', text: 'At least 1 special character (e.g., $, !, @, %, &)', met: passwordRequirements.hasSpecialChar },
                  { key: 'noSpaces', text: 'No leading or trailing spaces', met: passwordRequirements.noSpaces },
                ].map((req) => (
                  <div key={req.key} className="flex items-center gap-1">
                    {req.met ? (
                      <CheckCircle className="w-5 h-5" style={{ color: SUCCESS_COLOR }} />
                    ) : (
                      <div className="w-5 h-5 rounded-full border-2 border-[#B2B2B2] flex items-center justify-center">
                        <div className="w-1 h-1 rounded-full bg-[#B2B2B2]"></div>
                      </div>
                    )}
                    <span 
                      className="text-[13px] font-medium"
                      style={{ color: req.met ? SUCCESS_COLOR : '#B2B2B2' }}
                    >
                      {req.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Terms and Conditions */}
            <div className="flex items-center gap-2 pl-2">
              <div className="relative">
                <input
                  type="checkbox"
                  id="terms"
                  checked={agreeToTerms}
                  onChange={(e) => setAgreeToTerms(e.target.checked)}
                  className="sr-only"
                />
                <label
                  htmlFor="terms"
                  className={`w-5 h-5 rounded-md border flex items-center justify-center cursor-pointer transition-all ${
                    agreeToTerms ? 'border-transparent' : 'border-[#D4D4D4]'
                  }`}
                  style={{
                    backgroundColor: agreeToTerms ? PINK_COLOR : 'transparent'
                  }}
                >
                  {agreeToTerms && (
                    <Check className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
                  )}
                </label>
              </div>
              <label htmlFor="terms" className="text-[13px] font-medium text-[#B2B2B2] cursor-pointer">
                I agree{' '}
                <span className="font-semibold" style={{ color: PINK_COLOR }}>
                  Terms and Conditions
                </span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!isFormValid || isLoading}
              className="w-full flex items-center justify-center gap-2 py-2 px-3.5 rounded-xl text-sm font-semibold text-white transition-all"
              style={{
                backgroundColor: isFormValid ? PINK_COLOR : PINK_COLOR,
                opacity: isFormValid ? 1 : 0.4,
                cursor: isFormValid ? 'pointer' : 'not-allowed'
              }}
            >
              <User className="w-5 h-5 text-white" />
              <span>Sign up</span>
            </button>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Sign In Link */}
            <div className="flex items-center justify-center gap-1">
              <span className="text-[13px] font-medium text-[#ADADAD]">
                Already have an account?
              </span>
              <Link 
                to="/signin" 
                className="text-[13px] font-semibold hover:underline transition-colors"
                style={{ color: PINK_COLOR }}
              >
                Sign in
              </Link>
            </div>
          </form>
        </div>
      </div>

      {/* Right Panel - Pink Background with Banner */}
      <div className="w-full lg:w-1/2 p-4 sm:p-6">
        <div 
          className="w-full h-full min-h-[420px] rounded-3xl overflow-hidden flex items-center justify-center"
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
