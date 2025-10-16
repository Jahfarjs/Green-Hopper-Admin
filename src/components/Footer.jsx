import React from 'react'
import { useLocation, NavLink } from 'react-router-dom'
import { 
  HomeIcon,
  MapPinIcon,
  CalendarIcon,
  BuildingOfficeIcon,
  CubeIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  TruckIcon
} from '@heroicons/react/24/outline'

function Footer() {
  const location = useLocation()
  const currentRole = localStorage.getItem('admin_role')

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

  return (
    <footer className="fixed bottom-0 left-0 right-0 z-30 bg-[#0f1310] border-t border-[#5B8424]/20 px-6 py-3">
      <div className="flex items-center justify-center gap-1 flex-wrap">
        {filteredNavItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => 
              `flex items-center gap-2 px-3 py-2 rounded-lg transition-colors whitespace-nowrap ${
                isActive 
                  ? 'bg-[#5B8424]/20 text-white border border-[#5B8424]/30' 
                  : 'text-white/70 hover:text-white hover:bg-white/5'
              }`
            }
          >
            <Icon className="h-4 w-4" />
            <span className="text-sm font-medium">{label}</span>
          </NavLink>
        ))}
      </div>
    </footer>
  )
}

export default Footer
