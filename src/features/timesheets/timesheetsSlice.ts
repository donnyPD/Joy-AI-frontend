import { createSlice } from '@reduxjs/toolkit'
import { fetchTimesheets } from './timesheetsApi'
import type { Timesheet } from './timesheetsApi'

interface TimesheetsState {
  timesheets: Timesheet[]
  isLoading: boolean
  error: string | null
}

const initialState: TimesheetsState = {
  timesheets: [],
  isLoading: false,
  error: null,
}

const timesheetsSlice = createSlice({
  name: 'timesheets',
  initialState,
  reducers: {
    clearTimesheets: (state) => {
      state.timesheets = []
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTimesheets.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchTimesheets.fulfilled, (state, action) => {
        state.isLoading = false
        state.timesheets = action.payload.timesheets
      })
      .addCase(fetchTimesheets.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload || 'Failed to fetch timesheets'
      })
  },
})

export const { clearTimesheets } = timesheetsSlice.actions
export default timesheetsSlice.reducer
