import { createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../services/api'

interface Client {
  id: string
  name: string
  firstName: string | null
  lastName: string | null
  companyName: string | null
  emails: Array<{ address: string; primary: boolean }>
  phones: Array<{ number: string; primary: boolean; description: string | null }>
  billingAddress: {
    street: string | null
    city: string | null
    province: string | null
    postalCode: string | null
    country: string | null
  } | null
  tags: {
    nodes: Array<{ id: string; label: string }>
  }
  isArchived: boolean
  createdAt: string
}

interface ClientsResponse {
  success: boolean
  count: number
  clients: Client[]
}

export const fetchClients = createAsyncThunk<ClientsResponse, void, { rejectValue: string }>(
  'clients/fetchClients',
  async (_, { rejectWithValue }) => {
    try {
      console.log('🔄 Fetching clients from database...')
      const response = await api.get<ClientsResponse>(`/clients`)
      console.log('✅ Clients fetched successfully:', response.data)
      return response.data
    } catch (error: any) {
      console.error('❌ Error fetching clients:', error)
      console.error('Error response:', error.response)
      console.error('Error status:', error.response?.status)
      console.error('Error data:', error.response?.data)
      
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          error.message || 
                          'Failed to fetch clients'
      
      return rejectWithValue(errorMessage)
    }
  }
)
