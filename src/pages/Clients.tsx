import { useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { logout } from '../features/auth/authSlice'
import { fetchClients } from '../features/clients/clientsApi'

const PINK_COLOR = '#E91E63'

export default function Clients() {
  const dispatch = useAppDispatch()
  const { clients, isLoading, error } = useAppSelector((state) => state.clients)
  const { user } = useAppSelector((state) => state.auth)
  const hasRequested = useRef(false)
  const navigate = useNavigate()

  const handleSignOut = () => {
    dispatch(logout())
    navigate('/signin')
  }

  useEffect(() => {
    console.log('🔍 Clients page - useEffect triggered', { 
      hasJobberToken: !!user?.jobberAccessToken,
      userId: user?.id 
    })
    
    if (user?.jobberAccessToken && !hasRequested.current && clients.length === 0 && !isLoading) {
      console.log('📡 Dispatching fetchClients...')
      hasRequested.current = true
      dispatch(fetchClients({ first: 20 }))
    } else if (!user?.jobberAccessToken) {
      console.log('⚠️ No Jobber access token found')
    } else {
      console.log('ℹ️ Clients fetch skipped (already requested or data present)')
    }
  }, [dispatch, user?.jobberAccessToken, clients.length, isLoading])

  if (!user?.jobberAccessToken) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-yellow-800 mb-2">Jobber Not Connected</h2>
            <p className="text-yellow-700 mb-4">
              Please connect your Jobber account in Settings to view clients.
            </p>
            <Link
              to="/settings"
              className="inline-block px-4 py-2 text-white font-medium rounded-lg"
              style={{ backgroundColor: PINK_COLOR }}
            >
              Go to Settings
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg text-gray-600">Loading clients...</div>
      </div>
    )
  }

  if (error) {
    const isRateLimit = error.includes('rate limit') || error.includes('RATE_LIMIT')
    
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className={`${isRateLimit ? 'bg-yellow-50 border-yellow-200' : 'bg-red-50 border-red-200'} border rounded-lg p-6`}>
            <h2 className={`text-lg font-semibold mb-2 ${isRateLimit ? 'text-yellow-800' : 'text-red-800'}`}>
              {isRateLimit ? 'Rate Limit Exceeded' : 'Error Loading Clients'}
            </h2>
            <p className={isRateLimit ? 'text-yellow-700' : 'text-red-700'}>
              {error}
            </p>
            {isRateLimit && (
              <p className="text-yellow-600 text-sm mt-2">
                Please wait a few moments and try again. Jobber API has rate limits to prevent abuse.
              </p>
            )}
          </div>
        </div>
      </div>
    )
  }

  const formatAddress = (address: any) => {
    if (!address) return 'N/A'
    const parts = [address.street, address.city, address.province, address.postalCode].filter(Boolean)
    return parts.length > 0 ? parts.join(', ') : 'N/A'
  }

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
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Clients</h1>

        {clients.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <p className="text-gray-600">No clients found.</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Phone
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Address
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tags
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {clients.map((client) => {
                    const primaryEmail = client.emails?.find((e) => e.primary)?.address || client.emails?.[0]?.address
                    const primaryPhone = client.phones?.find((p) => p.primary)?.number || client.phones?.[0]?.number

                    return (
                      <tr key={client.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{client.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{primaryEmail || 'N/A'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{primaryPhone || 'N/A'}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-500">{formatAddress(client.billingAddress)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-wrap gap-1">
                            {client.tags?.nodes?.map((tag) => (
                              <span
                                key={tag.id}
                                className="px-2 py-1 text-xs rounded-full"
                                style={{ backgroundColor: `${PINK_COLOR}20`, color: PINK_COLOR }}
                              >
                                {tag.label}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 text-xs rounded-full ${
                              client.isArchived
                                ? 'bg-gray-100 text-gray-800'
                                : 'bg-green-100 text-green-800'
                            }`}
                          >
                            {client.isArchived ? 'Archived' : 'Active'}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
