import { createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../services/api'

interface SignUpData {
  email: string
  password: string
  name: string
}

interface SignInData {
  email: string
  password: string
}

interface AuthResponse {
  accessToken: string
  user: {
    id: string
    email: string
    name: string
  }
}

export const signUp = createAsyncThunk<AuthResponse, SignUpData, { rejectValue: string }>(
  'auth/signUp',
  async (data, { rejectWithValue }) => {
    try {
      const response = await api.post<AuthResponse>('/auth/signup', data)
      return response.data
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Sign up failed. Please try again.',
      )
    }
  },
)

export const signIn = createAsyncThunk<AuthResponse, SignInData, { rejectValue: string }>(
  'auth/signIn',
  async (data, { rejectWithValue }) => {
    try {
      const response = await api.post<AuthResponse>('/auth/signin', data)
      return response.data
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Sign in failed. Please check your credentials.',
      )
    }
  },
)

export const getMe = createAsyncThunk<any, void, { rejectValue: string }>(
  'auth/getMe',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/auth/me')
      return response.data
    } catch (error: any) {
      return rejectWithValue('Failed to fetch user data')
    }
  },
)
