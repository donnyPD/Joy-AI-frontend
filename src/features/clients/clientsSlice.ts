import { createSlice } from '@reduxjs/toolkit'
import { fetchClients, updateClient } from './clientsApi'

interface Client {
  id: string
  jId: string
  createdDate: string | null
  isRecurring: boolean
  lostRecurring: boolean
  whyCancelled: string | null
  isCompany: boolean
  displayName: string
  companyName: string | null
  title: string | null
  firstName: string | null
  lastName: string | null
  mainPhone: string | null
  email: string | null
  tags: string | null
  billingStreet1: string | null
  billingStreet2: string | null
  billingCity: string | null
  billingState: string | null
  billingCountry: string | null
  billingZip: string | null
  cftHavePets: string | null
  cftHaveKids: string | null
  cftTrashCanInventory: string | null
  cftAreasToAvoid: string | null
  cfsChangeSheets: string | null
  cftPreferredTimeRecurring: string | null
  cfsPreferredTimeContact: string | null
  cftTypeOfProperty: string | null
  cftAdditionalInfo: string | null
  cftResponsibidProfile: string | null
  workPhone: string | null
  mobilePhone: string | null
  homePhone: string | null
  faxPhone: string | null
  otherPhone: string | null
  servicePropertyName: string | null
  serviceStreet1: string | null
  serviceStreet2: string | null
  serviceCity: string | null
  serviceState: string | null
  serviceCountry: string | null
  serviceZip: string | null
  textMessageEnabledPhone: string | null
  receivesAutoVisitReminders: boolean
  receivesAutoJobFollowups: boolean
  receivesAutoQuoteFollowups: boolean
  receivesAutoInvoiceFollowups: boolean
  archived: boolean
  leadSource: string | null
  pftAddressAdditionalInfo: string | null
  pftApartmentNumber: string | null
  pftFootage: string | null
  pftNotes: string | null
}

interface ClientsState {
  clients: Client[]
  pageInfo: {
    hasNextPage: boolean
    endCursor: string | null
  } | null
  isLoading: boolean
  error: string | null
}

const initialState: ClientsState = {
  clients: [],
  pageInfo: null,
  isLoading: false,
  error: null,
}

const clientsSlice = createSlice({
  name: 'clients',
  initialState,
  reducers: {
    clearClients: (state) => {
      state.clients = []
      state.pageInfo = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchClients.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchClients.fulfilled, (state, action) => {
        state.isLoading = false
        // Transform DB structure to match frontend expectations
        state.clients = action.payload.clients.map((client: any) => {
          let emails: Array<{ address: string; primary: boolean }> = []
          let phones: Array<{ number: string; primary: boolean; description: string | null }> = []

          try {
            if (client.emailsJson) {
              emails = JSON.parse(client.emailsJson)
            }
          } catch (e) {
            console.warn('Failed to parse emailsJson:', e)
          }

          try {
            if (client.phonesJson) {
              phones = JSON.parse(client.phonesJson)
            }
          } catch (e) {
            console.warn('Failed to parse phonesJson:', e)
          }

          const safePhones = Array.isArray(phones) ? phones : []
          const primaryPhoneNumber = safePhones.find((phone) => phone?.primary)?.number || null
          const getPhoneByDescription = (matches: string[]) =>
            safePhones.find((phone) => {
              const description = phone?.description?.toLowerCase()
              return description ? matches.some((match) => description.includes(match)) : false
            })?.number || null
          const workPhoneNumber = getPhoneByDescription(['work'])
          const mobilePhoneNumber = getPhoneByDescription(['mobile', 'cell'])
          const homePhoneNumber = getPhoneByDescription(['home'])
          const faxPhoneNumber = getPhoneByDescription(['fax'])
          const otherPhoneNumber = getPhoneByDescription(['other'])

          return {
            id: client.id,
            jId: client.id,
            createdDate: client.createdDate
              ? new Date(client.createdDate).toLocaleDateString('en-GB')
              : null,
            isRecurring: !!client.isRecurring,
            lostRecurring: !!client.lostRecurring,
            whyCancelled: client.whyCancelled || null,
            isCompany: !!client.isCompany,
            displayName: client.displayName || '',
            companyName: client.companyName || null,
            title: client.title || null,
            firstName: client.firstName,
            lastName: client.lastName,
            mainPhone: primaryPhoneNumber || client.mainPhone || null,
            email:
              client.email ||
              (Array.isArray(emails) ? emails.map((e) => e.address).filter(Boolean).join(', ') : null),
            tags: client.tags || null,
            billingStreet1: client.billingStreet1 || null,
            billingStreet2: client.billingStreet2 || null,
            billingCity: client.billingCity || null,
            billingState: client.billingState || null,
            billingCountry: client.billingCountry || null,
            billingZip: client.billingZip || null,
            cftHavePets: client.cftHavePets || null,
            cftHaveKids: client.cftHaveKids || null,
            cftTrashCanInventory: client.cftTrashCanInventory || null,
            cftAreasToAvoid: client.cftAreasToAvoid || null,
            cfsChangeSheets: client.cfsChangeSheets || null,
            cftPreferredTimeRecurring: client.cftPreferredTimeRecurring || null,
            cfsPreferredTimeContact: client.cfsPreferredTimeContact || null,
            cftTypeOfProperty: client.cftTypeOfProperty || null,
            cftAdditionalInfo: client.cftAdditionalInfo || null,
            cftResponsibidProfile: client.cftResponsibidProfile || null,
            workPhone: workPhoneNumber || client.workPhone || null,
            mobilePhone: mobilePhoneNumber || client.mobilePhone || null,
            homePhone: homePhoneNumber || client.homePhone || null,
            faxPhone: faxPhoneNumber || client.faxPhone || null,
            otherPhone: otherPhoneNumber || client.otherPhone || null,
            servicePropertyName: client.servicePropertyName || null,
            serviceStreet1: client.serviceStreet1 || null,
            serviceStreet2: client.serviceStreet2 || null,
            serviceCity: client.serviceCity || null,
            serviceState: client.serviceState || null,
            serviceCountry: client.serviceCountry || null,
            serviceZip: client.serviceZip || null,
            textMessageEnabledPhone: client.textMessageEnabledPhone || primaryPhoneNumber || null,
            receivesAutoVisitReminders: !!client.receivesAutoVisitReminders,
            receivesAutoJobFollowups: !!client.receivesAutoJobFollowups,
            receivesAutoQuoteFollowups: !!client.receivesAutoQuoteFollowups,
            receivesAutoInvoiceFollowups: !!client.receivesAutoInvoiceFollowups,
            archived: !!client.archived,
            leadSource: client.leadSource || null,
            pftAddressAdditionalInfo: client.pftAddressAdditionalInfo || null,
            pftApartmentNumber: client.pftApartmentNumber || null,
            pftFootage: client.pftFootage || null,
            pftNotes: client.pftNotes || null,
          }
        })
        state.pageInfo = null // No pagination for DB queries
      })
      .addCase(fetchClients.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload || 'Failed to fetch clients'
      })
      .addCase(updateClient.fulfilled, (state, action) => {
        const updated = action.payload.client
        const index = state.clients.findIndex((client) => client.id === updated.id)
        if (index !== -1) {
          state.clients[index] = {
            ...state.clients[index],
            whyCancelled: updated.whyCancelled || null,
            lostRecurring: !!updated.lostRecurring,
            isRecurring: !!updated.isRecurring,
          }
        }
      })
  },
})

export const { clearClients } = clientsSlice.actions
export default clientsSlice.reducer
