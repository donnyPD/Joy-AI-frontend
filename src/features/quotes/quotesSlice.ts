import { createSlice } from '@reduxjs/toolkit'
import { fetchQuotes } from './quotesApi'

interface Quote {
  id: string
  quoteNumber: string
  clientName: string
  clientEmail: string
  clientPhone: string
  sentTo: string
  servicePropertyName: string
  serviceStreet: string
  serviceCity: string
  serviceProvince: string
  serviceZip: string
  salesperson: string
  title: string
  status: string
  leadSource: string
  lineItems: string
  subtotal: string
  total: string
  discount: string
  requiredDeposit: string
  collectedDeposit: string
  jobNumbers: string
  sentByUser: string
  clientHubViewedAt: string
  draftedDate: string
  sentDate: string
  changesRequestedDate: string
  approvedDate: string
  convertedDate: string
  archivedDate: string
  timeEstimated: string
  birthdayMonth: string
  referredBy: string
  typeOfProperty: string
  desiredFrequency: string
  exactSqFt: string
  typeOfCleaning: string
  additionalRequest: string
  parkingDetails: string
  squareFoot: string
  frequency: string
  preferredTimeOfContact: string
  zone: string
  dirtScale: string
}

interface QuotesState {
  quotes: Quote[]
  pageInfo: {
    hasNextPage: boolean
    endCursor: string | null
  } | null
  isLoading: boolean
  error: string | null
}

const initialState: QuotesState = {
  quotes: [],
  pageInfo: null,
  isLoading: false,
  error: null,
}

const quotesSlice = createSlice({
  name: 'quotes',
  initialState,
  reducers: {
    clearQuotes: (state) => {
      state.quotes = []
      state.pageInfo = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchQuotes.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchQuotes.fulfilled, (state, action) => {
        state.isLoading = false
        state.quotes = action.payload.quotes
        state.pageInfo = null // No pagination for DB queries
      })
      .addCase(fetchQuotes.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload || 'Failed to fetch quotes'
      })
  },
})

export const { clearQuotes } = quotesSlice.actions
export default quotesSlice.reducer
