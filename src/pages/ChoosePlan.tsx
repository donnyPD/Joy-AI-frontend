import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppSelector } from '../store/hooks'

const PINK_COLOR = '#E80379'

interface Plan {
  id: string
  name: string
  price: string
  description: string
  features: string[]
  popular?: boolean
}

const plans: Plan[] = [
  {
    id: 'free-trial',
    name: 'Free Trial',
    price: '$0',
    description: 'Perfect for trying out our platform',
    features: [
      '14-day free trial',
      'Basic features access',
      'Email support',
      'Up to 5 team members'
    ]
  },
  {
    id: 'tier-1',
    name: 'Tier 1',
    price: '$29',
    description: 'Great for small businesses',
    features: [
      'All basic features',
      'Priority support',
      'Up to 10 team members',
      'Monthly reports'
    ]
  },
  {
    id: 'tier-2',
    name: 'Tier 2',
    price: '$79',
    description: 'Ideal for growing teams',
    features: [
      'All Tier 1 features',
      'Advanced analytics',
      'Up to 25 team members',
      'Custom integrations',
      'Dedicated support'
    ],
    popular: true
  },
  {
    id: 'tier-3',
    name: 'Tier 3',
    price: '$149',
    description: 'For large enterprises',
    features: [
      'All Tier 2 features',
      'Unlimited team members',
      'White-label options',
      'API access',
      '24/7 phone support',
      'Custom training'
    ]
  }
]

export default function ChoosePlan() {
  const navigate = useNavigate()
  const { isAuthenticated } = useAppSelector((state) => state.auth)
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/signin')
    }
  }, [isAuthenticated, navigate])

  const handlePlanSelect = async (planId: string) => {
    setSelectedPlan(planId)
    setIsLoading(true)
    
    // Simulate API call or plan selection logic
    // In a real app, you would save the selected plan here
    setTimeout(() => {
      setIsLoading(false)
      navigate('/intergation')
    }, 500)
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-[#FDFDFD] overflow-hidden">
      {/* Logo at top center */}
      <div className="w-full flex justify-center mb-4 pt-8">
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
      <div className="w-full max-w-[1400px] flex flex-col gap-4 px-8 sm:px-12 flex-1 overflow-y-auto">
        {/* Title Container */}
        <div className="flex flex-col gap-2 text-center">
          <h1 className="text-[28px] font-medium text-[#191919] leading-[36px]">
            Choose your <span style={{ color: PINK_COLOR }}>plan</span>
          </h1>
          <p className="text-sm text-[#A0A0A0] leading-5">
            Select the perfect plan for your cleaning business
          </p>
        </div>

        {/* Plans - Horizontal Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {plans.map((plan) => (
              <div
                key={plan.id}
                onClick={() => handlePlanSelect(plan.id)}
                className={`relative bg-white rounded-xl border-2 transition-all cursor-pointer hover:shadow-xl hover:-translate-y-1 min-h-[420px] ${
                  selectedPlan === plan.id
                    ? 'border-[#E80379] shadow-xl scale-105'
                    : plan.popular
                    ? 'border-[#E80379] shadow-lg'
                    : 'border-[#E7E7E7]'
                } ${isLoading ? 'opacity-50 pointer-events-none' : ''}`}
                style={{
                  boxShadow: selectedPlan === plan.id 
                    ? '0px 0px 0px 2px rgba(232, 3, 121, 0.25), 0px 8px 24px rgba(232, 3, 121, 0.2)' 
                    : plan.popular 
                    ? '0px 4px 16px rgba(232, 3, 121, 0.15)' 
                    : '0px 2px 8px rgba(0, 0, 0, 0.08)'
                }}
              >
                {plan.popular && (
                  <div 
                    className="absolute -top-3 left-1/2 transform -translate-x-1/2 px-3 py-1 rounded-full text-xs font-semibold text-white"
                    style={{ backgroundColor: PINK_COLOR }}
                  >
                    Most Popular
                  </div>
                )}
                
                <div className="p-5 flex flex-col h-full">
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-[#191919] mb-1">
                      {plan.name}
                    </h3>
                    <p className="text-xs text-[#A0A0A0] mb-3">
                      {plan.description}
                    </p>
                  </div>
                  
                  <div className="mb-4">
                    <span className="text-2xl font-bold text-[#191919]">
                      {plan.price}
                    </span>
                    {plan.price !== '$0' && (
                      <span className="text-xs text-[#A0A0A0] ml-1">/month</span>
                    )}
                  </div>

                  <ul className="space-y-2 mb-5 flex-grow">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-1.5">
                        <svg 
                          width="16" 
                          height="16" 
                          viewBox="0 0 24 24" 
                          fill="none" 
                          xmlns="http://www.w3.org/2000/svg"
                          className="mt-0.5 flex-shrink-0"
                        >
                          <circle cx="12" cy="12" r="10" stroke={PINK_COLOR} strokeWidth="1.5"/>
                          <path d="M8 12L11 15L16 9" stroke={PINK_COLOR} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        <span className="text-xs text-[#191919] leading-4">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    type="button"
                    className={`w-full py-2 px-3 rounded-xl text-xs font-semibold transition-all ${
                      selectedPlan === plan.id || plan.popular
                        ? 'text-white'
                        : 'text-[#E80379] border-2'
                    }`}
                    style={{
                      backgroundColor: selectedPlan === plan.id || plan.popular ? PINK_COLOR : 'transparent',
                      borderColor: selectedPlan === plan.id || plan.popular ? 'transparent' : PINK_COLOR
                    }}
                    onMouseEnter={(e) => {
                      if (!selectedPlan && !plan.popular) {
                        e.currentTarget.style.backgroundColor = PINK_COLOR
                        e.currentTarget.style.color = 'white'
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!selectedPlan && !plan.popular) {
                        e.currentTarget.style.backgroundColor = 'transparent'
                        e.currentTarget.style.color = PINK_COLOR
                      }
                    }}
                  >
                    {isLoading && selectedPlan === plan.id ? 'Processing...' : selectedPlan === plan.id ? 'Selected' : 'Select Plan'}
                  </button>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  )
}
