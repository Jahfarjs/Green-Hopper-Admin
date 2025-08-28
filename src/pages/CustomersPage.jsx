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

function CustomerForm({ customer, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    name: customer?.name || '',
    email: customer?.email || '',
    phone: customer?.phone || '',
    nationality: customer?.nationality || '',
    noOfPax: customer?.noOfPax || '',
    children: customer?.children || 0,
    infants: customer?.infants || 0
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const headers = useAuthHeader()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const url = customer ? `${API_BASE_URL}/customers/${customer._id}` : `${API_BASE_URL}/customers`
      const method = customer ? 'PUT' : 'POST'
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', ...headers },
        body: JSON.stringify(formData)
      })
      
      const data = await res.json()
      if (!res.ok) throw new Error(data?.message || 'Failed to save customer')
      
      onSave(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-[#0f1310] rounded-xl border border-[#5B8424]/20 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-[#5B8424]/20">
          <div className="flex items-center justify-between">
            <h2 className="text-white text-xl font-semibold">
              {customer ? 'Edit Customer' : 'Add New Customer'}
            </h2>
            <button onClick={onCancel} className="text-white/70 hover:text-white">
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-300 text-sm">
              {error}
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">
                Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                required
                className="w-full px-3 py-2 rounded-lg bg-[#0c0c0c] border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-[#5B8424]"
                placeholder="Customer name"
              />
            </div>
            
            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">
                Email *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                required
                className="w-full px-3 py-2 rounded-lg bg-[#0c0c0c] border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-[#5B8424]"
                placeholder="customer@example.com"
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
                placeholder="+1234567890"
              />
            </div>
            
            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">
                Nationality *
              </label>
              <input
                type="text"
                value={formData.nationality}
                onChange={(e) => setFormData(prev => ({ ...prev, nationality: e.target.value }))}
                required
                className="w-full px-3 py-2 rounded-lg bg-[#0c0c0c] border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-[#5B8424]"
                placeholder="e.g., Indian, American"
              />
            </div>
            
            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">
                Number of Passengers *
              </label>
              <input
                type="number"
                min="1"
                value={formData.noOfPax}
                onChange={(e) => setFormData(prev => ({ ...prev, noOfPax: parseInt(e.target.value) || '' }))}
                required
                className="w-full px-3 py-2 rounded-lg bg-[#0c0c0c] border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-[#5B8424]"
                placeholder="1"
              />
            </div>
            
            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">
                Children
              </label>
              <input
                type="number"
                min="0"
                value={formData.children}
                onChange={(e) => setFormData(prev => ({ ...prev, children: parseInt(e.target.value) || 0 }))}
                className="w-full px-3 py-2 rounded-lg bg-[#0c0c0c] border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-[#5B8424]"
                placeholder="0"
              />
            </div>
            
            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">
                Infants
              </label>
              <input
                type="number"
                min="0"
                value={formData.infants}
                onChange={(e) => setFormData(prev => ({ ...prev, infants: parseInt(e.target.value) || 0 }))}
                className="w-full px-3 py-2 rounded-lg bg-[#0c0c0c] border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-[#5B8424]"
                placeholder="0"
              />
            </div>
          </div>
          
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-[#5B8424] hover:bg-[#5B8424]/80 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? 'Saving...' : (customer ? 'Update Customer' : 'Add Customer')}
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

function CustomersPage() {
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingCustomer, setEditingCustomer] = useState(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [deletingCustomer, setDeletingCustomer] = useState(null)
  const [viewMode, setViewMode] = useState('cards')
  const [sortBy, setSortBy] = useState('name')
  const [sortOrder, setSortOrder] = useState('asc')
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState(null)
  const headers = useAuthHeader()

  const sortOptions = [
    { value: 'name', label: 'Name' },
    { value: 'email', label: 'Email' },
    { value: 'phone', label: 'Phone' },
    { value: 'nationality', label: 'Nationality' },
    { value: 'noOfPax', label: 'Number of Pax' },
  ]

  const customerFields = [
    { key: 'name', label: 'Name', type: 'text' },
    { key: 'email', label: 'Email', type: 'text' },
    { key: 'phone', label: 'Phone', type: 'text' },
    { key: 'nationality', label: 'Nationality', type: 'text' },
    { key: 'noOfPax', label: 'Number of Pax', type: 'number' },
    { key: 'children', label: 'Children', type: 'number' },
    { key: 'infants', label: 'Infants', type: 'number' },
  ]

  const fetchCustomers = async () => {
    setError('')
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE_URL}/customers`, {
        headers
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.message || 'Failed to fetch customers')
      setCustomers(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCustomers()
  }, [])

  const handleSave = (customer) => {
    if (editingCustomer) {
      setCustomers(prev => prev.map(c => c._id === customer._id ? customer : c))
    } else {
      setCustomers(prev => [customer, ...prev])
    }
    setShowForm(false)
    setEditingCustomer(null)
  }

  const handleEdit = (customer) => {
    setEditingCustomer(customer)
    setShowForm(true)
  }

  const handleDelete = async () => {
    if (!deletingCustomer) return
    
    try {
      const res = await fetch(`${API_BASE_URL}/customers/${deletingCustomer._id}`, {
        method: 'DELETE',
        headers
      })
      
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data?.message || 'Failed to delete customer')
      }
      
      setCustomers(prev => prev.filter(c => c._id !== deletingCustomer._id))
      setShowDeleteDialog(false)
      setDeletingCustomer(null)
    } catch (err) {
      setError(err.message)
    }
  }

  const handleViewDetails = (customer) => {
    setSelectedCustomer(customer)
    setShowDetailsModal(true)
  }

  const filteredAndSortedCustomers = useMemo(() => {
    let filtered = customers.filter((customer) => {
      const target = `${customer.name} ${customer.email} ${customer.phone} ${customer.nationality}`.toLowerCase()
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
        case 'phone':
          aValue = a.phone?.toLowerCase() || ''
          bValue = b.phone?.toLowerCase() || ''
          break
        case 'nationality':
          aValue = a.nationality?.toLowerCase() || ''
          bValue = b.nationality?.toLowerCase() || ''
          break
        case 'noOfPax':
          aValue = a.noOfPax || 0
          bValue = b.noOfPax || 0
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
  }, [customers, query, sortBy, sortOrder])

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-white">Customers Management</h1>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#5B8424] hover:bg-[#5B8424]/80 text-white rounded-lg transition-colors"
        >
          <PlusIcon className="h-5 w-5" />
          Add Customer
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
        searchPlaceholder="Search customers..."
      />

      {loading && <div className="text-white/60 text-center py-8">Loading...</div>}
      {error && <div className="text-red-300 text-sm mb-4">{error}</div>}

      {viewMode === 'cards' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {filteredAndSortedCustomers.map((customer) => (
            <div 
              key={customer._id} 
              className="bg-[#0c0c0c] rounded-lg border border-white/10 p-3 cursor-pointer hover:bg-[#0c0c0c]/80 transition-colors"
              onClick={() => handleViewDetails(customer)}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-medium text-sm truncate">{customer.name}</h3>
                  <p className="text-white/60 text-xs">{customer.email}</p>
                  <p className="text-white/60 text-xs">{customer.phone}</p>
                </div>
                <div className="flex gap-1 ml-2" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => handleEdit(customer)}
                    className="p-1 text-white/60 hover:text-white transition-colors"
                  >
                    <PencilIcon className="h-3 w-3" />
                  </button>
                  <button
                    onClick={() => {
                      setDeletingCustomer(customer)
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
                  <span className="font-medium">Nationality:</span> {customer.nationality}
                </div>
                <div className="text-white/70">
                  <span className="font-medium">Pax:</span> {customer.noOfPax}
                </div>
                <div className="text-white/70">
                  <span className="font-medium">Children:</span> {customer.children}
                </div>
                <div className="text-white/70">
                  <span className="font-medium">Infants:</span> {customer.infants}
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
                <th className="px-3 py-2 text-left font-medium text-xs">Name</th>
                <th className="px-3 py-2 text-left font-medium text-xs">Email</th>
                <th className="px-3 py-2 text-left font-medium text-xs">Phone</th>
                <th className="px-3 py-2 text-left font-medium text-xs">Nationality</th>
                <th className="px-3 py-2 text-left font-medium text-xs">Pax</th>
                <th className="px-3 py-2 text-left font-medium text-xs">Children</th>
                <th className="px-3 py-2 text-left font-medium text-xs">Infants</th>
                <th className="px-3 py-2 text-left font-medium text-xs">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSortedCustomers.map((customer) => (
                <tr 
                  key={customer._id} 
                  className="border-t border-white/5 hover:bg-white/[0.03] cursor-pointer transition-colors"
                  onClick={() => handleViewDetails(customer)}
                >
                  <td className="px-3 py-2 font-medium text-xs">{customer.name}</td>
                  <td className="px-3 py-2 text-xs">{customer.email}</td>
                  <td className="px-3 py-2 text-xs">{customer.phone}</td>
                  <td className="px-3 py-2 text-xs">{customer.nationality}</td>
                  <td className="px-3 py-2 text-xs">{customer.noOfPax}</td>
                  <td className="px-3 py-2 text-xs">{customer.children}</td>
                  <td className="px-3 py-2 text-xs">{customer.infants}</td>
                  <td className="px-3 py-2 space-x-1" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => handleEdit(customer)}
                      className="px-2 py-1 rounded bg-blue-600/80 hover:bg-blue-600 transition-colors"
                    >
                      <PencilIcon className="h-3 w-3" />
                    </button>
                    <button
                      onClick={() => {
                        setDeletingCustomer(customer)
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

      {filteredAndSortedCustomers.length === 0 && !loading && (
        <div className="text-center py-8 text-white/60">
          No customers found
        </div>
      )}

      {showForm && (
        <CustomerForm
          customer={editingCustomer}
          onSave={handleSave}
          onCancel={() => {
            setShowForm(false)
            setEditingCustomer(null)
          }}
        />
      )}

      <DataDetailsModal
        isOpen={showDetailsModal}
        onClose={() => {
          setShowDetailsModal(false)
          setSelectedCustomer(null)
        }}
        data={selectedCustomer}
        title="Customer Details"
        fields={customerFields}
      />

      <ConfirmationDialog
        isOpen={showDeleteDialog}
        onClose={() => {
          setShowDeleteDialog(false)
          setDeletingCustomer(null)
        }}
        onConfirm={handleDelete}
        title="Delete Customer"
        message={`Are you sure you want to delete customer "${deletingCustomer?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        confirmButtonClass="bg-red-600 hover:bg-red-700"
      />
    </div>
  )
}

export default CustomersPage
