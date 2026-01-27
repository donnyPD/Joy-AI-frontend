import { useEffect, useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { fetchTimesheets } from '../features/timesheets/timesheetsApi'
import SidebarLayout from '../components/SidebarLayout'

const PINK_COLOR = '#E91E63'

export default function Timesheets() {
  const dispatch = useAppDispatch()
  const location = useLocation()
  const { timesheets, isLoading, error } = useAppSelector((state) => state.timesheets)
  const { user, isLoading: isAuthLoading } = useAppSelector((state) => state.auth)
  const lastFetchedPathRef = useRef<string>('')

  useEffect(() => {
    if (location.pathname !== '/timesheets') {
      lastFetchedPathRef.current = ''
      return
    }

    if (
      location.pathname === '/timesheets' &&
      user &&
      !isAuthLoading &&
      lastFetchedPathRef.current !== location.pathname
    ) {
      lastFetchedPathRef.current = location.pathname
      dispatch(fetchTimesheets({ limit: 100, skip: 0 }))
    }
  }, [dispatch, user, isAuthLoading, location.pathname])

  if (isAuthLoading) {
    return (
      <SidebarLayout>
        <div className="flex items-center justify-center h-[calc(100vh-10rem)]">
          <div className="text-lg text-gray-600">Loading...</div>
        </div>
      </SidebarLayout>
    )
  }

  if (isLoading) {
    return (
      <SidebarLayout>
        <div className="flex items-center justify-center h-[calc(100vh-10rem)]">
          <div className="text-lg text-gray-600">Loading timesheets...</div>
        </div>
      </SidebarLayout>
    )
  }

  if (error) {
    return (
      <SidebarLayout>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-red-800 mb-2">Error Loading Timesheets</h2>
          <p className="text-red-700">{error}</p>
        </div>
      </SidebarLayout>
    )
  }

  const columns = [
    { key: 'userName', label: 'Name' },
    { key: 'date', label: 'Date' },
    { key: 'startTime', label: 'Start time' },
    { key: 'endTime', label: 'End time' },
    { key: 'hours', label: 'Hours' },
    { key: 'workingOn', label: 'Working on' },
    { key: 'note', label: 'Note' },
    { key: 'clientName', label: 'Client name' },
  ] as const

  return (
    <SidebarLayout>
      <div className="bg-white rounded-2xl border border-[#EFEFEF] shadow-sm px-6 sm:px-8 py-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Timesheets</h1>

        {timesheets.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <p className="text-gray-600">No timesheets found.</p>
            {!user?.jobberAccessToken && (
              <div className="mt-4">
                <p className="text-gray-500 mb-4">
                  Connect your Jobber account to sync timesheets automatically.
                </p>
                <Link
                  to="/settings"
                  className="inline-block px-4 py-2 text-white font-medium rounded-lg"
                  style={{ backgroundColor: PINK_COLOR }}
                >
                  Go to Settings
                </Link>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto overflow-y-auto max-h-[calc(100vh-200px)]">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {columns.map((column) => (
                      <th
                        key={column.key}
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        {column.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {timesheets.map((timesheet) => (
                    <tr key={timesheet.id} className="hover:bg-gray-50">
                      {columns.map((column) => (
                        <td key={column.key} className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {(timesheet as any)[column.key] || 'N/A'}
                          </div>
                        </td>
                      ))}
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
