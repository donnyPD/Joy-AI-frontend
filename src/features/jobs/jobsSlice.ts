import { createSlice } from '@reduxjs/toolkit'
import { fetchJobs } from './jobsApi'

interface Job {
  id: string
  jobNumber: string
  title: string
  jobStatus: string
  jobType: string
  createdDate: string
  scheduleStartDate: string
  scheduleEndDate: string
  closedDate: string
  startTime: string
  endTime: string
  clientName: string
  clientEmail: string
  clientPhone: string
  leadSource: string
  billingStreet: string
  billingCity: string
  billingProvince: string
  billingZip: string
  servicePropertyName: string
  serviceStreet: string
  serviceCity: string
  serviceProvince: string
  serviceZip: string
  billingType: string
  visitFrequency: string
  billingFrequency: string
  automaticInvoicing: string
  visitsAssignedTo: string
  lineItems: string
  total: string
  completedVisits: string
  numberOfInvoices: string
  salesperson: string
  invoiceNumbers: string
  quoteNumber: string
  onlineBooking: string
  expensesTotal: string
  timeTracked: string
  labourCostTotal: string
  lineItemCostTotal: string
  totalCosts: string
  quoteDiscount: string
  totalRevenue: string
  profit: string
  profitPercent: string
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
  replied: string
}

interface JobsState {
  jobs: Job[]
  pageInfo: {
    hasNextPage: boolean
    endCursor: string | null
  } | null
  isLoading: boolean
  error: string | null
}

const initialState: JobsState = {
  jobs: [],
  pageInfo: null,
  isLoading: false,
  error: null,
}

const jobsSlice = createSlice({
  name: 'jobs',
  initialState,
  reducers: {
    clearJobs: (state) => {
      state.jobs = []
      state.pageInfo = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchJobs.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchJobs.fulfilled, (state, action) => {
        state.isLoading = false
        state.jobs = action.payload.jobs
        state.pageInfo = null // No pagination for DB queries
      })
      .addCase(fetchJobs.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload || 'Failed to fetch jobs'
      })
  },
})

export const { clearJobs } = jobsSlice.actions
export default jobsSlice.reducer
