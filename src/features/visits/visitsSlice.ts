import { createSlice } from '@reduxjs/toolkit'
import { fetchVisits } from './visitsApi'

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

interface VisitsState {
  visits: Visit[]
  isLoading: boolean
  error: string | null
}

const initialState: VisitsState = {
  visits: [],
  isLoading: false,
  error: null,
}

const visitsSlice = createSlice({
  name: 'visits',
  initialState,
  reducers: {
    clearVisits: (state) => {
      state.visits = []
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchVisits.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchVisits.fulfilled, (state, action) => {
        state.isLoading = false
        state.visits = action.payload.visits
      })
      .addCase(fetchVisits.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload || 'Failed to fetch visits'
      })
  },
})

export const { clearVisits } = visitsSlice.actions
export default visitsSlice.reducer
