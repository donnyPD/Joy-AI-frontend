import { createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../services/api'

interface Visit {
  id: string
  jobNumber: string
  date: string
  times: string
  visitTitle: string
  clientName: string
  clientEmail: string
  clientPhone: string
  servicePropertyName: string
  serviceStreet: string
  serviceCity: string
  serviceProvince: string
  serviceZip: string
  visitCompletedDate: string
  assignedTo: string
  lineItems: string
  oneOffJob: string
  visitBased: string
  scheduleDuration: string
  timeTracked: string
  jobType: string
  typeOfProperty: string
  frequency: string
  referredBy: string
  birthdayMonth: string
  typeOfCleaning: string
  hours: string
  cleaningInstructions: string
  howToGetInTheHouse: string
  detailToGetInTheHouse: string
  cleanInsideOfTheStove: string
  cleanInsideOfTheFridge: string
  windowsToBeCleaned: string
  glassDoorsToBeCleaned: string
  typerOfProductsToUse: string
  squareFoot: string
  exactSqFt: string
  zone: string
  parkingDetails: string
  responsibidProfile: string
  preferredTimeOfContact: string
  additionalInstructions: string
  pets: string
  clientsProductsNotes: string
  trashCanInventory: string
  changeSheets: string
  cleaningTech: string
}

interface VisitsResponse {
  success: boolean
  count: number
  visits: Visit[]
}

export const fetchVisits = createAsyncThunk<
  VisitsResponse,
  { limit?: number; skip?: number },
  { rejectValue: string }
>(
  'visits/fetchVisits',
  async ({ limit = 100, skip = 0 }, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams()
      params.append('limit', limit.toString())
      params.append('skip', skip.toString())

      const response = await api.get<VisitsResponse>(`/visits?${params.toString()}`)
      return response.data
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || error.response?.data?.error || 'Failed to fetch visits'
      )
    }
  }
)
