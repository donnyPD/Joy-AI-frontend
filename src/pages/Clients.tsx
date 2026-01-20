import { useEffect, useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { fetchClients } from '../features/clients/clientsApi'
import Navbar from '../components/Navbar'

const PINK_COLOR = '#E91E63'

export default function Clients() {
  const dispatch = useAppDispatch()
  const location = useLocation()
  const { clients, isLoading, error } = useAppSelector((state) => state.clients)
  const { user, isLoading: isAuthLoading } = useAppSelector((state) => state.auth)
  const lastFetchedPathRef = useRef<string>('')

  useEffect(() => {
    // Reset ref when leaving the route
    if (location.pathname !== '/clients') {
      lastFetchedPathRef.current = ''
      return
    }

    // Only fetch if we're on the clients route, user has token, auth is loaded, and we haven't fetched for this visit
    if (
      location.pathname === '/clients' &&
      user?.jobberAccessToken &&
      !isAuthLoading &&
      lastFetchedPathRef.current !== location.pathname
    ) {
      lastFetchedPathRef.current = location.pathname
      dispatch(fetchClients({ first: 20 }))
    }
  }, [dispatch, user?.jobberAccessToken, isAuthLoading, location.pathname])

  // Show loading state while auth is being fetched
  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
          <div className="text-lg text-gray-600">Loading...</div>
        </div>
      </div>
    )
  }

  if (!user?.jobberAccessToken) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
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
      <Navbar />

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
