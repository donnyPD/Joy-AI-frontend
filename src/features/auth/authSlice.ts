import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import { signUp, signIn, getMe } from './authApi'

interface User {
  id: string
  email: string
  name: string
  jobberAccessToken?: string
  jobberAccountId?: string
  isSubscribed?: boolean
  subscription?: {
    planKey: string
    status: string
  } | null
}

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}

const initialState: AuthState = {
  user: null,
  token: localStorage.getItem('accessToken'),
  isAuthenticated: !!localStorage.getItem('accessToken'),
  isLoading: false,
  error: null,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null
      state.token = null
      state.isAuthenticated = false
      localStorage.removeItem('accessToken')
    },
    clearError: (state) => {
      state.error = null
    },
    setJobberToken: (state, action: PayloadAction<{ token: string; accountId: string }>) => {
      if (state.user) {
        state.user.jobberAccessToken = action.payload.token
        state.user.jobberAccountId = action.payload.accountId
      }
    },
  },
  extraReducers: (builder) => {
    // Sign Up
    builder
      .addCase(signUp.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(signUp.fulfilled, (state) => {
        // After successful signup, don't authenticate - user needs to sign in
        state.isLoading = false
        // Don't set token, user, or isAuthenticated - user will sign in separately
      })
      .addCase(signUp.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

    // Sign In
    builder
      .addCase(signIn.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(signIn.fulfilled, (state, action) => {
        state.isLoading = false
        state.token = action.payload.accessToken
        state.user = action.payload.user
        state.isAuthenticated = true
        localStorage.setItem('accessToken', action.payload.accessToken)
      })
      .addCase(signIn.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

    // Get Me
    builder
      .addCase(getMe.pending, (state) => {
        state.isLoading = true
      })
      .addCase(getMe.fulfilled, (state, action) => {
        state.isLoading = false
        state.user = action.payload
        state.isAuthenticated = true
      })
      .addCase(getMe.rejected, (state) => {
        state.isLoading = false
        state.isAuthenticated = false
        state.token = null
        state.user = null
        localStorage.removeItem('accessToken')
      })
  },
})

export const { logout, clearError, setJobberToken } = authSlice.actions
export default authSlice.reducer
