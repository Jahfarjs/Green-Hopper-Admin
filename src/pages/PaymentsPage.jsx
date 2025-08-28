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

function PaymentForm({ payment, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    package: payment?.package?._id || payment?.package || '',
    date: payment?.date ? new Date(payment.date).toISOString().split('T')[0] : '',
    amount: payment?.amount || '',
    conversionRate: payment?.conversionRate || '',
    balance: payment?.balance || ''
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
      const url = payment ? `${API_BASE_URL}/payments/${payment._id}` : `${API_BASE_URL}/payments`
      const method = payment ? 'PUT' : 'POST'
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', ...headers },
        body: JSON.stringify(formData)
      })
      
      const data = await res.json()
      if (!res.ok) throw new Error(data?.message || 'Failed to save payment')
      
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
              {payment ? 'Edit Payment' : 'Add New Payment'}
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
                Payment Date *
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                required
                className="w-full px-3 py-2 rounded-lg bg-[#0c0c0c] border border-white/10 text-white focus:outline-none focus:border-[#5B8424]"
              />
            </div>
            
            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">
                Amount *
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData(prev => ({ ...prev, amount: parseFloat(e.target.value) || '' }))}
                required
                className="w-full px-3 py-2 rounded-lg bg-[#0c0c0c] border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-[#5B8424]"
                placeholder="0.00"
              />
            </div>
            
            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">
                Conversion Rate *
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.conversionRate}
                onChange={(e) => setFormData(prev => ({ ...prev, conversionRate: parseFloat(e.target.value) || '' }))}
                required
                className="w-full px-3 py-2 rounded-lg bg-[#0c0c0c] border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-[#5B8424]"
                placeholder="e.g., 83.5 for USD to INR"
              />
            </div>
            
            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">
                Balance *
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.balance}
                onChange={(e) => setFormData(prev => ({ ...prev, balance: parseFloat(e.target.value) || '' }))}
                required
                className="w-full px-3 py-2 rounded-lg bg-[#0c0c0c] border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-[#5B8424]"
                placeholder="0.00"
              />
            </div>
          </div>
          
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-[#5B8424] hover:bg-[#5B8424]/80 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? 'Saving...' : (payment ? 'Update Payment' : 'Add Payment')}
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

function PaymentsPage() {
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingPayment, setEditingPayment] = useState(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [deletingPayment, setDeletingPayment] = useState(null)
  const [viewMode, setViewMode] = useState('cards')
  const [sortBy, setSortBy] = useState('date')
  const [sortOrder, setSortOrder] = useState('desc')
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [selectedPayment, setSelectedPayment] = useState(null)
  const headers = useAuthHeader()

  const sortOptions = [
    { value: 'date', label: 'Date' },
    { value: 'customerName', label: 'Customer Name' },
    { value: 'amount', label: 'Amount' },
    { value: 'paymentMethod', label: 'Payment Method' },
    { value: 'status', label: 'Status' },
  ]

  const paymentFields = [
    { key: 'package.customer.name', label: 'Customer Name', type: 'text' },
    { key: 'package.packageCode', label: 'Package Code', type: 'text' },
    { key: 'date', label: 'Date', type: 'date' },
    { key: 'amount', label: 'Amount', type: 'currency' },
    { key: 'conversionRate', label: 'Conversion Rate', type: 'number' },
    { key: 'balance', label: 'Balance', type: 'currency' },
  ]

  const fetchPayments = async () => {
    setError('')
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE_URL}/payments`, {
        headers
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.message || 'Failed to fetch payments')
      setPayments(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPayments()
  }, [])

  const handleSave = (payment) => {
    if (editingPayment) {
      setPayments(prev => prev.map(p => p._id === payment._id ? payment : p))
    } else {
      setPayments(prev => [payment, ...prev])
    }
    setShowForm(false)
    setEditingPayment(null)
  }

  const handleEdit = (payment) => {
    setEditingPayment(payment)
    setShowForm(true)
  }

  const handleDelete = async () => {
    if (!deletingPayment) return
    
    try {
      const res = await fetch(`${API_BASE_URL}/payments/${deletingPayment._id}`, {
        method: 'DELETE',
        headers
      })
      
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data?.message || 'Failed to delete payment')
      }
      
      setPayments(prev => prev.filter(p => p._id !== deletingPayment._id))
      setShowDeleteDialog(false)
      setDeletingPayment(null)
    } catch (err) {
      setError(err.message)
    }
  }

  const handleViewDetails = (payment) => {
    setSelectedPayment(payment)
    setShowDetailsModal(true)
  }

  const filteredAndSortedPayments = useMemo(() => {
    let filtered = payments.filter((payment) => {
      const target = `${payment.package?.customer?.name || ''} ${payment.package?.packageCode || ''} ${payment.amount || ''}`.toLowerCase()
      return target.includes(query.toLowerCase())
    })

    // Sort the filtered results
    filtered.sort((a, b) => {
      let aValue, bValue
      
      switch (sortBy) {
        case 'date':
          aValue = new Date(a.date || 0)
          bValue = new Date(b.date || 0)
          break
        case 'customerName':
          aValue = a.package?.customer?.name?.toLowerCase() || ''
          bValue = b.package?.customer?.name?.toLowerCase() || ''
          break
        case 'amount':
          aValue = a.amount || 0
          bValue = b.amount || 0
          break
        case 'paymentMethod':
          aValue = a.paymentMethod?.toLowerCase() || ''
          bValue = b.paymentMethod?.toLowerCase() || ''
          break
        case 'status':
          aValue = a.status?.toLowerCase() || ''
          bValue = b.status?.toLowerCase() || ''
          break
        default:
          aValue = new Date(a.date || 0)
          bValue = new Date(b.date || 0)
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
  }, [payments, query, sortBy, sortOrder])

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-white">Payments Management</h1>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#5B8424] hover:bg-[#5B8424]/80 text-white rounded-lg transition-colors"
        >
          <PlusIcon className="h-5 w-5" />
          Add Payment
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
        searchPlaceholder="Search payments..."
      />

      {loading && <div className="text-white/60 text-center py-8">Loading...</div>}
      {error && <div className="text-red-300 text-sm mb-4">{error}</div>}

      {viewMode === 'cards' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAndSortedPayments.map((payment) => (
            <div 
              key={payment._id} 
              className="bg-[#0c0c0c] rounded-lg border border-white/10 p-4 cursor-pointer hover:bg-[#0c0c0c]/80 transition-colors"
              onClick={() => handleViewDetails(payment)}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-white font-medium">{payment.package?.customer?.name || 'N/A'}</h3>
                  <p className="text-white/60 text-sm">{payment.package?.packageCode || 'N/A'}</p>
                  <p className="text-white/60 text-sm">{payment.date ? new Date(payment.date).toLocaleDateString() : 'Invalid Date'}</p>
                </div>
                <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => handleEdit(payment)}
                    className="p-1 text-white/60 hover:text-white"
                  >
                    <PencilIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => {
                      setDeletingPayment(payment)
                      setShowDeleteDialog(true)
                    }}
                    className="p-1 text-red-400 hover:text-red-300"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="text-white font-medium">
                  <span className="font-medium">Amount:</span> ₹{payment.amount?.toLocaleString()}
                </div>
                <div className="text-white/70">
                  <span className="font-medium">Conversion Rate:</span> {payment.conversionRate}
                </div>
                <div className="text-white/70">
                  <span className="font-medium">Balance:</span> ₹{payment.balance?.toLocaleString()}
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
                <th className="px-4 py-3 text-left font-medium">Date</th>
                <th className="px-4 py-3 text-left font-medium">Customer</th>
                <th className="px-4 py-3 text-left font-medium">Package</th>
                <th className="px-4 py-3 text-left font-medium">Amount</th>
                <th className="px-4 py-3 text-left font-medium">Conversion Rate</th>
                <th className="px-4 py-3 text-left font-medium">Balance</th>
                <th className="px-4 py-3 text-left font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSortedPayments.map((payment) => (
                <tr 
                  key={payment._id} 
                  className="border-t border-white/5 hover:bg-white/[0.03] cursor-pointer"
                  onClick={() => handleViewDetails(payment)}
                >
                  <td className="px-4 py-3">{payment.date ? new Date(payment.date).toLocaleDateString() : 'Invalid Date'}</td>
                  <td className="px-4 py-3 font-medium">{payment.package?.customer?.name || 'N/A'}</td>
                  <td className="px-4 py-3">{payment.package?.packageCode || 'N/A'}</td>
                  <td className="px-4 py-3 font-bold">₹{payment.amount?.toLocaleString()}</td>
                  <td className="px-4 py-3">{payment.conversionRate}</td>
                  <td className="px-4 py-3">₹{payment.balance?.toLocaleString()}</td>
                  <td className="px-4 py-3 space-x-2" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => handleEdit(payment)}
                      className="px-3 py-1 rounded-lg bg-blue-600/80 hover:bg-blue-600 transition-colors"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => {
                        setDeletingPayment(payment)
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

      {filteredAndSortedPayments.length === 0 && !loading && (
        <div className="text-center py-8 text-white/60">
          No payments found
        </div>
      )}

      {showForm && (
        <PaymentForm
          payment={editingPayment}
          onSave={handleSave}
          onCancel={() => {
            setShowForm(false)
            setEditingPayment(null)
          }}
        />
      )}

      <DataDetailsModal
        isOpen={showDetailsModal}
        onClose={() => {
          setShowDetailsModal(false)
          setSelectedPayment(null)
        }}
        data={selectedPayment}
        title="Payment Details"
        fields={paymentFields}
      />

      <ConfirmationDialog
        isOpen={showDeleteDialog}
        onClose={() => {
          setShowDeleteDialog(false)
          setDeletingPayment(null)
        }}
        onConfirm={handleDelete}
        title="Delete Payment"
        message={`Are you sure you want to delete payment of ₹${deletingPayment?.amount?.toLocaleString()} for ${deletingPayment?.package?.customer?.name}? This action cannot be undone.`}
        confirmText="Delete"
        confirmButtonClass="bg-red-600 hover:bg-red-700"
      />
    </div>
  )
}

export default PaymentsPage
