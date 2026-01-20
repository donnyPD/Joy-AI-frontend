import { createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../services/api'

interface QuotesResponse {
  data: {
    quotes: {
      pageInfo: {
        hasNextPage: boolean
        endCursor: string | null
      }
      nodes: Array<{
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
      }>
    }
  }
}

export const fetchQuotes = createAsyncThunk<QuotesResponse, { first?: number; after?: string }, { rejectValue: string }>(
  'quotes/fetchQuotes',
  async ({ first = 100, after }, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams()
      if (first) params.append('first', first.toString())
      if (after) params.append('after', after)
      
      const response = await api.get<QuotesResponse>(`/jobber/quotes?${params.toString()}`)
      return response.data
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || error.response?.data?.error || 'Failed to fetch quotes'
      )
    }
  }
)
