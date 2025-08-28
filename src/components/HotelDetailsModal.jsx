import React from 'react'
import { XMarkIcon } from '@heroicons/react/24/outline'

function HotelDetailsModal({ isOpen, onClose, hotel }) {
  if (!isOpen || !hotel) return null

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-GB')
  }

  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return '₹0'
    return `₹${parseFloat(amount).toLocaleString('en-IN')}`
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-[#0f1310] rounded-xl border border-[#5B8424]/20 max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-[#5B8424]/20">
          <div className="flex items-center justify-between">
            <h2 className="text-white text-xl font-semibold">Hotel Details</h2>
            <button onClick={onClose} className="text-white/70 hover:text-white">
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
        </div>
        
        <div className="p-4 space-y-4">
          {/* Hotel Basic Information */}
          <div className="bg-[#1a2e1a] border border-[#5B8424]/20 rounded-lg overflow-hidden">
            <div className="bg-[#1e3a2e] px-3 py-2 border-b border-[#5B8424]/20">
              <h3 className="text-base font-semibold text-white">Hotel Information</h3>
            </div>
            <div className="p-3">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
                <div className="bg-[#2d4a2d] p-2 rounded border border-[#5B8424]/20">
                  <div className="text-[#5B8424] font-medium text-xs mb-1">Hotel Name</div>
                  <div className="text-white text-sm font-semibold truncate">{hotel.hotelName}</div>
                </div>
                <div className="bg-[#2d4a2d] p-2 rounded border border-[#5B8424]/20">
                  <div className="text-[#5B8424] font-medium text-xs mb-1">Destination</div>
                  <div className="text-white text-sm truncate">{hotel.destination?.destinationName || 'N/A'}</div>
                </div>
                <div className="bg-[#2d4a2d] p-2 rounded border border-[#5B8424]/20">
                  <div className="text-[#5B8424] font-medium text-xs mb-1">Country</div>
                  <div className="text-white text-sm truncate">{hotel.destination?.country || 'N/A'}</div>
                </div>
                <div className="bg-[#2d4a2d] p-2 rounded border border-[#5B8424]/20">
                  <div className="text-[#5B8424] font-medium text-xs mb-1">Total Periods</div>
                  <div className="text-white text-sm">{hotel.periods?.length || 0}</div>
                </div>
                <div className="bg-[#2d4a2d] p-2 rounded border border-[#5B8424]/20">
                  <div className="text-[#5B8424] font-medium text-xs mb-1">Total Room Categories</div>
                  <div className="text-white text-sm">{hotel.roomCategories?.length || 0}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Periods Information */}
          {hotel.periods && hotel.periods.length > 0 && (
            <div className="bg-[#1a2e1a] border border-[#5B8424]/20 rounded-lg overflow-hidden">
              <div className="bg-[#1e3a2e] px-3 py-2 border-b border-[#5B8424]/20">
                <h3 className="text-base font-semibold text-white">Operating Periods</h3>
              </div>
              <div className="p-3">
                <div className="space-y-2">
                  {hotel.periods.map((period, index) => (
                    <div key={period._id || index} className="bg-[#2d4a2d] p-3 rounded border border-[#5B8424]/20">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div>
                          <div className="text-[#5B8424] font-medium text-xs mb-1">Period Name</div>
                          <div className="text-white text-sm font-medium truncate">{period.periodName}</div>
                        </div>
                        <div>
                          <div className="text-[#5B8424] font-medium text-xs mb-1">Start Date</div>
                          <div className="text-white text-sm">{formatDate(period.startDate)}</div>
                        </div>
                        <div>
                          <div className="text-[#5B8424] font-medium text-xs mb-1">End Date</div>
                          <div className="text-white text-sm">{formatDate(period.endDate)}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Room Categories Information */}
          {hotel.roomCategories && hotel.roomCategories.length > 0 && (
            <div className="bg-[#1a2e1a] border border-[#5B8424]/20 rounded-lg overflow-hidden">
              <div className="bg-[#1e3a2e] px-3 py-2 border-b border-[#5B8424]/20">
                <h3 className="text-base font-semibold text-white">Room Categories & Rates</h3>
              </div>
              <div className="p-3">
                <div className="space-y-3">
                  {hotel.roomCategories.map((category, index) => (
                    <div key={category._id || index} className="bg-[#2d4a2d] p-3 rounded border border-[#5B8424]/20">
                      <div className="mb-2">
                        <div className="text-[#5B8424] font-medium text-xs mb-1">Room Category</div>
                        <div className="text-white text-sm font-semibold truncate">{category.categoryName}</div>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2 text-xs">
                        <div>
                          <div className="text-[#5B8424] font-medium text-xs mb-1">Single Rate</div>
                          <div className="text-white font-semibold text-green-400 text-xs">
                            {formatCurrency(category.specialRateOnCPAI?.single)}
                          </div>
                        </div>
                        <div>
                          <div className="text-[#5B8424] font-medium text-xs mb-1">Double Rate</div>
                          <div className="text-white font-semibold text-green-400 text-xs">
                            {formatCurrency(category.specialRateOnCPAI?.double)}
                          </div>
                        </div>
                        <div>
                          <div className="text-[#5B8424] font-medium text-xs mb-1">Extra Bed/Adult</div>
                          <div className="text-white font-medium text-yellow-400 text-xs">
                            {formatCurrency(category.extraBedAdult)}
                          </div>
                        </div>
                        <div>
                          <div className="text-[#5B8424] font-medium text-xs mb-1">Child WB</div>
                          <div className="text-white font-medium text-blue-400 text-xs">
                            {formatCurrency(category.childWB)}
                          </div>
                        </div>
                        <div>
                          <div className="text-[#5B8424] font-medium text-xs mb-1">Child WOB</div>
                          <div className="text-white font-medium text-purple-400 text-xs">
                            {formatCurrency(category.childWOB)}
                          </div>
                        </div>
                        <div>
                          <div className="text-[#5B8424] font-medium text-xs mb-1">Lunch/Dinner</div>
                          <div className="text-white font-medium text-pink-400 text-xs">
                            {formatCurrency(category.lunchDinner)}
                          </div>
                        </div>
                        <div>
                          <div className="text-[#5B8424] font-medium text-xs mb-1">X-Mas Gala</div>
                          <div className="text-white font-medium text-red-400 text-xs">
                            {formatCurrency(category.xmasGala)}
                          </div>
                        </div>
                        <div>
                          <div className="text-[#5B8424] font-medium text-xs mb-1">New Year Gala</div>
                          <div className="text-white font-medium text-indigo-400 text-xs">
                            {formatCurrency(category.newYearGala)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default HotelDetailsModal
