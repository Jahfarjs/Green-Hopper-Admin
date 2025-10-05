import React from 'react'
import { NavLink } from 'react-router-dom'
import logo from '../assets/logo-white.png'
import {
  HomeIcon,
  MapPinIcon,
  CalendarIcon,
  BuildingOfficeIcon,
  CubeIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline'

function Sidebar() {
  const role = localStorage.getItem('admin_role')
  
  // Define navigation items based on admin roles
  const navItems = [
    // Dashboard links
    { to: '/dashboard', label: 'Dashboard', icon: HomeIcon, roles: ['hotel_admin'] },
    { to: '/package-dashboard', label: 'Dashboard', icon: HomeIcon, roles: ['package_admin'] },
    
    // Destinations section (Hotel Admin now has access)
    { to: '/destinations', label: 'Destinations', icon: MapPinIcon, roles: ['hotel_admin'] },
    
    // Hotel Management section (Hotel Admin only)
    { to: '/hotel-management', label: 'Hotel Management', icon: BuildingOfficeIcon, roles: ['hotel_admin'] },
    { to: '/expenditure-management', label: 'Expenditure Management', icon: CurrencyDollarIcon, roles: ['hotel_admin'] },
    { to: '/receipt-generation', label: 'Receipt Generation', icon: DocumentTextIcon, roles: ['hotel_admin'] },
    
    // Package Management section (Package Admin only)
    { to: '/package-management', label: 'Package Management', icon: CubeIcon, roles: ['package_admin'] },
    
    // Bookings section (Hotel Admin now has access)
    { to: '/bookings', label: 'Bookings', icon: CalendarIcon, roles: ['hotel_admin'] },
  ]
  
  // Filter navigation items based on user role
  const filteredNavItems = navItems.filter(item => 
    !item.roles || item.roles.includes(role)
  )

  return (
    <aside className="fixed top-0 left-0 h-full w-64 bg-[#0f1310] border-r border-[#5B8424]/20 p-6 hidden md:flex md:flex-col z-30">
      <div className="flex justify-center mb-8">
        <img src={logo} alt="GreenHopper" className="h-12" />
      </div>
      <nav className="space-y-2">
        {filteredNavItems.map(({ to, label, icon: Icon, end, subItems }) => (
          <div key={to}>
            <NavLink
              to={to}
              end={end}
              className={({ isActive }) => `group flex items-center gap-3 px-4 py-2 rounded-lg transition-colors border border-transparent ${isActive ? 'bg-[#121a14] text-white border-[#5B8424]/30' : 'text-white/70 hover:text-white hover:bg-white/5'}`}
            >
              <Icon className="h-5 w-5 text-white/50 group-hover:text-white" />
              <span className="font-medium">{label}</span>
            </NavLink>
            {subItems && (
              <div className="ml-8 mt-2 space-y-1">
                {subItems.map((subItem) => (
                  <NavLink
                    key={subItem.to}
                    to={subItem.to}
                    end={subItem.end}
                    className={({ isActive }) => `group flex items-center gap-2 px-3 py-1.5 rounded-md transition-colors text-sm ${isActive ? 'bg-[#5B8424]/20 text-white' : 'text-white/60 hover:text-white hover:bg-white/5'}`}
                  >
                    <subItem.icon className="h-4 w-4 text-white/40 group-hover:text-white" />
                    <span>{subItem.label}</span>
                  </NavLink>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>
    </aside>
  )
}

export default Sidebar
