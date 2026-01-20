import { createSlice } from '@reduxjs/toolkit'
import { fetchQuotes } from './quotesApi'

interface Quote {
  id: string
  quoteNumber: string
  title: string | null
  quoteStatus: string
  createdAt: string
  updatedAt: string
  amounts: {
    subtotal: string
    total: string
  } | null
  client: {
    id: string
    name: string
    firstName: string | null
    lastName: string | null
    companyName: string | null
  } | null
  property: {
    id: string
    name: string | null
    address: {
      street: string | null
      city: string | null
      province: string | null
      postalCode: string | null
    } | null
  } | null
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
        state.quotes = action.payload.data.quotes.nodes
        state.pageInfo = action.payload.data.quotes.pageInfo
      })
      .addCase(fetchQuotes.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload || 'Failed to fetch quotes'
      })
  },
})

export const { clearQuotes } = quotesSlice.actions
export default quotesSlice.reducer
