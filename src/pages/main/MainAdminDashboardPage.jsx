import React from 'react';
import DestinationsPage from '../DestinationsPage';

const MainAdminDashboardPage = () => {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-2">Main Admin Dashboard</h1>
        <p className="text-gray-400">Complete access to all system features</p>
      </div>

      {/* Destinations Section */}
      <div>
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Destinations Management</h2>
          <DestinationsPage />
        </div>
      </div>
    </div>
  );
};

export default MainAdminDashboardPage;
