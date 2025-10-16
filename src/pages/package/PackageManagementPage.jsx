import React, { useState, useEffect } from 'react';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  MagnifyingGlassIcon, 
  XMarkIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  EyeIcon,
  UserIcon,
  PhoneIcon,
  CalendarIcon,
  BuildingOfficeIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  TruckIcon,
  ClockIcon,
  PaperAirplaneIcon
} from '@heroicons/react/24/outline';

const PackageManagementPage = () => {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingPackage, setEditingPackage] = useState(null);
  const [hotels, setHotels] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [destinations, setDestinations] = useState([]);
  const [nationalities, setNationalities] = useState([]);
  const [selectedHotel, setSelectedHotel] = useState(null);
  const [roomCategories, setRoomCategories] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, packageId: null, packageCode: '' });
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [showPackageDetails, setShowPackageDetails] = useState(false);
  const [hotelEntries, setHotelEntries] = useState([]);
  const itemsPerPage = 10;

  const currencies = [
    { value: 'USD', label: 'USD ($)', symbol: '$' },
    { value: 'EUR', label: 'EUR (€)', symbol: '€' },
    { value: 'GBP', label: 'GBP (£)', symbol: '£' },
    { value: 'INR', label: 'INR (₹)', symbol: '₹' },
    { value: 'MYR', label: 'MYR (RM)', symbol: 'RM' },
    { value: 'LKR', label: 'LKR (Rs)', symbol: 'Rs' },
    { value: 'AED', label: 'AED (د.إ)', symbol: 'د.إ' },
    { value: 'SGD', label: 'SGD (S$)', symbol: 'S$' },
    { value: 'JPY', label: 'JPY (¥)', symbol: '¥' },
    { value: 'AUD', label: 'AUD (A$)', symbol: 'A$' }
  ];

  const getCurrencySymbol = (currencyCode) => {
    const currency = currencies.find(c => c.value === currencyCode);
    return currency ? currency.symbol : '$';
  };

  // Form state
  const [formData, setFormData] = useState({
    nameOfGuest: '',
    phoneNumber: '',
    nationality: '',
    noOfPax: '',
    noOfChildren: '',
    dateOfArrival: '',
    cityOfArrival: '',
    timeOfArrival: '',
    arrivalFlight: '',
    dateOfDeparture: '',
    cityOfDeparture: '',
    timeOfDeparture: '',
    departureFlight: '',
    packagePrice: '',
    currency: 'USD',
    packageCode: '',
    nameOfDriver: '',
    phoneNumberOfDriver: '',
    vehicle: '',
    regNumberOfVehicle: '',
    cialParkingRate: '',
    cialEntryRate: '',
    bouquetRate: '',
    simCardRate: '',
    foodRate: '',
    nameOfTourExecutive: '',
    nameOfReservationOfficer: ''
  });

  useEffect(() => {
    fetchPackages();
    fetchHotels();
    fetchVehicles();
    fetchDestinations();
    fetchNationalities();
  }, []);

  const API_BASE_URL = import.meta.env.VITE_ADMIN_API_URL
  const fetchPackages = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`${API_BASE_URL}/packages`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setPackages(data);
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const fetchHotels = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`${API_BASE_URL}/hotels/for-packages`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setHotels(data);
      }
    } catch (error) {
    }
  };

  const fetchVehicles = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/vehicles/public`);
      
      if (response.ok) {
        const data = await response.json();
        setVehicles(data);
      }
    } catch (error) {
    }
  };

  const fetchDestinations = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/bookings/destinations`);
      if (response.ok) {
        const data = await response.json();
        setDestinations(data);
      }
    } catch (error) {
    }
  };

  const fetchNationalities = async () => {
    try {
      const response = await fetch('https://restcountries.com/v3.1/all?fields=name,demonyms');
      if (response.ok) {
        const data = await response.json();
        const nationalityList = data.map(country => ({
          name: country.name.common,
          demonym: country.demonyms?.eng?.m || country.name.common
        })).sort((a, b) => a.demonym.localeCompare(b.demonym));
        setNationalities(nationalityList);
      }
    } catch (error) {
      // Fallback to common nationalities if API fails
      setNationalities([
        { name: 'United States', demonym: 'American' },
        { name: 'United Kingdom', demonym: 'British' },
        { name: 'Canada', demonym: 'Canadian' },
        { name: 'Australia', demonym: 'Australian' },
        { name: 'Germany', demonym: 'German' },
        { name: 'France', demonym: 'French' },
        { name: 'Japan', demonym: 'Japanese' },
        { name: 'China', demonym: 'Chinese' },
        { name: 'India', demonym: 'Indian' },
        { name: 'Brazil', demonym: 'Brazilian' }
      ]);
    }
  };

  // Hotel entries management functions
  const addHotelEntry = () => {
    const newEntry = {
      id: Date.now(), // Simple unique ID
      hotelName: '',
      destination: '',
      checkinDate: '',
      checkoutDate: '',
      noOfRooms: '',
      roomCategory: '',
      noOfExtraBed: ''
    };
    setHotelEntries([...hotelEntries, newEntry]);
  };

  const removeHotelEntry = (entryId) => {
    setHotelEntries(hotelEntries.filter(entry => entry.id !== entryId));
  };

  const updateHotelEntry = (entryId, field, value) => {
    setHotelEntries(hotelEntries.map(entry => {
      if (entry.id === entryId) {
        const updatedEntry = { ...entry, [field]: value };
        
        // Auto-populate destination when hotel is selected
        if (field === 'hotelName') {
          const selectedHotelData = hotels.find(hotel => hotel._id === value);
          if (selectedHotelData) {
            updatedEntry.destination = selectedHotelData.destination?._id || '';
            updatedEntry.roomCategory = ''; // Reset room category
          }
        }
        
        return updatedEntry;
      }
      return entry;
    }));
  };

  const getRoomCategoriesForHotel = (hotelId) => {
    const hotel = hotels.find(h => h._id === hotelId);
    return hotel?.roomCategories || [];
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('admin_token');
      const url = editingPackage 
        ? `${API_BASE_URL}/packages/${editingPackage._id}`
        : `${API_BASE_URL}/packages`;
      
      const method = editingPackage ? 'PUT' : 'POST';
      
      // Remove packageCode from form data for new packages (let backend generate it)
      const submitData = { 
        ...formData, 
        hotelEntries: hotelEntries 
      };
      if (!editingPackage) {
        delete submitData.packageCode;
      }
      
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(submitData)
      });

      if (response.ok) {
        setShowModal(false);
        setEditingPackage(null);
        resetForm();
        fetchPackages();
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.message}${errorData.missingFields ? '\nMissing fields: ' + errorData.missingFields.join(', ') : ''}`);
      }
    } catch (error) {
      alert('Error saving package: ' + error.message);
    }
  };

  const handleEdit = (pkg) => {
    setEditingPackage(pkg);
    setFormData({
      nameOfGuest: pkg.nameOfGuest || '',
      phoneNumber: pkg.phoneNumber || '',
      nationality: pkg.nationality || '',
      noOfPax: pkg.noOfPax || '',
      noOfChildren: pkg.noOfChildren || '',
      dateOfArrival: pkg.dateOfArrival ? new Date(pkg.dateOfArrival).toISOString().split('T')[0] : '',
      cityOfArrival: pkg.cityOfArrival || '',
      timeOfArrival: pkg.timeOfArrival || '',
      arrivalFlight: pkg.arrivalFlight || '',
      dateOfDeparture: pkg.dateOfDeparture ? new Date(pkg.dateOfDeparture).toISOString().split('T')[0] : '',
      cityOfDeparture: pkg.cityOfDeparture || '',
      timeOfDeparture: pkg.timeOfDeparture || '',
      departureFlight: pkg.departureFlight || '',
      packagePrice: pkg.packagePrice || '',
      currency: pkg.currency || 'USD',
      packageCode: pkg.packageCode || '',
      nameOfDriver: pkg.nameOfDriver || '',
      phoneNumberOfDriver: pkg.phoneNumberOfDriver || '',
      vehicle: pkg.vehicle?._id || '',
      regNumberOfVehicle: pkg.regNumberOfVehicle || '',
      cialParkingRate: pkg.cialParkingRate || '',
      cialEntryRate: pkg.cialEntryRate || '',
      bouquetRate: pkg.bouquetRate || '',
      simCardRate: pkg.simCardRate || '',
      foodRate: pkg.foodRate || '',
      nameOfTourExecutive: pkg.nameOfTourExecutive || '',
      nameOfReservationOfficer: pkg.nameOfReservationOfficer || ''
    });
    
    // Populate hotel entries
    if (pkg.hotelEntries && pkg.hotelEntries.length > 0) {
      setHotelEntries(pkg.hotelEntries.map((entry, index) => ({
        id: entry.id || Date.now() + index,
        hotelName: entry.hotelName?._id || entry.hotelName || '',
        destination: entry.destination?._id || entry.destination || '',
        checkinDate: entry.checkinDate ? new Date(entry.checkinDate).toISOString().split('T')[0] : '',
        checkoutDate: entry.checkoutDate ? new Date(entry.checkoutDate).toISOString().split('T')[0] : '',
        noOfRooms: entry.noOfRooms || '',
        roomCategory: entry.roomCategory || '',
        noOfExtraBed: entry.noOfExtraBed || ''
      })));
    } else {
      // Fallback for old packages with single hotel
      setHotelEntries([{
        id: Date.now(),
        hotelName: pkg.hotelName?._id || '',
        destination: pkg.destination?._id || '',
        checkinDate: pkg.checkinDate ? new Date(pkg.checkinDate).toISOString().split('T')[0] : '',
        checkoutDate: pkg.checkoutDate ? new Date(pkg.checkoutDate).toISOString().split('T')[0] : '',
        noOfRooms: pkg.noOfRooms || '',
        roomCategory: pkg.roomCategory || '',
        noOfExtraBed: pkg.noOfExtraBed || ''
      }]);
    }
    
    setShowModal(true);
  };

  const handleDeleteClick = (pkg) => {
    setDeleteDialog({
      isOpen: true,
      packageId: pkg._id,
      packageCode: pkg.packageCode
    });
  };

  const handleDeleteConfirm = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`${API_BASE_URL}/packages/${deleteDialog.packageId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setPackages(packages.filter(pkg => pkg._id !== deleteDialog.packageId));
        setDeleteDialog({ isOpen: false, packageId: null, packageCode: '' });
      }
    } catch (error) {
    }
  };

  const handlePackageClick = (pkg) => {
    setSelectedPackage(pkg);
    setShowPackageDetails(true);
  };

  const closePackageDetails = () => {
    setShowPackageDetails(false);
    setSelectedPackage(null);
  };

  const resetForm = () => {
    setFormData({
      nameOfGuest: '',
      phoneNumber: '',
      nationality: '',
      noOfPax: '',
      noOfChildren: '',
      dateOfArrival: '',
      cityOfArrival: '',
      timeOfArrival: '',
      arrivalFlight: '',
      dateOfDeparture: '',
      cityOfDeparture: '',
      timeOfDeparture: '',
      departureFlight: '',
      packagePrice: '',
      currency: 'USD',
      packageCode: '',
      nameOfDriver: '',
      phoneNumberOfDriver: '',
      vehicle: '',
      regNumberOfVehicle: '',
      cialParkingRate: '',
      cialEntryRate: '',
      bouquetRate: '',
      simCardRate: '',
      foodRate: '',
      nameOfTourExecutive: '',
      nameOfReservationOfficer: ''
    });
    setHotelEntries([]);
  };

  const filteredPackages = packages.filter(pkg =>
    pkg.nameOfGuest?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pkg.packageCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pkg.phoneNumber?.includes(searchTerm)
  );

  // Pagination logic
  const totalPages = Math.ceil(filteredPackages.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentPackages = filteredPackages.slice(startIndex, endIndex);

  // Reset to page 1 when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="text-white/60 text-center py-8">Loading...</div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-2">Package Management</h1>
        <p className="text-gray-400">Manage travel packages</p>
      </div>

      <div className="bg-gray-800 rounded-lg p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search packages by guest name, package code, or phone number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <button
            onClick={() => {
              setEditingPackage(null);
              resetForm();
              setShowModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
          >
            <PlusIcon className="h-5 w-5" />
            Add Package
          </button>
        </div>
      </div>

      {/* Packages List */}
      <div className="bg-gray-800 rounded-lg shadow overflow-hidden">
        {currentPackages.length === 0 ? (
          <div className="text-center py-12">
            <UserIcon className="h-12 w-12 text-gray-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">No Packages Found</h3>
            <p className="text-gray-400">
              {searchTerm 
                ? 'Try adjusting your search criteria' 
                : 'No packages have been created yet.'
              }
            </p>
            {!searchTerm && (
              <button
                onClick={() => {
                  setEditingPackage(null);
                  resetForm();
                  setShowModal(true);
                }}
                className="mt-4 bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition-colors"
              >
                Add Package
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-gray-700">
            {currentPackages.map((pkg) => (
              <div 
                key={pkg._id} 
                className="p-4 hover:bg-gray-700 transition-colors border-l-4 border-l-transparent hover:border-l-green-500 cursor-pointer"
                onClick={() => handlePackageClick(pkg)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="flex-shrink-0">
                      <UserIcon className="h-8 w-8 text-green-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-base font-semibold text-white truncate">
                          {pkg.nameOfGuest}
                        </h3>
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {pkg.packageCode}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                        <div className="flex items-center gap-2 text-gray-300">
                          <PhoneIcon className="h-4 w-4 text-gray-500 flex-shrink-0" />
                          <span className="truncate">{pkg.phoneNumber}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-300">
                          <BuildingOfficeIcon className="h-4 w-4 text-gray-500 flex-shrink-0" />
                          <span className="truncate">
                            {pkg.hotelEntries && pkg.hotelEntries.length > 0 
                              ? `${pkg.hotelEntries.length} Hotel${pkg.hotelEntries.length > 1 ? 's' : ''}`
                              : pkg.hotelName?.hotelName || 'N/A'
                            }
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-300">
                          <MapPinIcon className="h-4 w-4 text-gray-500 flex-shrink-0" />
                          <span className="truncate">{pkg.destination?.destinationName}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-300">
                          <CurrencyDollarIcon className="h-4 w-4 text-gray-500 flex-shrink-0" />
                          <span className="truncate">{getCurrencySymbol(pkg.currency)}{pkg.packagePrice}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex-shrink-0 ml-4 flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handlePackageClick(pkg)
                      }}
                      className="p-2 text-gray-400 hover:text-blue-500 transition-colors"
                      title="View Details"
                    >
                      <EyeIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleEdit(pkg)
                      }}
                      className="p-2 text-gray-400 hover:text-green-500 transition-colors"
                      title="Edit"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDeleteClick(pkg)
                      }}
                      className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                      title="Delete"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {currentPackages.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-lg">No packages found</div>
          <div className="text-gray-500 text-sm mt-2">
            {searchTerm ? 'Try adjusting your search criteria' : 'No packages have been created yet'}
          </div>
        </div>
      )}

      {/* Pagination */}
      {filteredPackages.length > 0 && (
        <div className="flex items-center justify-between bg-gray-800 border border-gray-700 rounded-lg p-3 mt-6">
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <span>Showing</span>
            <span className="font-medium text-white">{startIndex + 1}</span>
            <span>to</span>
            <span className="font-medium text-white">{Math.min(endIndex, filteredPackages.length)}</span>
            <span>of</span>
            <span className="font-medium text-white">{filteredPackages.length}</span>
            <span>results</span>
          </div>
          
          <div className="flex items-center gap-1">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="flex items-center gap-1 px-2 py-1 text-sm font-medium text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors rounded"
            >
              <ChevronLeftIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Prev</span>
            </button>
            
            <div className="flex items-center gap-1">
              {totalPages <= 1 ? (
                <button
                  className="px-2 py-1 text-sm font-medium rounded bg-blue-600 text-white"
                >
                  1
                </button>
              ) : (
                Array.from({ length: Math.min(3, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage <= 2) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 1) {
                    pageNum = totalPages - 2 + i;
                  } else {
                    pageNum = currentPage - 1 + i;
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`px-2 py-1 text-sm font-medium rounded transition-colors ${
                        pageNum === currentPage
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-400 hover:text-white hover:bg-gray-700'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })
              )}
            </div>
            
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="flex items-center gap-1 px-2 py-1 text-sm font-medium text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors rounded"
            >
              <span className="hidden sm:inline">Next</span>
              <ChevronRightIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-white">
                {editingPackage ? 'Edit Package' : 'Add New Package'}
              </h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingPackage(null);
                  resetForm();
                }}
                className="text-gray-400 hover:text-white"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Guest Information */}
                <div className="col-span-2">
                  <h3 className="text-lg font-semibold mb-2 text-white">Guest Information</h3>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Guest Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.nameOfGuest}
                    onChange={(e) => setFormData({...formData, nameOfGuest: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter guest name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter phone number"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Nationality *
                  </label>
                  <select
                    required
                    value={formData.nationality}
                    onChange={(e) => setFormData({...formData, nationality: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Nationality</option>
                    {nationalities.map((nationality, index) => (
                      <option key={index} value={nationality.demonym}>
                        {nationality.demonym}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    No. of Pax *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.noOfPax}
                    onChange={(e) => setFormData({...formData, noOfPax: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter number of pax"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    No. of Children
                  </label>
                  <input
                    type="text"
                    value={formData.noOfChildren}
                    onChange={(e) => setFormData({...formData, noOfChildren: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter number of children"
                  />
                </div>

                {/* Arrival Information */}
                <div className="col-span-2">
                  <h3 className="text-lg font-semibold mb-2 text-white mt-4">Arrival Information</h3>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Date of Arrival *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.dateOfArrival}
                    onChange={(e) => setFormData({...formData, dateOfArrival: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    City of Arrival *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.cityOfArrival}
                    onChange={(e) => setFormData({...formData, cityOfArrival: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Time of Arrival *
                  </label>
                  <input
                    type="time"
                    required
                    value={formData.timeOfArrival}
                    onChange={(e) => setFormData({...formData, timeOfArrival: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Arrival Flight
                  </label>
                  <input
                    type="text"
                    value={formData.arrivalFlight}
                    onChange={(e) => setFormData({...formData, arrivalFlight: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Departure Information */}
                <div className="col-span-2">
                  <h3 className="text-lg font-semibold mb-2 text-white mt-4">Departure Information</h3>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Date of Departure *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.dateOfDeparture}
                    onChange={(e) => setFormData({...formData, dateOfDeparture: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    City of Departure *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.cityOfDeparture}
                    onChange={(e) => setFormData({...formData, cityOfDeparture: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Time of Departure *
                  </label>
                  <input
                    type="time"
                    required
                    value={formData.timeOfDeparture}
                    onChange={(e) => setFormData({...formData, timeOfDeparture: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Departure Flight
                  </label>
                  <input
                    type="text"
                    value={formData.departureFlight}
                    onChange={(e) => setFormData({...formData, departureFlight: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter departure flight (optional)"
                  />
                </div>

                {/* Package Information */}
                <div className="col-span-2">
                  <h3 className="text-lg font-semibold mb-2 text-white mt-4">Package Information</h3>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Currency *
                  </label>
                  <select
                    required
                    value={formData.currency}
                    onChange={(e) => setFormData({...formData, currency: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {currencies.map(currency => (
                      <option key={currency.value} value={currency.value}>
                        {currency.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Package Price *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.packagePrice}
                    onChange={(e) => setFormData({...formData, packagePrice: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter package price"
                  />
                </div>

                {editingPackage && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Package Code *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.packageCode}
                      onChange={(e) => setFormData({...formData, packageCode: e.target.value})}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                )}

                {/* Driver Information */}
                <div className="col-span-2">
                  <h3 className="text-lg font-semibold mb-2 text-white mt-4">Driver Information</h3>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Driver Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.nameOfDriver}
                    onChange={(e) => setFormData({...formData, nameOfDriver: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Driver Phone *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.phoneNumberOfDriver}
                    onChange={(e) => setFormData({...formData, phoneNumberOfDriver: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Vehicle *
                  </label>
                  <select
                    required
                    value={formData.vehicle}
                    onChange={(e) => setFormData({...formData, vehicle: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Vehicle</option>
                    {vehicles.map(vehicle => (
                      <option key={vehicle._id} value={vehicle._id}>
                        {vehicle.vehicleName} ({vehicle.vehicleType})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Vehicle Registration *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.regNumberOfVehicle}
                    onChange={(e) => setFormData({...formData, regNumberOfVehicle: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Hotel Information */}
                <div className="col-span-2">
                  <h3 className="text-lg font-semibold mb-4 text-white mt-4">Hotel Information</h3>
                </div>

                {hotelEntries.length === 0 ? (
                  <div className="col-span-2">
                    <div className="bg-gray-700 border-2 border-dashed border-gray-600 rounded-lg p-8 text-center">
                      <BuildingOfficeIcon className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                      <h4 className="text-lg font-medium text-white mb-2">No Hotels Added</h4>
                      <p className="text-gray-400 mb-4">Add hotel details for the customer's stay</p>
                      <button
                        type="button"
                        onClick={addHotelEntry}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                      >
                        <PlusIcon className="h-4 w-4" />
                        Add First Hotel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="col-span-2 space-y-4">
                    {hotelEntries.map((entry, index) => (
                      <div key={entry.id} className="bg-gray-700 border border-gray-600 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-md font-semibold text-white">Hotel {index + 1}</h4>
                          {hotelEntries.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeHotelEntry(entry.id)}
                              className="p-2 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-lg transition-colors"
                              title="Remove Hotel"
                            >
                              <TrashIcon className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">
                              Hotel *
                            </label>
                            <select
                              required
                              value={entry.hotelName}
                              onChange={(e) => updateHotelEntry(entry.id, 'hotelName', e.target.value)}
                              className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              <option value="">Select Hotel</option>
                              {hotels.map(hotel => (
                                <option key={hotel._id} value={hotel._id}>
                                  {hotel.hotelName}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">
                              Destination *
                            </label>
                            <select
                              required
                              value={entry.destination}
                              onChange={(e) => updateHotelEntry(entry.id, 'destination', e.target.value)}
                              className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              <option value="">Select Destination</option>
                              {destinations.map(dest => (
                                <option key={dest._id} value={dest._id}>
                                  {dest.destinationName}, {dest.country}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">
                              Check-in Date *
                            </label>
                            <input
                              type="date"
                              required
                              value={entry.checkinDate}
                              onChange={(e) => updateHotelEntry(entry.id, 'checkinDate', e.target.value)}
                              className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">
                              Check-out Date *
                            </label>
                            <input
                              type="date"
                              required
                              value={entry.checkoutDate}
                              onChange={(e) => updateHotelEntry(entry.id, 'checkoutDate', e.target.value)}
                              className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">
                              No. of Rooms *
                            </label>
                            <input
                              type="text"
                              required
                              value={entry.noOfRooms}
                              onChange={(e) => updateHotelEntry(entry.id, 'noOfRooms', e.target.value)}
                              className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="Enter number of rooms"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">
                              Room Category *
                            </label>
                            <select
                              required
                              value={entry.roomCategory}
                              onChange={(e) => updateHotelEntry(entry.id, 'roomCategory', e.target.value)}
                              className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                              disabled={!entry.hotelName}
                            >
                              <option value="">Select Room Category</option>
                              {getRoomCategoriesForHotel(entry.hotelName).map((category, catIndex) => (
                                <option key={catIndex} value={category.category}>
                                  {category.category}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">
                              No. of Extra Beds
                            </label>
                            <input
                              type="text"
                              value={entry.noOfExtraBed}
                              onChange={(e) => updateHotelEntry(entry.id, 'noOfExtraBed', e.target.value)}
                              className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="Enter number of extra beds"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {/* Add Hotel Button */}
                    <div className="flex justify-center mt-4">
                      <button
                        type="button"
                        onClick={addHotelEntry}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                      >
                        <PlusIcon className="h-4 w-4" />
                        Add Another Hotel
                      </button>
                    </div>
                  </div>
                )}

                {/* Additional Services */}
                <div className="col-span-2">
                  <h3 className="text-lg font-semibold mb-2 text-white mt-4">Additional Services</h3>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    CIAL Parking Rate
                  </label>
                  <input
                    type="text"
                    value={formData.cialParkingRate}
                    onChange={(e) => setFormData({...formData, cialParkingRate: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    CIAL Entry Rate
                  </label>
                  <input
                    type="text"
                    value={formData.cialEntryRate}
                    onChange={(e) => setFormData({...formData, cialEntryRate: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Bouquet Rate
                  </label>
                  <input
                    type="text"
                    value={formData.bouquetRate}
                    onChange={(e) => setFormData({...formData, bouquetRate: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    SIM Card Rate
                  </label>
                  <input
                    type="text"
                    value={formData.simCardRate}
                    onChange={(e) => setFormData({...formData, simCardRate: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Food Rate
                  </label>
                  <input
                    type="text"
                    value={formData.foodRate}
                    onChange={(e) => setFormData({...formData, foodRate: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Staff Information */}
                <div className="col-span-2">
                  <h3 className="text-lg font-semibold mb-2 text-white mt-4">Staff Information</h3>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Tour Executive *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.nameOfTourExecutive}
                    onChange={(e) => setFormData({...formData, nameOfTourExecutive: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Reservation Officer *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.nameOfReservationOfficer}
                    onChange={(e) => setFormData({...formData, nameOfReservationOfficer: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-4 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingPackage(null);
                    resetForm();
                  }}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
                >
                  {editingPackage ? 'Update Package' : 'Create Package'}
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
                <h3 className="text-lg font-medium text-white">Delete Package</h3>
                <p className="text-sm text-gray-400">
                  Are you sure you want to delete package "{deleteDialog.packageCode}"? This action cannot be undone.
                </p>
              </div>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={() => setDeleteDialog({ isOpen: false, packageId: null, packageCode: '' })}
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

      {/* Package Details Modal */}
      {showPackageDetails && selectedPackage && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 border border-gray-700 rounded-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-700">
              <div className="flex items-center gap-3">
                <UserIcon className="h-8 w-8 text-green-500" />
                <div>
                  <h2 className="text-xl font-bold text-white">Package Details</h2>
                  <p className="text-sm text-gray-400">ID: {selectedPackage._id}</p>
                </div>
              </div>
              <button
                onClick={closePackageDetails}
                className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
              >
                <XMarkIcon className="h-5 w-5 text-gray-400" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Guest Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="bg-gray-700 p-4 rounded-lg border border-gray-600">
                    <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                      <UserIcon className="h-5 w-5 text-green-500" />
                      Guest Information
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm text-gray-400">Guest Name</label>
                        <p className="text-white font-medium">{selectedPackage.nameOfGuest}</p>
                      </div>
                      <div>
                        <label className="text-sm text-gray-400">Phone Number</label>
                        <p className="text-white font-medium">{selectedPackage.phoneNumber}</p>
                      </div>
                      <div>
                        <label className="text-sm text-gray-400">Nationality</label>
                        <p className="text-white font-medium">{selectedPackage.nationality}</p>
                      </div>
                      <div>
                        <label className="text-sm text-gray-400">No. of Pax</label>
                        <p className="text-white font-medium">{selectedPackage.noOfPax}</p>
                      </div>
                      {selectedPackage.noOfChildren && (
                        <div>
                          <label className="text-sm text-gray-400">No. of Children</label>
                          <p className="text-white font-medium">{selectedPackage.noOfChildren}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="bg-gray-700 p-4 rounded-lg border border-gray-600">
                    <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                      <CalendarIcon className="h-5 w-5 text-green-500" />
                      Arrival Information
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm text-gray-400">Date of Arrival</label>
                        <p className="text-white font-medium">{new Date(selectedPackage.dateOfArrival).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <label className="text-sm text-gray-400">City of Arrival</label>
                        <p className="text-white font-medium">{selectedPackage.cityOfArrival}</p>
                      </div>
                      <div>
                        <label className="text-sm text-gray-400">Time of Arrival</label>
                        <p className="text-white font-medium">{selectedPackage.timeOfArrival}</p>
                      </div>
                      {selectedPackage.arrivalFlight && (
                        <div>
                          <label className="text-sm text-gray-400">Arrival Flight</label>
                          <p className="text-white font-medium">{selectedPackage.arrivalFlight}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="bg-gray-700 p-4 rounded-lg border border-gray-600">
                    <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                      <PaperAirplaneIcon className="h-5 w-5 text-green-500" />
                      Departure Information
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm text-gray-400">Date of Departure</label>
                        <p className="text-white font-medium">{new Date(selectedPackage.dateOfDeparture).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <label className="text-sm text-gray-400">City of Departure</label>
                        <p className="text-white font-medium">{selectedPackage.cityOfDeparture}</p>
                      </div>
                      <div>
                        <label className="text-sm text-gray-400">Time of Departure</label>
                        <p className="text-white font-medium">{selectedPackage.timeOfDeparture}</p>
                      </div>
                      {selectedPackage.departureFlight && (
                        <div>
                          <label className="text-sm text-gray-400">Departure Flight</label>
                          <p className="text-white font-medium">{selectedPackage.departureFlight}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-gray-700 p-4 rounded-lg border border-gray-600">
                    <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                      <CurrencyDollarIcon className="h-5 w-5 text-green-500" />
                      Package Information
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm text-gray-400">Package Code</label>
                        <p className="text-white font-medium">{selectedPackage.packageCode}</p>
                      </div>
                      <div>
                        <label className="text-sm text-gray-400">Package Price</label>
                        <p className="text-white font-medium">{getCurrencySymbol(selectedPackage.currency)}{selectedPackage.packagePrice}</p>
                      </div>
                      <div>
                        <label className="text-sm text-gray-400">Currency</label>
                        <p className="text-white font-medium">{selectedPackage.currency}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-700 p-4 rounded-lg border border-gray-600">
                    <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                      <TruckIcon className="h-5 w-5 text-green-500" />
                      Driver Information
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm text-gray-400">Driver Name</label>
                        <p className="text-white font-medium">{selectedPackage.nameOfDriver}</p>
                      </div>
                      <div>
                        <label className="text-sm text-gray-400">Driver Phone</label>
                        <p className="text-white font-medium">{selectedPackage.phoneNumberOfDriver}</p>
                      </div>
                      <div>
                        <label className="text-sm text-gray-400">Vehicle</label>
                        <p className="text-white font-medium">
                          {selectedPackage.vehicle?.vehicleName} ({selectedPackage.vehicle?.vehicleType})
                        </p>
                      </div>
                      <div>
                        <label className="text-sm text-gray-400">Vehicle Registration</label>
                        <p className="text-white font-medium">{selectedPackage.regNumberOfVehicle}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-700 p-4 rounded-lg border border-gray-600">
                    <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                      <BuildingOfficeIcon className="h-5 w-5 text-green-500" />
                      Hotel Information
                    </h3>
                    
                    {selectedPackage.hotelEntries && selectedPackage.hotelEntries.length > 0 ? (
                      <div className="space-y-4">
                        {selectedPackage.hotelEntries.map((entry, index) => (
                          <div key={entry.id || index} className="bg-gray-600 p-3 rounded-lg border border-gray-500">
                            <h4 className="text-md font-semibold text-white mb-3">Hotel {index + 1}</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <div>
                                <label className="text-sm text-gray-400">Hotel Name</label>
                                <p className="text-white font-medium">{entry.hotelName?.hotelName || entry.hotelName}</p>
                              </div>
                              <div>
                                <label className="text-sm text-gray-400">Destination</label>
                                <p className="text-white font-medium">{entry.destination?.destinationName || entry.destination}</p>
                              </div>
                              <div>
                                <label className="text-sm text-gray-400">Check-in Date</label>
                                <p className="text-white font-medium">{entry.checkinDate ? new Date(entry.checkinDate).toLocaleDateString() : 'N/A'}</p>
                              </div>
                              <div>
                                <label className="text-sm text-gray-400">Check-out Date</label>
                                <p className="text-white font-medium">{entry.checkoutDate ? new Date(entry.checkoutDate).toLocaleDateString() : 'N/A'}</p>
                              </div>
                              <div>
                                <label className="text-sm text-gray-400">No. of Rooms</label>
                                <p className="text-white font-medium">{entry.noOfRooms || 'N/A'}</p>
                              </div>
                              <div>
                                <label className="text-sm text-gray-400">Room Category</label>
                                <p className="text-white font-medium">{entry.roomCategory || 'N/A'}</p>
                              </div>
                              {entry.noOfExtraBed && (
                                <div>
                                  <label className="text-sm text-gray-400">No. of Extra Beds</label>
                                  <p className="text-white font-medium">{entry.noOfExtraBed}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      // Fallback for old packages with single hotel
                      <div className="space-y-3">
                        <div>
                          <label className="text-sm text-gray-400">Hotel Name</label>
                          <p className="text-white font-medium">{selectedPackage.hotelName?.hotelName || 'N/A'}</p>
                        </div>
                        <div>
                          <label className="text-sm text-gray-400">Destination</label>
                          <p className="text-white font-medium">{selectedPackage.destination?.destinationName || 'N/A'}</p>
                        </div>
                        <div>
                          <label className="text-sm text-gray-400">Check-in Date</label>
                          <p className="text-white font-medium">{selectedPackage.checkinDate ? new Date(selectedPackage.checkinDate).toLocaleDateString() : 'N/A'}</p>
                        </div>
                        <div>
                          <label className="text-sm text-gray-400">Check-out Date</label>
                          <p className="text-white font-medium">{selectedPackage.checkoutDate ? new Date(selectedPackage.checkoutDate).toLocaleDateString() : 'N/A'}</p>
                        </div>
                        <div>
                          <label className="text-sm text-gray-400">No. of Rooms</label>
                          <p className="text-white font-medium">{selectedPackage.noOfRooms || 'N/A'}</p>
                        </div>
                        <div>
                          <label className="text-sm text-gray-400">Room Category</label>
                          <p className="text-white font-medium">{selectedPackage.roomCategory || 'N/A'}</p>
                        </div>
                        {selectedPackage.noOfExtraBed && (
                          <div>
                            <label className="text-sm text-gray-400">No. of Extra Beds</label>
                            <p className="text-white font-medium">{selectedPackage.noOfExtraBed}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Additional Services */}
              {(selectedPackage.cialParkingRate || selectedPackage.cialEntryRate || selectedPackage.bouquetRate || selectedPackage.simCardRate || selectedPackage.foodRate) && (
                <div className="bg-gray-700 p-4 rounded-lg border border-gray-600">
                  <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                    <CurrencyDollarIcon className="h-5 w-5 text-green-500" />
                    Additional Services
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {selectedPackage.cialParkingRate && (
                      <div>
                        <label className="text-sm text-gray-400">CIAL Parking Rate</label>
                        <p className="text-white font-medium">{selectedPackage.cialParkingRate}</p>
                      </div>
                    )}
                    {selectedPackage.cialEntryRate && (
                      <div>
                        <label className="text-sm text-gray-400">CIAL Entry Rate</label>
                        <p className="text-white font-medium">{selectedPackage.cialEntryRate}</p>
                      </div>
                    )}
                    {selectedPackage.bouquetRate && (
                      <div>
                        <label className="text-sm text-gray-400">Bouquet Rate</label>
                        <p className="text-white font-medium">{selectedPackage.bouquetRate}</p>
                      </div>
                    )}
                    {selectedPackage.simCardRate && (
                      <div>
                        <label className="text-sm text-gray-400">SIM Card Rate</label>
                        <p className="text-white font-medium">{selectedPackage.simCardRate}</p>
                      </div>
                    )}
                    {selectedPackage.foodRate && (
                      <div>
                        <label className="text-sm text-gray-400">Food Rate</label>
                        <p className="text-white font-medium">{selectedPackage.foodRate}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Staff Information */}
              <div className="bg-gray-700 p-4 rounded-lg border border-gray-600">
                <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                  <UserIcon className="h-5 w-5 text-green-500" />
                  Staff Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-400">Tour Executive</label>
                    <p className="text-white font-medium">{selectedPackage.nameOfTourExecutive}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400">Reservation Officer</label>
                    <p className="text-white font-medium">{selectedPackage.nameOfReservationOfficer}</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-700">
                <button 
                  onClick={() => {
                    closePackageDetails()
                    handleEdit(selectedPackage)
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <PencilIcon className="h-4 w-4" />
                  Edit Package
                </button>
                <button 
                  onClick={() => {
                    handleDeleteClick(selectedPackage)
                    closePackageDetails()
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  <TrashIcon className="h-4 w-4" />
                  Delete Package
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PackageManagementPage;
