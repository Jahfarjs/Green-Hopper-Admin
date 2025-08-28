import React, { useEffect, useMemo, useState } from 'react'
import {
  ArrowLeftIcon,
  EyeIcon,
  MagnifyingGlassIcon,
  DocumentArrowDownIcon,
} from '@heroicons/react/24/outline'
import { PDFDownloadLink } from '@react-pdf/renderer'
import PageControls from '../components/PageControls'
import PackageDetailsPDF from '../components/PackageDetailsPDF'

const API_BASE_URL = import.meta.env.VITE_ADMIN_API_URL

function useAuthHeader() {
  return useMemo(() => ({
    Authorization: `Bearer ${localStorage.getItem('admin_token') || ''}`
  }), [])
}

function PackageDetailsPage() {
  const [packages, setPackages] = useState([])
  const [selectedPackage, setSelectedPackage] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [itemsPerPage] = useState(10)
  const headers = useAuthHeader()

  useEffect(() => {
    fetchPackages()
  }, [currentPage, searchTerm])

  const fetchPackages = async () => {
    try {
      setLoading(true)
      const queryParams = new URLSearchParams({
        page: currentPage,
        limit: itemsPerPage,
        ...(searchTerm && { search: searchTerm })
      })

      const res = await fetch(`${API_BASE_URL}/packages?${queryParams}`, {
        headers
      })
      const data = await res.json()
      
      if (res.ok) {
        setPackages(data.packages || data)
        setTotalPages(Math.ceil((data.total || data.length) / itemsPerPage))
      } else {
        throw new Error(data?.message || 'Failed to fetch packages')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const fetchPackageDetails = async (packageId) => {
    try {
      setLoading(true)
      setError('')
      
      const [packageRes, transportRes, expenseRes, paymentsRes, hotelBookingsRes] = await Promise.allSettled([
        fetch(`${API_BASE_URL}/packages/${packageId}`, { headers }),
        fetch(`${API_BASE_URL}/transports/package/${packageId}`, { headers }),
        fetch(`${API_BASE_URL}/expenses/package/${packageId}`, { headers }),
        fetch(`${API_BASE_URL}/payments/package/${packageId}`, { headers }),
        fetch(`${API_BASE_URL}/hotel-bookings/package/${packageId}`, { headers })
      ])

      // Handle package data (required)
      if (packageRes.status === 'rejected' || !packageRes.value.ok) {
        const errorData = packageRes.status === 'rejected' ? { message: 'Network error' } : await packageRes.value.json()
        throw new Error(errorData?.message || 'Failed to fetch package details')
      }

      const packageData = await packageRes.value.json()

      // Handle optional data
      const transportData = transportRes.status === 'fulfilled' && transportRes.value.ok ? await transportRes.value.json() : []
      const expenseData = expenseRes.status === 'fulfilled' && expenseRes.value.ok ? await expenseRes.value.json() : []
      const paymentsData = paymentsRes.status === 'fulfilled' && paymentsRes.value.ok ? await paymentsRes.value.json() : []
      const hotelBookingsData = hotelBookingsRes.status === 'fulfilled' && hotelBookingsRes.value.ok ? await hotelBookingsRes.value.json() : []

      setSelectedPackage({
        ...packageData,
        transport: transportData.length > 0 ? transportData[0] : null,
        expense: expenseData.length > 0 ? expenseData[0] : null,
        payments: paymentsData,
        hotelBookings: hotelBookingsData
      })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return ''
    return new Date(dateString).toLocaleDateString('en-GB')
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount || 0)
  }

  if (selectedPackage) {
    return (
      <div className="min-h-screen bg-[#0f1310] text-white p-4">
        {/* Header */}
        <div className="mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSelectedPackage(null)}
                className="flex items-center gap-2 text-[#5B8424] hover:text-[#7AB839] transition-colors"
              >
                <ArrowLeftIcon className="w-5 h-5" />
                Back to Packages
              </button>
              <h1 className="text-2xl font-bold">Package Details</h1>
            </div>
            
            {/* PDF Download Button */}
            <PDFDownloadLink
              document={<PackageDetailsPDF packageData={selectedPackage} />}
              fileName={`package-details-${selectedPackage.packageCode || 'package'}.pdf`}
              className="flex items-center gap-2 bg-[#5B8424] hover:bg-[#7AB839] text-white px-4 py-2 rounded-lg transition-colors"
            >
              {({ blob, url, loading, error }) => (
                <>
                  <DocumentArrowDownIcon className="w-5 h-5" />
                  {loading ? 'Generating PDF...' : error ? 'Error' : 'Download PDF'}
                </>
              )}
            </PDFDownloadLink>
          </div>
        </div>

        {/* Loading State for Details */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#5B8424]"></div>
          </div>
        )}

        {/* Package Details Grid */}
        <div className="space-y-4 max-w-full overflow-x-auto">
          {/* Guest and Package Overview Section */}
          <div className="bg-[#1a2e1a] border border-[#5B8424]/20 rounded-lg overflow-hidden">
            <div className="bg-[#2d4a2d] px-4 py-3 border-b border-[#5B8424]/20">
              <h2 className="text-lg font-semibold text-white">Guest & Package Overview</h2>
            </div>
            <div className="p-3 space-y-3">
              {/* Guest Details Row */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 text-sm">
                <div className="bg-[#2d4a2d] p-3 rounded border border-[#5B8424]/20">
                  <div className="text-[#5B8424] font-medium mb-1">NAME OF GUEST</div>
                  <div className="text-white">{selectedPackage.customer?.name || 'N/A'}</div>
                </div>
                <div className="bg-[#2d4a2d] p-3 rounded border border-[#5B8424]/20">
                  <div className="text-[#5B8424] font-medium mb-1">MR.</div>
                  <div className="text-white">-</div>
                </div>
                <div className="bg-[#2d4a2d] p-3 rounded border border-[#5B8424]/20">
                  <div className="text-[#5B8424] font-medium mb-1">PHONE</div>
                  <div className="text-white">{selectedPackage.customer?.phone || 'N/A'}</div>
                </div>
                <div className="bg-[#2d4a2d] p-3 rounded border border-[#5B8424]/20">
                  <div className="text-[#5B8424] font-medium mb-1">NATIONALITY</div>
                  <div className="text-white">{selectedPackage.customer?.nationality || 'N/A'}</div>
                </div>
                <div className="bg-[#2d4a2d] p-3 rounded border border-[#5B8424]/20">
                  <div className="text-[#5B8424] font-medium mb-1">NO. OF PAX</div>
                  <div className="text-white text-2xl font-bold">{selectedPackage.customer?.noOfPax || 0}</div>
                </div>
                <div className="bg-[#2d4a2d] p-3 rounded border border-[#5B8424]/20">
                  <div className="text-[#5B8424] font-medium mb-1">PACKAGE CODE</div>
                  <div className="text-white">{selectedPackage.packageCode || 'N/A'}</div>
                </div>
              </div>

              {/* Arrival Details */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                <div className="bg-[#2d4a2d] p-3 rounded border border-[#5B8424]/20">
                  <div className="text-[#5B8424] font-medium mb-1">DATE OF ARRIVAL</div>
                  <div className="text-white">{formatDate(selectedPackage.arrival?.date)}</div>
                </div>
                <div className="bg-[#2d4a2d] p-3 rounded border border-[#5B8424]/20">
                  <div className="text-[#5B8424] font-medium mb-1">CITY</div>
                  <div className="text-white">{selectedPackage.arrival?.city || 'N/A'}</div>
                </div>
                <div className="bg-[#2d4a2d] p-3 rounded border border-[#5B8424]/20">
                  <div className="text-[#5B8424] font-medium mb-1">FLIGHT</div>
                  <div className="text-white">{selectedPackage.arrival?.flight || 'N/A'}</div>
                </div>
                <div className="bg-[#2d4a2d] p-3 rounded border border-[#5B8424]/20">
                  <div className="text-[#5B8424] font-medium mb-1">TIME</div>
                  <div className="text-white">{selectedPackage.arrival?.time || 'N/A'}</div>
                </div>
              </div>

              {/* Departure Details */}
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 text-sm">
                <div className="bg-[#2d4a2d] p-3 rounded border border-[#5B8424]/20">
                  <div className="text-[#5B8424] font-medium mb-1">DATE OF DEPARTURE</div>
                  <div className="text-white">{formatDate(selectedPackage.departure?.date)}</div>
                </div>
                <div className="bg-[#2d4a2d] p-3 rounded border border-[#5B8424]/20">
                  <div className="text-[#5B8424] font-medium mb-1">CITY</div>
                  <div className="text-white">{selectedPackage.departure?.city || 'N/A'}</div>
                </div>
                <div className="bg-[#2d4a2d] p-3 rounded border border-[#5B8424]/20">
                  <div className="text-[#5B8424] font-medium mb-1">FLIGHT</div>
                  <div className="text-white">{selectedPackage.departure?.flight || 'N/A'}</div>
                </div>
                <div className="bg-[#2d4a2d] p-3 rounded border border-[#5B8424]/20">
                  <div className="text-[#5B8424] font-medium mb-1">TIME</div>
                  <div className="text-white">{selectedPackage.departure?.time || 'N/A'}</div>
                </div>
                <div className="bg-[#2d4a2d] p-3 rounded border border-[#5B8424]/20">
                  <div className="text-[#5B8424] font-medium mb-1">NO. OF DAY/NIGHT</div>
                  <div className="text-white">{selectedPackage.days}/{selectedPackage.nights}</div>
                </div>
                <div className="bg-[#2d4a2d] p-3 rounded border border-[#5B8424]/20">
                  <div className="text-[#5B8424] font-medium mb-1">NO. OF CHILDREN</div>
                  <div className="text-white">{selectedPackage.customer?.children || 0}</div>
                </div>
                <div className="bg-[#2d4a2d] p-3 rounded border border-[#5B8424]/20">
                  <div className="text-[#5B8424] font-medium mb-1">NO. OF INFANT</div>
                  <div className="text-white">{selectedPackage.customer?.infants || 0}</div>
                </div>
              </div>

              {/* Package Financials */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-3 text-sm">
                <div className="bg-[#2d4a2d] p-3 rounded border border-[#5B8424]/20">
                  <div className="text-[#5B8424] font-medium mb-1">PACKAGE PRIZE</div>
                  <div className="text-white text-lg font-semibold">{formatCurrency(selectedPackage.prizeINR)}</div>
                </div>
                <div className="bg-[#2d4a2d] p-3 rounded border border-[#5B8424]/20">
                  <div className="text-[#5B8424] font-medium mb-1">PACKAGE EXPENDITURE</div>
                  <div className="text-white">{formatCurrency(selectedPackage.expenditure)}</div>
                  <div className="text-[#5B8424] text-xs">BALANCE: {formatCurrency(selectedPackage.expenditure)}</div>
                </div>
                <div className="bg-[#2d4a2d] p-3 rounded border border-[#5B8424]/20">
                  <div className="text-[#5B8424] font-medium mb-1">PACKAGE PROFIT</div>
                  <div className="text-white">{formatCurrency(selectedPackage.profit)}</div>
                  <div className="text-[#5B8424] text-xs">BALANCE: {formatCurrency(selectedPackage.profit)}</div>
                </div>
                <div className="bg-[#2d4a2d] p-3 rounded border border-[#5B8424]/20">
                  <div className="text-[#5B8424] font-medium mb-1">ADVANCE</div>
                  <div className="text-white">{formatCurrency(selectedPackage.advance || 0)}</div>
                </div>
                <div className="bg-[#2d4a2d] p-3 rounded border border-[#5B8424]/20">
                  <div className="text-[#5B8424] font-medium mb-1">TOTAL</div>
                  <div className="text-white">{formatCurrency(selectedPackage.prizeINR)}</div>
                </div>
                <div className="bg-[#2d4a2d] p-3 rounded border border-[#5B8424]/20">
                  <div className="text-[#5B8424] font-medium mb-1">BALANCE DUE</div>
                  <div className="text-white">{formatCurrency((selectedPackage.prizeINR || 0) - (selectedPackage.advance || 0))}</div>
                </div>
              </div>

              {/* Payment Details */}
              {selectedPackage.payments && selectedPackage.payments.length > 0 && (
                <div className="bg-[#2d4a2d] p-3 rounded border border-[#5B8424]/20">
                  <div className="text-[#5B8424] font-medium mb-2">PAYMENT DETAILS</div>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 text-sm">
                    <div>
                      <div className="text-[#5B8424] text-xs">DATE</div>
                      <div className="text-white">{formatDate(selectedPackage.payments[0]?.date)}</div>
                    </div>
                    <div>
                      <div className="text-[#5B8424] text-xs">AMOUNT</div>
                      <div className="text-white">{formatCurrency(selectedPackage.payments[0]?.amount)}</div>
                    </div>
                    <div>
                      <div className="text-[#5B8424] text-xs">CONVERSION RATE</div>
                      <div className="text-white">{selectedPackage.payments[0]?.conversionRate || 0}</div>
                    </div>
                    <div>
                      <div className="text-[#5B8424] text-xs">AMOUNT IN INR</div>
                      <div className="text-white">{formatCurrency(selectedPackage.payments[0]?.amountInINR)}</div>
                    </div>
                    <div>
                      <div className="text-[#5B8424] text-xs">TOTAL</div>
                      <div className="text-white">{formatCurrency(selectedPackage.payments[0]?.amountInINR)}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Driver and Transport Details Section */}
          {selectedPackage.transport ? (
            <div className="bg-[#1a2e1a] border border-[#5B8424]/20 rounded-lg overflow-hidden">
              <div className="bg-[#1e3a2e] px-4 py-3 border-b border-[#5B8424]/20">
                <h2 className="text-lg font-semibold text-white">Driver & Transport Details</h2>
              </div>
              <div className="p-3 space-y-3">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 text-sm">
                  <div className="bg-[#2d4a2d] p-3 rounded border border-[#5B8424]/20">
                    <div className="text-[#5B8424] font-medium mb-1">NAME OF DRIVER</div>
                    <div className="text-white">{selectedPackage.transport.driverName || 'N/A'}</div>
                  </div>
                  <div className="bg-[#2d4a2d] p-3 rounded border border-[#5B8424]/20">
                    <div className="text-[#5B8424] font-medium mb-1">PHONE</div>
                    <div className="text-white">{selectedPackage.transport.phone || 'N/A'}</div>
                  </div>
                  <div className="bg-[#2d4a2d] p-3 rounded border border-[#5B8424]/20">
                    <div className="text-[#5B8424] font-medium mb-1">VEHICLE TYPE</div>
                    <div className="text-white">{selectedPackage.transport.vehicleType || 'INNOVA'}</div>
                  </div>
                  <div className="bg-[#2d4a2d] p-3 rounded border border-[#5B8424]/20">
                    <div className="text-[#5B8424] font-medium mb-1">REGN NO.</div>
                    <div className="text-white">{selectedPackage.transport.regNo || 'N/A'}</div>
                  </div>
                  <div className="bg-[#2d4a2d] p-3 rounded border border-[#5B8424]/20">
                    <div className="text-[#5B8424] font-medium mb-1">ADVANCE</div>
                    <div className="text-white">{formatCurrency(selectedPackage.transport.advance)}</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                  <div className="bg-[#2d4a2d] p-3 rounded border border-[#5B8424]/20">
                    <div className="text-[#5B8424] font-medium mb-1">DAILY RENT</div>
                    <div className="text-white">{formatCurrency(selectedPackage.transport.hire?.dailyRent)}</div>
                  </div>
                  <div className="bg-[#2d4a2d] p-3 rounded border border-[#5B8424]/20">
                    <div className="text-[#5B8424] font-medium mb-1">NO. OF DAYS</div>
                    <div className="text-white">{selectedPackage.transport.hire?.noOfDays || 0}</div>
                  </div>
                  <div className="bg-[#2d4a2d] p-3 rounded border border-[#5B8424]/20">
                    <div className="text-[#5B8424] font-medium mb-1">RENT TOTAL</div>
                    <div className="text-white">{formatCurrency(selectedPackage.transport.hire?.totalRent)}</div>
                  </div>
                  <div className="bg-[#2d4a2d] p-3 rounded border border-[#5B8424]/20">
                    <div className="text-[#5B8424] font-medium mb-1">NET TOTAL</div>
                    <div className="text-white">{formatCurrency(selectedPackage.transport.hire?.netTotal)}</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                  <div className="bg-[#2d4a2d] p-3 rounded border border-[#5B8424]/20">
                    <div className="text-[#5B8424] font-medium mb-1">PARKING & TOLL</div>
                    <div className="text-white">{formatCurrency(selectedPackage.transport.hire?.parkingToll)}</div>
                  </div>
                  <div className="bg-[#2d4a2d] p-3 rounded border border-[#5B8424]/20">
                    <div className="text-[#5B8424] font-medium mb-1">EXTRA KM</div>
                    <div className="text-white">{selectedPackage.transport.hire?.extraKm || 0}</div>
                  </div>
                  <div className="bg-[#2d4a2d] p-3 rounded border border-[#5B8424]/20">
                    <div className="text-[#5B8424] font-medium mb-1">EXTRA KM RATE</div>
                    <div className="text-white">{formatCurrency(selectedPackage.transport.hire?.extraKmRate)}</div>
                  </div>
                  <div className="bg-[#2d4a2d] p-3 rounded border border-[#5B8424]/20">
                    <div className="text-[#5B8424] font-medium mb-1">EXTRA KM TOTAL</div>
                    <div className="text-white">{formatCurrency(selectedPackage.transport.hire?.extraKmTotal)}</div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-[#1a2e1a] border border-[#5B8424]/20 rounded-lg overflow-hidden">
              <div className="bg-[#1e3a2e] px-4 py-3 border-b border-[#5B8424]/20">
                <h2 className="text-lg font-semibold text-white">Driver & Transport Details</h2>
              </div>
              <div className="p-4 text-center text-gray-400">
                No transport details available for this package
              </div>
            </div>
          )}

          {/* Package Expenditure Details Section */}
          {selectedPackage.hotelBookings && selectedPackage.hotelBookings.length > 0 ? (
            <div className="bg-[#1a2e1a] border border-[#5B8424]/20 rounded-lg overflow-hidden">
              <div className="bg-[#1e3a2e] px-4 py-3 border-b border-[#5B8424]/20">
                <h2 className="text-lg font-semibold text-white">Package Expenditure Details</h2>
              </div>
              <div className="p-3 overflow-x-auto min-w-full">
                <table className="w-full text-sm min-w-max">
                  <thead>
                    <tr className="bg-[#2d4a2d] text-white">
                      <th className="p-1 border border-[#5B8424]/20 text-left text-xs">Hotel</th>
                      <th className="p-1 border border-[#5B8424]/20 text-left text-xs">Destination</th>
                      <th className="p-1 border border-[#5B8424]/20 text-left text-xs">Check In</th>
                      <th className="p-1 border border-[#5B8424]/20 text-left text-xs">Check Out</th>
                      <th className="p-1 border border-[#5B8424]/20 text-left text-xs">Nights</th>
                      <th className="p-1 border border-[#5B8424]/20 text-left text-xs">Pax</th>
                      <th className="p-1 border border-[#5B8424]/20 text-left text-xs">Rooms</th>
                      <th className="p-1 border border-[#5B8424]/20 text-left text-xs">Room Rate</th>
                      <th className="p-1 border border-[#5B8424]/20 text-left text-xs">Room Type</th>
                      <th className="p-1 border border-[#5B8424]/20 text-left text-xs">Total</th>
                      <th className="p-1 border border-[#5B8424]/20 text-left text-xs">Extra Bed Rate</th>
                      <th className="p-1 border border-[#5B8424]/20 text-left text-xs">Extra Bed</th>
                      <th className="p-1 border border-[#5B8424]/20 text-left text-xs">Net Total</th>
                      <th className="p-1 border border-[#5B8424]/20 text-left text-xs">Paid</th>
                      <th className="p-1 border border-[#5B8424]/20 text-left text-xs">Balance</th>
                      <th className="p-1 border border-[#5B8424]/20 text-left text-xs">Cut Off Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedPackage.hotelBookings.map((booking, index) => (
                      <tr key={index} className="bg-[#2d4a2d] text-white">
                        <td className="p-1 border border-[#5B8424]/20 text-xs">{booking.hotel?.hotelName || 'N/A'}</td>
                        <td className="p-1 border border-[#5B8424]/20 text-xs">{booking.destination?.destinationName || 'N/A'}</td>
                        <td className="p-1 border border-[#5B8424]/20 text-xs">{formatDate(booking.checkIn)}</td>
                        <td className="p-1 border border-[#5B8424]/20 text-xs">{formatDate(booking.checkOut)}</td>
                        <td className="p-1 border border-[#5B8424]/20 text-xs">{booking.noOfNights}</td>
                        <td className="p-1 border border-[#5B8424]/20 text-xs">{booking.noOfPaxs}</td>
                        <td className="p-1 border border-[#5B8424]/20 text-xs">{booking.noOfRooms}</td>
                        <td className="p-1 border border-[#5B8424]/20 text-xs">{formatCurrency(booking.roomRate)}</td>
                        <td className="p-1 border border-[#5B8424]/20 text-xs">{booking.typeOfRoom}</td>
                        <td className="p-1 border border-[#5B8424]/20 text-xs">{formatCurrency(booking.total)}</td>
                        <td className="p-1 border border-[#5B8424]/20 text-xs">{formatCurrency(booking.extraBedRate)}</td>
                        <td className="p-1 border border-[#5B8424]/20 text-xs">{formatCurrency(booking.extraBedTotal)}</td>
                        <td className="p-1 border border-[#5B8424]/20 text-xs">{formatCurrency(booking.netTotal)}</td>
                        <td className="p-1 border border-[#5B8424]/20 text-xs">{formatCurrency(booking.paid)}</td>
                        <td className="p-1 border border-[#5B8424]/20 text-xs">{formatCurrency(booking.balance)}</td>
                        <td className="p-1 border border-[#5B8424]/20 text-xs">{formatDate(booking.cutOffDate)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="bg-[#1a2e1a] border border-[#5B8424]/20 rounded-lg overflow-hidden">
              <div className="bg-[#1e3a2e] px-4 py-3 border-b border-[#5B8424]/20">
                <h2 className="text-lg font-semibold text-white">Package Expenditure Details</h2>
              </div>
              <div className="p-4 text-center text-gray-400">
                No hotel bookings available for this package
              </div>
            </div>
          )}

          {/* Other Expenses Section */}
          {selectedPackage.expense ? (
            <div className="bg-[#1a2e1a] border border-[#5B8424]/20 rounded-lg overflow-hidden">
              <div className="bg-[#4a2d2d] px-4 py-3 border-b border-[#5B8424]/20">
                <h2 className="text-lg font-semibold text-white">Other Expenses</h2>
              </div>
              <div className="p-3">
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 text-sm">
                  <div className="bg-[#2d4a2d] p-3 rounded border border-[#5B8424]/20">
                    <div className="text-[#5B8424] font-medium mb-1">Commercial Parking</div>
                    <div className="text-white">{formatCurrency(selectedPackage.expense.parking)}</div>
                  </div>
                  <div className="bg-[#2d4a2d] p-3 rounded border border-[#5B8424]/20">
                    <div className="text-[#5B8424] font-medium mb-1">Commercial Entry</div>
                    <div className="text-white">{formatCurrency(selectedPackage.expense.entry)}</div>
                  </div>
                  <div className="bg-[#2d4a2d] p-3 rounded border border-[#5B8424]/20">
                    <div className="text-[#5B8424] font-medium mb-1">Bouquet</div>
                    <div className="text-white">{formatCurrency(selectedPackage.expense.bouquet)}</div>
                  </div>
                  <div className="bg-[#2d4a2d] p-3 rounded border border-[#5B8424]/20">
                    <div className="text-[#5B8424] font-medium mb-1">SIM Card</div>
                    <div className="text-white">{formatCurrency(selectedPackage.expense.simCard)}</div>
                  </div>
                  <div className="bg-[#2d4a2d] p-3 rounded border border-[#5B8424]/20">
                    <div className="text-[#5B8424] font-medium mb-1">Room</div>
                    <div className="text-white">{formatCurrency(selectedPackage.expense.room || 600)}</div>
                  </div>
                  <div className="bg-[#2d4a2d] p-3 rounded border border-[#5B8424]/20">
                    <div className="text-[#5B8424] font-medium mb-1">Food</div>
                    <div className="text-white">{formatCurrency(selectedPackage.expense.food)}</div>
                  </div>
                  <div className="bg-[#2d4a2d] p-3 rounded border border-[#5B8424]/20">
                    <div className="text-[#5B8424] font-medium mb-1">Transportation</div>
                    <div className="text-white">{formatCurrency(selectedPackage.expense.transportation)}</div>
                  </div>
                  <div className="bg-[#2d4a2d] p-3 rounded border border-[#5B8424]/20">
                    <div className="text-[#5B8424] font-medium mb-1">Total</div>
                    <div className="text-white font-semibold">{formatCurrency(selectedPackage.expense.total)}</div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-[#1a2e1a] border border-[#5B8424]/20 rounded-lg overflow-hidden">
              <div className="bg-[#4a2d2d] px-4 py-3 border-b border-[#5B8424]/20">
                <h2 className="text-lg font-semibold text-white">Other Expenses</h2>
              </div>
              <div className="p-4 text-center text-gray-400">
                No expense details available for this package
              </div>
            </div>
          )}

          {/* Signatures Section */}
          <div className="bg-[#1a2e1a] border border-[#5B8424]/20 rounded-lg overflow-hidden">
            <div className="bg-[#4a2d2d] px-4 py-3 border-b border-[#5B8424]/20">
              <h2 className="text-lg font-semibold text-white">Signatures</h2>
            </div>
            <div className="p-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="bg-[#2d4a2d] p-3 rounded border border-[#5B8424]/20">
                  <div className="text-[#5B8424] font-medium mb-1">Tour Executive</div>
                  <div className="text-white">{selectedPackage.tourExecutive || 'UMMAR'}</div>
                </div>
                <div className="bg-[#2d4a2d] p-3 rounded border border-[#5B8424]/20">
                  <div className="text-[#5B8424] font-medium mb-1">Transporter</div>
                  <div className="text-white">{selectedPackage.transporter || 'ANSARI'}</div>
                </div>
                <div className="bg-[#2d4a2d] p-3 rounded border border-[#5B8424]/20">
                  <div className="text-[#5B8424] font-medium mb-1">Reservation Officer</div>
                  <div className="text-white">{selectedPackage.reservationOfficer || 'N/A'}</div>
                </div>
                <div className="bg-[#2d4a2d] p-3 rounded border border-[#5B8424]/20">
                  <div className="text-[#5B8424] font-medium mb-1">Handling Officer</div>
                  <div className="text-white">{selectedPackage.handlingOfficer || 'N/A'}</div>
                </div>
                <div className="bg-[#2d4a2d] p-3 rounded border border-[#5B8424]/20 col-span-2">
                  <div className="text-[#5B8424] font-medium mb-1">Source of Enquiry</div>
                  <div className="text-white">{selectedPackage.sourceOfEnquiry || 'N/A'}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0f1310] text-white p-4">
      <div className="max-w-full mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Package Details</h1>
          <p className="text-gray-400">View detailed information about travel packages</p>
        </div>

        {/* Search Bar */}
        <div className="mb-4">
          <div className="relative max-w-md">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search packages..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-[#1a2e1a] border border-[#5B8424]/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#5B8424]"
            />
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-4 bg-red-900/20 border border-red-500/20 rounded-lg text-red-400">
            {error}
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#5B8424]"></div>
          </div>
        )}

        {/* Packages List */}
        {!loading && (
          <div className="bg-[#1a2e1a] border border-[#5B8424]/20 rounded-lg overflow-hidden">
            <div className="overflow-x-auto min-w-full">
              <table className="w-full">
                <thead>
                  <tr className="bg-[#2d4a2d] text-white">
                    <th className="px-4 py-3 text-left text-sm font-medium">Package Code</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Guest Name</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Phone</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Arrival</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Departure</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Amount</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {packages.map((packageItem) => (
                    <tr key={packageItem._id} className="border-b border-[#5B8424]/20 hover:bg-[#2d4a2d]/50 transition-colors">
                      <td className="px-4 py-3 text-white text-sm font-medium">{packageItem.packageCode}</td>
                      <td className="px-4 py-3 text-white text-sm">{packageItem.customer?.name || 'N/A'}</td>
                      <td className="px-4 py-3 text-white/80 text-sm">{packageItem.customer?.phone || 'N/A'}</td>
                      <td className="px-4 py-3 text-white/80 text-sm">{formatDate(packageItem.arrival?.date)}</td>
                      <td className="px-4 py-3 text-white/80 text-sm">{formatDate(packageItem.departure?.date)}</td>
                      <td className="px-4 py-3 text-white text-sm font-semibold">{formatCurrency(packageItem.prizeINR)}</td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => fetchPackageDetails(packageItem._id)}
                          className="flex items-center gap-1.5 text-[#5B8424] hover:text-[#7AB839] transition-colors text-sm"
                        >
                          <EyeIcon className="w-4 h-4" />
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Empty State */}
            {packages.length === 0 && !loading && (
              <div className="text-center py-8">
                <p className="text-gray-400 text-sm">No packages found</p>
              </div>
            )}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6">
            <PageControls
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>
    </div>
  )
}

export default PackageDetailsPage
