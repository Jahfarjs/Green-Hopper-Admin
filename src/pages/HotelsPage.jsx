import React, { useEffect, useMemo, useState } from 'react'
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  ViewColumnsIcon,
  Squares2X2Icon,
} from '@heroicons/react/24/outline'
import ConfirmationDialog from '../components/ConfirmationDialog'
import PageControls from '../components/PageControls'
import HotelDetailsModal from '../components/HotelDetailsModal'

const API_BASE_URL = import.meta.env.VITE_ADMIN_API_URL

function useAuthHeader() {
  return useMemo(() => ({
    Authorization: `Bearer ${localStorage.getItem('admin_token') || ''}`
  }), [])
}

function HotelForm({ hotel, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    hotelName: hotel?.hotelName || '',
    destination: hotel?.destination?._id || '',
    periods: hotel?.periods?.map(period => ({
      ...period,
      startDate: period.startDate ? new Date(period.startDate).toISOString().split('T')[0] : '',
      endDate: period.endDate ? new Date(period.endDate).toISOString().split('T')[0] : ''
    })) || [{ periodName: '', startDate: '', endDate: '' }],
    roomCategories: hotel?.roomCategories || [{
      categoryName: '',
      specialRateOnCPAI: { single: '', double: '' },
      extraBedAdult: '',
      childWB: '',
      childWOB: '',
      lunchDinner: '',
      xmasGala: '',
      newYearGala: ''
    }]
  })
  const [destinations, setDestinations] = useState([])
  const [loading, setLoading] = useState(false)
  const headers = useAuthHeader()

  useEffect(() => {
    fetchDestinations()
  }, [])

  const fetchDestinations = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/destinations`, {
        headers
      })
      const data = await res.json()
      if (res.ok) setDestinations(data)
    } catch (error) {
      console.error('Error fetching destinations:', error)
    }
  }

  const addPeriod = () => {
    setFormData(prev => ({
      ...prev,
      periods: [...prev.periods, { periodName: '', startDate: '', endDate: '' }]
    }))
  }

  const removePeriod = (index) => {
    setFormData(prev => ({
      ...prev,
      periods: prev.periods.filter((_, i) => i !== index)
    }))
  }

  const updatePeriod = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      periods: prev.periods.map((period, i) => 
        i === index ? { ...period, [field]: value } : period
      )
    }))
  }

  const addRoomCategory = () => {
    setFormData(prev => ({
      ...prev,
      roomCategories: [...prev.roomCategories, {
        categoryName: '',
        specialRateOnCPAI: { single: '', double: '' },
        extraBedAdult: '',
        childWB: '',
        childWOB: '',
        lunchDinner: '',
        xmasGala: '',
        newYearGala: ''
      }]
    }))
  }

  const removeRoomCategory = (index) => {
    setFormData(prev => ({
      ...prev,
      roomCategories: prev.roomCategories.filter((_, i) => i !== index)
    }))
  }

  const updateRoomCategory = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      roomCategories: prev.roomCategories.map((category, i) => {
        if (i === index) {
          if (field.startsWith('specialRateOnCPAI.')) {
            const rateType = field.split('.')[1]
            return {
              ...category,
              specialRateOnCPAI: {
                ...category.specialRateOnCPAI,
                [rateType]: value
              }
            }
          }
          return { ...category, [field]: value }
        }
        return category
      })
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const url = hotel ? `${API_BASE_URL}/admin/hotels/${hotel._id}` : `${API_BASE_URL}/admin/hotels`
      const method = hotel ? 'PUT' : 'POST'
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', ...headers },
        body: JSON.stringify(formData)
      })
      
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Failed to save hotel')
      
      onSave(data.hotel)
    } catch (error) {
      alert(error.message)
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
              {hotel ? 'Edit Hotel' : 'Add New Hotel'}
            </h2>
            <button onClick={onCancel} className="text-white/70 hover:text-white">
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-white/70 text-sm mb-2">Hotel Name</label>
              <input
                type="text"
                value={formData.hotelName}
                onChange={(e) => setFormData(prev => ({ ...prev, hotelName: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg bg-[#0c0c0c] border border-white/10 text-white focus:outline-none focus:border-[#5B8424]"
                required
              />
            </div>
            <div>
              <label className="block text-white/70 text-sm mb-2">Destination</label>
              <select
                value={formData.destination}
                onChange={(e) => setFormData(prev => ({ ...prev, destination: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg bg-[#0c0c0c] border border-white/10 text-white focus:outline-none focus:border-[#5B8424]"
                required
              >
                <option value="">Select Destination</option>
                {destinations.map(dest => (
                  <option key={dest._id} value={dest._id}>
                    {dest.destinationName}, {dest.country}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Periods Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-medium">Periods</h3>
              <button
                type="button"
                onClick={addPeriod}
                className="flex items-center gap-2 px-3 py-1 rounded-lg bg-[#5B8424] text-white text-sm hover:bg-[#5B8424]/80"
              >
                <PlusIcon className="h-4 w-4" />
                Add Period
              </button>
            </div>
            <div className="space-y-3">
              {formData.periods.map((period, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-3 p-3 bg-[#0c0c0c] rounded-lg">
                  <input
                    type="text"
                    placeholder="Period Name"
                    value={period.periodName}
                    onChange={(e) => updatePeriod(index, 'periodName', e.target.value)}
                    className="px-3 py-2 rounded bg-[#121a14] border border-white/10 text-white focus:outline-none focus:border-[#5B8424]"
                    required
                  />
                  <input
                    type="date"
                    value={period.startDate}
                    onChange={(e) => updatePeriod(index, 'startDate', e.target.value)}
                    className="px-3 py-2 rounded bg-[#121a14] border border-white/10 text-white focus:outline-none focus:border-[#5B8424]"
                    required
                  />
                  <input
                    type="date"
                    value={period.endDate}
                    onChange={(e) => updatePeriod(index, 'endDate', e.target.value)}
                    className="px-3 py-2 rounded bg-[#121a14] border border-white/10 text-white focus:outline-none focus:border-[#5B8424]"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => removePeriod(index)}
                    className="px-3 py-2 rounded bg-red-600/20 text-red-400 hover:bg-red-600/30"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Room Categories Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-medium">Room Categories</h3>
              <button
                type="button"
                onClick={addRoomCategory}
                className="flex items-center gap-2 px-3 py-1 rounded-lg bg-[#5B8424] text-white text-sm hover:bg-[#5B8424]/80"
              >
                <PlusIcon className="h-4 w-4" />
                Add Category
              </button>
            </div>
            <div className="space-y-4">
              {formData.roomCategories.map((category, index) => (
                <div key={index} className="p-4 bg-[#0c0c0c] rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-white/70 text-sm">Category {index + 1}</h4>
                    <button
                      type="button"
                      onClick={() => removeRoomCategory(index)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="Category Name"
                      value={category.categoryName}
                      onChange={(e) => updateRoomCategory(index, 'categoryName', e.target.value)}
                      className="px-3 py-2 rounded bg-[#121a14] border border-white/10 text-white focus:outline-none focus:border-[#5B8424]"
                      required
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="number"
                        placeholder="Single Rate"
                        value={category.specialRateOnCPAI.single}
                        onChange={(e) => updateRoomCategory(index, 'specialRateOnCPAI.single', e.target.value)}
                        className="px-3 py-2 rounded bg-[#121a14] border border-white/10 text-white focus:outline-none focus:border-[#5B8424]"
                        required
                      />
                      <input
                        type="number"
                        placeholder="Double Rate"
                        value={category.specialRateOnCPAI.double}
                        onChange={(e) => updateRoomCategory(index, 'specialRateOnCPAI.double', e.target.value)}
                        className="px-3 py-2 rounded bg-[#121a14] border border-white/10 text-white focus:outline-none focus:border-[#5B8424]"
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                    <input
                      type="number"
                      placeholder="Extra Bed Adult"
                      value={category.extraBedAdult}
                      onChange={(e) => updateRoomCategory(index, 'extraBedAdult', e.target.value)}
                      className="px-3 py-2 rounded bg-[#121a14] border border-white/10 text-white focus:outline-none focus:border-[#5B8424]"
                    />
                    <input
                      type="number"
                      placeholder="Child WB"
                      value={category.childWB}
                      onChange={(e) => updateRoomCategory(index, 'childWB', e.target.value)}
                      className="px-3 py-2 rounded bg-[#121a14] border border-white/10 text-white focus:outline-none focus:border-[#5B8424]"
                    />
                    <input
                      type="number"
                      placeholder="Child WOB"
                      value={category.childWOB}
                      onChange={(e) => updateRoomCategory(index, 'childWOB', e.target.value)}
                      className="px-3 py-2 rounded bg-[#121a14] border border-white/10 text-white focus:outline-none focus:border-[#5B8424]"
                    />
                    <input
                      type="number"
                      placeholder="Lunch/Dinner"
                      value={category.lunchDinner}
                      onChange={(e) => updateRoomCategory(index, 'lunchDinner', e.target.value)}
                      className="px-3 py-2 rounded bg-[#121a14] border border-white/10 text-white focus:outline-none focus:border-[#5B8424]"
                    />
                    <input
                      type="number"
                      placeholder="Xmas Gala"
                      value={category.xmasGala}
                      onChange={(e) => updateRoomCategory(index, 'xmasGala', e.target.value)}
                      className="px-3 py-2 rounded bg-[#121a14] border border-white/10 text-white focus:outline-none focus:border-[#5B8424]"
                    />
                  </div>
                  <input
                    type="number"
                    placeholder="New Year Gala"
                    value={category.newYearGala}
                    onChange={(e) => updateRoomCategory(index, 'newYearGala', e.target.value)}
                    className="w-full px-3 py-2 rounded bg-[#121a14] border border-white/10 text-white focus:outline-none focus:border-[#5B8424]"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-[#5B8424] text-white rounded-lg hover:bg-[#5B8424]/80 disabled:opacity-50"
            >
              {loading ? 'Saving...' : (hotel ? 'Update Hotel' : 'Create Hotel')}
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

function HotelsPage() {
  const headers = useAuthHeader()
  const [hotels, setHotels] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingHotel, setEditingHotel] = useState(null)
  const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, hotelId: null, hotelName: '' })
  const [viewMode, setViewMode] = useState('cards')
  const [sortBy, setSortBy] = useState('hotelName')
  const [sortOrder, setSortOrder] = useState('asc')
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [selectedHotel, setSelectedHotel] = useState(null)

  const sortOptions = [
    { value: 'hotelName', label: 'Hotel Name' },
    { value: 'destination', label: 'Destination' },
    { value: 'periods', label: 'Number of Periods' },
    { value: 'roomCategories', label: 'Number of Categories' },
  ]



  const fetchHotels = async () => {
    setError('')
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE_URL}/admin/hotels`, { headers })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.message || 'Failed to fetch hotels')
      setHotels(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchHotels() }, [])

  const deleteHotel = async (id) => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/hotels/${id}`, {
        method: 'DELETE',
        headers
      })
      if (!res.ok) throw new Error('Failed to delete hotel')
      await fetchHotels()
    } catch (err) {
      setError(err.message)
    }
  }

  const handleDeleteClick = (hotel) => {
    setDeleteDialog({
      isOpen: true,
      hotelId: hotel._id,
      hotelName: hotel.hotelName
    })
  }

  const handleDeleteConfirm = async () => {
    await deleteHotel(deleteDialog.hotelId)
    setDeleteDialog({ isOpen: false, hotelId: null, hotelName: '' })
  }

  const handleSave = (hotel) => {
    setShowForm(false)
    setEditingHotel(null)
    fetchHotels()
  }

  const handleViewDetails = (hotel) => {
    setSelectedHotel(hotel)
    setShowDetailsModal(true)
  }

  const filteredAndSortedHotels = useMemo(() => {
    let filtered = hotels.filter((hotel) => {
      const target = `${hotel.hotelName} ${hotel.destination?.destinationName || ''} ${hotel.destination?.country || ''}`.toLowerCase()
      return target.includes(query.toLowerCase())
    })

    // Sort the filtered results
    filtered.sort((a, b) => {
      let aValue, bValue
      
      switch (sortBy) {
        case 'hotelName':
          aValue = a.hotelName?.toLowerCase() || ''
          bValue = b.hotelName?.toLowerCase() || ''
          break
        case 'destination':
          aValue = `${a.destination?.destinationName || ''} ${a.destination?.country || ''}`.toLowerCase()
          bValue = `${b.destination?.destinationName || ''} ${b.destination?.country || ''}`.toLowerCase()
          break
        case 'periods':
          aValue = a.periods?.length || 0
          bValue = b.periods?.length || 0
          break
        case 'roomCategories':
          aValue = a.roomCategories?.length || 0
          bValue = b.roomCategories?.length || 0
          break
        default:
          aValue = a.hotelName?.toLowerCase() || ''
          bValue = b.hotelName?.toLowerCase() || ''
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
  }, [hotels, query, sortBy, sortOrder])

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-white">Hotels Management</h1>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#5B8424] text-white rounded-lg hover:bg-[#5B8424]/80"
        >
          <PlusIcon className="h-5 w-5" />
          Add Hotel
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
        searchPlaceholder="Search hotels..."
      />

      {loading && <div className="text-white/60 text-center py-8">Loading...</div>}
      {error && <div className="text-red-300 text-sm mb-4">{error}</div>}

      {viewMode === 'cards' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {filteredAndSortedHotels.map((hotel) => (
            <div 
              key={hotel._id} 
              className="bg-[#0c0c0c] rounded-lg border border-white/10 p-3 cursor-pointer hover:bg-[#0c0c0c]/80 transition-colors"
              onClick={() => handleViewDetails(hotel)}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-medium text-sm truncate">{hotel.hotelName}</h3>
                  <p className="text-white/60 text-xs">
                    {hotel.destination?.destinationName}, {hotel.destination?.country}
                  </p>
                </div>
                <div className="flex gap-1 ml-2" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => { setEditingHotel(hotel); setShowForm(true) }}
                    className="p-1 text-white/60 hover:text-white transition-colors"
                  >
                    <PencilIcon className="h-3 w-3" />
                  </button>
                  <button
                    onClick={() => handleDeleteClick(hotel)}
                    className="p-1 text-red-400 hover:text-red-300 transition-colors"
                  >
                    <TrashIcon className="h-3 w-3" />
                  </button>
                </div>
              </div>
              
              <div className="space-y-1 text-xs">
                <div className="text-white/70">
                  <span className="font-medium">Periods:</span> {hotel.periods?.length || 0}
                </div>
                <div className="text-white/70">
                  <span className="font-medium">Room Categories:</span> {hotel.roomCategories?.length || 0}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-white/10 bg-[#0c0c0c]">
          <table className="min-w-full text-xs text-white/90">
            <thead>
              <tr className="bg-[#1a1a1a] text-white/80 border-b border-white/10">
                <th className="px-2 py-2 text-left font-semibold text-[#5B8424] w-12">No.</th>
                <th className="px-2 py-2 text-left font-semibold text-[#5B8424] w-32">Hotel</th>
                <th className="px-2 py-2 text-left font-semibold text-[#5B8424] w-28">Destination</th>
                <th className="px-2 py-2 text-left font-semibold text-[#5B8424] w-24">Period</th>
                <th className="px-2 py-2 text-left font-semibold text-[#5B8424] w-28">Room Category</th>
                <th className="px-2 py-2 text-left font-semibold text-[#5B8424] w-20">Single</th>
                <th className="px-2 py-2 text-left font-semibold text-[#5B8424] w-20">Double</th>
                <th className="px-2 py-2 text-left font-semibold text-[#5B8424] w-16">Extra Bed</th>
                <th className="px-2 py-2 text-left font-semibold text-[#5B8424] w-16">Child WB</th>
                <th className="px-2 py-2 text-left font-semibold text-[#5B8424] w-16">Child WOB</th>
                <th className="px-2 py-2 text-left font-semibold text-[#5B8424] w-16">Lunch</th>
                <th className="px-2 py-2 text-left font-semibold text-[#5B8424] w-16">X-Gala</th>
                <th className="px-2 py-2 text-left font-semibold text-[#5B8424] w-16">NY-Gala</th>
                <th className="px-2 py-2 text-left font-semibold text-[#5B8424] w-16">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSortedHotels.map((hotel, hotelIndex) => {
                let rowIndex = 0
                return hotel.periods?.map((period, periodIndex) => 
                  hotel.roomCategories?.map((category, categoryIndex) => {
                    rowIndex++
                    const isFirstRow = periodIndex === 0 && categoryIndex === 0
                    const isFirstPeriod = categoryIndex === 0
                    
                    return (
                      <tr 
                        key={`${hotel._id}-${periodIndex}-${categoryIndex}`} 
                        className="border-b border-white/5 hover:bg-white/[0.02] transition-colors cursor-pointer"
                        onClick={() => handleViewDetails(hotel)}
                      >
                        {isFirstRow && (
                          <td rowSpan={hotel.periods?.length * hotel.roomCategories?.length || 1} className="px-2 py-2 bg-[#5B8424]/15 text-center font-semibold text-[#5B8424] border-r border-white/10">
                            {hotelIndex + 1}
                          </td>
                        )}
                        {isFirstRow && (
                          <td rowSpan={hotel.periods?.length * hotel.roomCategories?.length || 1} className="px-2 py-2 bg-[#5B8424]/15 font-semibold text-white border-r border-white/10">
                            <div className="truncate">{hotel.hotelName}</div>
                          </td>
                        )}
                        {isFirstRow && (
                          <td rowSpan={hotel.periods?.length * hotel.roomCategories?.length || 1} className="px-2 py-2 bg-[#5B8424]/15 text-white/90 border-r border-white/10">
                            <div className="truncate">{hotel.destination?.destinationName}, {hotel.destination?.country}</div>
                          </td>
                        )}
                        {isFirstPeriod && (
                          <td rowSpan={hotel.roomCategories?.length || 1} className="px-2 py-2 bg-orange-500/20 text-white border-r border-white/10">
                            <div className="font-medium text-xs">{period.periodName}</div>
                            <div className="text-xs text-white/70">
                              {new Date(period.startDate).toLocaleDateString()} - {new Date(period.endDate).toLocaleDateString()}
                            </div>
                          </td>
                        )}
                        <td className="px-2 py-2 bg-blue-500/20 text-white border-r border-white/10 font-medium">
                          <div className="truncate text-xs">{category.categoryName}</div>
                        </td>
                        <td className="px-2 py-2 text-center border-r border-white/10">
                          <span className="font-semibold text-green-400 text-xs">₹{category.specialRateOnCPAI?.single || 0}</span>
                        </td>
                        <td className="px-2 py-2 text-center border-r border-white/10">
                          <span className="font-semibold text-green-400 text-xs">₹{category.specialRateOnCPAI?.double || 0}</span>
                        </td>
                        <td className="px-2 py-2 text-center border-r border-white/10">
                          <span className="font-medium text-yellow-400 text-xs">₹{category.extraBedAdult || 0}</span>
                        </td>
                        <td className="px-2 py-2 text-center border-r border-white/10">
                          <span className="font-medium text-blue-400 text-xs">₹{category.childWB || 0}</span>
                        </td>
                        <td className="px-2 py-2 text-center border-r border-white/10">
                          <span className="font-medium text-purple-400 text-xs">₹{category.childWOB || 0}</span>
                        </td>
                        <td className="px-2 py-2 text-center border-r border-white/10">
                          <span className="font-medium text-pink-400 text-xs">₹{category.lunchDinner || 0}</span>
                        </td>
                        <td className="px-2 py-2 text-center border-r border-white/10">
                          <span className="font-medium text-red-400 text-xs">₹{category.xmasGala || 0}</span>
                        </td>
                        <td className="px-2 py-2 text-center border-r border-white/10">
                          <span className="font-medium text-indigo-400 text-xs">₹{category.newYearGala || 0}</span>
                        </td>
                        {isFirstRow && (
                          <td rowSpan={hotel.periods?.length * hotel.roomCategories?.length || 1} className="px-2 py-2 bg-[#5B8424]/15 border-r border-white/10" onClick={(e) => e.stopPropagation()}>
                            <div className="flex flex-col gap-1">
                              <button
                                onClick={() => { setEditingHotel(hotel); setShowForm(true) }}
                                className="p-1 text-white/60 hover:text-white hover:bg-white/10 rounded transition-colors"
                                title="Edit Hotel"
                              >
                                <PencilIcon className="h-3 w-3" />
                              </button>
                              <button
                                onClick={() => handleDeleteClick(hotel)}
                                className="p-1 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded transition-colors"
                                title="Delete Hotel"
                              >
                                <TrashIcon className="h-3 w-3" />
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    )
                  })
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {filteredAndSortedHotels.length === 0 && !loading && (
        <div className="text-center py-8 text-white/60">
          No hotels found
        </div>
      )}

      {showForm && (
        <HotelForm
          hotel={editingHotel}
          onSave={handleSave}
          onCancel={() => { setShowForm(false); setEditingHotel(null) }}
        />
      )}

      <HotelDetailsModal
        isOpen={showDetailsModal}
        onClose={() => {
          setShowDetailsModal(false)
          setSelectedHotel(null)
        }}
        hotel={selectedHotel}
      />

      <ConfirmationDialog
        isOpen={deleteDialog.isOpen}
        onClose={() => setDeleteDialog({ isOpen: false, hotelId: null, hotelName: '' })}
        onConfirm={handleDeleteConfirm}
        title="Delete Hotel"
        message={`Are you sure you want to delete "${deleteDialog.hotelName}"? This action cannot be undone.`}
        confirmText="Delete Hotel"
        cancelText="Cancel"
      />
    </div>
  )
}

export default HotelsPage
