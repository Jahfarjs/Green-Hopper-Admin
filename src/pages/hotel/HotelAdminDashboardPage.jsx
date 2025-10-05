import React, { useState, useEffect } from 'react';
import { Doughnut, Bar, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  Title,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement
} from 'chart.js';
import { 
  BuildingOfficeIcon, 
  CurrencyDollarIcon, 
  DocumentTextIcon, 
  CalendarIcon, 
  ChartBarIcon,
  MapPinIcon,
  UserGroupIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

// Register Chart.js components
ChartJS.register(
  ArcElement, 
  Tooltip, 
  Legend, 
  Title, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  PointElement, 
  LineElement
);

const HotelAdminDashboardPage = () => {
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('all'); // 'all', 'monthly', 'yearly'

  // Dashboard theme colors
  const themeColors = {
    primary: '#3B82F6',    // Blue
    secondary: '#22C55E',  // Green  
    accent: '#A855F7',     // Purple
    warning: '#F59E0B',    // Amber
    danger: '#EF4444',     // Red
    info: '#06B6D4'        // Cyan
  };

  // Fetch dashboard statistics
  const API_BASE_URL = import.meta.env.VITE_ADMIN_API_URL
  const fetchStatistics = async (selectedPeriod = 'all') => {
    try {
      setLoading(true);
      const token = localStorage.getItem('admin_token');
      
      // Fetch hotel statistics
      const hotelResponse = await fetch(`${API_BASE_URL}/dashboard/statistics?period=${selectedPeriod}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      // Fetch booking statistics
      const bookingResponse = await fetch(`${API_BASE_URL}/bookings`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (hotelResponse.ok && bookingResponse.ok) {
        const hotelData = await hotelResponse.json();
        const bookingData = await bookingResponse.json();
        
        // Process booking statistics
        const bookings = bookingData.bookings || [];
        const totalBookings = bookings.length;
        
        // Booking status statistics
        const bookingStatusStats = {
          pending: bookings.filter(b => b.status === 'pending').length,
          accepted: bookings.filter(b => b.status === 'accepted').length,
          rejected: bookings.filter(b => b.status === 'rejected').length
        };
        
        // Bookings by destination
        const bookingsByDestination = bookings.reduce((acc, booking) => {
          const destination = booking.destination;
          const existing = acc.find(item => item._id === destination);
          if (existing) {
            existing.count++;
          } else {
            acc.push({ _id: destination, count: 1 });
          }
          return acc;
        }, []);
        
        // Nationality statistics
        const nationalityStats = bookings.reduce((acc, booking) => {
          const nationality = booking.nationality || 'Unknown';
          const existing = acc.find(item => item._id === nationality);
          if (existing) {
            existing.count++;
          } else {
            acc.push({ _id: nationality, count: 1 });
          }
          return acc;
        }, []);
        
        // Monthly booking trends (last 6 months)
        const monthlyBookingTrends = [];
        for (let i = 5; i >= 0; i--) {
          const date = new Date();
          date.setMonth(date.getMonth() - i);
          const month = date.toLocaleDateString('en-US', { month: 'short' });
          const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
          const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);
          
          const monthBookings = bookings.filter(booking => {
            const bookingDate = new Date(booking.createdAt);
            return bookingDate >= monthStart && bookingDate <= monthEnd;
          });
          
          monthlyBookingTrends.push({
            month,
            count: monthBookings.length
          });
        }
        
        // Combine all statistics
        const combinedStatistics = {
          ...hotelData,
          totalBookings,
          bookingStatusStats,
          bookingsByDestination,
          nationalityStats,
          monthlyBookingTrends
        };
        
        setStatistics(combinedStatistics);
      } else {
        console.error('Failed to fetch statistics');
      }
    } catch (error) {
      console.error('Error fetching statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatistics(period);
  }, [period]);

  // Chart options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#E5E7EB',
          font: {
            size: 12
          }
        }
      },
      tooltip: {
        backgroundColor: '#1F2937',
        titleColor: '#F9FAFB',
        bodyColor: '#F9FAFB',
        borderColor: '#374151',
        borderWidth: 1
      }
    }
  };

  // Hotels by location chart
  const hotelsByLocationData = statistics?.hotelsByLocation ? {
    labels: statistics.hotelsByLocation.map(item => item._id),
    datasets: [{
      data: statistics.hotelsByLocation.map(item => item.count),
      backgroundColor: [
        themeColors.primary,
        themeColors.secondary,
        themeColors.accent,
        themeColors.warning,
        themeColors.danger,
        themeColors.info
      ],
      borderColor: '#1F2937',
      borderWidth: 2
    }]
  } : null;

  // Room prices by location chart
  const roomPricesData = statistics?.roomPricesByLocation ? {
    labels: statistics.roomPricesByLocation.map(item => item._id),
    datasets: [{
      data: statistics.roomPricesByLocation.map(item => item.totalPrice),
      backgroundColor: [
        themeColors.secondary,
        themeColors.primary,
        themeColors.accent,
        themeColors.warning,
        themeColors.danger,
        themeColors.info
      ],
      borderColor: '#1F2937',
      borderWidth: 2
    }]
  } : null;

  // Expenditure statistics chart
  const expenditureData = statistics?.expenditureStats ? {
    labels: ['Expenditure', 'Revenue', 'Profit'],
    datasets: [{
      data: [
        statistics.expenditureStats.totalExpenditure,
        statistics.expenditureStats.totalRevenue,
        statistics.expenditureStats.totalProfit
      ],
      backgroundColor: [
        themeColors.danger,
        themeColors.secondary,
        themeColors.primary
      ],
      borderColor: '#1F2937',
      borderWidth: 2
    }]
  } : null;

  // Booking status distribution chart
  const bookingStatusData = statistics?.bookingStatusStats ? {
    labels: ['Pending', 'Accepted', 'Rejected'],
    datasets: [{
      data: [
        statistics.bookingStatusStats.pending || 0,
        statistics.bookingStatusStats.accepted || 0,
        statistics.bookingStatusStats.rejected || 0
      ],
      backgroundColor: [
        themeColors.warning,
        themeColors.secondary,
        themeColors.danger
      ],
      borderColor: '#1F2937',
      borderWidth: 2
    }]
  } : null;

  // Bookings by destination chart
  const bookingsByDestinationData = statistics?.bookingsByDestination ? {
    labels: statistics.bookingsByDestination.map(item => item._id),
    datasets: [{
      data: statistics.bookingsByDestination.map(item => item.count),
      backgroundColor: [
        themeColors.primary,
        themeColors.secondary,
        themeColors.accent,
        themeColors.warning,
        themeColors.danger,
        themeColors.info
      ],
      borderColor: '#1F2937',
      borderWidth: 2
    }]
  } : null;

  // Monthly booking trends chart
  const monthlyBookingTrendsData = statistics?.monthlyBookingTrends ? {
    labels: statistics.monthlyBookingTrends.map(item => item.month),
    datasets: [{
      label: 'Bookings',
      data: statistics.monthlyBookingTrends.map(item => item.count),
      borderColor: themeColors.primary,
      backgroundColor: themeColors.primary + '20',
      borderWidth: 2,
      fill: true,
      tension: 0.4
    }]
  } : null;

  // Nationality distribution chart
  const nationalityData = statistics?.nationalityStats ? {
    labels: statistics.nationalityStats.map(item => item._id),
    datasets: [{
      data: statistics.nationalityStats.map(item => item.count),
      backgroundColor: [
        themeColors.primary,
        themeColors.secondary,
        themeColors.accent,
        themeColors.warning,
        themeColors.danger,
        themeColors.info
      ],
      borderColor: '#1F2937',
      borderWidth: 2
    }]
  } : null;

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-2">Hotel Admin Dashboard</h1>
        <p className="text-gray-400">Hotel administration panel with comprehensive statistics</p>
      </div>

      {/* Period Toggle Buttons */}
      <div className="mb-6">
        <div className="flex space-x-2">
          <button
            onClick={() => setPeriod('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              period === 'all' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            <CalendarIcon className="w-4 h-4 inline mr-2" />
            All Time
          </button>
          <button
            onClick={() => setPeriod('monthly')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              period === 'monthly' 
                ? 'bg-green-600 text-white' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            <CalendarIcon className="w-4 h-4 inline mr-2" />
            Monthly
          </button>
          <button
            onClick={() => setPeriod('yearly')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              period === 'yearly' 
                ? 'bg-purple-600 text-white' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            <CalendarIcon className="w-4 h-4 inline mr-2" />
            Yearly
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <>
          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
            {/* Hotels by Location Chart */}
            <div className="bg-gray-800 rounded-lg p-6">
              <div className="flex items-center mb-4">
                <BuildingOfficeIcon className="w-6 h-6 text-blue-500 mr-2" />
                <h3 className="text-lg font-semibold text-white">Hotels by Location</h3>
              </div>
              <div className="h-64">
                {hotelsByLocationData ? (
                  <Doughnut data={hotelsByLocationData} options={chartOptions} />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400">
                    No data available
                  </div>
                )}
              </div>
            </div>

            {/* Room Prices by Location Chart */}
            <div className="bg-gray-800 rounded-lg p-6">
              <div className="flex items-center mb-4">
                <CurrencyDollarIcon className="w-6 h-6 text-green-500 mr-2" />
                <h3 className="text-lg font-semibold text-white">Room Prices by Location</h3>
              </div>
              <div className="h-64">
                {roomPricesData ? (
                  <Doughnut data={roomPricesData} options={chartOptions} />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400">
                    No data available
                  </div>
                )}
              </div>
            </div>

            {/* Expenditure Statistics Chart */}
            <div className="bg-gray-800 rounded-lg p-6">
              <div className="flex items-center mb-4">
                <ChartBarIcon className="w-6 h-6 text-purple-500 mr-2" />
                <h3 className="text-lg font-semibold text-white">Financial Overview</h3>
              </div>
              <div className="h-64">
                {expenditureData ? (
                  <Doughnut data={expenditureData} options={chartOptions} />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400">
                    No data available
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Total Hotels</p>
                  <p className="text-3xl font-bold text-white">{statistics?.totalHotels || 0}</p>
                </div>
                <BuildingOfficeIcon className="w-12 h-12 text-blue-200" />
              </div>
            </div>

            <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">Total Bookings</p>
                  <p className="text-3xl font-bold text-white">{statistics?.totalBookings || 0}</p>
                </div>
                <CalendarIcon className="w-12 h-12 text-green-200" />
              </div>
            </div>

            <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">Pending Bookings</p>
                  <p className="text-3xl font-bold text-white">{statistics?.bookingStatusStats?.pending || 0}</p>
                </div>
                <ClockIcon className="w-12 h-12 text-purple-200" />
              </div>
            </div>

            <div className="bg-gradient-to-r from-orange-600 to-orange-700 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm font-medium">Accepted Bookings</p>
                  <p className="text-3xl font-bold text-white">{statistics?.bookingStatusStats?.accepted || 0}</p>
                </div>
                <CheckCircleIcon className="w-12 h-12 text-orange-200" />
              </div>
            </div>
          </div>

          {/* Booking Statistics Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
            {/* Booking Status Distribution */}
            <div className="bg-gray-800 rounded-lg p-6">
              <div className="flex items-center mb-4">
                <ChartBarIcon className="w-6 h-6 text-yellow-500 mr-2" />
                <h3 className="text-lg font-semibold text-white">Booking Status</h3>
              </div>
              <div className="h-64">
                {bookingStatusData ? (
                  <Doughnut data={bookingStatusData} options={chartOptions} />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400">
                    No booking data available
                  </div>
                )}
              </div>
            </div>

            {/* Bookings by Destination */}
            <div className="bg-gray-800 rounded-lg p-6">
              <div className="flex items-center mb-4">
                <MapPinIcon className="w-6 h-6 text-blue-500 mr-2" />
                <h3 className="text-lg font-semibold text-white">Bookings by Destination</h3>
              </div>
              <div className="h-64">
                {bookingsByDestinationData ? (
                  <Doughnut data={bookingsByDestinationData} options={chartOptions} />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400">
                    No destination data available
                  </div>
                )}
              </div>
            </div>

            {/* Monthly Booking Trends */}
            <div className="bg-gray-800 rounded-lg p-6">
              <div className="flex items-center mb-4">
                <CalendarIcon className="w-6 h-6 text-green-500 mr-2" />
                <h3 className="text-lg font-semibold text-white">Monthly Trends</h3>
              </div>
              <div className="h-64">
                {monthlyBookingTrendsData ? (
                  <Line data={monthlyBookingTrendsData} options={{
                    ...chartOptions,
                    scales: {
                      y: {
                        beginAtZero: true,
                        ticks: { color: '#E5E7EB' },
                        grid: { color: '#374151' }
                      },
                      x: {
                        ticks: { color: '#E5E7EB' },
                        grid: { color: '#374151' }
                      }
                    }
                  }} />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400">
                    No trend data available
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Location and Demographics Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Nationality Distribution */}
            <div className="bg-gray-800 rounded-lg p-6">
              <div className="flex items-center mb-4">
                <UserGroupIcon className="w-6 h-6 text-cyan-500 mr-2" />
                <h3 className="text-lg font-semibold text-white">Guest Nationalities</h3>
              </div>
              <div className="h-64">
                {nationalityData ? (
                  <Bar data={nationalityData} options={{
                    ...chartOptions,
                    scales: {
                      y: {
                        beginAtZero: true,
                        ticks: { color: '#E5E7EB' },
                        grid: { color: '#374151' }
                      },
                      x: {
                        ticks: { color: '#E5E7EB' },
                        grid: { color: '#374151' }
                      }
                    }
                  }} />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400">
                    No nationality data available
                  </div>
                )}
              </div>
            </div>

            {/* Booking Performance by Location */}
            <div className="bg-gray-800 rounded-lg p-6">
              <div className="flex items-center mb-4">
                <MapPinIcon className="w-6 h-6 text-red-500 mr-2" />
                <h3 className="text-lg font-semibold text-white">Location Performance</h3>
              </div>
              <div className="h-64">
                {bookingsByDestinationData ? (
                  <Bar data={bookingsByDestinationData} options={{
                    ...chartOptions,
                    scales: {
                      y: {
                        beginAtZero: true,
                        ticks: { color: '#E5E7EB' },
                        grid: { color: '#374151' }
                      },
                      x: {
                        ticks: { color: '#E5E7EB' },
                        grid: { color: '#374151' }
                      }
                    }
                  }} />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400">
                    No location data available
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Recent Bookings */}
          {statistics?.recentBookings && statistics.recentBookings.length > 0 && (
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Recent Bookings</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="text-left text-gray-300 py-2">Guest</th>
                      <th className="text-left text-gray-300 py-2">Hotel</th>
                      <th className="text-left text-gray-300 py-2">Destination</th>
                      <th className="text-left text-gray-300 py-2">Price</th>
                      <th className="text-left text-gray-300 py-2">Check-in</th>
                      <th className="text-left text-gray-300 py-2">Check-out</th>
                    </tr>
                  </thead>
                  <tbody>
                    {statistics.recentBookings.map((booking, index) => (
                      <tr key={index} className="border-b border-gray-700">
                        <td className="text-white py-2">{booking.nameOfGuest}</td>
                        <td className="text-gray-300 py-2">{booking.hotelName?.hotelName || 'N/A'}</td>
                        <td className="text-gray-300 py-2">{booking.destination?.destinationName || 'N/A'}</td>
                        <td className="text-gray-300 py-2">{booking.currency} {booking.packagePrice}</td>
                        <td className="text-gray-300 py-2">
                          {new Date(booking.checkinDate).toLocaleDateString()}
                        </td>
                        <td className="text-gray-300 py-2">
                          {new Date(booking.checkoutDate).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default HotelAdminDashboardPage;
