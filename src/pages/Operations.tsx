import { Link, useNavigate } from 'react-router-dom'
import { useAppDispatch } from '../store/hooks'
import { logout } from '../features/auth/authSlice'
import { useQuery } from '@tanstack/react-query'
import api from '../services/api'

interface TeamMember {
  id: string
  name: string
  [key: string]: any
}

export default function Operations() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  const handleSignOut = () => {
    dispatch(logout())
    navigate('/signin')
  }

  // Fetch team members from API
  const { data: teamMembers } = useQuery<TeamMember[]>({
    queryKey: ['/team-members'],
    queryFn: async () => {
      const response = await api.get<TeamMember[]>('/team-members')
      return response.data
    },
  })

  const teamMembersCount = teamMembers?.length || 0

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <Link to="/dashboard" className="text-xl font-bold text-gray-900">
                JOY AI
              </Link>
              <Link to="/clients" className="text-gray-700 hover:text-gray-900 font-medium">
                Clients
              </Link>
              <Link to="/quotes" className="text-gray-700 hover:text-gray-900 font-medium">
                Quotes
              </Link>
              <Link to="/jobs" className="text-gray-700 hover:text-gray-900 font-medium">
                Jobs
              </Link>
              <Link to="/operations" className="text-gray-700 hover:text-gray-900 font-medium">
                Operations
              </Link>
            </div>
            <div className="flex items-center">
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Operations</h1>

        {/* JOY Team Card */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link to="/operations/team" className="block">
            <div className="bg-white rounded-lg shadow-sm border border-blue-200 hover:shadow-lg hover:scale-105 transition-all duration-300 cursor-pointer group">
              <div className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <svg
                      className="w-6 h-6 text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                      />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                      JOY Team
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Manage team members and access
                    </p>
                  </div>
                  <svg
                    className="w-5 h-5 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between text-xs text-gray-600">
                    <span className="text-2xl font-bold text-gray-900">
                      {teamMembersCount}
                    </span>
                    <span className="text-gray-500">Total Members</span>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}
