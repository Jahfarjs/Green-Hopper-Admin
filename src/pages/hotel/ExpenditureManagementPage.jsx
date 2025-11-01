import React, { useState, useEffect } from 'react';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  EyeIcon,
  ChartBarIcon,
  CubeIcon,
  BuildingOfficeIcon,
  TruckIcon,
  AdjustmentsHorizontalIcon,
  CurrencyDollarIcon,
  BanknotesIcon,
  ClipboardDocumentListIcon,
  ExclamationTriangleIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

const ExpenditureManagementPage = () => {
  const [expenditures, setExpenditures] = useState([]);
  const [packages, setPackages] = useState([]);
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingExpenditure, setEditingExpenditure] = useState(null);
  const [formData, setFormData] = useState({
    package: '',
    packageExpenditure: '',
    packagePrice: '',
    packageProfit: ''
  });
  const [expenditureBreakdown, setExpenditureBreakdown] = useState({
    roomCost: 0,
    extraBedCost: 0,
    vehicleCost: 0,
    additionalServices: 0,
    totalExpenditure: 0,
    services: {
      cialParking: 0,
      cialEntry: 0,
      bouquet: 0,
      simCard: 0,
      food: 0
    }
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedExpenditure, setSelectedExpenditure] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState({
    isOpen: false,
    expenditureId: null,
    expenditureName: ''
  });

  const API_BASE_URL = import.meta.env.VITE_ADMIN_API_URL;

  const getCurrencySymbol = () => {
    return '₹';
  };

  useEffect(() => {
    fetchExpenditures();
    fetchPackages();
    fetchHotels();
  }, []);

  const fetchExpenditures = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/expenditures/public`);

      if (response.ok) {
        const data = await response.json();
        setExpenditures(data);
      } else {
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const fetchPackages = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/packages/public`);

      if (response.ok) {
        const data = await response.json();
        setPackages(data);
      }
    } catch (error) {
    }
  };

  const fetchHotels = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/hotels/public`);

      if (response.ok) {
        const data = await response.json();
        console.log('Fetched hotels:', data);
        setHotels(data);
      }
    } catch (error) {
      console.log('Error fetching hotels:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('admin_token');
      const url = editingExpenditure 
        ? `${API_BASE_URL}/expenditures/${editingExpenditure._id}`
        : `${API_BASE_URL}/expenditures`;
      
      const method = editingExpenditure ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const result = await response.json();
        if (editingExpenditure) {
          setExpenditures(expenditures.map(exp => 
            exp._id === editingExpenditure._id ? result.expenditure : exp
          ));
        } else {
          setExpenditures([result.expenditure, ...expenditures]);
        }
        setShowModal(false);
        setEditingExpenditure(null);
        setFormData({
          package: '',
          packageExpenditure: '',
          packagePrice: '',
          packageProfit: ''
        });
        // Refresh the expenditures list
        fetchExpenditures();
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to save expenditure');
      }
    } catch (error) {
      alert('Failed to save expenditure');
    }
  };

  const handleEdit = (expenditure) => {
    setEditingExpenditure(expenditure);
    setFormData({
      package: expenditure.package._id,
      packageExpenditure: expenditure.packageExpenditure,
      packagePrice: expenditure.packagePrice,
      packageProfit: expenditure.packageProfit
    });
    setShowModal(true);
  };

  const handleDeleteClick = (expenditure) => {
    setDeleteDialog({
      isOpen: true,
      expenditureId: expenditure._id,
      expenditureName: expenditure.package?.packageName || 'Unknown Package'
    });
  };

  const handleDeleteConfirm = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`${API_BASE_URL}/expenditures/${deleteDialog.expenditureId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setExpenditures(expenditures.filter(exp => exp._id !== deleteDialog.expenditureId));
        // Refresh the expenditures list
        fetchExpenditures();
        setDeleteDialog({ isOpen: false, expenditureId: null, expenditureName: '' });
      } else {
        alert('Failed to delete expenditure');
      }
    } catch (error) {
      alert('Failed to delete expenditure');
    }
  };

  const calculateNights = (checkinDate, checkoutDate) => {
    if (!checkinDate || !checkoutDate) {
      return 0;
    }
    
    // Handle different date formats
    let checkin, checkout;
    
    try {
      // Try parsing as Date object first
      if (checkinDate instanceof Date) {
        checkin = checkinDate;
      } else {
        // Handle various date string formats
        const dateStr = checkinDate.toString();
        if (dateStr.includes('T')) {
          // ISO format
          checkin = new Date(dateStr);
        } else if (dateStr.includes('/')) {
          // MM/DD/YYYY or DD/MM/YYYY format
          const parts = dateStr.split('/');
          if (parts.length === 3) {
            // Try MM/DD/YYYY first
            checkin = new Date(parts[2], parts[0] - 1, parts[1]);
            if (isNaN(checkin.getTime())) {
              // Try DD/MM/YYYY
              checkin = new Date(parts[2], parts[1] - 1, parts[0]);
            }
          }
        } else if (dateStr.includes('-')) {
          // YYYY-MM-DD format
          checkin = new Date(dateStr);
        } else {
          // Try direct parsing
          checkin = new Date(dateStr);
        }
      }
      
      if (checkoutDate instanceof Date) {
        checkout = checkoutDate;
      } else {
        // Handle various date string formats
        const dateStr = checkoutDate.toString();
        if (dateStr.includes('T')) {
          // ISO format
          checkout = new Date(dateStr);
        } else if (dateStr.includes('/')) {
          // MM/DD/YYYY or DD/MM/YYYY format
          const parts = dateStr.split('/');
          if (parts.length === 3) {
            // Try MM/DD/YYYY first
            checkout = new Date(parts[2], parts[0] - 1, parts[1]);
            if (isNaN(checkout.getTime())) {
              // Try DD/MM/YYYY
              checkout = new Date(parts[2], parts[1] - 1, parts[0]);
            }
          }
        } else if (dateStr.includes('-')) {
          // YYYY-MM-DD format
          checkout = new Date(dateStr);
        } else {
          // Try direct parsing
          checkout = new Date(dateStr);
        }
      }
      
      // Check if dates are valid
      if (isNaN(checkin.getTime()) || isNaN(checkout.getTime())) {
        return 0;
      }
      
      // Calculate difference in days
      const diffTime = checkout.getTime() - checkin.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      // Ensure we don't return negative values
      const nights = Math.max(0, diffDays);
      return nights;
    } catch (error) {
      return 0;
    }
  };

  const calculateExpenditure = (selectedPackage) => {
    if (!selectedPackage) return { totalExpenditure: 0, breakdown: {} };

    // Debug logging for package data

    // Handle multiple hotels or single hotel
    let hotelEntries = [];
    
    if (selectedPackage.hotelEntries && selectedPackage.hotelEntries.length > 0) {
      // Use hotel entries from the package
      hotelEntries = selectedPackage.hotelEntries;
    } else if (selectedPackage.hotelName && selectedPackage.checkinDate && selectedPackage.checkoutDate) {
      // Create single hotel entry from package data
      hotelEntries = [{
        hotelName: selectedPackage.hotelName,
        checkinDate: selectedPackage.checkinDate,
        checkoutDate: selectedPackage.checkoutDate,
        noOfRooms: selectedPackage.noOfRooms || 1,
        roomCategory: selectedPackage.roomCategory || 'Standard',
        noOfExtraBed: selectedPackage.noOfExtraBed || 0,
        destination: selectedPackage.destination
      }];
    } else {
      // No valid hotel data found
      hotelEntries = [];
    }


    let totalRoomCost = 0;
    let totalExtraBedCost = 0;
    let totalNights = 0;
    let hotelBreakdowns = [];

    // Calculate costs for each hotel entry
    hotelEntries.forEach((hotelEntry, index) => {
      console.log(`Processing hotel entry ${index + 1}:`, hotelEntry);
      
      // Calculate nights for this hotel entry
      const nights = calculateNights(hotelEntry.checkinDate, hotelEntry.checkoutDate);
      totalNights += nights;
      
      // Get room category rate from selected hotel
      let selectedHotel = null;
      let roomRate = 0;
      
      // Try to find hotel by ID first, then by name
      if (typeof hotelEntry.hotelName === 'string') {
        // If hotelName is a string, it might be an ID or name
        selectedHotel = hotels.find(hotel => 
          hotel._id === hotelEntry.hotelName || 
          hotel.hotelName === hotelEntry.hotelName ||
          hotel._id.toString() === hotelEntry.hotelName ||
          (hotel._id && hotel._id.toString() === hotelEntry.hotelName.toString())
        );
      } else if (typeof hotelEntry.hotelName === 'object' && hotelEntry.hotelName !== null) {
        // If hotelName is an object (populated), use it directly
        selectedHotel = hotelEntry.hotelName;
        // Also try to find in hotels array in case it has more complete data
        if (selectedHotel && selectedHotel._id) {
          const foundInArray = hotels.find(hotel => 
            hotel._id && selectedHotel._id && hotel._id.toString() === selectedHotel._id.toString()
          );
          if (foundInArray && foundInArray.roomCategories && foundInArray.roomCategories.length > 0) {
            selectedHotel = foundInArray;
          }
        }
      }
      
      
      // Check if hotel data is properly populated
      if (selectedHotel && selectedHotel.roomCategories && selectedHotel.roomCategories.length > 0) {
        // Try exact match first
        let roomCategory = selectedHotel.roomCategories.find(
          cat => cat.category === hotelEntry.roomCategory
        );
        
        // If no exact match, try case-insensitive match
        if (!roomCategory && hotelEntry.roomCategory) {
          roomCategory = selectedHotel.roomCategories.find(
            cat => cat.category && cat.category.toLowerCase().trim() === hotelEntry.roomCategory.toLowerCase().trim()
          );
        }
        
        if (roomCategory) {
          roomRate = parseFloat(roomCategory.rate) || 0;
        }
      } else {
        // If no hotel data, try to get rates from package level
        if (selectedPackage.hotelName && selectedPackage.hotelName.roomCategories) {
          let roomCategory = selectedPackage.hotelName.roomCategories.find(
            cat => cat.category === hotelEntry.roomCategory
          );
          
          // Try case-insensitive match
          if (!roomCategory && hotelEntry.roomCategory) {
            roomCategory = selectedPackage.hotelName.roomCategories.find(
              cat => cat.category && cat.category.toLowerCase().trim() === hotelEntry.roomCategory.toLowerCase().trim()
            );
          }
          
          if (roomCategory) {
            roomRate = parseFloat(roomCategory.rate) || 0;
          }
        }
        
        // If still no rate found, use default rates based on room category
        if (roomRate === 0) {
          const defaultRates = {
            'C1': 100, 'C2': 150, 'C3': 200, 'C4': 250, 'C5': 300,
            'Standard': 100, 'Deluxe': 150, 'Premium': 200, 'Suite': 300,
            'Economy': 80, 'Business': 120, 'Executive': 180, 'Luxury': 400,
            'Presidential': 500, 'Villa': 600, 'Penthouse': 800
          };
          roomRate = defaultRates[hotelEntry.roomCategory] || defaultRates[hotelEntry.roomCategory?.toLowerCase()] || 0;
        }
      }

      // Calculate room cost (nights * room rate * number of rooms) - all in INR
      const noOfRooms = parseInt(hotelEntry.noOfRooms) || 1;
      const roomCost = nights * roomRate * noOfRooms;

      // Calculate extra bed cost
      const noOfExtraBeds = parseInt(hotelEntry.noOfExtraBed) || 0;
      let extraBedRate = 50; // Default rate
      
      // Get extra bed rate from hotel if available
      if (selectedHotel && selectedHotel.roomCategories) {
        // Try exact match first
        let roomCategory = selectedHotel.roomCategories.find(
          cat => cat.category === hotelEntry.roomCategory
        );
        
        // Try case-insensitive match if no exact match
        if (!roomCategory && hotelEntry.roomCategory) {
          roomCategory = selectedHotel.roomCategories.find(
            cat => cat.category && cat.category.toLowerCase().trim() === hotelEntry.roomCategory.toLowerCase().trim()
          );
        }
        
        if (roomCategory && roomCategory.extraBedRate) {
          extraBedRate = parseFloat(roomCategory.extraBedRate) || 50;
        }
      } else if (selectedPackage.hotelName && selectedPackage.hotelName.roomCategories) {
        // Try package level hotel data
        let roomCategory = selectedPackage.hotelName.roomCategories.find(
          cat => cat.category === hotelEntry.roomCategory
        );
        
        // Try case-insensitive match if no exact match
        if (!roomCategory && hotelEntry.roomCategory) {
          roomCategory = selectedPackage.hotelName.roomCategories.find(
            cat => cat.category && cat.category.toLowerCase().trim() === hotelEntry.roomCategory.toLowerCase().trim()
          );
        }
        
        if (roomCategory && roomCategory.extraBedRate) {
          extraBedRate = parseFloat(roomCategory.extraBedRate) || 50;
        }
      }
      
      // Use default extra bed rates if still not found
      if (extraBedRate === 50) {
        const defaultExtraBedRates = {
          'C1': 30, 'C2': 40, 'C3': 50, 'C4': 60, 'C5': 70,
          'Standard': 30, 'Deluxe': 40, 'Premium': 50, 'Suite': 70
        };
        extraBedRate = defaultExtraBedRates[hotelEntry.roomCategory] || 50;
      }
      
      // Calculate extra bed cost - all in INR
      const extraBedCost = nights * noOfExtraBeds * extraBedRate;

      // Add to totals
      totalRoomCost += roomCost;
      totalExtraBedCost += extraBedCost;

      // Store breakdown for this hotel
      hotelBreakdowns.push({
        hotelName: selectedHotel?.hotelName || hotelEntry.hotelName?.hotelName || 'Hotel ' + (index + 1),
        nights: nights,
        noOfRooms: noOfRooms,
        roomRate: roomRate,
        roomCost: Math.round(roomCost),
        noOfExtraBeds: noOfExtraBeds,
        extraBedRate: extraBedRate,
        extraBedCost: Math.round(extraBedCost),
        roomCategory: hotelEntry.roomCategory,
        destination: hotelEntry.destination?.destinationName || 'N/A'
      });
    });

    // Calculate vehicle cost (based on total nights across all hotels) - all in INR
    let vehicleCost = 0;
    
    if (selectedPackage.vehicle) {
      // Get vehicle rate from the vehicle reference (already in INR)
      const vehicleRate = parseFloat(selectedPackage.vehicle.vehicleRatePerDay) || 0;
      vehicleCost = totalNights * vehicleRate;
    }

    // Add additional services (these are typically in the same currency as the package)
    const additionalServices = [
      parseFloat(selectedPackage.cialParkingRate) || 0,
      parseFloat(selectedPackage.cialEntryRate) || 0,
      parseFloat(selectedPackage.bouquetRate) || 0,
      parseFloat(selectedPackage.simCardRate) || 0,
      parseFloat(selectedPackage.foodRate) || 0
    ];

    const additionalServicesTotal = additionalServices.reduce((sum, rate) => sum + rate, 0);
    const totalExpenditure = totalRoomCost + totalExtraBedCost + vehicleCost + additionalServicesTotal;

    return {
      totalExpenditure: Math.round(totalExpenditure),
      breakdown: {
        roomCost: Math.round(totalRoomCost),
        extraBedCost: Math.round(totalExtraBedCost),
        vehicleCost: Math.round(vehicleCost),
        additionalServices: Math.round(additionalServicesTotal),
        nights: totalNights,
        vehicleRate: selectedPackage.vehicle ? parseFloat(selectedPackage.vehicle.vehicleRatePerDay) || 0 : 0,
        vehicleName: selectedPackage.vehicle ? selectedPackage.vehicle.vehicleName : 'N/A',
        vehicleType: selectedPackage.vehicle ? selectedPackage.vehicle.vehicleType : 'N/A',
        hotelBreakdowns: hotelBreakdowns,
        totalHotels: hotelEntries.length,
        services: {
          cialParking: parseFloat(selectedPackage.cialParkingRate) || 0,
          cialEntry: parseFloat(selectedPackage.cialEntryRate) || 0,
          bouquet: parseFloat(selectedPackage.bouquetRate) || 0,
          simCard: parseFloat(selectedPackage.simCardRate) || 0,
          food: parseFloat(selectedPackage.foodRate) || 0
        }
      }
    };
  };

  const calculateProfit = (packagePrice, expenditure) => {
    const price = parseFloat(packagePrice) || 0;
    const exp = parseFloat(expenditure) || 0;
    return Math.round(price - exp);
  };

  const handlePackageChange = async (packageId) => {
    // First try to find the package in the current list
    let selectedPackage = packages.find(pkg => pkg._id === packageId);
    
    // If not found or if it seems incomplete, try to fetch fresh data
    if (!selectedPackage || !selectedPackage.hotelName || !selectedPackage.checkinDate) {
      try {
        const token = localStorage.getItem('admin_token');
        const response = await fetch(`${API_BASE_URL}/packages/${packageId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          const freshPackageData = await response.json();
          selectedPackage = freshPackageData;
        }
      } catch (error) {
        // Error fetching fresh package data
      }
    }
    
    if (selectedPackage) {
      console.log('Selected package for expenditure calculation:', selectedPackage);
      const expenditureResult = calculateExpenditure(selectedPackage);
      const packagePrice = selectedPackage.packagePrice;
      const calculatedProfit = calculateProfit(packagePrice, expenditureResult.totalExpenditure);
      
      setFormData({
        ...formData,
        package: packageId,
        packagePrice: packagePrice,
        packageExpenditure: expenditureResult.totalExpenditure.toString(),
        packageProfit: calculatedProfit.toString()
      });
      
      setExpenditureBreakdown(expenditureResult.breakdown);
    } else {
      setFormData({
        ...formData,
        package: packageId,
        packagePrice: '',
        packageExpenditure: '',
        packageProfit: ''
      });
      setExpenditureBreakdown({
        roomCost: 0,
        extraBedCost: 0,
        vehicleCost: 0,
        additionalServices: 0,
        totalExpenditure: 0,
        services: {
          cialParking: 0,
          cialEntry: 0,
          bouquet: 0,
          simCard: 0,
          food: 0
        }
      });
    }
  };

  // Pagination functions
  const getCurrentPageData = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return expenditures.slice(startIndex, endIndex);
  };

  const getTotalPages = () => {
    return Math.max(1, Math.ceil(expenditures.length / itemsPerPage));
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleViewDetails = (expenditure) => {
    if (expenditure.package?.hotelEntries) {
      expenditure.package.hotelEntries.forEach((entry, index) => {
      });
    }
    setSelectedExpenditure(expenditure);
    setShowDetailsModal(true);
  };

  const closeDetailsModal = () => {
    setShowDetailsModal(false);
    setSelectedExpenditure(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5B8424]"></div>
      </div>
    );
  }

  return (
    <div className="p-6 pb-24">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Expenditure Management</h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-[#5B8424] hover:bg-[#4a6b1f] text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <PlusIcon className="h-5 w-5" />
          Add Expenditure
        </button>
      </div>

      {/* Expenditures Table */}
      <div className="bg-[#121a14] rounded-lg border border-[#5B8424]/20 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#0f1310] border-b border-[#5B8424]/20">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">Package</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">Expenditure</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">Profit</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#5B8424]/10">
              {getCurrentPageData().length > 0 ? (
                getCurrentPageData().map((expenditure) => (
                <tr key={expenditure._id} className="hover:bg-[#0f1310]/50 cursor-pointer" onClick={() => handleViewDetails(expenditure)}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-white">
                      {expenditure.package?.packageCode}
                    </div>
                    <div className="text-sm text-white/60">
                      {expenditure.package?.nameOfGuest}
                    </div>
                    {expenditure.package?.hotelEntries && expenditure.package.hotelEntries.length > 0 && (
                      <div className="text-xs text-green-400 mt-1">
                        {expenditure.package.hotelEntries.length} Hotel{expenditure.package.hotelEntries.length > 1 ? 's' : ''}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                    ₹{expenditure.packageExpenditure}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                    ₹{expenditure.packagePrice}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                    ₹{expenditure.packageProfit}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewDetails(expenditure);
                        }}
                        className="text-blue-400 hover:text-blue-300 transition-colors"
                        title="View Details"
                      >
                        <EyeIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(expenditure);
                        }}
                        className="text-[#5B8424] hover:text-[#4a6b1f] transition-colors"
                        title="Edit"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteClick(expenditure);
                        }}
                        className="text-red-400 hover:text-red-300 transition-colors"
                        title="Delete"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <ChartBarIcon className="h-12 w-12 text-white/30 mx-auto" />
                      <div className="text-lg text-white/60 font-medium">No expenditures found</div>
                      <div className="text-sm text-white/40">Start by adding your first expenditure</div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Controls - Always Show */}
      <div className="mt-6 flex items-center justify-between">
        <div className="text-sm text-white/60">
          {expenditures.length > 0 ? (
            <>
              Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, expenditures.length)} of {expenditures.length} results
            </>
          ) : (
            <>
              Showing 0 of 0 results
            </>
          )}
        </div>
        
        {expenditures.length > 0 ? (
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-1 bg-[#0f1310] border border-[#5B8424]/30 rounded text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#5B8424]/10 transition-colors"
            >
              Previous
            </button>
            
            <div className="flex space-x-1">
              {Array.from({ length: getTotalPages() }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-3 py-1 rounded text-sm transition-colors ${
                    currentPage === page
                      ? 'bg-[#5B8424] text-white'
                      : 'bg-[#0f1310] border border-[#5B8424]/30 text-white hover:bg-[#5B8424]/10'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
            
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === getTotalPages()}
              className="px-3 py-1 bg-[#0f1310] border border-[#5B8424]/30 rounded text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#5B8424]/10 transition-colors"
            >
              Next
            </button>
          </div>
        ) : (
          <div className="flex items-center space-x-2">
            <button
              disabled
              className="px-3 py-1 bg-[#0f1310] border border-[#5B8424]/30 rounded text-white opacity-50 cursor-not-allowed"
            >
              Previous
            </button>
            
            <div className="flex space-x-1">
              <button
                disabled
                className="px-3 py-1 rounded text-sm bg-[#5B8424] text-white cursor-not-allowed"
              >
                1
              </button>
            </div>
            
            <button
              disabled
              className="px-3 py-1 bg-[#0f1310] border border-[#5B8424]/30 rounded text-white opacity-50 cursor-not-allowed"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#121a14] rounded-lg border border-[#5B8424]/20 p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-white mb-4">
              {editingExpenditure ? 'Edit Expenditure' : 'Add New Expenditure'}
            </h2>
            {formData.package && (
              <div className="mb-4 p-3 bg-[#5B8424]/10 border border-[#5B8424]/30 rounded-lg">
                <p className="text-sm text-white/80">
                  💡 Expenditure and profit will be automatically calculated when you select a package
                </p>
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                {/* Left Column */}
                <div className="space-y-6">
                  {/* Package Selection */}
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-2">
                      Package
                    </label>
                    <select
                      value={formData.package}
                      onChange={(e) => handlePackageChange(e.target.value)}
                      className="w-full px-3 py-2 bg-[#0f1310] border border-[#5B8424]/30 rounded-lg text-white focus:outline-none focus:border-[#5B8424]"
                      required
                    >
                      <option value="">Select a package</option>
                      {packages.map((pkg) => (
                        <option key={pkg._id} value={pkg._id}>
                          {pkg.packageCode} - {pkg.nameOfGuest}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Package Expenditure */}
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-2">
                      Package Expenditure (Auto-calculated)
                    </label>
                    <input
                      type="text"
                      value={formData.packageExpenditure ? `₹${formData.packageExpenditure}` : ''}
                      readOnly
                      className="w-full px-3 py-2 bg-[#0f1310]/50 border border-[#5B8424]/30 rounded-lg text-white cursor-not-allowed"
                      placeholder="Select a package to auto-calculate"
                    />
                    <p className="text-xs text-white/50 mt-1">
                      Calculated from: Room cost + Extra beds + Vehicle cost + Additional services
                    </p>
                  </div>

                  {/* Hotel Cost Details - Left Column */}
                  {formData.package && formData.packageExpenditure && expenditureBreakdown.hotelBreakdowns && (
                    <div className="p-4 bg-[#1a1a1a]/50 rounded border border-green-500/20">
                      <div className="font-medium text-green-400 mb-3 flex items-center">
                        <BuildingOfficeIcon className="h-5 w-5 mr-2 inline" /> Hotel Cost Details ({expenditureBreakdown.totalHotels} Hotel{expenditureBreakdown.totalHotels > 1 ? 's' : ''})
                      </div>
                      {expenditureBreakdown.hotelBreakdowns.some(hotel => hotel.hotelName.startsWith('Hotel ')) && (
                        <div className="mb-3 p-2 bg-yellow-900/20 border border-yellow-500/30 rounded text-xs text-yellow-300">
                          <ExclamationTriangleIcon className="h-4 w-4 inline mr-1" /> Some hotels are using default rates because hotel data is missing. Please ensure hotel information is properly configured in the package.
                        </div>
                      )}
                      <div className="space-y-3">
                        {expenditureBreakdown.hotelBreakdowns.map((hotel, index) => (
                          <div key={index} className="p-3 bg-[#0f1310]/50 rounded border border-green-500/10">
                            <div className="font-medium text-green-300 text-sm mb-2">
                              Hotel {index + 1}: {hotel.hotelName}
                              {hotel.hotelName === 'Hotel ' + (index + 1) && (
                                <span className="text-yellow-400 text-xs ml-2">(Using Default Rates)</span>
                              )}
                            </div>
                            <div className="space-y-1 text-xs">
                              <div className="flex justify-between">
                                <span>Nights:</span>
                                <span className="text-green-300">{hotel.nights}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Rooms:</span>
                                <span className="text-green-300">{hotel.noOfRooms}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Room Rate:</span>
                                <span className="text-green-300">₹{hotel.roomRate}/night</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Extra Beds:</span>
                                <span className="text-green-300">{hotel.noOfExtraBeds}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Extra Bed Rate:</span>
                                <span className="text-green-300">₹{hotel.extraBedRate}/night</span>
                              </div>
                              <div className="border-t border-green-500/20 pt-1 mt-2">
                                <div className="flex justify-between text-xs font-medium">
                                  <span>Hotel Total:</span>
                                  <span className="text-green-300">₹{hotel.roomCost + hotel.extraBedCost}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                        <div className="border-t border-green-500/20 pt-2 mt-3">
                          <div className="flex justify-between text-sm">
                            <span>Total Nights:</span>
                            <span className="text-yellow-300">{expenditureBreakdown.nights}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Total Room Cost:</span>
                            <span className="text-green-300">₹{expenditureBreakdown.roomCost}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Total Extra Bed Cost:</span>
                            <span className="text-green-300">₹{expenditureBreakdown.extraBedCost}</span>
                          </div>
                          <div className="flex justify-between text-sm font-medium border-t border-green-500/20 pt-1 mt-1">
                            <span>Total Hotel Cost:</span>
                            <span className="text-green-300">₹{expenditureBreakdown.roomCost + expenditureBreakdown.extraBedCost}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}


                  {/* Vehicle Cost Details - Left Column */}
                  {formData.package && formData.packageExpenditure && expenditureBreakdown.vehicleCost > 0 && (
                    <div className="p-4 bg-[#1a1a1a]/50 rounded border border-orange-500/20">
                      <div className="font-medium text-orange-400 mb-3 flex items-center">
                        <TruckIcon className="h-5 w-5 mr-2 inline" /> Vehicle Cost Details
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm">Vehicle:</span>
                          <span className="font-medium text-orange-300">{expenditureBreakdown.vehicleName} ({expenditureBreakdown.vehicleType})</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Rate:</span>
                          <span className="font-medium text-orange-300">₹{expenditureBreakdown.vehicleRate}/day</span>
                        </div>
                        <div className="border-t border-orange-500/20 pt-2 mt-3">
                          <div className="flex justify-between text-sm font-medium">
                            <span>Vehicle Cost:</span>
                            <span className="text-orange-300">₹{expenditureBreakdown.vehicleCost}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Package Price */}
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-2">
                      Package Price (From Package)
                    </label>
                    <input
                      type="text"
                      value={formData.packagePrice ? `₹${formData.packagePrice}` : ''}
                      readOnly
                      className="w-full px-3 py-2 bg-[#0f1310]/50 border border-[#5B8424]/30 rounded-lg text-white cursor-not-allowed"
                      placeholder="Select a package to load price"
                    />
                  </div>

                  {/* Package Profit */}
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-2">
                      Package Profit (Auto-calculated)
                    </label>
                    <input
                      type="text"
                      value={formData.packageProfit ? `₹${formData.packageProfit}` : ''}
                      readOnly
                      className={`w-full px-3 py-2 bg-[#0f1310]/50 border rounded-lg text-white cursor-not-allowed ${
                        parseFloat(formData.packageProfit) >= 0 
                          ? 'border-green-500/50 text-green-400' 
                          : 'border-red-500/50 text-red-400'
                      }`}
                      placeholder="Select a package to calculate profit"
                    />
                    <p className="text-xs text-white/50 mt-1">
                      Profit = Package Price - Package Expenditure
                    </p>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                  {/* Additional Services Details - Right Column */}
                  {formData.package && formData.packageExpenditure && (
                    <div className="p-4 bg-[#1a1a1a]/50 rounded border border-purple-500/20">
                      <div className="font-medium text-purple-400 mb-3 flex items-center">
                        <AdjustmentsHorizontalIcon className="h-5 w-5 mr-2 inline" /> Additional Services Details
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>CIAL Parking:</span>
                          <span className="text-purple-300">₹{expenditureBreakdown.services?.cialParking || 0}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>CIAL Entry:</span>
                          <span className="text-purple-300">₹{expenditureBreakdown.services?.cialEntry || 0}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Bouquet:</span>
                          <span className="text-purple-300">₹{expenditureBreakdown.services?.bouquet || 0}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>SIM Card:</span>
                          <span className="text-purple-300">₹{expenditureBreakdown.services?.simCard || 0}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Food:</span>
                          <span className="text-purple-300">₹{expenditureBreakdown.services?.food || 0}</span>
                        </div>
                        <div className="border-t border-purple-500/20 pt-2 mt-3">
                          <div className="flex justify-between text-sm font-medium">
                            <span>Total Services:</span>
                            <span className="text-purple-300">₹{expenditureBreakdown.additionalServices}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Summary Section */}
                  {formData.package && formData.packageExpenditure && (
                    <div className="p-4 bg-[#1a1a1a]/30 border border-[#5B8424]/30 rounded-lg">
                      <div className="font-medium text-white mb-3 flex items-center">
                        <ClipboardDocumentListIcon className="h-5 w-5 mr-2 inline" /> Expenditure Summary
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="text-center p-3 bg-green-900/20 border border-green-500/30 rounded">
                          <div className="text-xs text-green-300 mb-1">Room Cost</div>
                          <div className="text-lg font-bold text-green-400">₹{expenditureBreakdown.roomCost}</div>
                        </div>
                        <div className="text-center p-3 bg-blue-900/20 border border-blue-500/30 rounded">
                          <div className="text-xs text-blue-300 mb-1">Extra Beds</div>
                          <div className="text-lg font-bold text-blue-400">₹{expenditureBreakdown.extraBedCost}</div>
                        </div>
                        {expenditureBreakdown.vehicleCost > 0 && (
                          <div className="text-center p-3 bg-orange-900/20 border border-orange-500/30 rounded">
                            <div className="text-xs text-orange-300 mb-1">Vehicle</div>
                            <div className="text-lg font-bold text-orange-400">₹{expenditureBreakdown.vehicleCost}</div>
                          </div>
                        )}
                        <div className="text-center p-3 bg-purple-900/20 border border-purple-500/30 rounded">
                          <div className="text-xs text-purple-300 mb-1">Services</div>
                          <div className="text-lg font-bold text-purple-400">₹{expenditureBreakdown.additionalServices}</div>
                        </div>
                        <div className={`text-center p-3 bg-yellow-900/20 border border-yellow-500/30 rounded ${expenditureBreakdown.vehicleCost > 0 ? 'col-span-2' : 'col-span-2'}`}>
                          <div className="text-xs text-yellow-300 mb-1">Total</div>
                          <div className="text-lg font-bold text-yellow-400">₹{formData.packageExpenditure}</div>
                        </div>
                      </div>
                    </div>
                  )}

                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">
                  Package Price (From Package)
                </label>
                <input
                  type="text"
                  value={formData.packagePrice ? `₹${formData.packagePrice}` : ''}
                  readOnly
                  className="w-full px-3 py-2 bg-[#0f1310]/50 border border-[#5B8424]/30 rounded-lg text-white cursor-not-allowed"
                  placeholder="Select a package to load price"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">
                  Package Profit (Auto-calculated)
                </label>
                <input
                  type="text"
                  value={formData.packageProfit ? `₹${formData.packageProfit}` : ''}
                  readOnly
                  className={`w-full px-3 py-2 bg-[#0f1310]/50 border rounded-lg text-white cursor-not-allowed ${
                    parseFloat(formData.packageProfit) >= 0 
                      ? 'border-green-500/50 text-green-400' 
                      : 'border-red-500/50 text-red-400'
                  }`}
                  placeholder="Select a package to calculate profit"
                />
                <p className="text-xs text-white/50 mt-1">
                  Profit = Package Price - Package Expenditure
                </p>
              </div>
              
              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-[#5B8424] hover:bg-[#4a6b1f] text-white px-4 py-2 rounded-lg transition-colors"
                >
                  {editingExpenditure ? 'Update' : 'Create'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingExpenditure(null);
                    setFormData({
                      package: '',
                      packageExpenditure: '',
                      packagePrice: '',
                      packageProfit: ''
                    });
                    setExpenditureBreakdown({
                      roomCost: 0,
                      extraBedCost: 0,
                      vehicleCost: 0,
                      additionalServices: 0,
                      totalExpenditure: 0,
                      services: {
                        cialParking: 0,
                        cialEntry: 0,
                        bouquet: 0,
                        simCard: 0,
                        food: 0
                      }
                    });
                  }}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteDialog.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0">
                <TrashIcon className="w-8 h-8 text-red-500" />
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-medium text-white">Delete Expenditure</h3>
                <p className="text-sm text-gray-400">
                  Are you sure you want to delete expenditure for "{deleteDialog.expenditureName}"? This action cannot be undone.
                </p>
              </div>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={() => setDeleteDialog({ isOpen: false, expenditureId: null, expenditureName: '' })}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {showDetailsModal && selectedExpenditure && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#121a14] rounded-lg border border-[#5B8424]/20 p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white flex items-center">
                <ChartBarIcon className="h-6 w-6 mr-2 inline" /> Expenditure Details
              </h2>
              <button
                onClick={closeDetailsModal}
                className="text-white/60 hover:text-white transition-colors"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Package Information */}
              <div className="space-y-4">
                <div className="p-4 bg-[#1a1a1a]/50 rounded border border-[#5B8424]/20">
                  <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
                    <CubeIcon className="h-6 w-6 mr-2 inline" /> Package Information
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-white/70">Package Code:</span>
                      <span className="text-white font-medium">{selectedExpenditure.package?.packageCode}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/70">Guest Name:</span>
                      <span className="text-white font-medium">{selectedExpenditure.package?.nameOfGuest}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/70">Phone:</span>
                      <span className="text-white font-medium">{selectedExpenditure.package?.phoneNumber || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/70">Nationality:</span>
                      <span className="text-white font-medium">{selectedExpenditure.package?.nationality || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/70">No. of Pax:</span>
                      <span className="text-white font-medium">{selectedExpenditure.package?.noOfPax || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/70">Children:</span>
                      <span className="text-white font-medium">{selectedExpenditure.package?.noOfChildren || '0'}</span>
                    </div>
                  </div>
                </div>

                {/* Multiple Hotels Information */}
                {selectedExpenditure.package?.hotelEntries && selectedExpenditure.package.hotelEntries.length > 0 ? (
                  <div className="space-y-4">
                    {selectedExpenditure.package.hotelEntries.map((hotelEntry, index) => (
                      <div key={hotelEntry.id || index} className="p-4 bg-[#1a1a1a]/50 rounded border border-[#5B8424]/20">
                        <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
                          <BuildingOfficeIcon className="h-6 w-6 mr-2 inline" /> Hotel {index + 1} Information
                        </h3>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-white/70">Hotel Name:</span>
                            <span className="text-white font-medium">{hotelEntry.hotelName?.hotelName || 'N/A'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-white/70">Destination:</span>
                            <span className="text-white font-medium">{hotelEntry.destination?.destinationName || 'N/A'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-white/70">Check-in:</span>
                            <span className="text-white font-medium">
                              {hotelEntry.checkinDate ? new Date(hotelEntry.checkinDate).toLocaleDateString() : 'N/A'}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-white/70">Check-out:</span>
                            <span className="text-white font-medium">
                              {hotelEntry.checkoutDate ? new Date(hotelEntry.checkoutDate).toLocaleDateString() : 'N/A'}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-white/70">Rooms:</span>
                            <span className="text-white font-medium">{hotelEntry.noOfRooms || 'N/A'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-white/70">Room Category:</span>
                            <span className="text-white font-medium">{hotelEntry.roomCategory || 'N/A'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-white/70">Extra Beds:</span>
                            <span className="text-white font-medium">{hotelEntry.noOfExtraBed || '0'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-white/70">Nights:</span>
                            <span className="text-white font-medium">
                              {hotelEntry.checkinDate && hotelEntry.checkoutDate 
                                ? calculateNights(hotelEntry.checkinDate, hotelEntry.checkoutDate)
                                : 'N/A'
                              }
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 bg-[#1a1a1a]/50 rounded border border-[#5B8424]/20">
                    <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
                      <BuildingOfficeIcon className="h-6 w-6 mr-2 inline" /> Hotel Information
                    </h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-white/70">Hotel Name:</span>
                        <span className="text-white font-medium">{selectedExpenditure.package?.hotelName?.hotelName || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/70">Check-in:</span>
                        <span className="text-white font-medium">
                          {selectedExpenditure.package?.checkinDate ? new Date(selectedExpenditure.package.checkinDate).toLocaleDateString() : 'N/A'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/70">Check-out:</span>
                        <span className="text-white font-medium">
                          {selectedExpenditure.package?.checkoutDate ? new Date(selectedExpenditure.package.checkoutDate).toLocaleDateString() : 'N/A'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/70">Rooms:</span>
                        <span className="text-white font-medium">{selectedExpenditure.package?.noOfRooms || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/70">Room Category:</span>
                        <span className="text-white font-medium">{selectedExpenditure.package?.roomCategory || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/70">Extra Beds:</span>
                        <span className="text-white font-medium">{selectedExpenditure.package?.noOfExtraBed || '0'}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Financial Information */}
              <div className="space-y-4">
                <div className="p-4 bg-[#1a1a1a]/50 rounded border border-green-500/20">
                  <h3 className="text-lg font-semibold text-green-400 mb-3 flex items-center">
                    <BanknotesIcon className="h-6 w-6 mr-2 inline" /> Financial Summary
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-green-900/20 rounded">
                      <span className="text-white/70">Package Price:</span>
                      <span className="text-green-400 font-bold text-lg">
                        ₹{selectedExpenditure.packagePrice}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-red-900/20 rounded">
                      <span className="text-white/70">Total Expenditure:</span>
                      <span className="text-red-400 font-bold text-lg">
                        ₹{selectedExpenditure.packageExpenditure}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-yellow-900/20 rounded">
                      <span className="text-white/70">Net Profit:</span>
                      <span className={`font-bold text-lg ${
                        parseFloat(selectedExpenditure.packageProfit) >= 0 ? 'text-green-400' : 'text-red-400'
                      }`}>
                        ₹{selectedExpenditure.packageProfit}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Hotel Summary for Multiple Hotels */}
                {selectedExpenditure.package?.hotelEntries && selectedExpenditure.package.hotelEntries.length > 1 && (
                  <div className="p-4 bg-[#1a1a1a]/50 rounded border border-blue-500/20">
                    <h3 className="text-lg font-semibold text-blue-400 mb-3 flex items-center">
                      <BuildingOfficeIcon className="h-6 w-6 mr-2 inline" /> Hotels Summary
                    </h3>
                    <div className="space-y-2">
                      {selectedExpenditure.package.hotelEntries.map((hotelEntry, index) => (
                        <div key={hotelEntry.id || index} className="flex justify-between items-center p-2 bg-blue-900/20 rounded">
                          <div className="flex flex-col">
                            <span className="text-white font-medium text-sm">Hotel {index + 1}</span>
                            <span className="text-white/60 text-xs">{hotelEntry.hotelName?.hotelName || 'N/A'}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-blue-300 text-sm">
                              {hotelEntry.checkinDate && hotelEntry.checkoutDate 
                                ? calculateNights(hotelEntry.checkinDate, hotelEntry.checkoutDate)
                                : 'N/A'
                              } nights
                            </span>
                            <div className="text-white/60 text-xs">
                              {hotelEntry.noOfRooms} room{hotelEntry.noOfRooms > 1 ? 's' : ''}
                              {hotelEntry.noOfExtraBed > 0 && `, ${hotelEntry.noOfExtraBed} extra bed${hotelEntry.noOfExtraBed > 1 ? 's' : ''}`}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="p-4 bg-[#1a1a1a]/50 rounded border border-purple-500/20">
                  <h3 className="text-lg font-semibold text-purple-400 mb-3 flex items-center">
                    <AdjustmentsHorizontalIcon className="h-6 w-6 mr-2 inline" /> Additional Services
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-white/70">CIAL Parking:</span>
                      <span className="text-white font-medium">₹{selectedExpenditure.package?.cialParkingRate || '0'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/70">CIAL Entry:</span>
                      <span className="text-white font-medium">₹{selectedExpenditure.package?.cialEntryRate || '0'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/70">Bouquet:</span>
                      <span className="text-white font-medium">₹{selectedExpenditure.package?.bouquetRate || '0'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/70">SIM Card:</span>
                      <span className="text-white font-medium">₹{selectedExpenditure.package?.simCardRate || '0'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/70">Food:</span>
                      <span className="text-white font-medium">₹{selectedExpenditure.package?.foodRate || '0'}</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-[#1a1a1a]/50 rounded border border-blue-500/20">
                  <h3 className="text-lg font-semibold text-blue-400 mb-3 flex items-center">
                    <TruckIcon className="h-6 w-6 mr-2 inline" /> Transportation
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-white/70">Driver Name:</span>
                      <span className="text-white font-medium">{selectedExpenditure.package?.nameOfDriver || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/70">Driver Phone:</span>
                      <span className="text-white font-medium">{selectedExpenditure.package?.phoneNumberOfDriver || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/70">Vehicle:</span>
                      <span className="text-white font-medium">
                        {selectedExpenditure.package?.vehicle?.vehicleName || 'N/A'} 
                        {selectedExpenditure.package?.vehicle?.vehicleType && ` (${selectedExpenditure.package.vehicle.vehicleType})`}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/70">Vehicle Rate:</span>
                      <span className="text-white font-medium">
                        {selectedExpenditure.package?.vehicle?.vehicleRatePerDay 
                          ? `${getCurrencySymbol()}${selectedExpenditure.package.vehicle.vehicleRatePerDay}/day`
                          : 'N/A'
                        }
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/70">Registration:</span>
                      <span className="text-white font-medium">{selectedExpenditure.package?.regNumberOfVehicle || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={closeDetailsModal}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => {
                  closeDetailsModal();
                  handleEdit(selectedExpenditure);
                }}
                className="px-4 py-2 bg-[#5B8424] hover:bg-[#4a6b1f] text-white rounded-lg transition-colors"
              >
                Edit Expenditure
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpenditureManagementPage;
