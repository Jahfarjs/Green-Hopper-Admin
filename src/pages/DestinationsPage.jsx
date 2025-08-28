import React, { useEffect, useMemo, useState } from 'react'
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  MagnifyingGlassIcon,
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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-[#0f1310] rounded-xl border border-[#5B8424]/20 max-w-md w-full">
        <div className="p-6 border-b border-[#5B8424]/20">
          <div className="flex items-center justify-between">
            <h2 className="text-white text-xl font-semibold">
              {destination ? 'Edit Destination' : 'Add New Destination'}
            </h2>
            <button onClick={onCancel} className="text-white/70 hover:text-white">
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-white/70 text-sm mb-2">Destination Name</label>
            <input
              type="text"
              value={formData.destinationName}
              onChange={(e) => setFormData(prev => ({ ...prev, destinationName: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg bg-[#0c0c0c] border border-white/10 text-white focus:outline-none focus:border-[#5B8424]"
              placeholder="e.g., Bali, Maldives"
              required
            />
          </div>
          
          <div>
            <label className="block text-white/70 text-sm mb-2">Country</label>
            <input
              type="text"
              value={formData.country}
              onChange={(e) => setFormData(prev => ({ ...prev, country: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg bg-[#0c0c0c] border border-white/10 text-white focus:outline-none focus:border-[#5B8424]"
              placeholder="e.g., Indonesia, Maldives"
              required
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-[#5B8424] text-white rounded-lg hover:bg-[#5B8424]/80 disabled:opacity-50"
            >
              {loading ? 'Saving...' : (destination ? 'Update Destination' : 'Create Destination')}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function DestinationsPage() {
  const headers = useAuthHeader()
  const [destinations, setDestinations] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingDestination, setEditingDestination] = useState(null)
  const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, destinationId: null, destinationName: '' })
  const [viewMode, setViewMode] = useState('cards')
  const [sortBy, setSortBy] = useState('destinationName')
  const [sortOrder, setSortOrder] = useState('asc')
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [selectedDestination, setSelectedDestination] = useState(null)

  const sortOptions = [
    { value: 'destinationName', label: 'Destination Name' },
    { value: 'country', label: 'Country' },
  ]

  const destinationFields = [
    { key: 'destinationName', label: 'Destination Name', type: 'text' },
    { key: 'country', label: 'Country', type: 'text' },
  ]

  const fetchDestinations = async () => {
    setError('')
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE_URL}/admin/destinations`, { headers })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.message || 'Failed to fetch destinations')
      setDestinations(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchDestinations() }, [])

  const deleteDestination = async (id) => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/destinations/${id}`, {
        method: 'DELETE',
        headers
      })
      if (!res.ok) throw new Error('Failed to delete destination')
      await fetchDestinations()
    } catch (err) {
      setError(err.message)
    }
  }

  const handleDeleteClick = (destination) => {
    setDeleteDialog({
      isOpen: true,
      destinationId: destination._id,
      destinationName: destination.destinationName
    })
  }

  const handleDeleteConfirm = async () => {
    await deleteDestination(deleteDialog.destinationId)
    setDeleteDialog({ isOpen: false, destinationId: null, destinationName: '' })
  }

  const handleSave = (destination) => {
    setShowForm(false)
    setEditingDestination(null)
    fetchDestinations()
  }

  const handleViewDetails = (destination) => {
    setSelectedDestination(destination)
    setShowDetailsModal(true)
  }

  const filteredAndSortedDestinations = useMemo(() => {
    let filtered = destinations.filter((destination) => {
      const target = `${destination.destinationName} ${destination.country}`.toLowerCase()
      return target.includes(query.toLowerCase())
    })

    // Sort the filtered results
    filtered.sort((a, b) => {
      let aValue, bValue
      
      switch (sortBy) {
        case 'destinationName':
          aValue = a.destinationName?.toLowerCase() || ''
          bValue = b.destinationName?.toLowerCase() || ''
          break
        case 'country':
          aValue = a.country?.toLowerCase() || ''
          bValue = b.country?.toLowerCase() || ''
          break
        default:
          aValue = a.destinationName?.toLowerCase() || ''
          bValue = b.destinationName?.toLowerCase() || ''
      }

      return sortOrder === 'asc' 
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue)
    })

    return filtered
  }, [destinations, query, sortBy, sortOrder])

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-white">Destinations Management</h1>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#5B8424] text-white rounded-lg hover:bg-[#5B8424]/80"
        >
          <PlusIcon className="h-5 w-5" />
          Add Destination
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
        searchPlaceholder="Search destinations..."
      />

      {loading && <div className="text-white/60 text-center py-8">Loading...</div>}
      {error && <div className="text-red-300 text-sm mb-4">{error}</div>}

      {viewMode === 'cards' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {filteredAndSortedDestinations.map((destination) => (
            <div 
              key={destination._id} 
              className="bg-[#0c0c0c] rounded-lg border border-white/10 p-3 cursor-pointer hover:bg-[#0c0c0c]/80 transition-colors"
              onClick={() => handleViewDetails(destination)}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-medium text-sm truncate">{destination.destinationName}</h3>
                  <p className="text-white/60 text-xs">{destination.country}</p>
                </div>
                <div className="flex gap-1 ml-2" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => { setEditingDestination(destination); setShowForm(true) }}
                    className="p-1 text-white/60 hover:text-white transition-colors"
                  >
                    <PencilIcon className="h-3 w-3" />
                  </button>
                  <button
                    onClick={() => handleDeleteClick(destination)}
                    className="p-1 text-red-400 hover:text-red-300 transition-colors"
                  >
                    <TrashIcon className="h-3 w-3" />
                  </button>
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
                <th className="px-3 py-2 text-left font-medium text-xs">Destination Name</th>
                <th className="px-3 py-2 text-left font-medium text-xs">Country</th>
                <th className="px-3 py-2 text-left font-medium text-xs">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSortedDestinations.map((destination) => (
                <tr 
                  key={destination._id} 
                  className="border-t border-white/5 hover:bg-white/[0.03] cursor-pointer transition-colors"
                  onClick={() => handleViewDetails(destination)}
                >
                  <td className="px-3 py-2 font-medium text-xs">{destination.destinationName}</td>
                  <td className="px-3 py-2 text-xs">{destination.country}</td>
                  <td className="px-3 py-2 space-x-1" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => { setEditingDestination(destination); setShowForm(true) }}
                      className="px-2 py-1 rounded bg-blue-600/80 hover:bg-blue-600 transition-colors"
                    >
                      <PencilIcon className="h-3 w-3" />
                    </button>
                    <button
                      onClick={() => handleDeleteClick(destination)}
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

      {filteredAndSortedDestinations.length === 0 && !loading && (
        <div className="text-center py-8 text-white/60">
          No destinations found
        </div>
      )}

      {showForm && (
        <DestinationForm
          destination={editingDestination}
          onSave={handleSave}
          onCancel={() => { setShowForm(false); setEditingDestination(null) }}
        />
      )}

      <DataDetailsModal
        isOpen={showDetailsModal}
        onClose={() => {
          setShowDetailsModal(false)
          setSelectedDestination(null)
        }}
        data={selectedDestination}
        title="Destination Details"
        fields={destinationFields}
      />

      <ConfirmationDialog
        isOpen={deleteDialog.isOpen}
        onClose={() => setDeleteDialog({ isOpen: false, destinationId: null, destinationName: '' })}
        onConfirm={handleDeleteConfirm}
        title="Delete Destination"
        message={`Are you sure you want to delete "${deleteDialog.destinationName}"? This action cannot be undone.`}
        confirmText="Delete Destination"
        cancelText="Cancel"
      />
    </div>
  )
}

export default DestinationsPage
