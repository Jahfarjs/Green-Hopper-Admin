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

function PackageForm({ package: packageData, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    customer: packageData?.customer?._id || packageData?.customer || '',
    arrival: {
      date: packageData?.arrival?.date ? new Date(packageData.arrival.date).toISOString().split('T')[0] : '',
      city: packageData?.arrival?.city || '',
      flight: packageData?.arrival?.flight || '',
      time: packageData?.arrival?.time || ''
    },
    departure: {
      date: packageData?.departure?.date ? new Date(packageData.departure.date).toISOString().split('T')[0] : '',
      city: packageData?.departure?.city || '',
      flight: packageData?.departure?.flight || '',
      time: packageData?.departure?.time || ''
    },
    days: packageData?.days || '',
    nights: packageData?.nights || '',
    prizeINR: packageData?.prizeINR || '',
    expenditure: packageData?.expenditure || '',
    profit: packageData?.profit || '',
    advance: packageData?.advance || '',
    tourExecutive: packageData?.tourExecutive || '',
    reservationOfficer: packageData?.reservationOfficer || '',
    sourceOfEnquiry: packageData?.sourceOfEnquiry || '',
    transporter: packageData?.transporter || '',
    handlingOfficer: packageData?.handlingOfficer || ''
  })
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const headers = useAuthHeader()

  useEffect(() => {
    fetchCustomers()
  }, [])

  const fetchCustomers = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/customers`, {
        headers
      })
      const data = await res.json()
      if (res.ok) setCustomers(data)
    } catch (error) {
      console.error('Error fetching customers:', error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const url = packageData ? `${API_BASE_URL}/packages/${packageData._id}` : `${API_BASE_URL}/packages`
      const method = packageData ? 'PUT' : 'POST'
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', ...headers },
        body: JSON.stringify(formData)
      })
      
      const data = await res.json()
      if (!res.ok) throw new Error(data?.message || 'Failed to save package')
      
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
              {packageData ? 'Edit Package' : 'Add New Package'}
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
                Customer *
              </label>
              <select
                value={formData.customer}
                onChange={(e) => setFormData(prev => ({ ...prev, customer: e.target.value }))}
                required
                className="w-full px-3 py-2 rounded-lg bg-[#0c0c0c] border border-white/10 text-white focus:outline-none focus:border-[#5B8424]"
              >
                <option value="">Select Customer</option>
                {customers.map(customer => (
                  <option key={customer._id} value={customer._id}>
                    {customer.name} - {customer.email}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">
                Days *
              </label>
              <input
                type="number"
                min="1"
                value={formData.days}
                onChange={(e) => setFormData(prev => ({ ...prev, days: parseInt(e.target.value) || '' }))}
                required
                className="w-full px-3 py-2 rounded-lg bg-[#0c0c0c] border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-[#5B8424]"
                placeholder="Number of days"
              />
            </div>
            
            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">
                Nights *
              </label>
              <input
                type="number"
                min="1"
                value={formData.nights}
                onChange={(e) => setFormData(prev => ({ ...prev, nights: parseInt(e.target.value) || '' }))}
                required
                className="w-full px-3 py-2 rounded-lg bg-[#0c0c0c] border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-[#5B8424]"
                placeholder="Number of nights"
              />
            </div>
            
            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">
                Prize (INR) *
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.prizeINR}
                onChange={(e) => setFormData(prev => ({ ...prev, prizeINR: parseFloat(e.target.value) || '' }))}
                required
                className="w-full px-3 py-2 rounded-lg bg-[#0c0c0c] border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-[#5B8424]"
                placeholder="0.00"
              />
            </div>
            
            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">
                Expenditure *
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.expenditure}
                onChange={(e) => setFormData(prev => ({ ...prev, expenditure: parseFloat(e.target.value) || '' }))}
                required
                className="w-full px-3 py-2 rounded-lg bg-[#0c0c0c] border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-[#5B8424]"
                placeholder="0.00"
              />
            </div>
            
            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">
                Profit *
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.profit}
                onChange={(e) => setFormData(prev => ({ ...prev, profit: parseFloat(e.target.value) || '' }))}
                required
                className="w-full px-3 py-2 rounded-lg bg-[#0c0c0c] border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-[#5B8424]"
                placeholder="0.00"
              />
            </div>
            
            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">
                Advance
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.advance}
                onChange={(e) => setFormData(prev => ({ ...prev, advance: parseFloat(e.target.value) || '' }))}
                className="w-full px-3 py-2 rounded-lg bg-[#0c0c0c] border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-[#5B8424]"
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="border-t border-white/10 pt-6">
            <h3 className="text-white font-medium mb-4">Arrival Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">
                  Arrival Date *
                </label>
                <input
                  type="date"
                  value={formData.arrival.date}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    arrival: { ...prev.arrival, date: e.target.value }
                  }))}
                  required
                  className="w-full px-3 py-2 rounded-lg bg-[#0c0c0c] border border-white/10 text-white focus:outline-none focus:border-[#5B8424]"
                />
              </div>
              
              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">
                  Arrival City *
                </label>
                <input
                  type="text"
                  value={formData.arrival.city}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    arrival: { ...prev.arrival, city: e.target.value }
                  }))}
                  required
                  className="w-full px-3 py-2 rounded-lg bg-[#0c0c0c] border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-[#5B8424]"
                  placeholder="City name"
                />
              </div>
              
              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">
                  Arrival Flight *
                </label>
                <input
                  type="text"
                  value={formData.arrival.flight}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    arrival: { ...prev.arrival, flight: e.target.value }
                  }))}
                  required
                  className="w-full px-3 py-2 rounded-lg bg-[#0c0c0c] border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-[#5B8424]"
                  placeholder="Flight number"
                />
              </div>
              
              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">
                  Arrival Time *
                </label>
                <input
                  type="time"
                  value={formData.arrival.time}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    arrival: { ...prev.arrival, time: e.target.value }
                  }))}
                  required
                  className="w-full px-3 py-2 rounded-lg bg-[#0c0c0c] border border-white/10 text-white focus:outline-none focus:border-[#5B8424]"
                />
              </div>
            </div>
          </div>

          <div className="border-t border-white/10 pt-6">
            <h3 className="text-white font-medium mb-4">Departure Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">
                  Departure Date *
                </label>
                <input
                  type="date"
                  value={formData.departure.date}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    departure: { ...prev.departure, date: e.target.value }
                  }))}
                  required
                  className="w-full px-3 py-2 rounded-lg bg-[#0c0c0c] border border-white/10 text-white focus:outline-none focus:border-[#5B8424]"
                />
              </div>
              
              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">
                  Departure City *
                </label>
                <input
                  type="text"
                  value={formData.departure.city}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    departure: { ...prev.departure, city: e.target.value }
                  }))}
                  required
                  className="w-full px-3 py-2 rounded-lg bg-[#0c0c0c] border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-[#5B8424]"
                  placeholder="City name"
                />
              </div>
              
              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">
                  Departure Flight *
                </label>
                <input
                  type="text"
                  value={formData.departure.flight}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    departure: { ...prev.departure, flight: e.target.value }
                  }))}
                  required
                  className="w-full px-3 py-2 rounded-lg bg-[#0c0c0c] border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-[#5B8424]"
                  placeholder="Flight number"
                />
              </div>
              
              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">
                  Departure Time *
                </label>
                <input
                  type="time"
                  value={formData.departure.time}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    departure: { ...prev.departure, time: e.target.value }
                  }))}
                  required
                  className="w-full px-3 py-2 rounded-lg bg-[#0c0c0c] border border-white/10 text-white focus:outline-none focus:border-[#5B8424]"
                />
              </div>
            </div>
          </div>

          <div className="border-t border-white/10 pt-6">
            <h3 className="text-white font-medium mb-4">Staff & Contact Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">
                  Tour Executive *
                </label>
                <input
                  type="text"
                  value={formData.tourExecutive}
                  onChange={(e) => setFormData(prev => ({ ...prev, tourExecutive: e.target.value }))}
                  required
                  className="w-full px-3 py-2 rounded-lg bg-[#0c0c0c] border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-[#5B8424]"
                  placeholder="Tour executive name"
                />
              </div>
              
              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">
                  Reservation Officer *
                </label>
                <input
                  type="text"
                  value={formData.reservationOfficer}
                  onChange={(e) => setFormData(prev => ({ ...prev, reservationOfficer: e.target.value }))}
                  required
                  className="w-full px-3 py-2 rounded-lg bg-[#0c0c0c] border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-[#5B8424]"
                  placeholder="Reservation officer name"
                />
              </div>
              
              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">
                  Source of Enquiry *
                </label>
                <input
                  type="text"
                  value={formData.sourceOfEnquiry}
                  onChange={(e) => setFormData(prev => ({ ...prev, sourceOfEnquiry: e.target.value }))}
                  required
                  className="w-full px-3 py-2 rounded-lg bg-[#0c0c0c] border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-[#5B8424]"
                  placeholder="e.g., Website, Referral, Social Media"
                />
              </div>
              
              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">
                  Transporter *
                </label>
                <input
                  type="text"
                  value={formData.transporter}
                  onChange={(e) => setFormData(prev => ({ ...prev, transporter: e.target.value }))}
                  required
                  className="w-full px-3 py-2 rounded-lg bg-[#0c0c0c] border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-[#5B8424]"
                  placeholder="Transporter name"
                />
              </div>
              
              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">
                  Handling Officer *
                </label>
                <input
                  type="text"
                  value={formData.handlingOfficer}
                  onChange={(e) => setFormData(prev => ({ ...prev, handlingOfficer: e.target.value }))}
                  required
                  className="w-full px-3 py-2 rounded-lg bg-[#0c0c0c] border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-[#5B8424]"
                  placeholder="Handling officer name"
                />
              </div>
            </div>
          </div>
          
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-[#5B8424] hover:bg-[#5B8424]/80 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? 'Saving...' : (packageData ? 'Update Package' : 'Add Package')}
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

function PackagesPage() {
  const [packages, setPackages] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingPackage, setEditingPackage] = useState(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [deletingPackage, setDeletingPackage] = useState(null)
  const [viewMode, setViewMode] = useState('cards')
  const [sortBy, setSortBy] = useState('packageCode')
  const [sortOrder, setSortOrder] = useState('asc')
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [selectedPackage, setSelectedPackage] = useState(null)
  const headers = useAuthHeader()

  const sortOptions = [
    { value: 'packageCode', label: 'Package Code' },
    { value: 'customerName', label: 'Customer Name' },
    { value: 'arrivalDate', label: 'Arrival Date' },
    { value: 'departureDate', label: 'Departure Date' },
    { value: 'days', label: 'Days' },
    { value: 'prizeINR', label: 'Price (INR)' },
    { value: 'profit', label: 'Profit' },
  ]

  const packageFields = [
    { key: 'packageCode', label: 'Package Code', type: 'text' },
    { key: 'customer.name', label: 'Customer Name', type: 'text' },
    { key: 'arrival.date', label: 'Arrival Date', type: 'date' },
    { key: 'arrival.city', label: 'Arrival City', type: 'text' },
    { key: 'arrival.flight', label: 'Arrival Flight', type: 'text' },
    { key: 'arrival.time', label: 'Arrival Time', type: 'text' },
    { key: 'departure.date', label: 'Departure Date', type: 'date' },
    { key: 'departure.city', label: 'Departure City', type: 'text' },
    { key: 'departure.flight', label: 'Departure Flight', type: 'text' },
    { key: 'departure.time', label: 'Departure Time', type: 'text' },
    { key: 'days', label: 'Days', type: 'number' },
    { key: 'nights', label: 'Nights', type: 'number' },
    { key: 'prizeINR', label: 'Price (INR)', type: 'currency' },
    { key: 'expenditure', label: 'Expenditure', type: 'currency' },
    { key: 'profit', label: 'Profit', type: 'currency' },
    { key: 'advance', label: 'Advance', type: 'currency' },
    { key: 'tourExecutive', label: 'Tour Executive', type: 'text' },
    { key: 'reservationOfficer', label: 'Reservation Officer', type: 'text' },
    { key: 'sourceOfEnquiry', label: 'Source of Enquiry', type: 'text' },
    { key: 'transporter', label: 'Transporter', type: 'text' },
    { key: 'handlingOfficer', label: 'Handling Officer', type: 'text' },
  ]

  const fetchPackages = async () => {
    setError('')
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE_URL}/packages`, {
        headers
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.message || 'Failed to fetch packages')
      setPackages(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPackages()
  }, [])

  const handleSave = (packageData) => {
    if (editingPackage) {
      setPackages(prev => prev.map(p => p._id === packageData._id ? packageData : p))
    } else {
      setPackages(prev => [packageData, ...prev])
    }
    setShowForm(false)
    setEditingPackage(null)
  }

  const handleEdit = (packageData) => {
    setEditingPackage(packageData)
    setShowForm(true)
  }

  const handleDelete = async () => {
    if (!deletingPackage) return
    
    try {
      const res = await fetch(`${API_BASE_URL}/packages/${deletingPackage._id}`, {
        method: 'DELETE',
        headers
      })
      
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data?.message || 'Failed to delete package')
      }
      
      setPackages(prev => prev.filter(p => p._id !== deletingPackage._id))
      setShowDeleteDialog(false)
      setDeletingPackage(null)
    } catch (err) {
      setError(err.message)
    }
  }

  const handleViewDetails = (packageData) => {
    setSelectedPackage(packageData)
    setShowDetailsModal(true)
  }

  const filteredAndSortedPackages = useMemo(() => {
    let filtered = packages.filter((packageData) => {
      const target = `${packageData.packageCode} ${packageData.customer?.name || ''} ${packageData.arrival?.city || ''} ${packageData.departure?.city || ''}`.toLowerCase()
      return target.includes(query.toLowerCase())
    })

    // Sort the filtered results
    filtered.sort((a, b) => {
      let aValue, bValue
      
      switch (sortBy) {
        case 'packageCode':
          aValue = a.packageCode?.toLowerCase() || ''
          bValue = b.packageCode?.toLowerCase() || ''
          break
        case 'customerName':
          aValue = a.customer?.name?.toLowerCase() || ''
          bValue = b.customer?.name?.toLowerCase() || ''
          break
        case 'arrivalDate':
          aValue = new Date(a.arrival?.date || 0)
          bValue = new Date(b.arrival?.date || 0)
          break
        case 'departureDate':
          aValue = new Date(a.departure?.date || 0)
          bValue = new Date(b.departure?.date || 0)
          break
        case 'days':
          aValue = a.days || 0
          bValue = b.days || 0
          break
        case 'prizeINR':
          aValue = a.prizeINR || 0
          bValue = b.prizeINR || 0
          break
        case 'profit':
          aValue = a.profit || 0
          bValue = b.profit || 0
          break
        default:
          aValue = a.packageCode?.toLowerCase() || ''
          bValue = b.packageCode?.toLowerCase() || ''
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
  }, [packages, query, sortBy, sortOrder])

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-white">Packages Management</h1>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#5B8424] hover:bg-[#5B8424]/80 text-white rounded-lg transition-colors"
        >
          <PlusIcon className="h-5 w-5" />
          Add Package
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
        searchPlaceholder="Search packages..."
      />

      {loading && <div className="text-white/60 text-center py-8">Loading...</div>}
      {error && <div className="text-red-300 text-sm mb-4">{error}</div>}

      {viewMode === 'cards' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {filteredAndSortedPackages.map((packageData) => (
            <div 
              key={packageData._id} 
              className="bg-[#0c0c0c] rounded-lg border border-white/10 p-3 cursor-pointer hover:bg-[#0c0c0c]/80 transition-colors"
              onClick={() => handleViewDetails(packageData)}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-medium text-sm truncate">{packageData.packageCode}</h3>
                  <p className="text-white/60 text-xs">{packageData.customer?.name || 'N/A'}</p>
                  <p className="text-white/60 text-xs">{packageData.days} days, {packageData.nights} nights</p>
                </div>
                <div className="flex gap-1 ml-2" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => handleEdit(packageData)}
                    className="p-1 text-white/60 hover:text-white transition-colors"
                  >
                    <PencilIcon className="h-3 w-3" />
                  </button>
                  <button
                    onClick={() => {
                      setDeletingPackage(packageData)
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
                  <span className="font-medium">Arrival:</span> {packageData.arrival?.city} ({new Date(packageData.arrival?.date).toLocaleDateString()})
                </div>
                <div className="text-white/70">
                  <span className="font-medium">Departure:</span> {packageData.departure?.city} ({new Date(packageData.departure?.date).toLocaleDateString()})
                </div>
                <div className="text-white/70">
                  <span className="font-medium">Price:</span> ₹{packageData.prizeINR?.toLocaleString()}
                </div>
                <div className="text-white/70">
                  <span className="font-medium">Profit:</span> ₹{packageData.profit?.toLocaleString()}
                </div>
                <div className="text-white/70">
                  <span className="font-medium">Advance:</span> ₹{packageData.advance?.toLocaleString() || '0'}
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
                <th className="px-4 py-3 text-left font-medium">Package Code</th>
                <th className="px-4 py-3 text-left font-medium">Customer</th>
                <th className="px-4 py-3 text-left font-medium">Arrival</th>
                <th className="px-4 py-3 text-left font-medium">Departure</th>
                <th className="px-4 py-3 text-left font-medium">Days</th>
                <th className="px-4 py-3 text-left font-medium">Price (INR)</th>
                <th className="px-4 py-3 text-left font-medium">Profit</th>
                <th className="px-4 py-3 text-left font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSortedPackages.map((packageData) => (
                <tr 
                  key={packageData._id} 
                  className="border-t border-white/5 hover:bg-white/[0.03] cursor-pointer"
                  onClick={() => handleViewDetails(packageData)}
                >
                  <td className="px-4 py-3 font-medium">{packageData.packageCode}</td>
                  <td className="px-4 py-3">{packageData.customer?.name || 'N/A'}</td>
                  <td className="px-4 py-3">
                    {packageData.arrival?.city} ({new Date(packageData.arrival?.date).toLocaleDateString()})
                  </td>
                  <td className="px-4 py-3">
                    {packageData.departure?.city} ({new Date(packageData.departure?.date).toLocaleDateString()})
                  </td>
                  <td className="px-4 py-3">{packageData.days}</td>
                  <td className="px-4 py-3">₹{packageData.prizeINR?.toLocaleString()}</td>
                  <td className="px-4 py-3">₹{packageData.profit?.toLocaleString()}</td>
                  <td className="px-4 py-3 space-x-2" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => handleEdit(packageData)}
                      className="px-3 py-1 rounded-lg bg-blue-600/80 hover:bg-blue-600 transition-colors"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => {
                        setDeletingPackage(packageData)
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

      {filteredAndSortedPackages.length === 0 && !loading && (
        <div className="text-center py-8 text-white/60">
          No packages found
        </div>
      )}

      {showForm && (
        <PackageForm
          package={editingPackage}
          onSave={handleSave}
          onCancel={() => {
            setShowForm(false)
            setEditingPackage(null)
          }}
        />
      )}

      <DataDetailsModal
        isOpen={showDetailsModal}
        onClose={() => {
          setShowDetailsModal(false)
          setSelectedPackage(null)
        }}
        data={selectedPackage}
        title="Package Details"
        fields={packageFields}
      />

      <ConfirmationDialog
        isOpen={showDeleteDialog}
        onClose={() => {
          setShowDeleteDialog(false)
          setDeletingPackage(null)
        }}
        onConfirm={handleDelete}
        title="Delete Package"
        message={`Are you sure you want to delete package "${deletingPackage?.packageCode}"? This action cannot be undone.`}
        confirmText="Delete"
        confirmButtonClass="bg-red-600 hover:bg-red-700"
      />
    </div>
  )
}

export default PackagesPage
