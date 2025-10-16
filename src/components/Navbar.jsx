import React, { useMemo, useState } from 'react'
import { useLocation, useNavigate, NavLink } from 'react-router-dom'
import { 
  ArrowRightOnRectangleIcon, 
  UserCircleIcon,
  HomeIcon,
  MapPinIcon,
  CalendarIcon,
  BuildingOfficeIcon,
  CubeIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  TruckIcon
} from '@heroicons/react/24/outline'
import logo from '../assets/logo-white.png'

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
    if (path.includes('/bookings')) return 'GREEN HOPPER'
    if (path.includes('/destinations')) return 'GREEN HOPPER'
    return 'GREEN HOPPER'
  }, [location.pathname])

  const currentRole = localStorage.getItem('admin_role')
  const roleDisplayName = useMemo(() => {
    switch (currentRole) {
      case 'admin': return 'Main Admin'
      case 'hotel_admin': return 'Hotel Admin'
      case 'package_admin': return 'Package Admin'
      default: return 'Admin'
    }
  }, [currentRole])

  // Define navigation items based on admin roles
  const navItems = [
    // Dashboard links
    { to: '/dashboard', label: 'Dashboard', icon: HomeIcon, roles: ['hotel_admin'] },
    { to: '/package-dashboard', label: 'Dashboard', icon: HomeIcon, roles: ['package_admin'] },
    
    // Destinations section (Hotel Admin now has access)
    { to: '/destinations', label: 'Destinations', icon: MapPinIcon, roles: ['hotel_admin'] },
    
    // Hotel Management section (Hotel Admin only)
    { to: '/hotel-management', label: 'Hotel Management', icon: BuildingOfficeIcon, roles: ['hotel_admin'] },
    { to: '/vehicle-management', label: 'Vehicle Management', icon: TruckIcon, roles: ['hotel_admin'] },
    { to: '/expenditure-management', label: 'Expenditure Management', icon: CurrencyDollarIcon, roles: ['hotel_admin'] },
    { to: '/receipt-generation', label: 'Receipt Generation', icon: DocumentTextIcon, roles: ['hotel_admin'] },
    
    // Package Management section (Package Admin only)
    { to: '/package-management', label: 'Package Management', icon: CubeIcon, roles: ['package_admin'] },
    
    // Bookings section (Hotel Admin now has access)
    { to: '/bookings', label: 'Bookings', icon: CalendarIcon, roles: ['hotel_admin'] },
  ]
  
  // Filter navigation items based on user role
  const filteredNavItems = navItems.filter(item => 
    !item.roles || item.roles.includes(currentRole)
  )

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
          <div className="flex items-center gap-1">
            {/* Logout button */}
            <button 
              onClick={() => setLogoutDialog(true)} 
              className="flex items-center gap-2 px-3 py-2 text-white/70 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
            >
              <ArrowRightOnRectangleIcon className="h-4 w-4" />
              <span className="text-sm font-medium">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Logout Confirmation Modal */}
      {logoutDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0">
                <ArrowRightOnRectangleIcon className="w-8 h-8 text-red-500" />
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-medium text-white">Logout</h3>
                <p className="text-sm text-gray-400">
                  Are you sure you want to logout? You will need to login again to access the admin panel.
                </p>
              </div>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={() => setLogoutDialog(false)}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default Navbar
