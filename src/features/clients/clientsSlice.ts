import { createSlice } from '@reduxjs/toolkit'
import { fetchClients } from './clientsApi'

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
        state.clients = action.payload.data.clients.nodes
        state.pageInfo = action.payload.data.clients.pageInfo
      })
      .addCase(fetchClients.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload || 'Failed to fetch clients'
      })
  },
})

export const { clearClients } = clientsSlice.actions
export default clientsSlice.reducer
