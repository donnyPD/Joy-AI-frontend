import { configureStore } from '@reduxjs/toolkit'
import authReducer from '../features/auth/authSlice'
import jobberReducer from '../features/jobber/jobberSlice'
import clientsReducer from '../features/clients/clientsSlice'
import quotesReducer from '../features/quotes/quotesSlice'
import jobsReducer from '../features/jobs/jobsSlice'
import invoicesReducer from '../features/invoices/invoicesSlice'
import visitsReducer from '../features/visits/visitsSlice'
import timesheetsReducer from '../features/timesheets/timesheetsSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    jobber: jobberReducer,
    clients: clientsReducer,
    quotes: quotesReducer,
    jobs: jobsReducer,
    invoices: invoicesReducer,
    visits: visitsReducer,
    timesheets: timesheetsReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
