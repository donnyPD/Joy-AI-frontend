import { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from './store/hooks'
import { getMe } from './features/auth/authApi'
import SignIn from './pages/auth/SignIn'
import SignUp from './pages/auth/SignUp'
import Dashboard from './pages/Dashboard'
import Settings from './pages/Settings'
import Clients from './pages/Clients'
import Quotes from './pages/Quotes'
import Jobs from './pages/Jobs'

function App() {
  const dispatch = useAppDispatch()
  const { isAuthenticated, token, user, isLoading } = useAppSelector((state) => state.auth)

  useEffect(() => {
    // Check if user is authenticated on mount or if token exists but user data is missing
    if (token && (!isAuthenticated || !user)) {
      dispatch(getMe())
    }
  }, [dispatch, token, isAuthenticated, user])

  useEffect(() => {
    const handleFocus = () => {
      if (token) {
        dispatch(getMe())
      }
    }

    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [dispatch, token])

  return (
    <Routes>
      <Route path="/signin" element={<SignIn />} />
      <Route path="/signup" element={<SignUp />} />
      <Route
        path="/dashboard"
        element={isAuthenticated ? <Dashboard /> : <Navigate to="/signin" />}
      />
      <Route
        path="/settings"
        element={isAuthenticated ? <Settings /> : <Navigate to="/signin" />}
      />
      <Route
        path="/clients"
        element={isAuthenticated ? <Clients /> : <Navigate to="/signin" />}
      />
      <Route
        path="/quotes"
        element={isAuthenticated ? <Quotes /> : <Navigate to="/signin" />}
      />
      <Route
        path="/jobs"
        element={isAuthenticated ? <Jobs /> : <Navigate to="/signin" />}
      />
      <Route path="/" element={<Navigate to={isAuthenticated ? "/dashboard" : "/signin"} />} />
    </Routes>
  )
}

export default App
