import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
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
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12Z" stroke="#B2B2B2" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M20.59 22C20.59 18.13 16.74 15 12 15C7.26 15 3.41 18.13 3.41 22" stroke="#B2B2B2" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                
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
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z" stroke="#B2B2B2" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="L22 6L12 13L2 6" stroke="#B2B2B2" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                
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
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M19 11H5C3.89543 11 3 11.8954 3 13V20C3 21.1046 3.89543 22 5 22H19C20.1046 22 21 21.1046 21 20V13C21 11.8954 20.1046 11 19 11Z" stroke="#B2B2B2" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M7 11V7C7 5.67392 7.52678 4.40215 8.46447 3.46447C9.40215 2.52678 10.6739 2 12 2C13.3261 2 14.5979 2.52678 15.5355 3.46447C16.4732 4.40215 17 5.67392 17 7V11" stroke="#B2B2B2" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                
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
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="12" cy="12" r="10" stroke={SUCCESS_COLOR} strokeWidth="1.5"/>
                        <path d="M8 12L11 15L16 9" stroke={SUCCESS_COLOR} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
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
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M20 6L9 17L4 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
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
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M16 7C16 9.20914 14.2091 11 12 11C9.79086 11 8 9.20914 8 7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7Z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 14C8.13401 14 5 17.134 5 21H19C19 17.134 15.866 14 12 14Z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M19 11V7C19 4.79086 16.7614 3 14.5 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
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
