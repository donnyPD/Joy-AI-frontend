import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { fetchClients } from '../features/clients/clientsApi'
import SidebarLayout from '../components/SidebarLayout'

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

    // Only fetch if we're on the clients route, user is authenticated, auth is loaded, and we haven't fetched for this visit
    if (
      location.pathname === '/clients' &&
      user &&
      !isAuthLoading &&
      lastFetchedPathRef.current !== location.pathname
    ) {
      lastFetchedPathRef.current = location.pathname
      dispatch(fetchClients())
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
          <div className="text-lg text-gray-600">Loading clients...</div>
        </div>
      </SidebarLayout>
    )
  }

  if (error) {
    const isRateLimit = error.includes('rate limit') || error.includes('RATE_LIMIT')
    
    return (
      <SidebarLayout>
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
      </SidebarLayout>
    )
  }

  const formatBool = (value: boolean) => (value ? 'Yes' : 'No')
  const formatValue = (value: any) => {
    if (value === null || value === undefined || value === '') return 'N/A'
    return String(value)
  }

  const columns = [
    { key: 'jId', label: 'J-ID' },
    { key: 'createdDate', label: 'Created Date' },
    { key: 'isCompany', label: 'Is Company?', format: formatBool },
    { key: 'displayName', label: 'Display Name' },
    { key: 'companyName', label: 'Company Name' },
    { key: 'title', label: 'Title' },
    { key: 'firstName', label: 'First Name' },
    { key: 'lastName', label: 'Last Name' },
    { key: 'mainPhone', label: 'Main Phone #s' },
    { key: 'email', label: 'E-mails' },
    { key: 'tags', label: 'Tags' },
    { key: 'billingStreet1', label: 'Billing Street 1' },
    { key: 'billingStreet2', label: 'Billing Street 2' },
    { key: 'billingCity', label: 'Billing City' },
    { key: 'billingState', label: 'Billing State' },
    { key: 'billingCountry', label: 'Billing Country' },
    { key: 'billingZip', label: 'Billing Zip code' },
    { key: 'cftHavePets', label: 'CFT[ Have Pets ]' },
    { key: 'cftHaveKids', label: 'CFT[ Have Kids ]' },
    { key: 'cftTrashCanInventory', label: 'CFT[Trash can Inventory]' },
    { key: 'cftAreasToAvoid', label: 'CFT[Areas to avoid]' },
    { key: 'cfsChangeSheets', label: 'CFS[Change sheets?]' },
    { key: 'cftPreferredTimeRecurring', label: 'CFT[Preferred time for Recurring Services]' },
    { key: 'cfsPreferredTimeContact', label: 'CFS[Preferred Time of Contact]' },
    { key: 'cftTypeOfProperty', label: 'CFT[Type of Property]' },
    { key: 'cftAdditionalInfo', label: 'CFT[Additional Information (client/service)]' },
    { key: 'cftResponsibidProfile', label: 'CFT[ResponsiBid Profile]' },
    { key: 'workPhone', label: 'Work Phone #s' },
    { key: 'mobilePhone', label: 'Mobile Phone #s' },
    { key: 'homePhone', label: 'Home Phone #s' },
    { key: 'faxPhone', label: 'Fax Phone #s' },
    { key: 'otherPhone', label: 'Other Phone #s' },
    { key: 'servicePropertyName', label: 'Service Property Name' },
    { key: 'serviceStreet1', label: 'Service Street 1' },
    { key: 'serviceStreet2', label: 'Service Street 2' },
    { key: 'serviceCity', label: 'Service City' },
    { key: 'serviceState', label: 'Service State' },
    { key: 'serviceCountry', label: 'Service Country' },
    { key: 'serviceZip', label: 'Service Zip code' },
    { key: 'textMessageEnabledPhone', label: 'Text Message Enabled Phone #' },
    { key: 'receivesAutoVisitReminders', label: 'Receives automatic visit reminders?', format: formatBool },
    { key: 'receivesAutoJobFollowups', label: 'Receives automatic job follow-ups?', format: formatBool },
    { key: 'receivesAutoQuoteFollowups', label: 'Receives automatic quote follow-ups?', format: formatBool },
    { key: 'receivesAutoInvoiceFollowups', label: 'Receives automatic invoice follow-ups?', format: formatBool },
    { key: 'archived', label: 'Archived', format: formatBool },
    { key: 'leadSource', label: 'Lead Source' },
    { key: 'pftAddressAdditionalInfo', label: 'PFT[Address additional info]' },
    { key: 'pftApartmentNumber', label: 'PFT[Apartment #]' },
    { key: 'pftFootage', label: 'PFT[Footage]' },
    { key: 'pftNotes', label: 'PFT[Notes]' },
  ]

  return (
    <SidebarLayout>
      <div className="bg-white rounded-2xl border border-[#EFEFEF] shadow-sm px-6 sm:px-8 py-6 overflow-hidden h-full w-full flex flex-col min-h-0">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Clients</h1>

        {clients.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <p className="text-gray-600">No clients found.</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden flex-1 min-h-0 w-full">
            <div className="overflow-auto max-w-full h-full w-full">
              <table className="min-w-max w-max divide-y divide-gray-200">
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
                  {clients.map((client) => (
                    <tr key={client.id} className="hover:bg-gray-50">
                      {columns.map((column) => {
                        const rawValue = (client as any)[column.key]
                        const value = column.format
                          ? column.format(rawValue)
                          : formatValue(rawValue)
                        return (
                          <td key={`${client.id}-${column.key}`} className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{value}</div>
                          </td>
                        )
                      })}
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
