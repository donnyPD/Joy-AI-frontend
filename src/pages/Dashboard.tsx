import { useAppSelector } from '../store/hooks'
import Navbar from '../components/Navbar'

export default function Dashboard() {
  const { user } = useAppSelector((state) => state.auth)

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

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
