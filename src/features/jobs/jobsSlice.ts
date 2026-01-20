import { createSlice } from '@reduxjs/toolkit'
import { fetchJobs } from './jobsApi'

interface Job {
  id: string
  jobNumber: string
  title: string | null
  jobStatus: string
  jobType: string | null
  createdAt: string
  startAt: string | null
  endAt: string | null
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
        state.jobs = action.payload.data.jobs.nodes
        state.pageInfo = action.payload.data.jobs.pageInfo
      })
      .addCase(fetchJobs.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload || 'Failed to fetch jobs'
      })
  },
})

export const { clearJobs } = jobsSlice.actions
export default jobsSlice.reducer
