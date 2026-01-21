import { useEffect, useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { fetchQuotes } from '../features/quotes/quotesApi'
import SidebarLayout from '../components/SidebarLayout'

const PINK_COLOR = '#E91E63'

export default function Quotes() {
  const dispatch = useAppDispatch()
  const location = useLocation()
  const { quotes, isLoading, error } = useAppSelector((state) => state.quotes)
  const { user, isLoading: isAuthLoading } = useAppSelector((state) => state.auth)
  const lastFetchedPathRef = useRef<string>('')

  useEffect(() => {
    // Reset ref when leaving the route
    if (location.pathname !== '/quotes') {
      lastFetchedPathRef.current = ''
      return
    }

    // Only fetch if we're on the quotes route, user has token, auth is loaded, and we haven't fetched for this visit
    if (
      location.pathname === '/quotes' &&
      user?.jobberAccessToken &&
      !isAuthLoading &&
      lastFetchedPathRef.current !== location.pathname
    ) {
      lastFetchedPathRef.current = location.pathname
      dispatch(fetchQuotes({ first: 20 }))
    }
  }, [dispatch, user?.jobberAccessToken, isAuthLoading, location.pathname])

  // Show loading state while auth is being fetched
  if (isAuthLoading) {
    return (
      <SidebarLayout>
        <div className="flex items-center justify-center h-[calc(100vh-10rem)]">
          <div className="text-lg text-gray-600">Loading...</div>
        </div>
      </SidebarLayout>
    )
  }

  if (!user?.jobberAccessToken) {
    return (
      <SidebarLayout>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-yellow-800 mb-2">Jobber Not Connected</h2>
          <p className="text-yellow-700 mb-4">
            Please connect your Jobber account in Integrations to view quotes.
          </p>
          <Link
            to="/intergation"
            className="inline-block px-4 py-2 text-white font-medium rounded-lg"
            style={{ backgroundColor: PINK_COLOR }}
          >
            Go to Integrations
          </Link>
        </div>
      </SidebarLayout>
    )
  }

  if (isLoading) {
    return (
      <SidebarLayout>
        <div className="flex items-center justify-center h-[calc(100vh-10rem)]">
          <div className="text-lg text-gray-600">Loading quotes...</div>
        </div>
      </SidebarLayout>
    )
  }

  if (error) {
    return (
      <SidebarLayout>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-red-800 mb-2">Error Loading Quotes</h2>
          <p className="text-red-700">{error}</p>
        </div>
      </SidebarLayout>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const formatAddress = (property: any) => {
    if (!property?.address) return 'N/A'
    const parts = [
      property.address.street,
      property.address.city,
      property.address.province,
      property.address.postalCode,
    ].filter(Boolean)
    return parts.length > 0 ? parts.join(', ') : 'N/A'
  }

  const getStatusColor = (status: string) => {
    const statusColors: Record<string, string> = {
      DRAFT: 'bg-gray-100 text-gray-800',
      SENT: 'bg-blue-100 text-blue-800',
      APPROVED: 'bg-green-100 text-green-800',
      REJECTED: 'bg-red-100 text-red-800',
    }
    return statusColors[status] || 'bg-gray-100 text-gray-800'
  }

  return (
    <SidebarLayout>
      <div className="bg-white rounded-2xl border border-[#EFEFEF] shadow-sm px-6 sm:px-8 py-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Quotes</h1>

        {quotes.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <p className="text-gray-600">No quotes found.</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quote #
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Title
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Client
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Property
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {quotes.map((quote) => (
                    <tr key={quote.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{quote.quoteNumber}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{quote.title || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{quote.client?.name || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-500">{formatAddress(quote.property)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          ${parseFloat(quote.amounts?.total || '0').toFixed(2)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(quote.quoteStatus)}`}>
                          {quote.quoteStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{formatDate(quote.createdAt)}</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </SidebarLayout>
  )
}
