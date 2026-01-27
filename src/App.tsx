import { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from './store/hooks'
import { getMe } from './features/auth/authApi'
import SignIn from './pages/auth/SignIn'
import SignUp from './pages/auth/SignUp'
import ChoosePlan from './pages/ChoosePlan'
import Dashboard from './pages/Dashboard'
import Home from './pages/Home'
import Settings from './pages/Settings'
import Integration from './pages/Integration'
import Clients from './pages/Clients'
import Quotes from './pages/Quotes'
import Jobs from './pages/Jobs'
import Invoices from './pages/Invoices'
import Visits from './pages/Visits'
import Timesheets from './pages/Timesheets'
import Operations from './pages/Operations'
import Services from './pages/Services'
import ManageTeam from './pages/ManageTeam'
import TeamMemberDetail from './pages/TeamMemberDetail'
import Inventory from './pages/Inventory'
import Metrics from './pages/Metrics'
import PublicInventoryForm from './pages/PublicInventoryForm'
import InventoryPurchaseOrder from './pages/InventoryPurchaseOrder'

function App() {
  const dispatch = useAppDispatch()
  const { isAuthenticated, token, user } = useAppSelector((state) => state.auth)

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
      <Route path="/public/inventory-form" element={<PublicInventoryForm />} />
      <Route path="/signin" element={<SignIn />} />
      <Route path="/signup" element={<SignUp />} />
      <Route
        path="/choose-plan"
        element={isAuthenticated ? <ChoosePlan /> : <Navigate to="/signin" />}
      />
      <Route
        path="/dashboard"
        element={isAuthenticated ? <Dashboard /> : <Navigate to="/signin" />}
      />
      <Route
        path="/intergation"
        element={isAuthenticated ? <Integration /> : <Navigate to="/signin" />}
      />
      <Route
        path="/integrations"
        element={
          isAuthenticated ? <Navigate to="/intergation" replace /> : <Navigate to="/signin" />
        }
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
      <Route
        path="/invoices"
        element={isAuthenticated ? <Invoices /> : <Navigate to="/signin" />}
      />
      <Route
        path="/visits"
        element={isAuthenticated ? <Visits /> : <Navigate to="/signin" />}
      />
            <Route
              path="/timesheets"
              element={isAuthenticated ? <Timesheets /> : <Navigate to="/signin" />}
            />
      <Route
        path="/operations"
        element={isAuthenticated ? <Operations /> : <Navigate to="/signin" />}
      />
      <Route
        path="/services"
        element={isAuthenticated ? <Services /> : <Navigate to="/signin" />}
      />
      <Route
        path="/operations/team"
        element={isAuthenticated ? <ManageTeam /> : <Navigate to="/signin" />}
      />
      <Route
        path="/operations/users/:id"
        element={isAuthenticated ? <TeamMemberDetail /> : <Navigate to="/signin" />}
      />
      <Route
        path="/"
        element={isAuthenticated ? <Home /> : <Navigate to="/signin" />}
      />
      <Route
        path="/operations/inventory"
        element={isAuthenticated ? <Inventory /> : <Navigate to="/signin" />}
      />
      <Route
        path="/operations/inventory/add-purchase"
        element={isAuthenticated ? <InventoryPurchaseOrder /> : <Navigate to="/signin" />}
      />
      <Route
        path="/services"
        element={isAuthenticated ? <Services /> : <Navigate to="/signin" />}
      />
      <Route
        path="/services/metrics"
        element={isAuthenticated ? <Metrics /> : <Navigate to="/signin" />}
      />
    </Routes>
  )
}

export default App
