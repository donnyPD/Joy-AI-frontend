import { createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../services/api'

interface OAuthUrlResponse {
  authUrl: string
}

export const getOAuthUrl = createAsyncThunk<OAuthUrlResponse, void, { rejectValue: string }>(
  'jobber/getOAuthUrl',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/auth/jobber/oauth-url')
      console.log('OAuth URL full response:', response)
      console.log('OAuth URL response data:', response.data)
      console.log('OAuth URL response data type:', typeof response.data)
      
      // Check if response is HTML (ngrok warning page) - even with 200 status
      const responseData = response.data
      if (typeof responseData === 'string') {
        if (
          responseData.includes('<!DOCTYPE html>') || 
          responseData.includes('<html') || 
          responseData.includes('ngrok') ||
          responseData.includes('ERR_NGROK')
        ) {
          console.error('Received HTML response (ngrok warning page)')
          return rejectWithValue(
            'Ngrok warning page detected. Please visit your backend URL directly in browser first to bypass the warning, then try connecting again.'
          )
        }
      }
      
      // Handle different response formats
      const authUrl = responseData?.authUrl || responseData?.data?.authUrl
      
      if (!authUrl || typeof authUrl !== 'string') {
        console.error('Invalid authUrl:', authUrl)
        console.error('Response structure:', typeof responseData === 'string' ? 'HTML string' : JSON.stringify(responseData, null, 2))
        return rejectWithValue(
          `Invalid response from server. Expected JSON with authUrl but received ${typeof responseData === 'string' ? 'HTML' : 'unexpected format'}. Please check your backend URL.`
        )
      }
      
      return { authUrl }
    } catch (error: any) {
      console.error('OAuth URL API error:', error)
      console.error('Error response:', error.response)
      console.error('Error response data:', error.response?.data)
      console.error('Error status:', error.response?.status)
      
      // Handle ngrok warning page or HTML responses
      if (error.response?.data && typeof error.response.data === 'string') {
        if (error.response.data.includes('ngrok')) {
          return rejectWithValue(
            'Ngrok warning page detected. Please bypass the warning page and ensure your backend is accessible.'
          )
        }
        if (error.response.data.includes('<!DOCTYPE') || error.response.data.includes('<html')) {
          return rejectWithValue('Received HTML instead of JSON. Please check your backend URL.')
        }
      }
      
      // Handle 401 Unauthorized
      if (error.response?.status === 401) {
        return rejectWithValue('Unauthorized. Please sign in again.')
      }
      
      return rejectWithValue(
        error.response?.data?.message || 
        error.message || 
        `Failed to get OAuth URL (Status: ${error.response?.status || 'Unknown'}). Please check your backend connection.`
      )
    }
  },
)

export const disconnectJobber = createAsyncThunk<
  { success: boolean },
  void,
  { rejectValue: string }
>(
  'jobber/disconnectJobber',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/jobber/disconnect')
      return response.data
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to disconnect Jobber account',
      )
    }
  },
)
