import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

// Main API instance - baseURL already includes /api from env or default
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Separate API instance for auth endpoints
export const authApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add auth token to requests for main API
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken')
  console.log('📤 API Request:', {
    url: config.url,
    method: config.method,
    hasToken: !!token,
    tokenLength: token?.length,
    tokenStart: token ? `${token.substring(0, 20)}...` : 'none',
  })
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  } else {
    console.warn('⚠️ No access token found in localStorage for request:', config.url)
  }
  // Ensure we expect JSON response
  config.headers.Accept = 'application/json'
  // Bypass ngrok warning page for API requests
  config.headers['ngrok-skip-browser-warning'] = 'true'
  return config
})

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('🚨 API Error Interceptor:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
    })
    
    // Only logout on 401 if it's NOT a Jobber connection issue
    // Jobber connection issues should return 400 (Bad Request), not 401
    if (error.response?.status === 401) {
      // Check if it's a Jobber-related endpoint
      const isJobberEndpoint = error.config?.url?.includes('/jobber/')
      
      if (!isJobberEndpoint) {
        console.warn('⚠️ 401 Unauthorized - Logging out user')
        localStorage.removeItem('accessToken')
        if (!window.location.pathname.includes('/signin')) {
          setTimeout(() => {
            window.location.href = '/signin'
          }, 100)
        }
      } else {
        console.warn('⚠️ 401 on Jobber endpoint - likely missing Jobber connection')
      }
    }
    return Promise.reject(error)
  }
)

// Add auth token interceptor for auth API (for /auth/me endpoint)
authApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  config.headers.Accept = 'application/json'
  config.headers['ngrok-skip-browser-warning'] = 'true'
  return config
})

// Handle auth errors for auth API
authApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('accessToken')
      if (!window.location.pathname.includes('/signin')) {
        setTimeout(() => {
          window.location.href = '/signin'
        }, 100)
      }
    }
    return Promise.reject(error)
  }
)

export default api
