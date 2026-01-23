import { useEffect, useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { fetchInvoices } from '../features/invoices/invoicesApi'
import SidebarLayout from '../components/SidebarLayout'

const PINK_COLOR = '#E91E63'

export default function Invoices() {
  const dispatch = useAppDispatch()
  const location = useLocation()
  const { invoices, isLoading, error } = useAppSelector((state) => state.invoices)
  const { user, isLoading: isAuthLoading } = useAppSelector((state) => state.auth)
  const lastFetchedPathRef = useRef<string>('')

  useEffect(() => {
    // Reset ref when leaving the route
    if (location.pathname !== '/invoices') {
      lastFetchedPathRef.current = ''
      return
    }

    // Only fetch if we're on the invoices route, user is authenticated, auth is loaded, and we haven't fetched for this visit
    if (
      location.pathname === '/invoices' &&
      user &&
      !isAuthLoading &&
      lastFetchedPathRef.current !== location.pathname
    ) {
      lastFetchedPathRef.current = location.pathname
      dispatch(fetchInvoices({ limit: 100, skip: 0 }))
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
          <div className="text-lg text-gray-600">Loading invoices...</div>
        </div>
      </SidebarLayout>
    )
  }

  if (error) {
    return (
      <SidebarLayout>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-red-800 mb-2">Error Loading Invoices</h2>
          <p className="text-red-700">{error}</p>
        </div>
      </SidebarLayout>
    )
  }

  const columns = [
    { key: 'invoiceNumber', label: 'Invoice #' },
    { key: 'clientName', label: 'Client name' },
    { key: 'leadSource', label: 'Lead source' },
    { key: 'clientEmail', label: 'Client email' },
    { key: 'clientPhone', label: 'Client phone' },
    { key: 'sentTo', label: 'Sent to' },
    { key: 'billingStreet', label: 'Billing street' },
    { key: 'billingCity', label: 'Billing city' },
    { key: 'billingProvince', label: 'Billing province' },
    { key: 'billingZip', label: 'Billing ZIP' },
    { key: 'servicePropertyName', label: 'Service property name' },
    { key: 'serviceStreet', label: 'Service street' },
    { key: 'serviceCity', label: 'Service city' },
    { key: 'serviceProvince', label: 'Service province' },
    { key: 'serviceZip', label: 'Service ZIP' },
    { key: 'subject', label: 'Subject' },
    { key: 'createdDate', label: 'Created date' },
    { key: 'issuedDate', label: 'Issued date' },
    { key: 'dueDate', label: 'Due date' },
    { key: 'lateBy', label: 'Late by' },
    { key: 'salesperson', label: 'Salesperson' },
    { key: 'markedPaidDate', label: 'Marked paid date' },
    { key: 'daysToPaid', label: 'Days to paid' },
    { key: 'lastContacted', label: 'Last contacted' },
    { key: 'visitsAssignedTo', label: 'Visits assigned to' },
    { key: 'jobNumbers', label: 'Job #s' },
    { key: 'status', label: 'Status' },
    { key: 'lineItems', label: 'Line items' },
    { key: 'preTaxTotal', label: 'Pre-tax total ($)' },
    { key: 'total', label: 'Total ($)' },
    { key: 'tip', label: 'Tip ($)' },
    { key: 'balance', label: 'Balance ($)' },
    { key: 'taxPercent', label: 'Tax (%)' },
    { key: 'deposit', label: 'Deposit $' },
    { key: 'discount', label: 'Discount ($)' },
    { key: 'taxAmount', label: 'Tax amount ($)' },
    { key: 'viewedInClientHub', label: 'Viewed in client hub' },
    { key: 'referredBy', label: 'Referred by' },
    { key: 'cleaningTechAssigned', label: 'Cleaning Tech Assigned' },
    { key: 'birthdayMonth', label: 'Birthday Month' },
    { key: 'frequency', label: 'Frequency' },
    { key: 'typeOfProperty', label: 'Type of Property' },
    { key: 'parkingDetails', label: 'Parking details' },
    { key: 'squareFoot', label: 'Square Foot' },
    { key: 'exactSqFt', label: 'Exact SqFt' },
    { key: 'preferredTimeOfContact', label: 'Preferred Time of Contact' },
    { key: 'zone', label: 'Zone' },
    { key: 'cleaningTech', label: 'Cleaning Tech' },
  ] as const

  return (
    <SidebarLayout>
      <div className="bg-white rounded-2xl border border-[#EFEFEF] shadow-sm px-6 sm:px-8 py-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Invoices</h1>

        {invoices.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <p className="text-gray-600">No invoices found.</p>
            {!user?.jobberAccessToken && (
              <div className="mt-4">
                <p className="text-gray-500 mb-4">
                  Connect your Jobber account to sync invoices automatically.
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
                  {invoices.map((invoice) => (
                    <tr key={invoice.id} className="hover:bg-gray-50">
                      {columns.map((column) => (
                        <td key={column.key} className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {(invoice as any)[column.key] || 'N/A'}
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
