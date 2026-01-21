import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useAppSelector } from '../store/hooks'
import Navbar from '../components/Navbar'

const cards = [
  {
    id: 'growth',
    title: 'Growth Automations',
    description: 'Manage and monitor your growth automation workflows',
    image: '/rocket.png'
  },
  {
    id: 'operations',
    title: 'Operations Automations',
    description: 'Manage and monitor your operations automation workflows',
    image: '/notes.png'
  },
  {
    id: 'services',
    title: 'Services Automations',
    description: 'Manage and monitor your services automation workflows',
    image: '/bucket.png'
  }
]

export default function Home() {
  const { user } = useAppSelector((state) => state.auth)
  const firstName = useMemo(() => {
    const name = user?.name?.trim()
    return name ? name.split(' ')[0] : 'there'
  }, [user?.name])

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="w-full px-2 sm:px-6 lg:px-10 py-10">
          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-3"
              style={{
                background: 'linear-gradient(180deg, #FF83AD 0%, #EA1059 100%)',
                boxShadow: '0px 0px 0px 1px #E60953, 0px 2px 6px -1px rgba(224, 36, 99, 0.3)'
              }}
            >
              <img src="/signup-logo.png" alt="Joy AI" className="w-7 h-7" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-semibold text-[#191919]">
              Hey <span className="text-[#E80379]">{firstName}</span>, how is your day?
            </h1>
            <p className="text-sm text-[#A0A0A0] mt-2">What would you like to do?</p>

            <div className="mt-6 flex items-center gap-2 w-full max-w-md">
              <input
                type="text"
                placeholder="What are you looking for?"
                className="flex-1 px-4 py-2.5 rounded-full border border-[#E7E7E7] text-sm focus:outline-none focus:ring-2 focus:ring-[#F3A6C9] focus:border-transparent"
              />
              <button
                type="button"
                className="px-4 py-2.5 rounded-full text-sm font-semibold text-white flex items-center gap-2"
                style={{ backgroundColor: '#E80379' }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 103.5 10.5a7.5 7.5 0 0013.15 6.15z" />
                </svg>
                Search
              </button>
            </div>
          </div>

          <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
            {cards.map((card) => (
              <Link
                key={card.id}
                to="/dashboard"
                className="group bg-[#FFEAF4] rounded-2xl p-6 border border-[#F7D6E5] shadow-sm transition-all cursor-pointer hover:-translate-y-1 hover:shadow-lg hover:border-[#F3A6C9] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F3A6C9] focus-visible:ring-offset-2"
              >
                <div className="flex justify-center">
                  <img
                    src={card.image}
                    alt={card.title}
                    className="w-24 h-24 object-contain transition-transform duration-200 group-hover:scale-105"
                  />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-[#191919]">{card.title}</h3>
                <p className="text-sm text-[#A0A0A0] mt-2">{card.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
