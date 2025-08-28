import React, { useEffect, useMemo, useState } from 'react'
import { Routes, Route, useNavigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import Navbar from '../components/Navbar'
import PageControls from '../components/PageControls'
import HotelsPage from './HotelsPage'
import DestinationsPage from './DestinationsPage'
import CustomersPage from './CustomersPage'
import PackagesPage from './PackagesPage'
import PackageDetailsPage from './PackageDetailsPage'
import HotelBookingsPage from './HotelBookingsPage'
import PaymentsPage from './PaymentsPage'
import ExpensesPage from './ExpensesPage'
import TransportsPage from './TransportsPage'
import {
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline'

const API_BASE_URL = import.meta.env.VITE_ADMIN_API_URL

function useAuthHeader() {
  return useMemo(() => ({
    Authorization: `Bearer ${localStorage.getItem('admin_token') || ''}`
  }), [])
}

function StatusBadge({ status }) {
  const map = {
    pending: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    accepted: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    rejected: 'bg-red-500/10 text-red-400 border-red-500/20',
  }
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs border capitalize ${map[status] || 'bg-white/5 text-white/70 border-white/10'}`}>{status}</span>
  )
}

function BookingTable({ statusFilter }) {
  const headers = useAuthHeader()
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')
  const [viewMode, setViewMode] = useState('table')
  const [sortBy, setSortBy] = useState('name')
  const [sortOrder, setSortOrder] = useState('asc')

  const sortOptions = [
    { value: 'name', label: 'Name' },
    { value: 'email', label: 'Email' },
    { value: 'destination', label: 'Destination' },
    { value: 'preferredDate', label: 'Preferred Date' },
    { value: 'status', label: 'Status' },
  ]

  const fetchBookings = async () => {
    setError('')
    setLoading(true)
    try {
      const path = statusFilter ? `/admin/bookings/status/${statusFilter}` : '/admin/bookings'
      const res = await fetch(`${API_BASE_URL}${path}`, {
        headers
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.message || 'Failed to fetch bookings')
      setBookings(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchBookings() }, [statusFilter])

  const updateStatus = async (id, status) => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/bookings/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...headers },
        body: JSON.stringify({ status })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.message || 'Failed to update status')
      await fetchBookings()
    } catch (err) {
      setError(err.message)
    }
  }

  const filteredAndSortedBookings = useMemo(() => {
    let filtered = bookings.filter((b) => {
      const target = `${b.name} ${b.email} ${b.destination}`.toLowerCase()
      return target.includes(query.toLowerCase())
    })

    // Sort the filtered results
    filtered.sort((a, b) => {
      let aValue, bValue
      
      switch (sortBy) {
        case 'name':
          aValue = a.name?.toLowerCase() || ''
          bValue = b.name?.toLowerCase() || ''
          break
        case 'email':
          aValue = a.email?.toLowerCase() || ''
          bValue = b.email?.toLowerCase() || ''
          break
        case 'destination':
          aValue = a.destination?.toLowerCase() || ''
          bValue = b.destination?.toLowerCase() || ''
          break
        case 'preferredDate':
          aValue = new Date(a.preferredDate || 0)
          bValue = new Date(b.preferredDate || 0)
          break
        case 'status':
          aValue = a.status?.toLowerCase() || ''
          bValue = b.status?.toLowerCase() || ''
          break
        default:
          aValue = a.name?.toLowerCase() || ''
          bValue = b.name?.toLowerCase() || ''
      }

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortOrder === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue)
      } else {
        return sortOrder === 'asc' ? aValue - bValue : bValue - aValue
      }
    })

    return filtered
  }, [bookings, query, sortBy, sortOrder])

  return (
    <div className="p-6">
      <PageControls
        query={query}
        onQueryChange={setQuery}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        sortBy={sortBy}
        onSortByChange={setSortBy}
        sortOrder={sortOrder}
        onSortOrderChange={setSortOrder}
        sortOptions={sortOptions}
        searchPlaceholder="Search bookings..."
        showViewToggle={false}
      />

      {loading && <div className="text-white/60 text-center py-8">Loading...</div>}
      {error && <div className="text-red-300 text-sm mb-4">{error}</div>}

      <div className="overflow-x-auto rounded-xl border border-white/10">
        <table className="min-w-full text-sm text-white/90">
          <thead>
            <tr className="bg-white/5 text-white/70">
              <th className="px-4 py-3 text-left font-medium">Name</th>
              <th className="px-4 py-3 text-left font-medium">Email</th>
              <th className="px-4 py-3 text-left font-medium">Destination</th>
              <th className="px-4 py-3 text-left font-medium">Preferred Date</th>
              <th className="px-4 py-3 text-left font-medium">Status</th>
              <th className="px-4 py-3 text-left font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredAndSortedBookings.map((b) => (
              <tr key={b._id} className="border-t border-white/5 hover:bg-white/[0.03]">
                <td className="px-4 py-3">{b.name}</td>
                <td className="px-4 py-3">{b.email}</td>
                <td className="px-4 py-3">{b.destination}</td>
                <td className="px-4 py-3">{new Date(b.preferredDate).toLocaleDateString()}</td>
                <td className="px-4 py-3"><StatusBadge status={b.status} /></td>
                <td className="px-4 py-3 space-x-2">
                  <button onClick={() => updateStatus(b._id, 'accepted')} className="px-3 py-1 rounded-lg bg-emerald-600/80 hover:bg-emerald-600 transition-colors">Accept</button>
                  <button onClick={() => updateStatus(b._id, 'rejected')} className="px-3 py-1 rounded-lg bg-red-600/80 hover:bg-red-600 transition-colors">Reject</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredAndSortedBookings.length === 0 && !loading && (
        <div className="text-center py-8 text-white/60">
          No bookings found
        </div>
      )}
    </div>
  )
}

function DashboardLayout() {
  return (
    <div className="h-screen bg-gradient-to-b from-black via-[#0b0b0b] to-[#111111] text-white flex overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col md:ml-64">
        <Navbar />
        <div className="flex-1 overflow-y-auto p-2 md:p-4">
          <Routes>
            <Route index element={<BookingTable />} />
            <Route path="pending" element={<BookingTable statusFilter="pending" />} />
            <Route path="accepted" element={<BookingTable statusFilter="accepted" />} />
            <Route path="rejected" element={<BookingTable statusFilter="rejected" />} />
            <Route path="hotels" element={<HotelsPage />} />
            <Route path="destinations" element={<DestinationsPage />} />
            <Route path="customers" element={<CustomersPage />} />
            <Route path="packages" element={<PackagesPage />} />
            <Route path="package-details" element={<PackageDetailsPage />} />
            <Route path="hotel-bookings" element={<HotelBookingsPage />} />
            <Route path="payments" element={<PaymentsPage />} />
            <Route path="expenses" element={<ExpensesPage />} />
            <Route path="transports" element={<TransportsPage />} />
          </Routes>
        </div>
      </div>
    </div>
  )
}

function DashboardPage() {
  const navigate = useNavigate()
  useEffect(() => {
    const token = localStorage.getItem('admin_token')
    if (!token) navigate('/login', { replace: true })
  }, [])
  return <DashboardLayout />
}

export default DashboardPage


