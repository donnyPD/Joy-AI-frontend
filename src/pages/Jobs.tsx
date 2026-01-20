import { useEffect, useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { fetchJobs } from '../features/jobs/jobsApi'
import Navbar from '../components/Navbar'

const PINK_COLOR = '#E91E63'

export default function Jobs() {
  const dispatch = useAppDispatch()
  const location = useLocation()
  const { jobs, isLoading, error } = useAppSelector((state) => state.jobs)
  const { user, isLoading: isAuthLoading } = useAppSelector((state) => state.auth)
  const lastFetchedPathRef = useRef<string>('')

  useEffect(() => {
    // Reset ref when leaving the route
    if (location.pathname !== '/jobs') {
      lastFetchedPathRef.current = ''
      return
    }

    // Only fetch if we're on the jobs route, user has token, auth is loaded, and we haven't fetched for this visit
    if (
      location.pathname === '/jobs' &&
      user?.jobberAccessToken &&
      !isAuthLoading &&
      lastFetchedPathRef.current !== location.pathname
    ) {
      lastFetchedPathRef.current = location.pathname
      dispatch(fetchJobs({ first: 20 }))
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
              Please connect your Jobber account in Settings to view jobs.
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
        <div className="text-lg text-gray-600">Loading jobs...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-red-800 mb-2">Error Loading Jobs</h2>
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  const formatDateTime = (dateString: string | null) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
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
      SCHEDULED: 'bg-blue-100 text-blue-800',
      IN_PROGRESS: 'bg-yellow-100 text-yellow-800',
      COMPLETED: 'bg-green-100 text-green-800',
      CANCELLED: 'bg-red-100 text-red-800',
      CLOSED: 'bg-gray-100 text-gray-800',
    }
    return statusColors[status] || 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Jobs</h1>

        {jobs.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <p className="text-gray-600">No jobs found.</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Job #
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
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Start Date
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {jobs.map((job) => (
                    <tr key={job.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{job.jobNumber}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{job.title || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{job.client?.name || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-500">{formatAddress(job.property)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{job.jobType || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(job.jobStatus)}`}>
                          {job.jobStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{formatDateTime(job.startAt)}</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
