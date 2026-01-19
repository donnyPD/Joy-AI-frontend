import { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from './store/hooks'
import { getMe } from './features/auth/authApi'
import SignIn from './pages/auth/SignIn'
import SignUp from './pages/auth/SignUp'
import Dashboard from './pages/Dashboard'
import Settings from './pages/Settings'

function App() {
  const dispatch = useAppDispatch()
  const { isAuthenticated, token } = useAppSelector((state) => state.auth)

  useEffect(() => {
    // Check if user is authenticated on mount
    if (token && !isAuthenticated) {
      dispatch(getMe())
    }
  }, [dispatch, token, isAuthenticated])

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
      <Route path="/" element={<Navigate to={isAuthenticated ? "/dashboard" : "/signin"} />} />
    </Routes>
  )
}

export default App
