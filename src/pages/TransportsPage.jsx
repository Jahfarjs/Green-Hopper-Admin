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

function TransportForm({ transport, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    package: transport?.package?._id || transport?.package || '',
    driverName: transport?.driverName || '',
    phone: transport?.phone || '',
    vehicleType: transport?.vehicleType || '',
    regNo: transport?.regNo || '',
    advance: transport?.advance || 0,
    dailyRent: transport?.hire?.dailyRent || '',
    noOfDays: transport?.hire?.noOfDays || '',
    parkingToll: transport?.hire?.parkingToll || 0,
    extraKm: transport?.hire?.extraKm || 0,
    extraKmRate: transport?.hire?.extraKmRate || 0
  })
  const [packages, setPackages] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const headers = useAuthHeader()

  useEffect(() => {
    fetchPackages()
  }, [])

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

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const url = transport ? `${API_BASE_URL}/transports/${transport._id}` : `${API_BASE_URL}/transports`
      const method = transport ? 'PUT' : 'POST'
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', ...headers },
        body: JSON.stringify(formData)
      })
      
      const data = await res.json()
      if (!res.ok) throw new Error(data?.message || 'Failed to save transport')
      
      onSave(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const calculateTotals = () => {
    const dailyRent = parseFloat(formData.dailyRent) || 0
    const noOfDays = parseFloat(formData.noOfDays) || 0
    const parkingToll = parseFloat(formData.parkingToll) || 0
    const extraKm = parseFloat(formData.extraKm) || 0
    const extraKmRate = parseFloat(formData.extraKmRate) || 0
    
    const totalRent = dailyRent * noOfDays
    const extraKmTotal = extraKm * extraKmRate
    const netTotal = totalRent + parkingToll + extraKmTotal
    
    return { totalRent, extraKmTotal, netTotal }
  }

  const { totalRent, extraKmTotal, netTotal } = calculateTotals()

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-[#0f1310] rounded-xl border border-[#5B8424]/20 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-[#5B8424]/20">
          <div className="flex items-center justify-between">
            <h2 className="text-white text-xl font-semibold">
              {transport ? 'Edit Transport' : 'Add New Transport'}
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
                Driver Name *
              </label>
              <input
                type="text"
                value={formData.driverName}
                onChange={(e) => setFormData(prev => ({ ...prev, driverName: e.target.value }))}
                required
                className="w-full px-3 py-2 rounded-lg bg-[#0c0c0c] border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-[#5B8424]"
                placeholder="Driver name"
              />
            </div>
            
            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">
                Phone *
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                required
                className="w-full px-3 py-2 rounded-lg bg-[#0c0c0c] border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-[#5B8424]"
                placeholder="Phone number"
              />
            </div>
            
            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">
                Vehicle Type *
              </label>
              <input
                type="text"
                value={formData.vehicleType}
                onChange={(e) => setFormData(prev => ({ ...prev, vehicleType: e.target.value }))}
                required
                className="w-full px-3 py-2 rounded-lg bg-[#0c0c0c] border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-[#5B8424]"
                placeholder="e.g., SUV, Sedan, Bus"
              />
            </div>
            
            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">
                Registration Number *
              </label>
              <input
                type="text"
                value={formData.regNo}
                onChange={(e) => setFormData(prev => ({ ...prev, regNo: e.target.value }))}
                required
                className="w-full px-3 py-2 rounded-lg bg-[#0c0c0c] border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-[#5B8424]"
                placeholder="Vehicle registration number"
              />
            </div>
            
            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">
                Advance Amount
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.advance}
                onChange={(e) => setFormData(prev => ({ ...prev, advance: parseFloat(e.target.value) || 0 }))}
                className="w-full px-3 py-2 rounded-lg bg-[#0c0c0c] border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-[#5B8424]"
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="border-t border-white/10 pt-6">
            <h3 className="text-white font-medium mb-4">Hire Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">
                  Daily Rent *
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.dailyRent}
                  onChange={(e) => setFormData(prev => ({ ...prev, dailyRent: parseFloat(e.target.value) || '' }))}
                  required
                  className="w-full px-3 py-2 rounded-lg bg-[#0c0c0c] border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-[#5B8424]"
                  placeholder="0.00"
                />
              </div>
              
              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">
                  Number of Days *
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.noOfDays}
                  onChange={(e) => setFormData(prev => ({ ...prev, noOfDays: parseInt(e.target.value) || '' }))}
                  required
                  className="w-full px-3 py-2 rounded-lg bg-[#0c0c0c] border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-[#5B8424]"
                  placeholder="Number of days"
                />
              </div>
              
              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">
                  Parking & Toll
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.parkingToll}
                  onChange={(e) => setFormData(prev => ({ ...prev, parkingToll: parseFloat(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 rounded-lg bg-[#0c0c0c] border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-[#5B8424]"
                  placeholder="0.00"
                />
              </div>
              
              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">
                  Extra Kilometers
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.extraKm}
                  onChange={(e) => setFormData(prev => ({ ...prev, extraKm: parseInt(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 rounded-lg bg-[#0c0c0c] border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-[#5B8424]"
                  placeholder="Extra kilometers"
                />
              </div>
              
              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">
                  Extra KM Rate
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.extraKmRate}
                  onChange={(e) => setFormData(prev => ({ ...prev, extraKmRate: parseFloat(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 rounded-lg bg-[#0c0c0c] border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-[#5B8424]"
                  placeholder="Rate per extra km"
                />
              </div>
            </div>
          </div>

          <div className="border-t border-white/10 pt-6">
            <div className="bg-white/5 rounded-lg p-4 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-white/80">Total Rent:</span>
                <span className="text-white">₹{totalRent.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white/80">Extra KM Total:</span>
                <span className="text-white">₹{extraKmTotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center border-t border-white/10 pt-2">
                <span className="text-white/80 font-medium">Net Total:</span>
                <span className="text-white text-xl font-bold">₹{netTotal.toLocaleString()}</span>
              </div>
            </div>
          </div>
          
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-[#5B8424] hover:bg-[#5B8424]/80 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? 'Saving...' : (transport ? 'Update Transport' : 'Add Transport')}
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

function TransportsPage() {
  const [transports, setTransports] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingTransport, setEditingTransport] = useState(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [deletingTransport, setDeletingTransport] = useState(null)
  const [viewMode, setViewMode] = useState('cards')
  const [sortBy, setSortBy] = useState('driverName')
  const [sortOrder, setSortOrder] = useState('asc')
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [selectedTransport, setSelectedTransport] = useState(null)
  const headers = useAuthHeader()

  const sortOptions = [
    { value: 'driverName', label: 'Driver Name' },
    { value: 'vehicleType', label: 'Vehicle Type' },
    { value: 'regNo', label: 'Registration No' },
    { value: 'dailyRent', label: 'Daily Rent' },
    { value: 'netTotal', label: 'Net Total' },
  ]

  const transportFields = [
    { key: 'driverName', label: 'Driver Name', type: 'text' },
    { key: 'phone', label: 'Phone', type: 'text' },
    { key: 'vehicleType', label: 'Vehicle Type', type: 'text' },
    { key: 'regNo', label: 'Registration Number', type: 'text' },
    { key: 'advance', label: 'Advance Amount', type: 'currency' },
    { key: 'package.packageCode', label: 'Package Code', type: 'text' },
    { key: 'package.customer.name', label: 'Customer Name', type: 'text' },
    { key: 'hire.dailyRent', label: 'Daily Rent', type: 'currency' },
    { key: 'hire.noOfDays', label: 'Number of Days', type: 'number' },
    { key: 'hire.parkingToll', label: 'Parking & Toll', type: 'currency' },
    { key: 'hire.extraKm', label: 'Extra Kilometers', type: 'number' },
    { key: 'hire.extraKmRate', label: 'Extra KM Rate', type: 'currency' },
    { key: 'hire.totalRent', label: 'Total Rent', type: 'currency' },
    { key: 'hire.extraKmTotal', label: 'Extra KM Total', type: 'currency' },
    { key: 'hire.netTotal', label: 'Net Total', type: 'currency' },
  ]

  const fetchTransports = async () => {
    setError('')
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE_URL}/transports`, {
        headers
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.message || 'Failed to fetch transports')
      setTransports(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTransports()
  }, [])

  const handleSave = (transport) => {
    if (editingTransport) {
      setTransports(prev => prev.map(t => t._id === transport._id ? transport : t))
    } else {
      setTransports(prev => [transport, ...prev])
    }
    setShowForm(false)
    setEditingTransport(null)
  }

  const handleEdit = (transport) => {
    setEditingTransport(transport)
    setShowForm(true)
  }

  const handleDelete = async () => {
    if (!deletingTransport) return
    
    try {
      const res = await fetch(`${API_BASE_URL}/transports/${deletingTransport._id}`, {
        method: 'DELETE',
        headers
      })
      
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data?.message || 'Failed to delete transport')
      }
      
      setTransports(prev => prev.filter(t => t._id !== deletingTransport._id))
      setShowDeleteDialog(false)
      setDeletingTransport(null)
    } catch (err) {
      setError(err.message)
    }
  }

  const handleViewDetails = (transport) => {
    setSelectedTransport(transport)
    setShowDetailsModal(true)
  }

  const filteredAndSortedTransports = useMemo(() => {
    let filtered = transports.filter((transport) => {
      const target = `${transport.driverName} ${transport.vehicleType} ${transport.regNo} ${transport.package?.packageCode || ''}`.toLowerCase()
      return target.includes(query.toLowerCase())
    })

    // Sort the filtered results
    filtered.sort((a, b) => {
      let aValue, bValue
      
      switch (sortBy) {
        case 'driverName':
          aValue = a.driverName?.toLowerCase() || ''
          bValue = b.driverName?.toLowerCase() || ''
          break
        case 'vehicleType':
          aValue = a.vehicleType?.toLowerCase() || ''
          bValue = b.vehicleType?.toLowerCase() || ''
          break
        case 'regNo':
          aValue = a.regNo?.toLowerCase() || ''
          bValue = b.regNo?.toLowerCase() || ''
          break
        case 'dailyRent':
          aValue = a.hire?.dailyRent || 0
          bValue = b.hire?.dailyRent || 0
          break
        case 'netTotal':
          aValue = a.hire?.netTotal || 0
          bValue = b.hire?.netTotal || 0
          break
        default:
          aValue = a.driverName?.toLowerCase() || ''
          bValue = b.driverName?.toLowerCase() || ''
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
  }, [transports, query, sortBy, sortOrder])

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-white">Transports Management</h1>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#5B8424] hover:bg-[#5B8424]/80 text-white rounded-lg transition-colors"
        >
          <PlusIcon className="h-5 w-5" />
          Add Transport
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
        searchPlaceholder="Search transports..."
      />

      {loading && <div className="text-white/60 text-center py-8">Loading...</div>}
      {error && <div className="text-red-300 text-sm mb-4">{error}</div>}

      {viewMode === 'cards' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAndSortedTransports.map((transport) => (
            <div 
              key={transport._id} 
              className="bg-[#0c0c0c] rounded-lg border border-white/10 p-4 cursor-pointer hover:bg-[#0c0c0c]/80 transition-colors"
              onClick={() => handleViewDetails(transport)}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-white font-medium">{transport.driverName}</h3>
                  <p className="text-white/60 text-sm">{transport.vehicleType}</p>
                  <p className="text-white/60 text-sm">{transport.regNo}</p>
                </div>
                <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => handleEdit(transport)}
                    className="p-1 text-white/60 hover:text-white"
                  >
                    <PencilIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => {
                      setDeletingTransport(transport)
                      setShowDeleteDialog(true)
                    }}
                    className="p-1 text-red-400 hover:text-red-300"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="text-white/70">
                  <span className="font-medium">Package:</span> {transport.package?.packageCode || 'N/A'}
                </div>
                <div className="text-white/70">
                  <span className="font-medium">Phone:</span> {transport.phone}
                </div>
                <div className="text-white/70">
                  <span className="font-medium">Days:</span> {transport.hire?.noOfDays}
                </div>
                <div className="text-white/70">
                  <span className="font-medium">Daily Rent:</span> ₹{transport.hire?.dailyRent?.toLocaleString()}
                </div>
                <div className="text-white/70">
                  <span className="font-medium">Total Rent:</span> ₹{transport.hire?.totalRent?.toLocaleString()}
                </div>
                <div className="text-white font-medium">
                  <span className="font-medium">Net Total:</span> ₹{transport.hire?.netTotal?.toLocaleString()}
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
                <th className="px-4 py-3 text-left font-medium">Package</th>
                <th className="px-4 py-3 text-left font-medium">Driver</th>
                <th className="px-4 py-3 text-left font-medium">Vehicle</th>
                <th className="px-4 py-3 text-left font-medium">Reg No</th>
                <th className="px-4 py-3 text-left font-medium">Days</th>
                <th className="px-4 py-3 text-left font-medium">Daily Rent</th>
                <th className="px-4 py-3 text-left font-medium">Total Rent</th>
                <th className="px-4 py-3 text-left font-medium">Net Total</th>
                <th className="px-4 py-3 text-left font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSortedTransports.map((transport) => (
                <tr 
                  key={transport._id} 
                  className="border-t border-white/5 hover:bg-white/[0.03] cursor-pointer"
                  onClick={() => handleViewDetails(transport)}
                >
                  <td className="px-4 py-3 font-medium">{transport.package?.packageCode || 'N/A'}</td>
                  <td className="px-4 py-3">{transport.driverName}</td>
                  <td className="px-4 py-3">{transport.vehicleType}</td>
                  <td className="px-4 py-3">{transport.regNo}</td>
                  <td className="px-4 py-3">{transport.hire?.noOfDays}</td>
                  <td className="px-4 py-3">₹{transport.hire?.dailyRent?.toLocaleString()}</td>
                  <td className="px-4 py-3">₹{transport.hire?.totalRent?.toLocaleString()}</td>
                  <td className="px-4 py-3 font-bold">₹{transport.hire?.netTotal?.toLocaleString()}</td>
                  <td className="px-4 py-3 space-x-2" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => handleEdit(transport)}
                      className="px-3 py-1 rounded-lg bg-blue-600/80 hover:bg-blue-600 transition-colors"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => {
                        setDeletingTransport(transport)
                        setShowDeleteDialog(true)
                      }}
                      className="px-3 py-1 rounded-lg bg-red-600/80 hover:bg-red-600 transition-colors"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {filteredAndSortedTransports.length === 0 && !loading && (
        <div className="text-center py-8 text-white/60">
          No transports found
        </div>
      )}

      {showForm && (
        <TransportForm
          transport={editingTransport}
          onSave={handleSave}
          onCancel={() => {
            setShowForm(false)
            setEditingTransport(null)
          }}
        />
      )}

      <DataDetailsModal
        isOpen={showDetailsModal}
        onClose={() => {
          setShowDetailsModal(false)
          setSelectedTransport(null)
        }}
        data={selectedTransport}
        title="Transport Details"
        fields={transportFields}
      />

      <ConfirmationDialog
        isOpen={showDeleteDialog}
        onClose={() => {
          setShowDeleteDialog(false)
          setDeletingTransport(null)
        }}
        onConfirm={handleDelete}
        title="Delete Transport"
        message={`Are you sure you want to delete transport for ${deletingTransport?.driverName} (${deletingTransport?.vehicleType})? This action cannot be undone.`}
        confirmText="Delete"
        confirmButtonClass="bg-red-600 hover:bg-red-700"
      />
    </div>
  )
}

export default TransportsPage
