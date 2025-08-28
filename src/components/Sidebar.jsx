import React from 'react'
import { NavLink } from 'react-router-dom'
import logo from '../assets/logo-white.png'
import {
  HomeIcon,
  ClockIcon,
  CheckBadgeIcon,
  XCircleIcon,
  BuildingOfficeIcon,
  MapPinIcon,
  UsersIcon,
  BriefcaseIcon,
  BuildingOffice2Icon,
  CreditCardIcon,
  BanknotesIcon,
  TruckIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline'

function Sidebar() {
  const navItems = [
    { 
      to: '/dashboard', 
      label: 'Bookings', 
      icon: HomeIcon, 
      end: true,
      subItems: [
        { to: '/dashboard', label: 'All Bookings', icon: HomeIcon, end: true },
        { to: '/dashboard/pending', label: 'Pending', icon: ClockIcon },
        { to: '/dashboard/accepted', label: 'Accepted', icon: CheckBadgeIcon },
        { to: '/dashboard/rejected', label: 'Rejected', icon: XCircleIcon },
      ]
    },
    { to: '/dashboard/hotels', label: 'Hotels', icon: BuildingOfficeIcon },
    { to: '/dashboard/destinations', label: 'Destinations', icon: MapPinIcon },
    { to: '/dashboard/customers', label: 'Customers', icon: UsersIcon },
    { to: '/dashboard/packages', label: 'Packages', icon: BriefcaseIcon },
    { to: '/dashboard/hotel-bookings', label: 'Hotel Bookings', icon: BuildingOffice2Icon },
    { to: '/dashboard/payments', label: 'Payments', icon: CreditCardIcon },
    { to: '/dashboard/expenses', label: 'Expenses', icon: BanknotesIcon },
    { to: '/dashboard/transports', label: 'Transports', icon: TruckIcon },
  ]

  return (
    <aside className="fixed top-0 left-0 h-full w-64 bg-[#0f1310] border-r border-[#5B8424]/20 p-6 hidden md:flex md:flex-col z-30">
      <div className="flex justify-center mb-8">
        <img src={logo} alt="GreenHopper" className="h-12" />
      </div>
      <nav className="space-y-2">
        {navItems.map(({ to, label, icon: Icon, end, subItems }) => (
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
