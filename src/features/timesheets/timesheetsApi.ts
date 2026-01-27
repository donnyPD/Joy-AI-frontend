import { createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../services/api'

export interface Timesheet {
  id: string
  userName: string
  date: string
  startTime: string
  endTime: string
  hours: string
  workingOn: string
  note: string
  clientName: string
}

interface TimesheetsResponse {
  success: boolean
  count: number
  timesheets: Timesheet[]
}

export const fetchTimesheets = createAsyncThunk<
  TimesheetsResponse,
  { limit?: number; skip?: number },
  { rejectValue: string }
>('timesheets/fetchTimesheets', async ({ limit = 100, skip = 0 }, { rejectWithValue }) => {
  try {
    const params = new URLSearchParams()
    params.append('limit', limit.toString())
    params.append('skip', skip.toString())

    const response = await api.get<TimesheetsResponse>(`/timesheets?${params.toString()}`)
    return response.data
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message ||
        error.response?.data?.error ||
        'Failed to fetch timesheets'
    )
  }
})
