import { createSlice } from '@reduxjs/toolkit'
import { getOAuthUrl, disconnectJobber } from './jobberApi'

interface JobberState {
  oauthUrl: string | null
  isLoading: boolean
  error: string | null
}

const initialState: JobberState = {
  oauthUrl: null,
  isLoading: false,
  error: null,
}

const jobberSlice = createSlice({
  name: 'jobber',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getOAuthUrl.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(getOAuthUrl.fulfilled, (state, action) => {
        state.isLoading = false
        state.oauthUrl = action.payload.authUrl
      })
      .addCase(getOAuthUrl.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      .addCase(disconnectJobber.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(disconnectJobber.fulfilled, (state) => {
        state.isLoading = false
        state.oauthUrl = null
      })
      .addCase(disconnectJobber.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
  },
})

export const { clearError } = jobberSlice.actions
export default jobberSlice.reducer
