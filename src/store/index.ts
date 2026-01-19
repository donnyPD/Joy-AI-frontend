import { configureStore } from '@reduxjs/toolkit'
import authReducer from '../features/auth/authSlice'
import jobberReducer from '../features/jobber/jobberSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    jobber: jobberReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
