import { useEffect, useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { fetchVisits } from '../features/visits/visitsApi'
import SidebarLayout from '../components/SidebarLayout'

const PINK_COLOR = '#E91E63'

export default function Visits() {
  const dispatch = useAppDispatch()
  const location = useLocation()
  const { visits, isLoading, error } = useAppSelector((state) => state.visits)
  const { user, isLoading: isAuthLoading } = useAppSelector((state) => state.auth)
  const lastFetchedPathRef = useRef<string>('')

  useEffect(() => {
    // Reset ref when leaving the route
    if (location.pathname !== '/visits') {
      lastFetchedPathRef.current = ''
      return
    }

    // Only fetch if we're on the visits route, user is authenticated, auth is loaded, and we haven't fetched for this visit
    if (
      location.pathname === '/visits' &&
      user &&
      !isAuthLoading &&
      lastFetchedPathRef.current !== location.pathname
    ) {
      lastFetchedPathRef.current = location.pathname
      dispatch(fetchVisits({ limit: 100, skip: 0 }))
    }
  }, [dispatch, user, isAuthLoading, location.pathname])

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

  if (isLoading) {
    return (
      <SidebarLayout>
        <div className="flex items-center justify-center h-[calc(100vh-10rem)]">
          <div className="text-lg text-gray-600">Loading visits...</div>
        </div>
      </SidebarLayout>
    )
  }

  if (error) {
    return (
      <SidebarLayout>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-red-800 mb-2">Error Loading Visits</h2>
          <p className="text-red-700">{error}</p>
        </div>
      </SidebarLayout>
    )
  }

  const columns = [
    { key: 'jobNumber', label: 'Job #' },
    { key: 'date', label: 'Date' },
    { key: 'times', label: 'Times' },
    { key: 'visitTitle', label: 'Visit title' },
    { key: 'clientName', label: 'Client name' },
    { key: 'clientEmail', label: 'Client email' },
    { key: 'clientPhone', label: 'Client phone' },
    { key: 'servicePropertyName', label: 'Service property name' },
    { key: 'serviceStreet', label: 'Service street' },
    { key: 'serviceCity', label: 'Service city' },
    { key: 'serviceProvince', label: 'Service province' },
    { key: 'serviceZip', label: 'Service ZIP' },
    { key: 'visitCompletedDate', label: 'Visit completed date' },
    { key: 'assignedTo', label: 'Assigned to' },
    { key: 'lineItems', label: 'Line items' },
    { key: 'oneOffJob', label: 'One-off job ($)' },
    { key: 'visitBased', label: 'Visit based ($)' },
    { key: 'scheduleDuration', label: 'Schedule duration' },
    { key: 'timeTracked', label: 'Time tracked' },
    { key: 'jobType', label: 'Job type' },
    { key: 'typeOfProperty', label: 'Type of Property' },
    { key: 'frequency', label: 'Frequency' },
    { key: 'referredBy', label: 'Referred by' },
    { key: 'birthdayMonth', label: 'Birthday Month' },
    { key: 'typeOfCleaning', label: 'Type of Cleaning' },
    { key: 'hours', label: 'Hours' },
    { key: 'cleaningInstructions', label: 'Cleaning Instructions' },
    { key: 'howToGetInTheHouse', label: 'How to get in the house' },
    { key: 'detailToGetInTheHouse', label: 'Detail to get in the house:' },
    { key: 'cleanInsideOfTheStove', label: 'Clean inside of the stove' },
    { key: 'cleanInsideOfTheFridge', label: 'Clean inside of the fridge' },
    { key: 'windowsToBeCleaned', label: 'Windows to be cleaned' },
    { key: 'glassDoorsToBeCleaned', label: 'Glass doors to be cleaned' },
    { key: 'typerOfProductsToUse', label: 'Type of products to use:' },
    { key: 'squareFoot', label: 'Square Foot' },
    { key: 'exactSqFt', label: 'Exact SqFt' },
    { key: 'zone', label: 'Zone' },
    { key: 'parkingDetails', label: 'Parking details' },
    { key: 'responsibidProfile', label: 'ResponsiBid Profile' },
    { key: 'preferredTimeOfContact', label: 'Preferred Time of Contact' },
    { key: 'additionalInstructions', label: 'Additional instructions' },
    { key: 'pets', label: 'Pets' },
    { key: 'clientsProductsNotes', label: "Client's Products Notes" },
    { key: 'trashCanInventory', label: 'Trash can Inventory' },
    { key: 'changeSheets', label: 'Change Sheets?' },
    { key: 'cleaningTech', label: 'Cleaning Tech' },
  ] as const

  return (
    <SidebarLayout>
      <div className="bg-white rounded-2xl border border-[#EFEFEF] shadow-sm px-6 sm:px-8 py-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Visits</h1>

        {visits.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <p className="text-gray-600">No visits found.</p>
            {!user?.jobberAccessToken && (
              <div className="mt-4">
                <p className="text-gray-500 mb-4">
                  Connect your Jobber account in Settings to sync visits automatically.
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
                  {visits.map((visit) => (
                    <tr key={visit.id} className="hover:bg-gray-50">
                      {columns.map((column) => (
                        <td key={column.key} className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {(visit as any)[column.key] || 'N/A'}
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
