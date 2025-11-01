import React, { useState, useEffect } from 'react'
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  BuildingOfficeIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  TruckIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  EyeIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline'

function HotelManagementPage() {
  const [hotels, setHotels] = useState([])
  const [destinations, setDestinations] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingHotel, setEditingHotel] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [locationFilter, setLocationFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedHotel, setSelectedHotel] = useState(null)
  const [showHotelDetails, setShowHotelDetails] = useState(false)
  const [deleteDialog, setDeleteDialog] = useState({
    isOpen: false,
    hotelId: null,
    hotelName: ''
  })
  const [formData, setFormData] = useState({
    hotelName: '',
    destination: '',
    currency: 'INR',
    roomCategories: [{ category: '', rate: '', extraBedRate: '' }]
  })
  const itemsPerPage = 10

  const getCurrencySymbol = () => {
    return '₹'
  }

  useEffect(() => {
    fetchHotels()
    fetchDestinations()
  }, [])

  const API_BASE_URL = import.meta.env.VITE_ADMIN_API_URL
  const fetchHotels = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/hotels/public`)
      
      if (response.ok) {
        const data = await response.json()
        setHotels(data)
      } else {
      }
    } catch (error) {
    } finally {
      setLoading(false)
    }
  }

  const fetchDestinations = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/destinations/public`)
      
      if (response.ok) {
        const data = await response.json()
        setDestinations(data)
      }
    } catch (error) {
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      const token = localStorage.getItem('admin_token')
      const url = editingHotel ? `${API_BASE_URL}/hotels/${editingHotel._id}` : `${API_BASE_URL}/hotels`
      const method = editingHotel ? 'PUT' : 'POST'
      
      // Always use INR as currency
      const submitData = {
        ...formData,
        currency: 'INR'
      }
      
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(submitData)
      })
      
      if (response.ok) {
        const data = await response.json()
        if (editingHotel) {
          setHotels(hotels.map(hotel => 
            hotel._id === editingHotel._id ? data.hotel : hotel
          ))
        } else {
          setHotels([data.hotel, ...hotels])
        }
        setShowModal(false)
        resetForm()
      } else {
        const error = await response.json()
        alert(error.message || 'Failed to save hotel')
      }
    } catch (error) {
      alert('Failed to save hotel')
    }
  }

  const handleEdit = (hotel) => {
    setEditingHotel(hotel)
    setFormData({
      hotelName: hotel.hotelName,
      destination: hotel.destination._id,
      currency: 'INR',
      roomCategories: hotel.roomCategories || [{ category: '', rate: '', extraBedRate: '' }]
    })
    setShowModal(true)
  }

  const handleDeleteClick = (hotel) => {
    setDeleteDialog({
      isOpen: true,
      hotelId: hotel._id,
      hotelName: hotel.hotelName
    });
  };

  const handleDeleteConfirm = async () => {
    try {
      const token = localStorage.getItem('admin_token')
      const response = await fetch(`${API_BASE_URL}/hotels/${deleteDialog.hotelId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (response.ok) {
        setHotels(hotels.filter(hotel => hotel._id !== deleteDialog.hotelId))
        setDeleteDialog({ isOpen: false, hotelId: null, hotelName: '' });
      } else {
        const error = await response.json()
        alert(error.message || 'Failed to delete hotel')
      }
    } catch (error) {
      alert('Failed to delete hotel')
    }
  }

  const resetForm = () => {
    setFormData({
      hotelName: '',
      destination: '',
      currency: 'INR',
      roomCategories: [{ category: '', rate: '', extraBedRate: '' }]
    })
    setEditingHotel(null)
  }

  const addRoomCategory = () => {
    setFormData({
      ...formData,
      roomCategories: [...formData.roomCategories, { category: '', rate: '', extraBedRate: '' }]
    })
  }

  const removeRoomCategory = (index) => {
    if (formData.roomCategories.length > 1) {
      const updatedCategories = formData.roomCategories.filter((_, i) => i !== index)
      setFormData({
        ...formData,
        roomCategories: updatedCategories
      })
    }
  }

  const updateRoomCategory = (index, field, value) => {
    const updatedCategories = formData.roomCategories.map((category, i) => 
      i === index ? { ...category, [field]: value } : category
    )
    setFormData({
      ...formData,
      roomCategories: updatedCategories
    })
  }

  const openModal = () => {
    resetForm()
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    resetForm()
  }

  const handleHotelClick = (hotel) => {
    setSelectedHotel(hotel)
    setShowHotelDetails(true)
  }

  const closeHotelDetails = () => {
    setShowHotelDetails(false)
    setSelectedHotel(null)
  }

  // Filter and search logic
  const filteredHotels = hotels.filter(hotel => {
    const matchesSearch = searchQuery === '' || 
      hotel.hotelName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      hotel.destination?.destinationName.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesLocation = locationFilter === 'all' || 
      hotel.destination?._id === locationFilter
    
    return matchesSearch && matchesLocation
  })

  // Pagination logic
  const totalPages = Math.ceil(filteredHotels.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentHotels = filteredHotels.slice(startIndex, endIndex)

  // Reset to page 1 when filter changes
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, locationFilter])

  const handlePageChange = (page) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5B8424]"></div>
      </div>
    )
  }

  return (
    <div className="p-6 pb-24">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Hotel Management</h1>
          <p className="text-gray-400">Manage hotels and room categories</p>
        </div>
        <button
          onClick={openModal}
          className="bg-[#5B8424] hover:bg-[#4a6b1f] text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <PlusIcon className="h-5 w-5" />
          Add Hotel
        </button>
      </div>

      {/* Search and Filter */}
      <div className="bg-[#121a14] border border-[#5B8424]/20 rounded-lg p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search hotels or destinations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-[#2a2a2a] border border-[#444] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#5B8424]"
              />
            </div>
          </div>
          <div className="md:w-64">
            <select
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="w-full px-3 py-2 bg-[#2a2a2a] border border-[#444] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#5B8424]"
            >
              <option value="all">All Locations</option>
              {destinations.map(dest => (
                <option key={dest._id} value={dest._id}>
                  {dest.destinationName}, {dest.country}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-[#121a14] border border-[#5B8424]/20 rounded-lg p-4">
          <div className="flex items-center">
            <div className="p-2 bg-[#5B8424]/20 rounded-lg">
              <BuildingOfficeIcon className="h-6 w-6 text-[#5B8424]" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-400">Total Hotels</p>
              <p className="text-2xl font-bold text-white">{hotels.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-[#121a14] border border-[#5B8424]/20 rounded-lg p-4">
          <div className="flex items-center">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <MapPinIcon className="h-6 w-6 text-blue-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-400">Locations</p>
              <p className="text-2xl font-bold text-white">{destinations.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-[#121a14] border border-[#5B8424]/20 rounded-lg p-4">
          <div className="flex items-center">
            <div className="p-2 bg-green-500/20 rounded-lg">
              <BuildingOfficeIcon className="h-6 w-6 text-green-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-400">Room Types</p>
              <p className="text-2xl font-bold text-white">{hotels.reduce((sum, hotel) => sum + (hotel.roomCategories?.length || 0), 0)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Hotels List */}
      <div className="bg-[#121a14] border border-[#5B8424]/20 rounded-lg overflow-hidden">
        {currentHotels.length === 0 ? (
          <div className="text-center py-12">
            <BuildingOfficeIcon className="h-12 w-12 text-gray-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">No Hotels Found</h3>
            <p className="text-gray-400">
              {searchQuery || locationFilter !== 'all' 
                ? 'Try adjusting your search criteria' 
                : 'No hotels have been created yet.'
              }
            </p>
            {!searchQuery && locationFilter === 'all' && (
              <button
                onClick={openModal}
                className="mt-4 bg-[#5B8424] hover:bg-[#4a6b1f] text-white px-6 py-2 rounded-lg transition-colors"
              >
                Add Hotel
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-[#5B8424]/10">
            {currentHotels.map((hotel) => (
              <div 
                key={hotel._id} 
                className="p-4 hover:bg-[#0f1310] transition-colors border-l-4 border-l-transparent hover:border-l-[#5B8424] cursor-pointer"
                onClick={() => handleHotelClick(hotel)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="flex-shrink-0">
                      <BuildingOfficeIcon className="h-8 w-8 text-[#5B8424]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-base font-semibold text-white truncate">
                          {hotel.hotelName}
                        </h3>
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {hotel.destination?.destinationName}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                        <div className="flex items-center gap-2 text-gray-300">
                          <MapPinIcon className="h-4 w-4 text-gray-500 flex-shrink-0" />
                          <span className="truncate">{hotel.destination?.country}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-300">
                          <BuildingOfficeIcon className="h-4 w-4 text-gray-500 flex-shrink-0" />
                          <span className="truncate">{hotel.roomCategories?.length || 0} room types</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-300">
                          <CurrencyDollarIcon className="h-4 w-4 text-gray-500 flex-shrink-0" />
                          <span className="truncate">From {getCurrencySymbol()}{hotel.roomCategories?.[0]?.rate || 'N/A'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex-shrink-0 ml-4 flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleHotelClick(hotel)
                      }}
                      className="p-2 text-gray-400 hover:text-blue-500 transition-colors"
                      title="View Details"
                    >
                      <EyeIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleEdit(hotel)
                      }}
                      className="p-2 text-gray-400 hover:text-[#5B8424] transition-colors"
                      title="Edit"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDeleteClick(hotel)
                      }}
                      className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                      title="Delete"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {filteredHotels.length > 0 && (
        <div className="flex items-center justify-between bg-[#121a14] border border-[#5B8424]/20 rounded-lg p-3 mt-6">
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <span>Showing</span>
            <span className="font-medium text-white">{startIndex + 1}</span>
            <span>to</span>
            <span className="font-medium text-white">{Math.min(endIndex, filteredHotels.length)}</span>
            <span>of</span>
            <span className="font-medium text-white">{filteredHotels.length}</span>
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

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a1a1a] border border-[#333] rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-white">
                  {editingHotel ? 'Edit Hotel' : 'Add New Hotel'}
                </h2>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Hotel Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.hotelName}
                      onChange={(e) => setFormData({...formData, hotelName: e.target.value})}
                      className="w-full px-3 py-2 bg-[#2a2a2a] border border-[#444] rounded-lg text-white focus:border-[#5B8424] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Destination *
                    </label>
                    <select
                      required
                      value={formData.destination}
                      onChange={(e) => setFormData({...formData, destination: e.target.value})}
                      className="w-full px-3 py-2 bg-[#2a2a2a] border border-[#444] rounded-lg text-white focus:border-[#5B8424] focus:outline-none"
                    >
                      <option value="">Select Destination</option>
                      {destinations.map(dest => (
                        <option key={dest._id} value={dest._id}>
                          {dest.destinationName}, {dest.country}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Room Categories *
                    </label>
                    <div className="space-y-3">
                      {formData.roomCategories.map((room, index) => (
                        <div key={index} className="flex gap-3 items-end">
                          <div className="flex-1">
                            <input
                              type="text"
                              placeholder="Category (e.g., Standard, Deluxe)"
                              required
                              value={room.category}
                              onChange={(e) => updateRoomCategory(index, 'category', e.target.value)}
                              className="w-full px-3 py-2 bg-[#2a2a2a] border border-[#444] rounded-lg text-white focus:border-[#5B8424] focus:outline-none"
                            />
                          </div>
                          <div className="flex-1">
                            <input
                              type="text"
                              placeholder="Rate"
                              required
                              value={room.rate}
                              onChange={(e) => updateRoomCategory(index, 'rate', e.target.value)}
                              className="w-full px-3 py-2 bg-[#2a2a2a] border border-[#444] rounded-lg text-white focus:border-[#5B8424] focus:outline-none"
                            />
                          </div>
                          <div className="flex-1">
                            <input
                              type="text"
                              placeholder="Extra Bed Rate"
                              required
                              value={room.extraBedRate}
                              onChange={(e) => updateRoomCategory(index, 'extraBedRate', e.target.value)}
                              className="w-full px-3 py-2 bg-[#2a2a2a] border border-[#444] rounded-lg text-white focus:border-[#5B8424] focus:outline-none"
                            />
                          </div>
                          {formData.roomCategories.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeRoomCategory(index)}
                              className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={addRoomCategory}
                        className="w-full px-4 py-2 bg-[#5B8424] hover:bg-[#4a6b1f] text-white rounded-lg transition-colors flex items-center justify-center gap-2"
                      >
                        <PlusIcon className="h-4 w-4" />
                        Add Room Category
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-[#5B8424] hover:bg-[#4a6b1f] text-white px-6 py-2 rounded-lg transition-colors"
                  >
                    {editingHotel ? 'Update Hotel' : 'Create Hotel'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteDialog.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0">
                <TrashIcon className="w-8 h-8 text-red-500" />
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-medium text-white">Delete Hotel</h3>
                <p className="text-sm text-gray-400">
                  Are you sure you want to delete hotel "{deleteDialog.hotelName}"? This action cannot be undone.
                </p>
              </div>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={() => setDeleteDialog({ isOpen: false, hotelId: null, hotelName: '' })}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hotel Details Modal */}
      {showHotelDetails && selectedHotel && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-[#121a14] border border-[#5B8424]/20 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-[#5B8424]/10">
              <div className="flex items-center gap-3">
                <BuildingOfficeIcon className="h-8 w-8 text-[#5B8424]" />
                <div>
                  <h2 className="text-xl font-bold text-white">Hotel Details</h2>
                  <p className="text-sm text-gray-400">ID: {selectedHotel._id}</p>
                </div>
              </div>
              <button
                onClick={closeHotelDetails}
                className="p-2 hover:bg-[#0f1310] rounded-lg transition-colors"
              >
                <XMarkIcon className="h-5 w-5 text-gray-400" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Hotel and Location Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="bg-[#0f1310] p-4 rounded-lg border border-[#5B8424]/10">
                    <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                      <BuildingOfficeIcon className="h-5 w-5 text-[#5B8424]" />
                      Hotel Information
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm text-gray-400">Hotel Name</label>
                        <p className="text-white font-medium">{selectedHotel.hotelName}</p>
                      </div>
                      <div>
                        <label className="text-sm text-gray-400">Location</label>
                        <p className="text-white font-medium">
                          {selectedHotel.destination?.destinationName}, {selectedHotel.destination?.country}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm text-gray-400">Currency</label>
                        <p className="text-white font-medium">INR (₹)</p>
                      </div>
                    </div>
                  </div>

                </div>

                <div className="space-y-4">
                  <div className="bg-[#0f1310] p-4 rounded-lg border border-[#5B8424]/10">
                    <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                      <CurrencyDollarIcon className="h-5 w-5 text-[#5B8424]" />
                      Room Categories
                    </h3>
                    <div className="space-y-3">
                      {selectedHotel.roomCategories && selectedHotel.roomCategories.map((room, index) => (
                        <div key={index} className="bg-[#0a0a0a] p-3 rounded-lg">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="text-white font-medium">{room.category}</p>
                              <p className="text-sm text-gray-400">Rate: {getCurrencySymbol()}{room.rate}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-gray-400">Extra Bed</p>
                              <p className="text-white font-medium">{getCurrencySymbol()}{room.extraBedRate}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-[#0f1310] p-4 rounded-lg border border-[#5B8424]/10">
                    <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                      <MapPinIcon className="h-5 w-5 text-[#5B8424]" />
                      Summary
                    </h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Total Room Types:</span>
                        <span className="text-white font-medium">{selectedHotel.roomCategories?.length || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Starting Rate:</span>
                        <span className="text-white font-medium">{getCurrencySymbol()}{selectedHotel.roomCategories?.[0]?.rate || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Location:</span>
                        <span className="text-white font-medium">{selectedHotel.destination?.destinationName}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3 pt-4 border-t border-[#5B8424]/10">
                <button 
                  onClick={() => {
                    closeHotelDetails()
                    handleEdit(selectedHotel)
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-[#5B8424] text-white rounded-lg hover:bg-[#4a6f1f] transition-colors"
                >
                  <PencilIcon className="h-4 w-4" />
                  Edit Hotel
                </button>
                <button 
                  onClick={() => {
                    handleDeleteClick(selectedHotel)
                    closeHotelDetails()
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  <TrashIcon className="h-4 w-4" />
                  Delete Hotel
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  <BuildingOfficeIcon className="h-4 w-4" />
                  View Bookings
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default HotelManagementPage
