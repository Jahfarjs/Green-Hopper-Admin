import React from 'react'
import {
  MagnifyingGlassIcon,
  ViewColumnsIcon,
  Squares2X2Icon,
  FunnelIcon,
} from '@heroicons/react/24/outline'

function PageControls({ 
  query, 
  onQueryChange, 
  viewMode, 
  onViewModeChange, 
  sortBy, 
  onSortByChange, 
  sortOrder, 
  onSortOrderChange,
  sortOptions = [],
  searchPlaceholder = "Search...",
  showViewToggle = true,
  showSorting = true
}) {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="relative w-full md:max-w-xs">
          <MagnifyingGlassIcon className="h-5 w-5 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-full pl-10 pr-3 py-2 rounded-lg bg-[#0c0c0c] border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-[#5B8424]"
          />
        </div>

        {/* View Toggle */}
        {showViewToggle && (
          <div className="flex items-center gap-2 bg-[#0c0c0c] rounded-lg border border-white/10 p-1">
            <button
              onClick={() => onViewModeChange('cards')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md transition-colors ${
                viewMode === 'cards' 
                  ? 'bg-[#5B8424] text-white' 
                  : 'text-white/70 hover:text-white hover:bg-white/5'
              }`}
            >
              <Squares2X2Icon className="h-4 w-4" />
              Cards
            </button>
            <button
              onClick={() => onViewModeChange('table')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md transition-colors ${
                viewMode === 'table' 
                  ? 'bg-[#5B8424] text-white' 
                  : 'text-white/70 hover:text-white hover:bg-white/5'
              }`}
            >
              <ViewColumnsIcon className="h-4 w-4" />
              Table
            </button>
          </div>
        )}

        {/* Sorting */}
        {showSorting && sortOptions.length > 0 && (
          <div className="flex items-center gap-2">
            <FunnelIcon className="h-5 w-5 text-white/40" />
            <select
              value={sortBy}
              onChange={(e) => onSortByChange(e.target.value)}
              className="px-3 py-2 rounded-lg bg-[#0c0c0c] border border-white/10 text-white focus:outline-none focus:border-[#5B8424] text-sm"
            >
              {sortOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <button
              onClick={() => onSortOrderChange(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="px-3 py-2 rounded-lg bg-[#0c0c0c] border border-white/10 text-white hover:bg-white/5 transition-colors text-sm"
            >
              {sortOrder === 'asc' ? '↑' : '↓'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default PageControls
