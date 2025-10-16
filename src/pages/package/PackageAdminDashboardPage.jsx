import React, { useState, useEffect } from 'react';
import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  Title
} from 'chart.js';
import { 
  DocumentTextIcon, 
  CurrencyDollarIcon, 
  BuildingOfficeIcon, 
  CalendarIcon, 
  ChartBarIcon,
  UserGroupIcon,
  MapPinIcon
} from '@heroicons/react/24/outline';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend, Title);

const PackageAdminDashboardPage = () => {
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
      const response = await fetch(`${API_BASE_URL}/package-dashboard/statistics?period=${selectedPeriod}`, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setStatistics(data);
      } else {
      }
    } catch (error) {
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

  // Packages by destination chart
  const packagesByDestinationData = statistics?.packagesByDestination ? {
    labels: statistics.packagesByDestination.map(item => item._id),
    datasets: [{
      data: statistics.packagesByDestination.map(item => item.count),
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

  // Package revenue by destination chart
  const packageRevenueData = statistics?.packageRevenueByDestination ? {
    labels: statistics.packageRevenueByDestination.map(item => item._id),
    datasets: [{
      data: statistics.packageRevenueByDestination.map(item => item.totalRevenue),
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

  // Packages by room category chart
  const packagesByRoomCategoryData = statistics?.packagesByRoomCategory ? {
    labels: statistics.packagesByRoomCategory.map(item => item._id),
    datasets: [{
      data: statistics.packagesByRoomCategory.map(item => item.count),
      backgroundColor: [
        themeColors.accent,
        themeColors.primary,
        themeColors.secondary,
        themeColors.warning,
        themeColors.danger,
        themeColors.info
      ],
      borderColor: '#1F2937',
      borderWidth: 2
    }]
  } : null;

  // Nationality distribution chart
  const nationalityData = statistics?.packagesByNationality ? {
    labels: statistics.packagesByNationality.map(item => item._id),
    datasets: [{
      data: statistics.packagesByNationality.map(item => item.count),
      backgroundColor: [
        themeColors.warning,
        themeColors.primary,
        themeColors.secondary,
        themeColors.accent,
        themeColors.danger,
        themeColors.info
      ],
      borderColor: '#1F2937',
      borderWidth: 2
    }]
  } : null;

  // Financial overview chart
  const financialOverviewData = statistics?.financialOverview ? {
    labels: ['Total Revenue', 'Average Package Price'],
    datasets: [{
      data: [
        statistics.financialOverview.totalRevenue,
        statistics.financialOverview.avgPackagePrice
      ],
      backgroundColor: [
        themeColors.secondary,
        themeColors.primary
      ],
      borderColor: '#1F2937',
      borderWidth: 2
    }]
  } : null;

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-2">Package Admin Dashboard</h1>
        <p className="text-gray-400">Package administration panel with comprehensive statistics</p>
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
            {/* Packages by Destination Chart */}
            <div className="bg-gray-800 rounded-lg p-6">
              <div className="flex items-center mb-4">
                <MapPinIcon className="w-6 h-6 text-blue-500 mr-2" />
                <h3 className="text-lg font-semibold text-white">Packages by Destination</h3>
              </div>
              <div className="h-64">
                {packagesByDestinationData ? (
                  <Doughnut data={packagesByDestinationData} options={chartOptions} />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400">
                    No data available
                  </div>
                )}
              </div>
            </div>

            {/* Package Revenue by Destination Chart */}
            <div className="bg-gray-800 rounded-lg p-6">
              <div className="flex items-center mb-4">
                <CurrencyDollarIcon className="w-6 h-6 text-green-500 mr-2" />
                <h3 className="text-lg font-semibold text-white">Revenue by Destination</h3>
              </div>
              <div className="h-64">
                {packageRevenueData ? (
                  <Doughnut data={packageRevenueData} options={chartOptions} />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400">
                    No data available
                  </div>
                )}
              </div>
            </div>

            {/* Packages by Room Category Chart */}
            <div className="bg-gray-800 rounded-lg p-6">
              <div className="flex items-center mb-4">
                <BuildingOfficeIcon className="w-6 h-6 text-purple-500 mr-2" />
                <h3 className="text-lg font-semibold text-white">Packages by Room Category</h3>
              </div>
              <div className="h-64">
                {packagesByRoomCategoryData ? (
                  <Doughnut data={packagesByRoomCategoryData} options={chartOptions} />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400">
                    No data available
                  </div>
                )}
              </div>
            </div>

            {/* Nationality Distribution Chart */}
            <div className="bg-gray-800 rounded-lg p-6">
              <div className="flex items-center mb-4">
                <UserGroupIcon className="w-6 h-6 text-amber-500 mr-2" />
                <h3 className="text-lg font-semibold text-white">Customer Nationality</h3>
              </div>
              <div className="h-64">
                {nationalityData ? (
                  <Doughnut data={nationalityData} options={chartOptions} />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400">
                    No data available
                  </div>
                )}
              </div>
            </div>

            {/* Financial Overview Chart */}
            <div className="bg-gray-800 rounded-lg p-6">
              <div className="flex items-center mb-4">
                <ChartBarIcon className="w-6 h-6 text-cyan-500 mr-2" />
                <h3 className="text-lg font-semibold text-white">Financial Overview</h3>
              </div>
              <div className="h-64">
                {financialOverviewData ? (
                  <Doughnut data={financialOverviewData} options={chartOptions} />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400">
                    No data available
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Total Packages</p>
                  <p className="text-3xl font-bold text-white">{statistics?.totalPackages || 0}</p>
                </div>
                <DocumentTextIcon className="w-12 h-12 text-blue-200" />
              </div>
            </div>

            <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">Total Hotels</p>
                  <p className="text-3xl font-bold text-white">{statistics?.totalHotels || 0}</p>
                </div>
                <BuildingOfficeIcon className="w-12 h-12 text-green-200" />
              </div>
            </div>

            <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">Total Destinations</p>
                  <p className="text-3xl font-bold text-white">{statistics?.totalDestinations || 0}</p>
                </div>
                <MapPinIcon className="w-12 h-12 text-purple-200" />
              </div>
            </div>
          </div>

          {/* Recent Packages */}
          {statistics?.recentPackages && statistics.recentPackages.length > 0 && (
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Recent Packages</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="text-left text-gray-300 py-2">Guest</th>
                      <th className="text-left text-gray-300 py-2">Nationality</th>
                      <th className="text-left text-gray-300 py-2">Hotel</th>
                      <th className="text-left text-gray-300 py-2">Destination</th>
                      <th className="text-left text-gray-300 py-2">Price</th>
                      <th className="text-left text-gray-300 py-2">Check-in</th>
                      <th className="text-left text-gray-300 py-2">Check-out</th>
                    </tr>
                  </thead>
                  <tbody>
                    {statistics.recentPackages.map((packageItem, index) => (
                      <tr key={index} className="border-b border-gray-700">
                        <td className="text-white py-2">{packageItem.nameOfGuest}</td>
                        <td className="text-gray-300 py-2">{packageItem.nationality}</td>
                        <td className="text-gray-300 py-2">{packageItem.hotelName?.hotelName || 'N/A'}</td>
                        <td className="text-gray-300 py-2">{packageItem.destination?.destinationName || 'N/A'}</td>
                        <td className="text-gray-300 py-2">{packageItem.currency} {packageItem.packagePrice}</td>
                        <td className="text-gray-300 py-2">
                          {new Date(packageItem.checkinDate).toLocaleDateString()}
                        </td>
                        <td className="text-gray-300 py-2">
                          {new Date(packageItem.checkoutDate).toLocaleDateString()}
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

export default PackageAdminDashboardPage;
