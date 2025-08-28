import React from 'react'
import { XMarkIcon } from '@heroicons/react/24/outline'

function DataDetailsModal({ isOpen, onClose, data, title, fields }) {
  if (!isOpen || !data) return null

  const getValue = (obj, path) => {
    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : null
    }, obj)
  }

  const formatValue = (value, type) => {
    if (value === null || value === undefined) return 'N/A'
    
    switch (type) {
      case 'currency':
        return `₹${Number(value).toLocaleString()}`
      case 'date':
        return new Date(value).toLocaleDateString()
      case 'datetime':
        return new Date(value).toLocaleString()
      case 'number':
        return Number(value).toLocaleString()
      case 'object':
        if (Array.isArray(value)) {
          return value.length > 0 ? `${value.length} items` : 'No items'
        }
        return typeof value === 'object' ? 'Object' : String(value)
      case 'boolean':
        return value ? 'Yes' : 'No'
      default:
        return String(value)
    }
  }

  const renderFieldValue = (field, value) => {
    if (field.type === 'object' && Array.isArray(value)) {
      return (
        <div className="space-y-2">
          {value.map((item, index) => (
            <div key={index} className="bg-white/5 rounded-lg p-3">
              {typeof item === 'object' ? (
                Object.entries(item).map(([key, val]) => (
                  <div key={key} className="flex justify-between text-sm">
                    <span className="text-white/70 capitalize">{key}:</span>
                    <span className="text-white">{formatValue(val, 'text')}</span>
                  </div>
                ))
              ) : (
                <span className="text-white">{formatValue(item, 'text')}</span>
              )}
            </div>
          ))}
        </div>
      )
    }

    if (field.type === 'object' && typeof value === 'object' && value !== null) {
      return (
        <div className="bg-white/5 rounded-lg p-3">
          {Object.entries(value).map(([key, val]) => (
            <div key={key} className="flex justify-between text-sm">
              <span className="text-white/70 capitalize">{key}:</span>
              <span className="text-white">{formatValue(val, 'text')}</span>
            </div>
          ))}
        </div>
      )
    }

    // Handle nested object references (like destination.destinationName, hotel.hotelName)
    if (field.key.includes('.') && typeof value === 'object' && value !== null) {
      const keys = field.key.split('.')
      const nestedValue = keys.reduce((obj, key) => obj?.[key], value)
      return (
        <span className="text-white font-medium">
          {formatValue(nestedValue, field.type)}
        </span>
      )
    }

    return (
      <span className="text-white font-medium">
        {formatValue(value, field.type)}
      </span>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-[#0f1310] rounded-xl border border-[#5B8424]/20 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-[#5B8424]/20">
          <div className="flex items-center justify-between">
            <h2 className="text-white text-xl font-semibold">{title}</h2>
            <button 
              onClick={onClose}
              className="text-white/70 hover:text-white transition-colors"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
        </div>
        
        <div className="p-6 space-y-4">
          {fields.map((field) => {
            const value = getValue(data, field.key)
            return (
              <div key={field.key} className="space-y-2">
                <label className="block text-white/70 text-sm font-medium">
                  {field.label}
                </label>
                <div className="bg-[#0c0c0c] rounded-lg p-3 border border-white/10">
                  {renderFieldValue(field, value)}
                </div>
              </div>
            )
          })}
        </div>
        
        <div className="p-6 border-t border-[#5B8424]/20">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-[#5B8424] text-white rounded-lg hover:bg-[#5B8424]/80 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

export default DataDetailsModal
