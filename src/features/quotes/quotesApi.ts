import { createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../services/api'

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

interface QuotesResponse {
  success: boolean
  count: number
  quotes: Quote[]
}

export const fetchQuotes = createAsyncThunk<QuotesResponse, { limit?: number; skip?: number }, { rejectValue: string }>(
  'quotes/fetchQuotes',
  async ({ limit = 100, skip = 0 }, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams()
      if (limit) params.append('limit', limit.toString())
      if (skip) params.append('skip', skip.toString())
      
      const response = await api.get<QuotesResponse>(`/quotes?${params.toString()}`)
      return response.data
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || error.response?.data?.error || 'Failed to fetch quotes'
      )
    }
  }
)
