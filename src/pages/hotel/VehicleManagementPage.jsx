import React, { useState, useEffect } from 'react'
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  TruckIcon,
  CurrencyDollarIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  EyeIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline'

function VehicleManagementPage() {
  const [vehicles, setVehicles] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingVehicle, setEditingVehicle] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedVehicle, setSelectedVehicle] = useState(null)
  const [showVehicleDetails, setShowVehicleDetails] = useState(false)
  const [deleteDialog, setDeleteDialog] = useState({
    isOpen: false,
    vehicleId: null,
    vehicleName: ''
  })
  const [formData, setFormData] = useState({
    vehicleName: '',
    vehicleType: 'Innova',
    vehicleRatePerDay: '',
    currency: 'INR'
  })
  const [categories, setCategories] = useState(['Innova', 'Etiose', 'Traveller'])
  const [newCategory, setNewCategory] = useState('')
  const itemsPerPage = 10

  const vehicleTypes = categories.map(c => ({ value: c, label: c }))

  const getCurrencySymbol = () => {
    return '₹'
  }

  useEffect(() => {
    fetchVehicles()
  }, [])

  const API_BASE_URL = import.meta.env.VITE_ADMIN_API_URL
  const fetchVehicles = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/vehicles/public`)
      
      if (response.ok) {
        const data = await response.json()
        setVehicles(data)
        // Merge categories from backend data
        const foundTypes = Array.from(new Set((data || []).map(v => (v.vehicleType || '').trim()).filter(Boolean)))
        if (foundTypes.length) {
          setCategories(prev => Array.from(new Set([...
            prev,
            ...foundTypes
          ])))
        }
      } else {
      }
    } catch (error) {
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      const token = localStorage.getItem('admin_token')
      const url = editingVehicle ? `${API_BASE_URL}/vehicles/${editingVehicle._id}` : `${API_BASE_URL}/vehicles`
      const method = editingVehicle ? 'PUT' : 'POST'
      
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
        if (editingVehicle) {
          setVehicles(vehicles.map(vehicle => 
            vehicle._id === editingVehicle._id ? data.vehicle : vehicle
          ))
        } else {
          setVehicles([data.vehicle, ...vehicles])
        }
        setShowModal(false)
        resetForm()
      } else {
        const error = await response.json()
        alert(error.message || 'Failed to save vehicle')
      }
    } catch (error) {
      alert('Failed to save vehicle')
    }
  }

  const handleEdit = (vehicle) => {
    setEditingVehicle(vehicle)
    setFormData({
      vehicleName: vehicle.vehicleName,
      vehicleType: vehicle.vehicleType,
      vehicleRatePerDay: vehicle.vehicleRatePerDay,
      currency: 'INR'
    })
    setShowModal(true)
  }

  const handleDeleteClick = (vehicle) => {
    setDeleteDialog({
      isOpen: true,
      vehicleId: vehicle._id,
      vehicleName: vehicle.vehicleName
    });
  };

  const handleDeleteConfirm = async () => {
    try {
      const token = localStorage.getItem('admin_token')
      const response = await fetch(`${API_BASE_URL}/vehicles/${deleteDialog.vehicleId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (response.ok) {
        setVehicles(vehicles.filter(vehicle => vehicle._id !== deleteDialog.vehicleId))
        setDeleteDialog({ isOpen: false, vehicleId: null, vehicleName: '' });
      } else {
        const error = await response.json()
        alert(error.message || 'Failed to delete vehicle')
      }
    } catch (error) {
      alert('Failed to delete vehicle')
    }
  }

  const resetForm = () => {
    setFormData({
      vehicleName: '',
      vehicleType: categories[0] || 'Innova',
      vehicleRatePerDay: '',
      currency: 'INR'
    })
    setEditingVehicle(null)
  }

  const addCategory = () => {
    const value = newCategory.trim()
    if (!value) return
    setCategories(prev => Array.from(new Set([...prev, value])))
    setNewCategory('')
  }

  const openModal = () => {
    resetForm()
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    resetForm()
  }

  const handleVehicleClick = (vehicle) => {
    setSelectedVehicle(vehicle)
    setShowVehicleDetails(true)
  }

  const closeVehicleDetails = () => {
    setShowVehicleDetails(false)
    setSelectedVehicle(null)
  }

  // Filter and search logic
  const filteredVehicles = vehicles.filter(vehicle => {
    const matchesSearch = searchQuery === '' || 
      vehicle.vehicleName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vehicle.vehicleType.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesType = typeFilter === 'all' || vehicle.vehicleType === typeFilter
    
    return matchesSearch && matchesType
  })

  // Pagination logic
  const totalPages = Math.ceil(filteredVehicles.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentVehicles = filteredVehicles.slice(startIndex, endIndex)

  // Reset to page 1 when filter changes
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, typeFilter])

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
          <h1 className="text-3xl font-bold text-white mb-2">Vehicle Management</h1>
          <p className="text-gray-400">Manage vehicles and their rates</p>
        </div>
        <button
          onClick={openModal}
          className="bg-[#5B8424] hover:bg-[#4a6b1f] text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <PlusIcon className="h-5 w-5" />
          Add Vehicle
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
                placeholder="Search vehicles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-[#2a2a2a] border border-[#444] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#5B8424]"
              />
            </div>
          </div>
          <div className="md:w-64">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full px-3 py-2 bg-[#2a2a2a] border border-[#444] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#5B8424]"
            >
              <option value="all">All Types</option>
              {vehicleTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2 md:w-auto">
            <input
              type="text"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              placeholder="Add category (e.g., Innova)"
              className="w-full md:w-64 px-3 py-2 bg-[#2a2a2a] border border-[#444] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#5B8424]"
            />
            <button
              type="button"
              onClick={addCategory}
              className="px-3 py-2 bg-[#5B8424] hover:bg-[#4a6b1f] text-white rounded-lg"
            >
              Add
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-[#121a14] border border-[#5B8424]/20 rounded-lg p-4">
          <div className="flex items-center">
            <div className="p-2 bg-[#5B8424]/20 rounded-lg">
              <TruckIcon className="h-6 w-6 text-[#5B8424]" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-400">Total Vehicles</p>
              <p className="text-2xl font-bold text-white">{vehicles.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-[#121a14] border border-[#5B8424]/20 rounded-lg p-4">
          <div className="flex items-center">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <TruckIcon className="h-6 w-6 text-blue-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-400">Cars</p>
              <p className="text-2xl font-bold text-white">{vehicles.filter(v => v.vehicleType === 'car').length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-[#121a14] border border-[#5B8424]/20 rounded-lg p-4">
          <div className="flex items-center">
            <div className="p-2 bg-green-500/20 rounded-lg">
              <CurrencyDollarIcon className="h-6 w-6 text-green-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-400">Avg Rate</p>
              <p className="text-2xl font-bold text-white">
                {vehicles.length > 0 ? 
                  `${getCurrencySymbol()}${Math.round(vehicles.reduce((sum, v) => sum + parseFloat(v.vehicleRatePerDay || 0), 0) / vehicles.length)}` 
                  : `${getCurrencySymbol()}0`
                }
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Vehicles List */}
      <div className="bg-[#121a14] border border-[#5B8424]/20 rounded-lg overflow-hidden">
        {currentVehicles.length === 0 ? (
          <div className="text-center py-12">
            <TruckIcon className="h-12 w-12 text-gray-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">No Vehicles Found</h3>
            <p className="text-gray-400">
              {searchQuery || typeFilter !== 'all' 
                ? 'Try adjusting your search criteria' 
                : 'No vehicles have been created yet.'
              }
            </p>
            {!searchQuery && typeFilter === 'all' && (
              <button
                onClick={openModal}
                className="mt-4 bg-[#5B8424] hover:bg-[#4a6b1f] text-white px-6 py-2 rounded-lg transition-colors"
              >
                Add Vehicle
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-[#5B8424]/10">
            {currentVehicles.map((vehicle) => (
              <div 
                key={vehicle._id} 
                className="p-4 hover:bg-[#0f1310] transition-colors border-l-4 border-l-transparent hover:border-l-[#5B8424] cursor-pointer"
                onClick={() => handleVehicleClick(vehicle)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="flex-shrink-0">
                      <TruckIcon className="h-8 w-8 text-[#5B8424]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-base font-semibold text-white truncate">
                          {vehicle.vehicleName}
                        </h3>
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {vehicle.vehicleType}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                        <div className="flex items-center gap-2 text-gray-300">
                          <TruckIcon className="h-4 w-4 text-gray-500 flex-shrink-0" />
                          <span className="truncate capitalize">{vehicle.vehicleType}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-300">
                          <CurrencyDollarIcon className="h-4 w-4 text-gray-500 flex-shrink-0" />
                          <span className="truncate">{getCurrencySymbol()}{vehicle.vehicleRatePerDay}/day</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex-shrink-0 ml-4 flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleVehicleClick(vehicle)
                      }}
                      className="p-2 text-gray-400 hover:text-blue-500 transition-colors"
                      title="View Details"
                    >
                      <EyeIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleEdit(vehicle)
                      }}
                      className="p-2 text-gray-400 hover:text-[#5B8424] transition-colors"
                      title="Edit"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDeleteClick(vehicle)
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
      {filteredVehicles.length > 0 && (
        <div className="flex items-center justify-between bg-[#121a14] border border-[#5B8424]/20 rounded-lg p-3 mt-6">
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <span>Showing</span>
            <span className="font-medium text-white">{startIndex + 1}</span>
            <span>to</span>
            <span className="font-medium text-white">{Math.min(endIndex, filteredVehicles.length)}</span>
            <span>of</span>
            <span className="font-medium text-white">{filteredVehicles.length}</span>
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
                  {editingVehicle ? 'Edit Vehicle' : 'Add New Vehicle'}
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
                      Vehicle Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.vehicleName}
                      onChange={(e) => setFormData({...formData, vehicleName: e.target.value})}
                      className="w-full px-3 py-2 bg-[#2a2a2a] border border-[#444] rounded-lg text-white focus:border-[#5B8424] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Vehicle Type *
                    </label>
                    <select
                      required
                      value={formData.vehicleType}
                      onChange={(e) => setFormData({...formData, vehicleType: e.target.value})}
                      className="w-full px-3 py-2 bg-[#2a2a2a] border border-[#444] rounded-lg text-white focus:border-[#5B8424] focus:outline-none"
                    >
                      {vehicleTypes.map(type => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                    <div className="flex items-center gap-2 mt-2">
                      <input
                        type="text"
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value)}
                        placeholder="New category"
                        className="flex-1 px-3 py-2 bg-[#2a2a2a] border border-[#444] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#5B8424]"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          addCategory()
                          setFormData(prev => ({ ...prev, vehicleType: newCategory.trim() || prev.vehicleType }))
                        }}
                        className="px-3 py-2 bg-[#5B8424] hover:bg-[#4a6b1f] text-white rounded-lg"
                      >
                        Add Category
                      </button>
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Vehicle Rate/Day *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.vehicleRatePerDay}
                      onChange={(e) => setFormData({...formData, vehicleRatePerDay: e.target.value})}
                      className="w-full px-3 py-2 bg-[#2a2a2a] border border-[#444] rounded-lg text-white focus:border-[#5B8424] focus:outline-none"
                    />
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
                    {editingVehicle ? 'Update Vehicle' : 'Create Vehicle'}
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
                <h3 className="text-lg font-medium text-white">Delete Vehicle</h3>
                <p className="text-sm text-gray-400">
                  Are you sure you want to delete vehicle "{deleteDialog.vehicleName}"? This action cannot be undone.
                </p>
              </div>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={() => setDeleteDialog({ isOpen: false, vehicleId: null, vehicleName: '' })}
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

      {/* Vehicle Details Modal */}
      {showVehicleDetails && selectedVehicle && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-[#121a14] border border-[#5B8424]/20 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-[#5B8424]/10">
              <div className="flex items-center gap-3">
                <TruckIcon className="h-8 w-8 text-[#5B8424]" />
                <div>
                  <h2 className="text-xl font-bold text-white">Vehicle Details</h2>
                  <p className="text-sm text-gray-400">ID: {selectedVehicle._id}</p>
                </div>
              </div>
              <button
                onClick={closeVehicleDetails}
                className="p-2 hover:bg-[#0f1310] rounded-lg transition-colors"
              >
                <XMarkIcon className="h-5 w-5 text-gray-400" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Vehicle Information */}
              <div className="bg-[#0f1310] p-4 rounded-lg border border-[#5B8424]/10">
                <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                  <TruckIcon className="h-5 w-5 text-[#5B8424]" />
                  Vehicle Information
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm text-gray-400">Vehicle Name</label>
                    <p className="text-white font-medium">{selectedVehicle.vehicleName}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400">Vehicle Type</label>
                    <p className="text-white font-medium capitalize">{selectedVehicle.vehicleType}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400">Daily Rate</label>
                    <p className="text-white font-medium">{getCurrencySymbol()}{selectedVehicle.vehicleRatePerDay}/day</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400">Currency</label>
                    <p className="text-white font-medium">INR (₹)</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3 pt-4 border-t border-[#5B8424]/10">
                <button 
                  onClick={() => {
                    closeVehicleDetails()
                    handleEdit(selectedVehicle)
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-[#5B8424] text-white rounded-lg hover:bg-[#4a6f1f] transition-colors"
                >
                  <PencilIcon className="h-4 w-4" />
                  Edit Vehicle
                </button>
                <button 
                  onClick={() => {
                    handleDeleteClick(selectedVehicle)
                    closeVehicleDetails()
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  <TrashIcon className="h-4 w-4" />
                  Delete Vehicle
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default VehicleManagementPage
