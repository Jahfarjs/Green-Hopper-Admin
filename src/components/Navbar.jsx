import React, { useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { ArrowRightOnRectangleIcon, UserCircleIcon, DocumentTextIcon } from '@heroicons/react/24/outline'
import logo from '../assets/logo-white.png'
import ConfirmationDialog from './ConfirmationDialog'

function useAuthHeader() {
  return useMemo(() => ({
    Authorization: `Bearer ${localStorage.getItem('admin_token') || ''}`
  }), [])
}

function Navbar() {
  const location = useLocation()
  const navigate = useNavigate()
  const [logoutDialog, setLogoutDialog] = useState(false)

  const pageTitle = useMemo(() => {
    const path = location.pathname
    if (path.includes('/dashboard')) return 'Dashboard'
    if (path.includes('/hotels')) return 'Hotels Management'
    if (path.includes('/destinations')) return 'Destinations Management'
    if (path.includes('/customers')) return 'Customers Management'
    if (path.includes('/packages')) return 'Packages Management'
    if (path.includes('/hotel-bookings')) return 'Hotel Bookings Management'
    if (path.includes('/payments')) return 'Payments Management'
    if (path.includes('/expenses')) return 'Expenses Management'
    if (path.includes('/transports')) return 'Transports Management'
    return 'Admin Panel'
  }, [location.pathname])

  const handleLogout = () => {
    localStorage.removeItem('admin_token')
    window.location.href = '/admin/login'
  }

  return (
    <>
      <header className="sticky top-0 z-40 bg-[#0f1310] border-b border-[#5B8424]/20 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img src={logo} alt="GreenHopper Holidays" className="h-8" />
            <h1 className="text-white text-xl font-bold">{pageTitle}</h1>
          </div>
          <div className="flex items-center gap-4">
            {/* Package Details Button - Special Important Button */}
            <button 
              onClick={() => navigate('/dashboard/package-details')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105 ${
                location.pathname.includes('/package-details') 
                  ? 'bg-gradient-to-r from-[#5B8424] to-[#4a6f1e] text-white shadow-lg shadow-[#5B8424]/30' 
                  : 'bg-gradient-to-r from-[#5B8424] to-[#4a6f1e] text-white hover:from-[#6b9a2a] hover:to-[#5B8424] shadow-md hover:shadow-lg shadow-[#5B8424]/20 hover:shadow-[#5B8424]/40'
              }`}
            >
              <DocumentTextIcon className="h-5 w-5" />
              <span className="hidden sm:inline">Package Details</span>
            </button>
            
            <div className="hidden md:flex items-center gap-2 text-white/50">
              <UserCircleIcon className="h-6 w-6" />
            </div>
            <button 
              onClick={() => setLogoutDialog(true)} 
              className="flex items-center gap-2 px-3 py-2 text-white/70 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
            >
              <ArrowRightOnRectangleIcon className="h-5 w-5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      <ConfirmationDialog
        isOpen={logoutDialog}
        onClose={() => setLogoutDialog(false)}
        onConfirm={handleLogout}
        title="Logout"
        message="Are you sure you want to logout? You will need to login again to access the admin panel."
        confirmText="Logout"
        confirmButtonClass="bg-red-600 hover:bg-red-700"
      />
    </>
  )
}

export default Navbar
