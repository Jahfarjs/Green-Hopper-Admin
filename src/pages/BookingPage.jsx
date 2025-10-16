import React, { useState, useEffect } from 'react'
import { 
  CalendarIcon, 
  UserIcon, 
  EnvelopeIcon, 
  MapPinIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  XMarkIcon,
  PhoneIcon,
  GlobeAltIcon,
  DocumentTextIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline'

const API_BASE_URL = import.meta.env.VITE_ADMIN_API_URL
function BookingPage() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filterStatus, setFilterStatus] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedBooking, setSelectedBooking] = useState(null)
  const [showBookingDetails, setShowBookingDetails] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [successMessage, setSuccessMessage] = useState(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const itemsPerPage = 20

  useEffect(() => {
    fetchBookings()
  }, [])

  const fetchBookings = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('admin_token')
      
      const response = await fetch(`${API_BASE_URL}/bookings`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch bookings')
      }

      const data = await response.json()
      setBookings(data.bookings || [])
    } catch (error) {
      setError('Failed to load bookings')
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'accepted':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />
      case 'rejected':
        return <XCircleIcon className="h-5 w-5 text-red-500" />
      case 'pending':
      default:
        return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'accepted':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'pending':
      default:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const filteredBookings = bookings.filter(booking => {
    const matchesStatus = filterStatus === 'all' || booking.status === filterStatus
    const matchesSearch = searchQuery === '' || 
      booking.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.destination.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.nationality.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.numberOfDays.toString().includes(searchQuery)
    
    return matchesStatus && matchesSearch
  })

  // Pagination logic
  const totalPages = Math.ceil(filteredBookings.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentBookings = filteredBookings.slice(startIndex, endIndex)

  // Reset to page 1 when filter changes
  useEffect(() => {
    setCurrentPage(1)
  }, [filterStatus, searchQuery])

  const handlePageChange = (page) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleBookingClick = (booking) => {
    setSelectedBooking(booking)
    setShowBookingDetails(true)
  }

  const closeBookingDetails = () => {
    setShowBookingDetails(false)
    setSelectedBooking(null)
  }

  const updateBookingStatus = async (bookingId, status) => {
    try {
      setIsProcessing(true)
      const token = localStorage.getItem('admin_token')
      
      const response = await fetch(`${API_BASE_URL}/admin/bookings/${bookingId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
      })

      if (!response.ok) {
        throw new Error('Failed to update booking status')
      }

      const data = await response.json()
      
      // Update the booking in the local state
      setBookings(bookings.map(booking => 
        booking._id === bookingId 
          ? { ...booking, status: status, updatedAt: new Date().toISOString() }
          : booking
      ))

      // Update selected booking if it's the same one
      if (selectedBooking && selectedBooking._id === bookingId) {
        setSelectedBooking({ ...selectedBooking, status: status, updatedAt: new Date().toISOString() })
      }

      // Close the modal
      setShowBookingDetails(false)
      setSelectedBooking(null)

      // Show success message
      setSuccessMessage({
        type: 'success',
        title: 'Booking Updated Successfully!',
        message: `The booking has been ${status} successfully.`,
        bookingId: bookingId,
        status: status
      })
      
    } catch (error) {
      setSuccessMessage({
        type: 'error',
        title: 'Update Failed',
        message: 'Failed to update booking status. Please try again.',
        bookingId: bookingId
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleAcceptBooking = () => {
    if (selectedBooking) {
      updateBookingStatus(selectedBooking._id, 'accepted')
    }
  }

  const handleRejectBooking = () => {
    if (selectedBooking) {
      updateBookingStatus(selectedBooking._id, 'rejected')
    }
  }

  // Auto-dismiss success message after 5 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage(null)
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [successMessage])

  const dismissSuccessMessage = () => {
    setSuccessMessage(null)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5B8424]"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 mb-4">
          <XCircleIcon className="h-12 w-12 mx-auto" />
        </div>
        <h3 className="text-lg font-medium text-white mb-2">Error Loading Bookings</h3>
        <p className="text-gray-400 mb-4">{error}</p>
        <button 
          onClick={fetchBookings}
          className="bg-[#5B8424] text-white px-4 py-2 rounded-lg hover:bg-[#4a6f1f] transition-colors"
        >
          Try Again
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-24">
      {/* Success Message Overlay */}
      {successMessage && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-[#121a14] border border-[#5B8424]/20 rounded-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                {successMessage.type === 'success' ? (
                  <CheckCircleIcon className="h-8 w-8 text-green-500" />
                ) : (
                  <XCircleIcon className="h-8 w-8 text-red-500" />
                )}
                <h3 className="text-xl font-bold text-white">{successMessage.title}</h3>
              </div>
              <button
                onClick={dismissSuccessMessage}
                className="p-2 hover:bg-[#0f1310] rounded-lg transition-colors"
              >
                <XMarkIcon className="h-5 w-5 text-gray-400" />
              </button>
            </div>
            
            <div className="space-y-4">
              <p className="text-gray-300">{successMessage.message}</p>
              
              {successMessage.type === 'success' && (
                <div className="bg-[#0f1310] p-4 rounded-lg border border-[#5B8424]/10">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm text-gray-400">Booking ID:</span>
                    <span className="text-sm font-mono text-white">{successMessage.bookingId}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-400">Status:</span>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      successMessage.status === 'accepted' 
                        ? 'bg-green-100 text-green-800 border-green-200'
                        : 'bg-red-100 text-red-800 border-red-200'
                    }`}>
                      {successMessage.status.charAt(0).toUpperCase() + successMessage.status.slice(1)}
                    </span>
                  </div>
                </div>
              )}
              
              <div className="flex gap-3 pt-4">
                <button
                  onClick={dismissSuccessMessage}
                  className="flex-1 bg-[#5B8424] text-white py-2 rounded-lg hover:bg-[#4a6f1f] transition-colors font-medium"
                >
                  Continue
                </button>
                {successMessage.type === 'success' && (
                  <button
                    onClick={() => {
                      dismissSuccessMessage()
                      fetchBookings()
                    }}
                    className="flex-1 bg-gray-600 text-white py-2 rounded-lg hover:bg-gray-700 transition-colors font-medium"
                  >
                    Refresh List
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Travel Bookings</h1>
          <p className="text-gray-400 mt-1">Manage and view all customer booking requests</p>
        </div>
        <div className="mt-4 sm:mt-0">
          <button 
            onClick={fetchBookings}
            className="bg-[#5B8424] text-white px-4 py-2 rounded-lg hover:bg-[#4a6f1f] transition-colors flex items-center gap-2"
          >
            <ClockIcon className="h-4 w-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#121a14] border border-[#5B8424]/20 rounded-lg p-4">
          <div className="flex items-center">
            <div className="p-2 bg-[#5B8424]/20 rounded-lg">
              <CalendarIcon className="h-6 w-6 text-[#5B8424]" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-400">Total Bookings</p>
              <p className="text-2xl font-bold text-white">{bookings.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-[#121a14] border border-[#5B8424]/20 rounded-lg p-4">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-500/20 rounded-lg">
              <ExclamationTriangleIcon className="h-6 w-6 text-yellow-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-400">Pending</p>
              <p className="text-2xl font-bold text-white">
                {bookings.filter(b => b.status === 'pending').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-[#121a14] border border-[#5B8424]/20 rounded-lg p-4">
          <div className="flex items-center">
            <div className="p-2 bg-green-500/20 rounded-lg">
              <CheckCircleIcon className="h-6 w-6 text-green-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-400">Accepted</p>
              <p className="text-2xl font-bold text-white">
                {bookings.filter(b => b.status === 'accepted').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-[#121a14] border border-[#5B8424]/20 rounded-lg p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search bookings by name, email, destination, nationality, or number of days..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-[#2a2a2a] border border-[#444] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#5B8424]"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setFilterStatus('all')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            filterStatus === 'all' 
              ? 'bg-[#5B8424] text-white' 
              : 'bg-[#121a14] text-gray-400 hover:text-white border border-[#5B8424]/20'
          }`}
        >
          All ({bookings.length})
        </button>
        <button
          onClick={() => setFilterStatus('pending')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            filterStatus === 'pending' 
              ? 'bg-[#5B8424] text-white' 
              : 'bg-[#121a14] text-gray-400 hover:text-white border border-[#5B8424]/20'
          }`}
        >
          Pending ({bookings.filter(b => b.status === 'pending').length})
        </button>
        <button
          onClick={() => setFilterStatus('accepted')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            filterStatus === 'accepted' 
              ? 'bg-[#5B8424] text-white' 
              : 'bg-[#121a14] text-gray-400 hover:text-white border border-[#5B8424]/20'
          }`}
        >
          Accepted ({bookings.filter(b => b.status === 'accepted').length})
        </button>
        <button
          onClick={() => setFilterStatus('rejected')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            filterStatus === 'rejected' 
              ? 'bg-[#5B8424] text-white' 
              : 'bg-[#121a14] text-gray-400 hover:text-white border border-[#5B8424]/20'
          }`}
        >
          Rejected ({bookings.filter(b => b.status === 'rejected').length})
        </button>
      </div>

      {/* Bookings List */}
      <div className="bg-[#121a14] border border-[#5B8424]/20 rounded-lg overflow-hidden">
        {currentBookings.length === 0 ? (
          <div className="text-center py-12">
            <CalendarIcon className="h-12 w-12 text-gray-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">No Bookings Found</h3>
            <p className="text-gray-400">
              {filterStatus === 'all' 
                ? 'No booking requests have been submitted yet.' 
                : `No ${filterStatus} bookings found.`
              }
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[#5B8424]/10">
            {currentBookings.map((booking) => (
              <div 
                key={booking._id} 
                className="p-4 hover:bg-[#0f1310] transition-colors border-l-4 border-l-transparent hover:border-l-[#5B8424] cursor-pointer"
                onClick={() => handleBookingClick(booking)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="flex-shrink-0">
                      {getStatusIcon(booking.status)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-base font-semibold text-white truncate">
                          {booking.name}
                        </h3>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                          {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-sm">
                        <div className="flex items-center gap-2 text-gray-300">
                          <EnvelopeIcon className="h-4 w-4 text-gray-500 flex-shrink-0" />
                          <span className="truncate">{booking.email}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-300">
                          <UserIcon className="h-4 w-4 text-gray-500 flex-shrink-0" />
                          <span className="truncate">{booking.nationality}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-300">
                          <MapPinIcon className="h-4 w-4 text-gray-500 flex-shrink-0" />
                          <span className="truncate">{booking.destination}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-300">
                          <CalendarIcon className="h-4 w-4 text-gray-500 flex-shrink-0" />
                          <span className="truncate">{formatDate(booking.preferredDate)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-300">
                          <ClockIcon className="h-4 w-4 text-gray-500 flex-shrink-0" />
                          <span className="truncate">{booking.numberOfDays} day{booking.numberOfDays !== 1 ? 's' : ''}</span>
                        </div>
                      </div>
                      
                      {booking.additionalNotes && (
                        <div className="mt-2">
                          <p className="text-sm text-gray-400 truncate">
                            <span className="font-medium">Notes:</span> {booking.additionalNotes}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex-shrink-0 ml-4 text-right">
                    <div className="text-xs text-gray-500">
                      <p>Submitted: {formatDate(booking.createdAt)}</p>
                      {booking.updatedAt !== booking.createdAt && (
                        <p>Updated: {formatDate(booking.updatedAt)}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Compact Pagination */}
      {filteredBookings.length > 0 && (
        <div className="flex items-center justify-between bg-[#121a14] border border-[#5B8424]/20 rounded-lg p-3">
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <span>Showing</span>
            <span className="font-medium text-white">{startIndex + 1}</span>
            <span>to</span>
            <span className="font-medium text-white">{Math.min(endIndex, filteredBookings.length)}</span>
            <span>of</span>
            <span className="font-medium text-white">{filteredBookings.length}</span>
            <span>results</span>
          </div>
          
          <div className="flex items-center gap-1">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="flex items-center gap-1 px-2 py-1 text-sm font-medium text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors rounded"
            >
              <ChevronLeftIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Prev</span>
            </button>
            
            <div className="flex items-center gap-1">
              {totalPages <= 1 ? (
                <button
                  className="px-2 py-1 text-sm font-medium rounded bg-[#5B8424] text-white"
                >
                  1
                </button>
              ) : (
                Array.from({ length: Math.min(3, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage <= 2) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 1) {
                    pageNum = totalPages - 2 + i;
                  } else {
                    pageNum = currentPage - 1 + i;
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`px-2 py-1 text-sm font-medium rounded transition-colors ${
                        pageNum === currentPage
                          ? 'bg-[#5B8424] text-white'
                          : 'text-gray-400 hover:text-white hover:bg-[#0f1310]'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })
              )}
            </div>
            
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="flex items-center gap-1 px-2 py-1 text-sm font-medium text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors rounded"
            >
              <span className="hidden sm:inline">Next</span>
              <ChevronRightIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Booking Details Modal */}
      {showBookingDetails && selectedBooking && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-[#121a14] border border-[#5B8424]/20 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-[#5B8424]/10">
              <div className="flex items-center gap-3">
                {getStatusIcon(selectedBooking.status)}
                <div>
                  <h2 className="text-xl font-bold text-white">Booking Details</h2>
                  <p className="text-sm text-gray-400">ID: {selectedBooking._id}</p>
                </div>
              </div>
              <button
                onClick={closeBookingDetails}
                className="p-2 hover:bg-[#0f1310] rounded-lg transition-colors"
              >
                <XMarkIcon className="h-5 w-5 text-gray-400" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Status and Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="bg-[#0f1310] p-4 rounded-lg border border-[#5B8424]/10">
                    <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                      <UserIcon className="h-5 w-5 text-[#5B8424]" />
                      Customer Information
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm text-gray-400">Full Name</label>
                        <p className="text-white font-medium">{selectedBooking.name}</p>
                      </div>
                      <div>
                        <label className="text-sm text-gray-400">Email Address</label>
                        <p className="text-white font-medium">{selectedBooking.email}</p>
                      </div>
                      <div>
                        <label className="text-sm text-gray-400">Nationality</label>
                        <p className="text-white font-medium">{selectedBooking.nationality}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-[#0f1310] p-4 rounded-lg border border-[#5B8424]/10">
                    <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                      <MapPinIcon className="h-5 w-5 text-[#5B8424]" />
                      Travel Details
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm text-gray-400">Destination</label>
                        <p className="text-white font-medium">{selectedBooking.destination}</p>
                      </div>
                      <div>
                        <label className="text-sm text-gray-400">Preferred Date</label>
                        <p className="text-white font-medium">{formatDate(selectedBooking.preferredDate)}</p>
                      </div>
                      <div>
                        <label className="text-sm text-gray-400">Number of Days</label>
                        <p className="text-white font-medium">{selectedBooking.numberOfDays} day{selectedBooking.numberOfDays !== 1 ? 's' : ''}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-[#0f1310] p-4 rounded-lg border border-[#5B8424]/10">
                    <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                      <DocumentTextIcon className="h-5 w-5 text-[#5B8424]" />
                      Booking Status
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm text-gray-400">Current Status</label>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedBooking.status)}`}>
                            {selectedBooking.status.charAt(0).toUpperCase() + selectedBooking.status.slice(1)}
                          </span>
                        </div>
                      </div>
                      <div>
                        <label className="text-sm text-gray-400">Booking ID</label>
                        <p className="text-white font-mono text-sm">{selectedBooking._id}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-[#0f1310] p-4 rounded-lg border border-[#5B8424]/10">
                    <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                      <ClockIcon className="h-5 w-5 text-[#5B8424]" />
                      Timeline
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm text-gray-400">Submitted</label>
                        <p className="text-white font-medium">{formatDate(selectedBooking.createdAt)}</p>
                      </div>
                      {selectedBooking.updatedAt !== selectedBooking.createdAt && (
                        <div>
                          <label className="text-sm text-gray-400">Last Updated</label>
                          <p className="text-white font-medium">{formatDate(selectedBooking.updatedAt)}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Additional Notes */}
              {selectedBooking.additionalNotes && (
                <div className="bg-[#0f1310] p-4 rounded-lg border border-[#5B8424]/10">
                  <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                    <DocumentTextIcon className="h-5 w-5 text-[#5B8424]" />
                    Additional Notes
                  </h3>
                  <div className="bg-[#0a0a0a] p-3 rounded-lg">
                    <p className="text-gray-300 whitespace-pre-wrap">{selectedBooking.additionalNotes}</p>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3 pt-4 border-t border-[#5B8424]/10">
                {selectedBooking.status === 'pending' && (
                  <>
                    <button 
                      onClick={handleAcceptBooking}
                      disabled={isProcessing}
                      className="flex items-center gap-2 px-4 py-2 bg-[#5B8424] text-white rounded-lg hover:bg-[#4a6f1f] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isProcessing ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      ) : (
                        <CheckCircleIcon className="h-4 w-4" />
                      )}
                      {isProcessing ? 'Processing...' : 'Accept Booking'}
                    </button>
                    <button 
                      onClick={handleRejectBooking}
                      disabled={isProcessing}
                      className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isProcessing ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      ) : (
                        <XCircleIcon className="h-4 w-4" />
                      )}
                      {isProcessing ? 'Processing...' : 'Reject Booking'}
                    </button>
                  </>
                )}
                {selectedBooking.status === 'accepted' && (
                  <div className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-800 rounded-lg">
                    <CheckCircleIcon className="h-4 w-4" />
                    Booking Accepted
                  </div>
                )}
                {selectedBooking.status === 'rejected' && (
                  <div className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-800 rounded-lg">
                    <XCircleIcon className="h-4 w-4" />
                    Booking Rejected
                  </div>
                )}
                <button className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
                  <DocumentTextIcon className="h-4 w-4" />
                  Generate Report
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  <EnvelopeIcon className="h-4 w-4" />
                  Send Email
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default BookingPage
