import React, { useEffect, useMemo, useState } from 'react'
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline'

const API_BASE_URL = import.meta.env.VITE_ADMIN_API_URL

function useAuthHeader() {
  return useMemo(() => ({
    Authorization: `Bearer ${localStorage.getItem('admin_token') || ''}`
  }), [])
}

function DestinationForm({ destination, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    destinationName: destination?.destinationName || '',
    country: destination?.country || ''
  })
  const [loading, setLoading] = useState(false)
  const headers = useAuthHeader()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const url = destination ? `${API_BASE_URL}/admin/destinations/${destination._id}` : `${API_BASE_URL}/admin/destinations`
      const method = destination ? 'PUT' : 'POST'
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', ...headers },
        body: JSON.stringify(formData)
      })
      
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Failed to save destination')
      
      onSave(data.destination)
    } catch (error) {
      alert(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6 mb-6">
      <h3 className="text-lg font-semibold text-white mb-4">
        {destination ? 'Edit Destination' : 'Add New Destination'}
      </h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Destination Name
          </label>
          <input
            type="text"
            value={formData.destinationName}
            onChange={(e) => setFormData({ ...formData, destinationName: e.target.value })}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter destination name"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Country
          </label>
          <input
            type="text"
            value={formData.country}
            onChange={(e) => setFormData({ ...formData, country: e.target.value })}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter country"
            required
          />
        </div>
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white rounded-lg font-medium transition-colors"
          >
            {loading ? 'Saving...' : (destination ? 'Update' : 'Create')}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}

function DestinationsPage() {
  const [destinations, setDestinations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [editingDestination, setEditingDestination] = useState(null)
  const [query, setQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 12
  const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, destinationId: null, destinationName: '' })
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [selectedDestination, setSelectedDestination] = useState(null)
  const headers = useAuthHeader()

  const sortOptions = [
    { value: 'destinationName', label: 'Name' },
    { value: 'country', label: 'Country' },
    { value: 'createdAt', label: 'Created Date' }
  ]

  const destinationFields = [
    { key: 'destinationName', label: 'Destination Name', type: 'text' },
    { key: 'country', label: 'Country', type: 'text' },
    { key: 'createdAt', label: 'Created At', type: 'date' }
  ]

  useEffect(() => {
    fetchDestinations()
  }, [])

  const fetchDestinations = async () => {
    try {
      setLoading(true)
      const res = await fetch(`${API_BASE_URL}/admin/destinations`, { headers })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Failed to fetch destinations')
      setDestinations(data)
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = (destination) => {
    if (editingDestination) {
      setDestinations(destinations.map(d => d._id === destination._id ? destination : d))
    } else {
      setDestinations([destination, ...destinations])
    }
    setShowForm(false)
    setEditingDestination(null)
  }

  const handleDeleteClick = (destination) => {
    setDeleteDialog({
      isOpen: true,
      destinationId: destination._id,
      destinationName: destination.destinationName
    })
  }

  const handleDeleteConfirm = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/destinations/${deleteDialog.destinationId}`, {
        method: 'DELETE',
        headers
      })
      if (!res.ok) throw new Error('Failed to delete destination')
      setDestinations(destinations.filter(d => d._id !== deleteDialog.destinationId))
      setDeleteDialog({ isOpen: false, destinationId: null, destinationName: '' })
    } catch (error) {
      alert(error.message)
    }
  }

  const handleViewDetails = (destination) => {
    setSelectedDestination(destination)
    setShowDetailsModal(true)
  }

  const filteredDestinations = destinations.filter(destination =>
    destination.destinationName.toLowerCase().includes(query.toLowerCase()) ||
    destination.country.toLowerCase().includes(query.toLowerCase())
  )

  // Pagination logic
  const totalPages = Math.ceil(filteredDestinations.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentDestinations = filteredDestinations.slice(startIndex, endIndex)

  // Reset to page 1 when search changes
  useEffect(() => {
    setCurrentPage(1)
  }, [query])

  const handlePageChange = (page) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-2">Destinations</h1>
        <p className="text-gray-400">Manage travel destinations</p>
      </div>

      {showForm && (
        <DestinationForm
          destination={editingDestination}
          onSave={handleSave}
          onCancel={() => {
            setShowForm(false)
            setEditingDestination(null)
          }}
        />
      )}

      <div className="bg-gray-800 rounded-lg p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search destinations..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            <PlusIcon className="h-5 w-5" />
            Add Destination
          </button>
        </div>
      </div>

      {loading && <div className="text-white/60 text-center py-8">Loading...</div>}
      {error && <div className="text-red-300 text-sm mb-4">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {currentDestinations.map((destination) => (
          <div 
            key={destination._id} 
            className="bg-gray-800 rounded-lg border border-gray-700 p-4 hover:bg-gray-700 transition-colors"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1 min-w-0">
                <h3 className="text-white font-medium text-lg truncate">{destination.destinationName}</h3>
                <p className="text-gray-400 text-sm">{destination.country}</p>
              </div>
              <div className="flex gap-2 ml-3">
                <button
                  onClick={() => { setEditingDestination(destination); setShowForm(true) }}
                  className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-400/10 rounded-lg transition-colors"
                  title="Edit"
                >
                  <PencilIcon className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDeleteClick(destination)}
                  className="p-2 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg transition-colors"
                  title="Delete"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="text-xs text-gray-500">
              Created: {formatDate(destination.createdAt)}
            </div>
          </div>
        ))}
      </div>

      {currentDestinations.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-lg">No destinations found</div>
          <div className="text-gray-500 text-sm mt-2">
            {query ? 'Try adjusting your search criteria' : 'No destinations have been created yet'}
          </div>
        </div>
      )}

      {/* Destination Details Modal */}
      {showDetailsModal && selectedDestination && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-white">Destination Details</h3>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Destination Name</label>
                <div className="text-white">{selectedDestination.destinationName}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Country</label>
                <div className="text-white">{selectedDestination.country}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Created At</label>
                <div className="text-white">{formatDate(selectedDestination.createdAt)}</div>
              </div>
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
                <h3 className="text-lg font-medium text-white">Delete Destination</h3>
                <p className="text-sm text-gray-400">
                  Are you sure you want to delete "{deleteDialog.destinationName}"? This action cannot be undone.
                </p>
              </div>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={() => setDeleteDialog({ isOpen: false, destinationId: null, destinationName: '' })}
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

      {/* Pagination */}
      {filteredDestinations.length > 0 && (
        <div className="flex items-center justify-between bg-gray-800 border border-gray-700 rounded-lg p-3 mt-6">
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <span>Showing</span>
            <span className="font-medium text-white">{startIndex + 1}</span>
            <span>to</span>
            <span className="font-medium text-white">{Math.min(endIndex, filteredDestinations.length)}</span>
            <span>of</span>
            <span className="font-medium text-white">{filteredDestinations.length}</span>
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
                  className="px-2 py-1 text-sm font-medium rounded bg-blue-600 text-white"
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
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-400 hover:text-white hover:bg-gray-700'
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
    </div>
  )
}

export default DestinationsPage