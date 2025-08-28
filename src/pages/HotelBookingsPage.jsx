import React, { useEffect, useMemo, useState } from 'react'
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline'
import ConfirmationDialog from '../components/ConfirmationDialog'
import PageControls from '../components/PageControls'
import DataDetailsModal from '../components/DataDetailsModal'

const API_BASE_URL = import.meta.env.VITE_ADMIN_API_URL

function useAuthHeader() {
  return useMemo(() => ({
    Authorization: `Bearer ${localStorage.getItem('admin_token') || ''}`
  }), [])
}

function HotelBookingForm({ booking, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    package: booking?.package?._id || booking?.package || '',
    destination: booking?.destination?._id || booking?.destination || '',
    hotel: booking?.hotel?._id || booking?.hotel || '',
    checkIn: booking?.checkIn ? new Date(booking.checkIn).toISOString().split('T')[0] : '',
    checkOut: booking?.checkOut ? new Date(booking.checkOut).toISOString().split('T')[0] : '',
    noOfNights: booking?.noOfNights || '',
    noOfPaxs: booking?.noOfPaxs || '',
    noOfRooms: booking?.noOfRooms || '',
    roomRate: booking?.roomRate || '',
    typeOfRoom: booking?.typeOfRoom || '',
    extraBedRate: booking?.extraBedRate || 0,
    paid: booking?.paid || 0,
    cutOffDate: booking?.cutOffDate ? new Date(booking.cutOffDate).toISOString().split('T')[0] : ''
  })
  const [packages, setPackages] = useState([])
  const [destinations, setDestinations] = useState([])
  const [hotels, setHotels] = useState([])
  const [selectedHotel, setSelectedHotel] = useState(null)
  const [roomCategories, setRoomCategories] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const headers = useAuthHeader()

  useEffect(() => {
    fetchPackages()
    fetchDestinations()
  }, [])

  useEffect(() => {
    if (formData.destination) {
      fetchHotelsByDestination(formData.destination)
    } else {
      setHotels([])
      setFormData(prev => ({ ...prev, hotel: '', typeOfRoom: '' }))
      setSelectedHotel(null)
      setRoomCategories([])
    }
  }, [formData.destination])

  useEffect(() => {
    if (formData.hotel) {
      const hotel = hotels.find(h => h._id === formData.hotel)
      if (hotel) {
        setSelectedHotel(hotel)
        setRoomCategories(hotel.roomCategories || [])
        setFormData(prev => ({ ...prev, typeOfRoom: '' }))
      }
    } else {
      setSelectedHotel(null)
      setRoomCategories([])
      setFormData(prev => ({ ...prev, typeOfRoom: '' }))
    }
  }, [formData.hotel, hotels])

  const fetchPackages = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/packages`, {
        headers
      })
      const data = await res.json()
      if (res.ok) setPackages(data)
    } catch (error) {
      console.error('Error fetching packages:', error)
    }
  }

  const fetchDestinations = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/destinations`, {
        headers
      })
      const data = await res.json()
      if (res.ok) setDestinations(data)
    } catch (error) {
      console.error('Error fetching destinations:', error)
    }
  }

  const fetchHotelsByDestination = async (destinationId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/hotels/destination/${destinationId}`, {
        headers
      })
      const data = await res.json()
      if (res.ok) setHotels(data)
    } catch (error) {
      console.error('Error fetching hotels:', error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const url = booking ? `${API_BASE_URL}/hotel-bookings/${booking._id}` : `${API_BASE_URL}/hotel-bookings`
      const method = booking ? 'PUT' : 'POST'
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', ...headers },
        body: JSON.stringify(formData)
      })
      
      const data = await res.json()
      if (!res.ok) throw new Error(data?.message || 'Failed to save hotel booking')
      
      onSave(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-[#0f1310] rounded-xl border border-[#5B8424]/20 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-[#5B8424]/20">
          <div className="flex items-center justify-between">
            <h2 className="text-white text-xl font-semibold">
              {booking ? 'Edit Hotel Booking' : 'Add New Hotel Booking'}
            </h2>
            <button onClick={onCancel} className="text-white/70 hover:text-white">
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-300 text-sm">
              {error}
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">
                Package *
              </label>
              <select
                value={formData.package}
                onChange={(e) => setFormData(prev => ({ ...prev, package: e.target.value }))}
                required
                className="w-full px-3 py-2 rounded-lg bg-[#0c0c0c] border border-white/10 text-white focus:outline-none focus:border-[#5B8424]"
              >
                <option value="">Select Package</option>
                {packages.map(pkg => (
                  <option key={pkg._id} value={pkg._id}>
                    {pkg.packageCode} - {pkg.customer?.name || 'N/A'}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">
                Destination *
              </label>
              <select
                value={formData.destination}
                onChange={(e) => setFormData(prev => ({ ...prev, destination: e.target.value, hotel: '' }))}
                required
                className="w-full px-3 py-2 rounded-lg bg-[#0c0c0c] border border-white/10 text-white focus:outline-none focus:border-[#5B8424]"
              >
                <option value="">Select Destination</option>
                {destinations.map(dest => (
                  <option key={dest._id} value={dest._id}>
                    {dest.destinationName} - {dest.country}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">
                Hotel *
              </label>
              <select
                value={formData.hotel}
                onChange={(e) => setFormData(prev => ({ ...prev, hotel: e.target.value, typeOfRoom: '' }))}
                required
                disabled={!formData.destination}
                className="w-full px-3 py-2 rounded-lg bg-[#0c0c0c] border border-white/10 text-white focus:outline-none focus:border-[#5B8424] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="">Select Hotel</option>
                {hotels.map(hotel => (
                  <option key={hotel._id} value={hotel._id}>
                    {hotel.hotelName}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">
                Check-in Date *
              </label>
              <input
                type="date"
                value={formData.checkIn}
                onChange={(e) => setFormData(prev => ({ ...prev, checkIn: e.target.value }))}
                required
                className="w-full px-3 py-2 rounded-lg bg-[#0c0c0c] border border-white/10 text-white focus:outline-none focus:border-[#5B8424]"
              />
            </div>
            
            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">
                Check-out Date *
              </label>
              <input
                type="date"
                value={formData.checkOut}
                onChange={(e) => setFormData(prev => ({ ...prev, checkOut: e.target.value }))}
                required
                className="w-full px-3 py-2 rounded-lg bg-[#0c0c0c] border border-white/10 text-white focus:outline-none focus:border-[#5B8424]"
              />
            </div>
            
            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">
                Number of Nights *
              </label>
              <input
                type="number"
                min="1"
                value={formData.noOfNights}
                onChange={(e) => setFormData(prev => ({ ...prev, noOfNights: parseInt(e.target.value) || '' }))}
                required
                className="w-full px-3 py-2 rounded-lg bg-[#0c0c0c] border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-[#5B8424]"
                placeholder="Number of nights"
              />
            </div>
            
            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">
                Number of Passengers *
              </label>
              <input
                type="number"
                min="1"
                value={formData.noOfPaxs}
                onChange={(e) => setFormData(prev => ({ ...prev, noOfPaxs: parseInt(e.target.value) || '' }))}
                required
                className="w-full px-3 py-2 rounded-lg bg-[#0c0c0c] border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-[#5B8424]"
                placeholder="Number of passengers"
              />
            </div>
            
            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">
                Number of Rooms *
              </label>
              <input
                type="number"
                min="1"
                value={formData.noOfRooms}
                onChange={(e) => setFormData(prev => ({ ...prev, noOfRooms: parseInt(e.target.value) || '' }))}
                required
                className="w-full px-3 py-2 rounded-lg bg-[#0c0c0c] border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-[#5B8424]"
                placeholder="Number of rooms"
              />
            </div>
            
            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">
                Room Rate *
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.roomRate}
                onChange={(e) => setFormData(prev => ({ ...prev, roomRate: parseFloat(e.target.value) || '' }))}
                required
                className="w-full px-3 py-2 rounded-lg bg-[#0c0c0c] border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-[#5B8424]"
                placeholder="0.00"
              />
            </div>
            
            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">
                Type of Room *
              </label>
              <select
                value={formData.typeOfRoom}
                onChange={(e) => setFormData(prev => ({ ...prev, typeOfRoom: e.target.value }))}
                required
                disabled={!formData.hotel}
                className="w-full px-3 py-2 rounded-lg bg-[#0c0c0c] border border-white/10 text-white focus:outline-none focus:border-[#5B8424] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="">Select Room Category</option>
                {roomCategories.map(category => (
                  <option key={category.categoryName} value={category.categoryName}>
                    {category.categoryName}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">
                Extra Bed Rate
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.extraBedRate}
                onChange={(e) => setFormData(prev => ({ ...prev, extraBedRate: parseFloat(e.target.value) || 0 }))}
                className="w-full px-3 py-2 rounded-lg bg-[#0c0c0c] border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-[#5B8424]"
                placeholder="0.00"
              />
            </div>
            
            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">
                Amount Paid
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.paid}
                onChange={(e) => setFormData(prev => ({ ...prev, paid: parseFloat(e.target.value) || 0 }))}
                className="w-full px-3 py-2 rounded-lg bg-[#0c0c0c] border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-[#5B8424]"
                placeholder="0.00"
              />
            </div>
            
            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">
                Cut-off Date *
              </label>
              <input
                type="date"
                value={formData.cutOffDate}
                onChange={(e) => setFormData(prev => ({ ...prev, cutOffDate: e.target.value }))}
                required
                className="w-full px-3 py-2 rounded-lg bg-[#0c0c0c] border border-white/10 text-white focus:outline-none focus:border-[#5B8424]"
              />
            </div>
          </div>

          <div className="border-t border-white/10 pt-6">
            <div className="bg-white/5 rounded-lg p-4 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-white/80">Room Total:</span>
                <span className="text-white">₹{((formData.noOfRooms || 0) * (formData.roomRate || 0) * (formData.noOfNights || 0)).toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white/80">Extra Bed Total:</span>
                <span className="text-white">₹{((formData.extraBedRate || 0) * (formData.noOfNights || 0)).toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center border-t border-white/10 pt-2">
                <span className="text-white/80 font-medium">Net Total:</span>
                <span className="text-white text-xl font-bold">₹{(((formData.noOfRooms || 0) * (formData.roomRate || 0) * (formData.noOfNights || 0)) + ((formData.extraBedRate || 0) * (formData.noOfNights || 0))).toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white/80">Amount Paid:</span>
                <span className="text-white">₹{(formData.paid || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center border-t border-white/10 pt-2">
                <span className="text-white/80 font-medium">Balance:</span>
                <span className="text-white text-xl font-bold">₹{(((formData.noOfRooms || 0) * (formData.roomRate || 0) * (formData.noOfNights || 0)) + ((formData.extraBedRate || 0) * (formData.noOfNights || 0)) - (formData.paid || 0)).toLocaleString()}</span>
              </div>
            </div>
          </div>
          
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-[#5B8424] hover:bg-[#5B8424]/80 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? 'Saving...' : (booking ? 'Update Hotel Booking' : 'Add Hotel Booking')}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function HotelBookingsPage() {
  const [hotelBookings, setHotelBookings] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingBooking, setEditingBooking] = useState(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [deletingBooking, setDeletingBooking] = useState(null)
  const [viewMode, setViewMode] = useState('cards')
  const [sortBy, setSortBy] = useState('checkInDate')
  const [sortOrder, setSortOrder] = useState('desc')
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [selectedBooking, setSelectedBooking] = useState(null)
  const headers = useAuthHeader()

  const sortOptions = [
    { value: 'checkInDate', label: 'Check-in Date' },
    { value: 'checkOutDate', label: 'Check-out Date' },
    { value: 'customerName', label: 'Customer Name' },
    { value: 'destinationName', label: 'Destination Name' },
    { value: 'hotelName', label: 'Hotel Name' },
    { value: 'totalAmount', label: 'Total Amount' },
    { value: 'status', label: 'Status' },
  ]

  const bookingFields = [
    { key: 'package.customer.name', label: 'Customer Name', type: 'text' },
    { key: 'package.packageCode', label: 'Package Code', type: 'text' },
    { key: 'destination.destinationName', label: 'Destination', type: 'text' },
    { key: 'hotel.hotelName', label: 'Hotel', type: 'text' },
    { key: 'checkIn', label: 'Check-in Date', type: 'date' },
    { key: 'checkOut', label: 'Check-out Date', type: 'date' },
    { key: 'noOfNights', label: 'Number of Nights', type: 'number' },
    { key: 'noOfPaxs', label: 'Number of Passengers', type: 'number' },
    { key: 'noOfRooms', label: 'Number of Rooms', type: 'number' },
    { key: 'roomRate', label: 'Room Rate', type: 'currency' },
    { key: 'typeOfRoom', label: 'Type of Room', type: 'text' },
    { key: 'extraBedRate', label: 'Extra Bed Rate', type: 'currency' },
    { key: 'paid', label: 'Amount Paid', type: 'currency' },
    { key: 'cutOffDate', label: 'Cut-off Date', type: 'date' },
  ]

  const fetchHotelBookings = async () => {
    setError('')
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE_URL}/hotel-bookings`, {
        headers
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.message || 'Failed to fetch hotel bookings')
      setHotelBookings(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchHotelBookings()
  }, [])

  const handleSave = (booking) => {
    if (editingBooking) {
      setHotelBookings(prev => prev.map(b => b._id === booking._id ? booking : b))
    } else {
      setHotelBookings(prev => [booking, ...prev])
    }
    setShowForm(false)
    setEditingBooking(null)
  }

  const handleEdit = (booking) => {
    setEditingBooking(booking)
    setShowForm(true)
  }

  const handleDelete = async () => {
    if (!deletingBooking) return
    
    try {
      const res = await fetch(`${API_BASE_URL}/hotel-bookings/${deletingBooking._id}`, {
        method: 'DELETE',
        headers
      })
      
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data?.message || 'Failed to delete hotel booking')
      }
      
      setHotelBookings(prev => prev.filter(b => b._id !== deletingBooking._id))
      setShowDeleteDialog(false)
      setDeletingBooking(null)
    } catch (err) {
      setError(err.message)
    }
  }

  const handleViewDetails = (booking) => {
    setSelectedBooking(booking)
    setShowDetailsModal(true)
  }

  const filteredAndSortedBookings = useMemo(() => {
    let filtered = hotelBookings.filter((booking) => {
      const target = `${booking.package?.customer?.name || ''} ${booking.package?.packageCode || ''} ${booking.destination?.destinationName || ''} ${booking.hotel?.hotelName || ''} ${booking.typeOfRoom || ''}`.toLowerCase()
      return target.includes(query.toLowerCase())
    })

    // Sort the filtered results
    filtered.sort((a, b) => {
      let aValue, bValue
      
      switch (sortBy) {
        case 'checkInDate':
          aValue = new Date(a.checkIn || 0)
          bValue = new Date(b.checkIn || 0)
          break
        case 'checkOutDate':
          aValue = new Date(a.checkOut || 0)
          bValue = new Date(b.checkOut || 0)
          break
        case 'customerName':
          aValue = a.package?.customer?.name?.toLowerCase() || ''
          bValue = b.package?.customer?.name?.toLowerCase() || ''
          break
        case 'destinationName':
          aValue = a.destination?.destinationName?.toLowerCase() || ''
          bValue = b.destination?.destinationName?.toLowerCase() || ''
          break
        case 'hotelName':
          aValue = a.hotel?.hotelName?.toLowerCase() || ''
          bValue = b.hotel?.hotelName?.toLowerCase() || ''
          break
        case 'totalAmount':
          aValue = ((a.noOfRooms || 0) * (a.roomRate || 0) * (a.noOfNights || 0)) + ((a.extraBedRate || 0) * (a.noOfNights || 0))
          bValue = ((b.noOfRooms || 0) * (b.roomRate || 0) * (b.noOfNights || 0)) + ((b.extraBedRate || 0) * (b.noOfNights || 0))
          break
        case 'status':
          aValue = a.status?.toLowerCase() || ''
          bValue = b.status?.toLowerCase() || ''
          break
        default:
          aValue = new Date(a.checkIn || 0)
          bValue = new Date(b.checkIn || 0)
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
  }, [hotelBookings, query, sortBy, sortOrder])

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-white">Hotel Bookings Management</h1>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#5B8424] hover:bg-[#5B8424]/80 text-white rounded-lg transition-colors"
        >
          <PlusIcon className="h-5 w-5" />
          Add Hotel Booking
        </button>
      </div>

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
        searchPlaceholder="Search hotel bookings..."
      />

      {loading && <div className="text-white/60 text-center py-8">Loading...</div>}
      {error && <div className="text-red-300 text-sm mb-4">{error}</div>}

      {viewMode === 'cards' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {filteredAndSortedBookings.map((booking) => (
            <div 
              key={booking._id} 
              className="bg-[#0c0c0c] rounded-lg border border-white/10 p-3 cursor-pointer hover:bg-[#0c0c0c]/80 transition-colors"
              onClick={() => handleViewDetails(booking)}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-medium text-sm truncate">{booking.package?.customer?.name || 'N/A'}</h3>
                  <p className="text-white/60 text-xs">{booking.package?.packageCode || 'N/A'}</p>
                  <p className="text-white/60 text-xs">{booking.destination?.destinationName || 'N/A'}</p>
                </div>
                <div className="flex gap-1 ml-2" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => handleEdit(booking)}
                    className="p-1 text-white/60 hover:text-white transition-colors"
                  >
                    <PencilIcon className="h-3 w-3" />
                  </button>
                  <button
                    onClick={() => {
                      setDeletingBooking(booking)
                      setShowDeleteDialog(true)
                    }}
                    className="p-1 text-red-400 hover:text-red-300 transition-colors"
                  >
                    <TrashIcon className="h-3 w-3" />
                  </button>
                </div>
              </div>
              
              <div className="space-y-1 text-xs">
                <div className="text-white/70">
                  <span className="font-medium">Hotel:</span> {booking.hotel?.hotelName || 'N/A'}
                </div>
                <div className="text-white/70">
                  <span className="font-medium">Check-in:</span> {booking.checkIn ? new Date(booking.checkIn).toLocaleDateString() : 'Invalid Date'}
                </div>
                <div className="text-white/70">
                  <span className="font-medium">Check-out:</span> {booking.checkOut ? new Date(booking.checkOut).toLocaleDateString() : 'Invalid Date'}
                </div>
                <div className="text-white/70">
                  <span className="font-medium">Rooms:</span> {booking.noOfRooms} | Adults: {booking.noOfPaxs}
                </div>
                <div className="text-white/70">
                  <span className="font-medium">Room Type:</span> {booking.typeOfRoom}
                </div>
                <div className="text-white font-medium text-sm">
                  <span className="font-medium">Total:</span> ₹{(((booking.noOfRooms || 0) * (booking.roomRate || 0) * (booking.noOfNights || 0)) + ((booking.extraBedRate || 0) * (booking.noOfNights || 0))).toLocaleString()}
                </div>
                <div className="text-white/70">
                  <span className="font-medium">Status:</span> {booking.status || 'Pending'}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-white/10">
          <table className="min-w-full text-sm text-white/90">
            <thead>
              <tr className="bg-white/5 text-white/70">
                <th className="px-3 py-2 text-left font-medium text-xs">Customer</th>
                <th className="px-3 py-2 text-left font-medium text-xs">Package</th>
                <th className="px-3 py-2 text-left font-medium text-xs">Destination</th>
                <th className="px-3 py-2 text-left font-medium text-xs">Hotel</th>
                <th className="px-3 py-2 text-left font-medium text-xs">Check-in</th>
                <th className="px-3 py-2 text-left font-medium text-xs">Check-out</th>
                <th className="px-3 py-2 text-left font-medium text-xs">Room Type</th>
                <th className="px-3 py-2 text-left font-medium text-xs">Total</th>
                <th className="px-3 py-2 text-left font-medium text-xs">Status</th>
                <th className="px-3 py-2 text-left font-medium text-xs">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSortedBookings.map((booking) => (
                <tr 
                  key={booking._id} 
                  className="border-t border-white/5 hover:bg-white/[0.03] cursor-pointer transition-colors"
                  onClick={() => handleViewDetails(booking)}
                >
                  <td className="px-3 py-2 font-medium text-xs">{booking.package?.customer?.name || 'N/A'}</td>
                  <td className="px-3 py-2 text-xs">{booking.package?.packageCode || 'N/A'}</td>
                  <td className="px-3 py-2 text-xs">{booking.destination?.destinationName || 'N/A'}</td>
                  <td className="px-3 py-2 text-xs">{booking.hotel?.hotelName || 'N/A'}</td>
                  <td className="px-3 py-2 text-xs">{booking.checkIn ? new Date(booking.checkIn).toLocaleDateString() : 'Invalid Date'}</td>
                  <td className="px-3 py-2 text-xs">{booking.checkOut ? new Date(booking.checkOut).toLocaleDateString() : 'Invalid Date'}</td>
                  <td className="px-3 py-2 text-xs">{booking.typeOfRoom}</td>
                  <td className="px-3 py-2 font-bold text-xs">₹{(((booking.noOfRooms || 0) * (booking.roomRate || 0) * (booking.noOfNights || 0)) + ((booking.extraBedRate || 0) * (booking.noOfNights || 0))).toLocaleString()}</td>
                  <td className="px-3 py-2 text-xs">{booking.status || 'Pending'}</td>
                  <td className="px-3 py-2 space-x-1" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => handleEdit(booking)}
                      className="px-2 py-1 rounded bg-blue-600/80 hover:bg-blue-600 transition-colors"
                    >
                      <PencilIcon className="h-3 w-3" />
                    </button>
                    <button
                      onClick={() => {
                        setDeletingBooking(booking)
                        setShowDeleteDialog(true)
                      }}
                      className="px-2 py-1 rounded bg-red-600/80 hover:bg-red-600 transition-colors"
                    >
                      <TrashIcon className="h-3 w-3" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {filteredAndSortedBookings.length === 0 && !loading && (
        <div className="text-center py-8 text-white/60">
          No hotel bookings found
        </div>
      )}

      {showForm && (
        <HotelBookingForm
          booking={editingBooking}
          onSave={handleSave}
          onCancel={() => {
            setShowForm(false)
            setEditingBooking(null)
          }}
        />
      )}

      <DataDetailsModal
        isOpen={showDetailsModal}
        onClose={() => {
          setShowDetailsModal(false)
          setSelectedBooking(null)
        }}
        data={selectedBooking}
        title="Hotel Booking Details"
        fields={bookingFields}
      />

      <ConfirmationDialog
        isOpen={showDeleteDialog}
        onClose={() => {
          setShowDeleteDialog(false)
          setDeletingBooking(null)
        }}
        onConfirm={handleDelete}
        title="Delete Hotel Booking"
        message={`Are you sure you want to delete hotel booking for ${deletingBooking?.package?.customer?.name} at ${deletingBooking?.hotel?.hotelName || deletingBooking?.destination?.destinationName}? This action cannot be undone.`}
        confirmText="Delete"
        confirmButtonClass="bg-red-600 hover:bg-red-700"
      />
    </div>
  )
}

export default HotelBookingsPage
