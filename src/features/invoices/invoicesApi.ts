import { createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../services/api'

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

interface InvoicesResponse {
  success: boolean
  count: number
  invoices: Invoice[]
}

export const fetchInvoices = createAsyncThunk<InvoicesResponse, { limit?: number; skip?: number }, { rejectValue: string }>(
  'invoices/fetchInvoices',
  async ({ limit = 100, skip = 0 }, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams()
      if (limit) params.append('limit', limit.toString())
      if (skip) params.append('skip', skip.toString())
      
      const response = await api.get<InvoicesResponse>(`/invoices?${params.toString()}`)
      return response.data
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || error.response?.data?.error || 'Failed to fetch invoices'
      )
    }
  }
)

export const fetchInvoice = createAsyncThunk<Invoice, string, { rejectValue: string }>(
  'invoices/fetchInvoice',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get<Invoice>(`/invoices/${id}`)
      return response.data
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || error.response?.data?.error || 'Failed to fetch invoice'
      )
    }
  }
)
