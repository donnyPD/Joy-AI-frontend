import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { fetchJobs } from '../features/jobs/jobsApi'
import SidebarLayout from '../components/SidebarLayout'

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

    // Only fetch if we're on the jobs route, user is authenticated, auth is loaded, and we haven't fetched for this visit
    if (
      location.pathname === '/jobs' &&
      user &&
      !isAuthLoading &&
      lastFetchedPathRef.current !== location.pathname
    ) {
      lastFetchedPathRef.current = location.pathname
      dispatch(fetchJobs({ limit: 100, skip: 0 }))
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
          <div className="text-lg text-gray-600">Loading jobs...</div>
        </div>
      </SidebarLayout>
    )
  }

  if (error) {
    return (
      <SidebarLayout>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-red-800 mb-2">Error Loading Jobs</h2>
          <p className="text-red-700">{error}</p>
        </div>
      </SidebarLayout>
    )
  }

  const columns = [
    { key: 'jobNumber', label: 'Job #' },
    { key: 'clientName', label: 'Client name' },
    { key: 'leadSource', label: 'Lead source' },
    { key: 'clientEmail', label: 'Client email' },
    { key: 'clientPhone', label: 'Client phone' },
    { key: 'billingStreet', label: 'Billing street' },
    { key: 'billingCity', label: 'Billing city' },
    { key: 'billingProvince', label: 'Billing province' },
    { key: 'billingZip', label: 'Billing ZIP' },
    { key: 'servicePropertyName', label: 'Service property name' },
    { key: 'serviceStreet', label: 'Service street' },
    { key: 'serviceCity', label: 'Service city' },
    { key: 'serviceProvince', label: 'Service province' },
    { key: 'serviceZip', label: 'Service ZIP' },
    { key: 'title', label: 'Title' },
    { key: 'createdDate', label: 'Created date' },
    { key: 'scheduleStartDate', label: 'Scheduled start date' },
    { key: 'closedDate', label: 'Closed date' },
    { key: 'salesperson', label: 'Salesperson' },
    { key: 'lineItems', label: 'Line items' },
    { key: 'visitsAssignedTo', label: 'Visits assigned to' },
    { key: 'invoiceNumbers', label: 'Invoice #s' },
    { key: 'quoteNumber', label: 'Quote #' },
    { key: 'onlineBooking', label: 'Online booking' },
    { key: 'expensesTotal', label: 'Expenses total ($)' },
    { key: 'timeTracked', label: 'Time tracked' },
    { key: 'labourCostTotal', label: 'Labour cost total ($)' },
    { key: 'lineItemCostTotal', label: 'Line item cost total ($)' },
    { key: 'totalCosts', label: 'Total costs ($)' },
    { key: 'quoteDiscount', label: 'Quote discount ($)' },
    { key: 'totalRevenue', label: 'Total revenue ($)' },
    { key: 'profit', label: 'Profit ($)' },
    { key: 'profitPercent', label: 'Profit %' },
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
    { key: 'typerOfProductsToUse', label: 'Typer of products to use:' },
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
    { key: 'startTime', label: 'Start Time' },
    { key: 'endTime', label: 'End Time' },
    { key: 'billingType', label: 'Billing type' },
    { key: 'visitFrequency', label: 'Visit frequency' },
    { key: 'billingFrequency', label: 'Billing frequency' },
    { key: 'automaticInvoicing', label: 'Automatic invoicing' },
    { key: 'total', label: 'Total ($)' },
    { key: 'completedVisits', label: 'Completed visits' },
    { key: 'numberOfInvoices', label: 'Number of invoices' },
    { key: 'scheduleEndDate', label: 'Schedule end date' },
    { key: 'replied', label: 'Replied' },
  ] as const

  return (
    <SidebarLayout>
      <div className="bg-white rounded-2xl border border-[#EFEFEF] shadow-sm px-6 sm:px-8 py-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Jobs</h1>

        {jobs.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <p className="text-gray-600">No jobs found.</p>
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
                  {jobs.map((job) => (
                    <tr key={job.id} className="hover:bg-gray-50">
                      {columns.map((column) => (
                        <td key={column.key} className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {(job as any)[column.key] || 'N/A'}
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
