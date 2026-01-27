import { createSlice } from '@reduxjs/toolkit'
import { fetchInvoices, fetchInvoice } from './invoicesApi'

interface Invoice {
  id: string
  invoiceNumber: string
  clientName: string
  leadSource: string
  clientEmail: string
  clientPhone: string
  sentTo: string
  billingStreet: string
  billingCity: string
  billingProvince: string
  billingZip: string
  servicePropertyName: string
  serviceStreet: string
  serviceCity: string
  serviceProvince: string
  serviceZip: string
  subject: string
  createdDate: string
  issuedDate: string
  dueDate: string
  lateBy: string
  salesperson: string
  markedPaidDate: string
  daysToPaid: string
  lastContacted: string
  visitsAssignedTo: string
  jobNumbers: string
  status: string
  lineItems: string
  preTaxTotal: string
  total: string
  tip: string
  balance: string
  taxPercent: string
  deposit: string
  discount: string
  taxAmount: string
  viewedInClientHub: string
  referredBy: string
  cleaningTechAssigned: string
  birthdayMonth: string
  frequency: string
  typeOfProperty: string
  parkingDetails: string
  squareFoot: string
  exactSqFt: string
  preferredTimeOfContact: string
  zone: string
  cleaningTech: string
}

interface InvoicesState {
  invoices: Invoice[]
  currentInvoice: Invoice | null
  isLoading: boolean
  error: string | null
}

const initialState: InvoicesState = {
  invoices: [],
  currentInvoice: null,
  isLoading: false,
  error: null,
}

const invoicesSlice = createSlice({
  name: 'invoices',
  initialState,
  reducers: {
    clearInvoices: (state) => {
      state.invoices = []
      state.currentInvoice = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchInvoices.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchInvoices.fulfilled, (state, action) => {
        state.isLoading = false
        state.invoices = action.payload.invoices
      })
      .addCase(fetchInvoices.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload || 'Failed to fetch invoices'
      })
      .addCase(fetchInvoice.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchInvoice.fulfilled, (state, action) => {
        state.isLoading = false
        state.currentInvoice = action.payload
      })
      .addCase(fetchInvoice.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload || 'Failed to fetch invoice'
      })
  },
})

export const { clearInvoices } = invoicesSlice.actions
export default invoicesSlice.reducer
