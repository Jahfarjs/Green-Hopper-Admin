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

function ExpenseForm({ expense, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    package: expense?.package?._id || expense?.package || '',
    parking: expense?.parking || 0,
    entry: expense?.entry || 0,
    bouquet: expense?.bouquet || 0,
    simCard: expense?.simCard || 0,
    food: expense?.food || 0,
    transportation: expense?.transportation || 0
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
      const url = expense ? `${API_BASE_URL}/expenses/${expense._id}` : `${API_BASE_URL}/expenses`
      const method = expense ? 'PUT' : 'POST'
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', ...headers },
        body: JSON.stringify(formData)
      })
      
      const data = await res.json()
      if (!res.ok) throw new Error(data?.message || 'Failed to save expense')
      
      onSave(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const calculateTotal = () => {
    const parking = parseFloat(formData.parking) || 0
    const entry = parseFloat(formData.entry) || 0
    const bouquet = parseFloat(formData.bouquet) || 0
    const simCard = parseFloat(formData.simCard) || 0
    const food = parseFloat(formData.food) || 0
    const transportation = parseFloat(formData.transportation) || 0
    
    return parking + entry + bouquet + simCard + food + transportation
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-[#0f1310] rounded-xl border border-[#5B8424]/20 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-[#5B8424]/20">
          <div className="flex items-center justify-between">
            <h2 className="text-white text-xl font-semibold">
              {expense ? 'Edit Expense' : 'Add New Expense'}
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
          </div>

          <div className="border-t border-white/10 pt-6">
            <h3 className="text-white font-medium mb-4">Expense Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">
                  Parking
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.parking}
                  onChange={(e) => setFormData(prev => ({ ...prev, parking: parseFloat(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 rounded-lg bg-[#0c0c0c] border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-[#5B8424]"
                  placeholder="0.00"
                />
              </div>
              
              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">
                  Entry
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.entry}
                  onChange={(e) => setFormData(prev => ({ ...prev, entry: parseFloat(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 rounded-lg bg-[#0c0c0c] border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-[#5B8424]"
                  placeholder="0.00"
                />
              </div>
              
              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">
                  Bouquet
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.bouquet}
                  onChange={(e) => setFormData(prev => ({ ...prev, bouquet: parseFloat(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 rounded-lg bg-[#0c0c0c] border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-[#5B8424]"
                  placeholder="0.00"
                />
              </div>
              
              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">
                  SIM Card
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.simCard}
                  onChange={(e) => setFormData(prev => ({ ...prev, simCard: parseFloat(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 rounded-lg bg-[#0c0c0c] border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-[#5B8424]"
                  placeholder="0.00"
                />
              </div>
              
              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">
                  Food
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.food}
                  onChange={(e) => setFormData(prev => ({ ...prev, food: parseFloat(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 rounded-lg bg-[#0c0c0c] border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-[#5B8424]"
                  placeholder="0.00"
                />
              </div>
              
              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">
                  Transportation
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.transportation}
                  onChange={(e) => setFormData(prev => ({ ...prev, transportation: parseFloat(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 rounded-lg bg-[#0c0c0c] border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-[#5B8424]"
                  placeholder="0.00"
                />
              </div>
            </div>
          </div>

          <div className="border-t border-white/10 pt-6">
            <div className="bg-white/5 rounded-lg p-4">
              <div className="flex justify-between items-center">
                <span className="text-white/80 font-medium">Total Expense:</span>
                <span className="text-white text-xl font-bold">₹{calculateTotal().toLocaleString()}</span>
              </div>
            </div>
          </div>
          
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-[#5B8424] hover:bg-[#5B8424]/80 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? 'Saving...' : (expense ? 'Update Expense' : 'Add Expense')}
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

function ExpensesPage() {
  const [expenses, setExpenses] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingExpense, setEditingExpense] = useState(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [deletingExpense, setDeletingExpense] = useState(null)
  const [viewMode, setViewMode] = useState('cards')
  const [sortBy, setSortBy] = useState('date')
  const [sortOrder, setSortOrder] = useState('desc')
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [selectedExpense, setSelectedExpense] = useState(null)
  const headers = useAuthHeader()

  const sortOptions = [
    { value: 'date', label: 'Date' },
    { value: 'description', label: 'Description' },
    { value: 'amount', label: 'Amount' },
    { value: 'category', label: 'Category' },
  ]

  const expenseFields = [
    { key: 'package.customer.name', label: 'Customer Name', type: 'text' },
    { key: 'package.packageCode', label: 'Package Code', type: 'text' },
    { key: 'parking', label: 'Parking', type: 'currency' },
    { key: 'entry', label: 'Entry', type: 'currency' },
    { key: 'bouquet', label: 'Bouquet', type: 'currency' },
    { key: 'simCard', label: 'SIM Card', type: 'currency' },
    { key: 'food', label: 'Food', type: 'currency' },
    { key: 'transportation', label: 'Transportation', type: 'currency' },
  ]

  const fetchExpenses = async () => {
    setError('')
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE_URL}/expenses`, {
        headers
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.message || 'Failed to fetch expenses')
      setExpenses(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchExpenses()
  }, [])

  const handleSave = (expense) => {
    if (editingExpense) {
      setExpenses(prev => prev.map(e => e._id === expense._id ? expense : e))
    } else {
      setExpenses(prev => [expense, ...prev])
    }
    setShowForm(false)
    setEditingExpense(null)
  }

  const handleEdit = (expense) => {
    setEditingExpense(expense)
    setShowForm(true)
  }

  const handleDelete = async () => {
    if (!deletingExpense) return
    
    try {
      const res = await fetch(`${API_BASE_URL}/expenses/${deletingExpense._id}`, {
        method: 'DELETE',
        headers
      })
      
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data?.message || 'Failed to delete expense')
      }
      
      setExpenses(prev => prev.filter(e => e._id !== deletingExpense._id))
      setShowDeleteDialog(false)
      setDeletingExpense(null)
    } catch (err) {
      setError(err.message)
    }
  }

  const handleViewDetails = (expense) => {
    setSelectedExpense(expense)
    setShowDetailsModal(true)
  }

  const filteredAndSortedExpenses = useMemo(() => {
    let filtered = expenses.filter((expense) => {
      const target = `${expense.package?.customer?.name || ''} ${expense.package?.packageCode || ''} ${expense.parking || ''} ${expense.entry || ''} ${expense.bouquet || ''} ${expense.simCard || ''} ${expense.food || ''} ${expense.transportation || ''}`.toLowerCase()
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
        case 'description':
          aValue = a.package?.packageCode?.toLowerCase() || ''
          bValue = b.package?.packageCode?.toLowerCase() || ''
          break
        case 'amount':
          aValue = (a.parking || 0) + (a.entry || 0) + (a.bouquet || 0) + (a.simCard || 0) + (a.food || 0) + (a.transportation || 0)
          bValue = (b.parking || 0) + (b.entry || 0) + (b.bouquet || 0) + (b.simCard || 0) + (b.food || 0) + (b.transportation || 0)
          break
        case 'category':
          aValue = 'Expense'
          bValue = 'Expense'
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
  }, [expenses, query, sortBy, sortOrder])

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-white">Expenses Management</h1>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#5B8424] hover:bg-[#5B8424]/80 text-white rounded-lg transition-colors"
        >
          <PlusIcon className="h-5 w-5" />
          Add Expense
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
        searchPlaceholder="Search expenses..."
      />

      {loading && <div className="text-white/60 text-center py-8">Loading...</div>}
      {error && <div className="text-red-300 text-sm mb-4">{error}</div>}

      {viewMode === 'cards' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAndSortedExpenses.map((expense) => {
            const totalAmount = (expense.parking || 0) + (expense.entry || 0) + (expense.bouquet || 0) + (expense.simCard || 0) + (expense.food || 0) + (expense.transportation || 0)
            return (
              <div 
                key={expense._id} 
                className="bg-[#0c0c0c] rounded-lg border border-white/10 p-4 cursor-pointer hover:bg-[#0c0c0c]/80 transition-colors"
                onClick={() => handleViewDetails(expense)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-white font-medium">{expense.package?.customer?.name || 'N/A'}</h3>
                    <p className="text-white/60 text-sm">{expense.package?.packageCode || 'N/A'}</p>
                    <p className="text-white/60 text-sm">Expense Details</p>
                  </div>
                  <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => handleEdit(expense)}
                      className="p-1 text-white/60 hover:text-white"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => {
                        setDeletingExpense(expense)
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
                    <span className="font-medium">Total Amount:</span> ₹{totalAmount.toLocaleString()}
                  </div>
                  <div className="text-white/70">
                    <span className="font-medium">Parking:</span> ₹{(expense.parking || 0).toLocaleString()}
                  </div>
                  <div className="text-white/70">
                    <span className="font-medium">Entry:</span> ₹{(expense.entry || 0).toLocaleString()}
                  </div>
                  <div className="text-white/70">
                    <span className="font-medium">Bouquet:</span> ₹{(expense.bouquet || 0).toLocaleString()}
                  </div>
                  <div className="text-white/70">
                    <span className="font-medium">SIM Card:</span> ₹{(expense.simCard || 0).toLocaleString()}
                  </div>
                  <div className="text-white/70">
                    <span className="font-medium">Food:</span> ₹{(expense.food || 0).toLocaleString()}
                  </div>
                  <div className="text-white/70">
                    <span className="font-medium">Transportation:</span> ₹{(expense.transportation || 0).toLocaleString()}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-white/10">
          <table className="min-w-full text-sm text-white/90">
            <thead>
              <tr className="bg-white/5 text-white/70">
                <th className="px-4 py-3 text-left font-medium">Customer</th>
                <th className="px-4 py-3 text-left font-medium">Package</th>
                <th className="px-4 py-3 text-left font-medium">Parking</th>
                <th className="px-4 py-3 text-left font-medium">Entry</th>
                <th className="px-4 py-3 text-left font-medium">Bouquet</th>
                <th className="px-4 py-3 text-left font-medium">SIM Card</th>
                <th className="px-4 py-3 text-left font-medium">Food</th>
                <th className="px-4 py-3 text-left font-medium">Transportation</th>
                <th className="px-4 py-3 text-left font-medium">Total</th>
                <th className="px-4 py-3 text-left font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSortedExpenses.map((expense) => {
                const totalAmount = (expense.parking || 0) + (expense.entry || 0) + (expense.bouquet || 0) + (expense.simCard || 0) + (expense.food || 0) + (expense.transportation || 0)
                return (
                  <tr 
                    key={expense._id} 
                    className="border-t border-white/5 hover:bg-white/[0.03] cursor-pointer"
                    onClick={() => handleViewDetails(expense)}
                  >
                    <td className="px-4 py-3 font-medium">{expense.package?.customer?.name || 'N/A'}</td>
                    <td className="px-4 py-3">{expense.package?.packageCode || 'N/A'}</td>
                    <td className="px-4 py-3">₹{(expense.parking || 0).toLocaleString()}</td>
                    <td className="px-4 py-3">₹{(expense.entry || 0).toLocaleString()}</td>
                    <td className="px-4 py-3">₹{(expense.bouquet || 0).toLocaleString()}</td>
                    <td className="px-4 py-3">₹{(expense.simCard || 0).toLocaleString()}</td>
                    <td className="px-4 py-3">₹{(expense.food || 0).toLocaleString()}</td>
                    <td className="px-4 py-3">₹{(expense.transportation || 0).toLocaleString()}</td>
                    <td className="px-4 py-3 font-bold">₹{totalAmount.toLocaleString()}</td>
                    <td className="px-4 py-3 space-x-2" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => handleEdit(expense)}
                        className="px-3 py-1 rounded-lg bg-blue-600/80 hover:bg-blue-600 transition-colors"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => {
                          setDeletingExpense(expense)
                          setShowDeleteDialog(true)
                        }}
                        className="px-3 py-1 rounded-lg bg-red-600/80 hover:bg-red-600 transition-colors"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {filteredAndSortedExpenses.length === 0 && !loading && (
        <div className="text-center py-8 text-white/60">
          No expenses found
        </div>
      )}

      {showForm && (
        <ExpenseForm
          expense={editingExpense}
          onSave={handleSave}
          onCancel={() => {
            setShowForm(false)
            setEditingExpense(null)
          }}
        />
      )}

      <DataDetailsModal
        isOpen={showDetailsModal}
        onClose={() => {
          setShowDetailsModal(false)
          setSelectedExpense(null)
        }}
        data={selectedExpense}
        title="Expense Details"
        fields={expenseFields}
      />

      <ConfirmationDialog
        isOpen={showDeleteDialog}
        onClose={() => {
          setShowDeleteDialog(false)
          setDeletingExpense(null)
        }}
        onConfirm={handleDelete}
        title="Delete Expense"
        message={`Are you sure you want to delete expense for ${deletingExpense?.package?.customer?.name} (${deletingExpense?.package?.packageCode})? This action cannot be undone.`}
        confirmText="Delete"
        confirmButtonClass="bg-red-600 hover:bg-red-700"
      />
    </div>
  )
}

export default ExpensesPage
