import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import MainAdminDashboardPage from './pages/main/MainAdminDashboardPage'
import HotelAdminDashboardPage from './pages/hotel/HotelAdminDashboardPage'
import HotelManagementPage from './pages/hotel/HotelManagementPage'
import VehicleManagementPage from './pages/hotel/VehicleManagementPage'
import ExpenditureManagementPage from './pages/hotel/ExpenditureManagementPage'
import ReceiptGenerationPage from './pages/hotel/ReceiptGenerationPage'
import PackageAdminDashboardPage from './pages/package/PackageAdminDashboardPage'
import PackageManagementPage from './pages/package/PackageManagementPage'
import DestinationsPage from './pages/DestinationsPage'
import BookingPage from './pages/BookingPage'
import Navbar from './components/Navbar'
import Footer from './components/Footer'

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    // Error logging can be added here if needed
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <h1>Something went wrong</h1>
          <p>Error: {this.state.error?.message}</p>
          <button onClick={() => window.location.reload()}>Reload Page</button>
        </div>
      )
    }

    return this.props.children
  }
}

function App() {
  // Admin Layout Wrapper Component
  function AdminLayout({ children }) {
    return (
      <div className="h-screen bg-gradient-to-b from-black via-[#0b0b0b] to-[#111111] text-white flex flex-col overflow-hidden">
        <Navbar />
        <div className="flex-1 overflow-y-auto p-2 md:p-4 pb-20">
          {children}
        </div>
        <Footer />
      </div>
    )
  }

  function ProtectedRoute({ children }) {
    const token = localStorage.getItem('admin_token')
    const role = localStorage.getItem('admin_role')
    
    if (!token) {
      return <Navigate to="/login" replace />
    }
    
    // If no role is set, redirect to login to set proper role
    if (!role) {
      return <Navigate to="/login" replace />
    }
    
    return children
  }

  // Simple fallback component for loading states
  function FallbackComponent() {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h1>Loading...</h1>
        <p>Please wait while the page loads.</p>
      </div>
    )
  }

  return (
    <ErrorBoundary>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        
        <Route
          path="/unauthorized"
          element={
            <div style={{ padding: '20px', textAlign: 'center' }}>
              <h1>Unauthorized Access</h1>
              <p>You don't have permission to access this page.</p>
              <button onClick={() => window.location.href = '/login'}>Go to Login</button>
            </div>
          }
        />
        
        {/* Dashboard Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <AdminLayout>
                <HotelAdminDashboardPage />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        
        
        <Route
          path="/hotel-management"
          element={
            <ProtectedRoute>
              <AdminLayout>
                <HotelManagementPage />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/vehicle-management"
          element={
            <ProtectedRoute>
              <AdminLayout>
                <VehicleManagementPage />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/expenditure-management"
          element={
            <ProtectedRoute>
              <AdminLayout>
                <ExpenditureManagementPage />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/receipt-generation"
          element={
            <ProtectedRoute>
              <AdminLayout>
                <ReceiptGenerationPage />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/package-dashboard"
          element={
            <ProtectedRoute>
              <AdminLayout>
                <PackageAdminDashboardPage />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/package-management"
          element={
            <ProtectedRoute>
              <AdminLayout>
                <PackageManagementPage />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        
        {/* Destinations Route */}
        <Route
          path="/destinations"
          element={
            <ProtectedRoute>
              <AdminLayout>
                <DestinationsPage />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        
        {/* Bookings Route */}
        <Route
          path="/bookings"
          element={
            <ProtectedRoute>
              <AdminLayout>
                <BookingPage />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        
        <Route
          path="*"
          element={
            localStorage.getItem('admin_token') ? (
              (() => {
                const role = localStorage.getItem('admin_role')
                if (role === 'hotel_admin') return <Navigate to="/dashboard" replace />
                if (role === 'package_admin') return <Navigate to="/package-dashboard" replace />
                return <Navigate to="/dashboard" replace />
              })()
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
      </Routes>
    </ErrorBoundary>
  )
}

export default App