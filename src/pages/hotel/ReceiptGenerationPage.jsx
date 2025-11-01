import React, { useState, useEffect } from 'react';
import { Document, Page, Text, View, StyleSheet, PDFDownloadLink, PDFViewer, Font, Image } from '@react-pdf/renderer';
import { Download, Search, Package, Eye, X } from 'lucide-react';
// Import logo and seal as URL for better compatibility with react-pdf
const logoWhite = new URL('../../assets/logo-white.png', import.meta.url).href;
const sealImage = new URL('../../assets/seal.jpeg', import.meta.url).href;

// Register fonts for Arabic text support
Font.register({
  family: 'Helvetica',
  src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-light-webfont.ttf',
});

// PDF Document Component
const TourConfirmationVoucher = ({ packageData }) => {
  const styles = StyleSheet.create({
    page: {
      flexDirection: 'column',
      backgroundColor: '#ffffff',
      padding: 0,
      fontFamily: 'Helvetica',
    },
    header: {
      backgroundColor: '#ffffff',
      padding: 6,
      flexDirection: 'row',
      alignItems: 'center',
      borderBottom: '1px solid #e0e0e0',
    },
    logo: {
      width: 40,
      height: 40,
    },
    greetingContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    greeting: {
      color: '#333333',
      fontSize: 8,
      textAlign: 'center',
      fontWeight: 'bold',
      marginBottom: 1,
    },
    title: {
      fontSize: 14,
      color: '#333333',
      textAlign: 'center',
      marginTop: 6,
      marginBottom: 6,
      fontFamily: 'Helvetica-Bold',
    },
    bookingInfo: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 6,
      paddingHorizontal: 10,
      gap: 15,
    },
    bookingLeft: {
      flex: 1,
    },
    bookingRight: {
      flex: 1,
    },
    infoLabel: {
      backgroundColor: '#ADD8E6',
      color: '#ffffff',
      padding: 2,
      fontSize: 7,
      marginBottom: 2,
      fontWeight: 'bold',
      borderRadius: 1,
    },
    infoValue: {
      fontSize: 8,
      marginBottom: 4,
      fontWeight: 'bold',
      color: '#333333',
    },
    infoValueNormal: {
      fontSize: 8,
      marginBottom: 4,
      color: '#333333',
    },
    packageDetailsSection: {
      marginHorizontal: 8,
      marginBottom: 6,
    },
    sectionTitle: {
      backgroundColor: '#556B2F',
      color: '#ffffff',
      fontSize: 8,
      fontWeight: 'bold',
      textAlign: 'center',
      padding: 4,
      marginBottom: 4,
    },
    detailsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
    },
    detailBox: {
      width: '48%',
      backgroundColor: '#f8f9fa',
      border: '1px solid #e0e0e0',
      padding: 3,
      marginBottom: 3,
      minHeight: 25,
    },
    detailLabel: {
      fontSize: 6,
      color: '#666666',
      fontWeight: 'bold',
      marginBottom: 1,
    },
    detailValue: {
      fontSize: 7,
      color: '#333333',
      fontWeight: 'bold',
    },
    notes: {
      marginHorizontal: 8,
      marginBottom: 6,
      padding: 4,
      backgroundColor: '#f8f9fa',
      borderRadius: 2,
    },
    notesTitle: {
      fontSize: 7,
      fontWeight: 'bold',
      marginBottom: 3,
      color: '#333333',
    },
    notesList: {
      fontSize: 6,
      lineHeight: 1.2,
    },
    notesItem: {
      marginBottom: 2,
      paddingLeft: 1,
    },
    sealContainer: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      marginTop: 4,
      marginRight: 10,
      width: '100%',
      height: 50,
    },
    seal: {
      width: 50,
      height: 50,
      objectFit: 'contain',
    },
    hotelEntrySection: {
      marginBottom: 4,
    },
    hotelEntryTitle: {
      backgroundColor: '#4A5568',
      color: '#ffffff',
      fontSize: 7,
      fontWeight: 'bold',
      textAlign: 'center',
      padding: 3,
      marginBottom: 3,
      borderRadius: 1,
    },
  });

  const formatDate = (date) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('en-GB', { 
      day: '2-digit', 
      month: 'short', 
      year: '2-digit' 
    });
  };

  const calculateNights = (checkin, checkout) => {
    if (!checkin || !checkout) return 0;
    const checkinDate = new Date(checkin);
    const checkoutDate = new Date(checkout);
    const diffTime = Math.abs(checkoutDate - checkinDate);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Image style={styles.logo} src={logoWhite} />
          <View style={styles.greetingContainer}>
            <Text style={styles.greeting}>Welcome to GreenHopper Holidays</Text>
            <Text style={styles.greeting}>Your Journey Begins Here</Text>
          </View>
          <View style={{ width: 50, height: 50 }}></View>
        </View>

        {/* Title */}
        <Text style={styles.title}>Tour Confirmation Voucher</Text>

        {/* Booking Information */}
        <View style={styles.bookingInfo}>
          <View style={styles.bookingLeft}>
            <Text style={styles.infoLabel}>Guest Name :</Text>
            <Text style={styles.infoValue}>{packageData.nameOfGuest}</Text>
            
            <Text style={styles.infoLabel}>Country :</Text>
            <Text style={styles.infoValueNormal}>{packageData.nationality}</Text>
          </View>
          
          <View style={styles.bookingRight}>
            <Text style={styles.infoLabel}>File No :</Text>
            <Text style={styles.infoValue}>{packageData.packageCode}</Text>
            
            <Text style={styles.infoLabel}>Flight Details</Text>
            <Text style={styles.infoValueNormal}>{packageData.arrivalFlight || 'N/A'}</Text>
          </View>
        </View>

        {/* Package Details Section */}
        <View style={styles.packageDetailsSection}>
          <Text style={styles.sectionTitle}>PACKAGE DETAILS</Text>
          
          {/* Multiple Hotels Support */}
          {packageData.hotelEntries && packageData.hotelEntries.length > 0 ? (
            packageData.hotelEntries.map((hotelEntry, index) => (
              <View key={hotelEntry.id || index} style={styles.hotelEntrySection}>
                {packageData.hotelEntries.length > 1 && (
                  <Text style={styles.hotelEntryTitle}>HOTEL {index + 1}</Text>
                )}
                
                {/* Compact grid layout for multiple hotels */}
                <View style={packageData.hotelEntries.length > 1 ? {
                  flexDirection: 'row',
                  flexWrap: 'wrap',
                  justifyContent: 'space-between',
                } : styles.detailsGrid}>
                  <View style={packageData.hotelEntries.length > 1 ? {
                    width: '32%',
                    backgroundColor: '#f8f9fa',
                    border: '1px solid #e0e0e0',
                    padding: 2,
                    marginBottom: 2,
                    minHeight: 20,
                  } : styles.detailBox}>
                    <Text style={styles.detailLabel}>DESTINATION</Text>
                    <Text style={styles.detailValue}>{hotelEntry.destination?.destinationName || 'N/A'}</Text>
                  </View>
                  
                  <View style={packageData.hotelEntries.length > 1 ? {
                    width: '32%',
                    backgroundColor: '#f8f9fa',
                    border: '1px solid #e0e0e0',
                    padding: 2,
                    marginBottom: 2,
                    minHeight: 20,
                  } : styles.detailBox}>
                    <Text style={styles.detailLabel}>HOTEL</Text>
                    <Text style={styles.detailValue}>{hotelEntry.hotelName?.hotelName || 'N/A'}</Text>
                  </View>
                  
                  <View style={packageData.hotelEntries.length > 1 ? {
                    width: '32%',
                    backgroundColor: '#f8f9fa',
                    border: '1px solid #e0e0e0',
                    padding: 2,
                    marginBottom: 2,
                    minHeight: 20,
                  } : styles.detailBox}>
                    <Text style={styles.detailLabel}>CONF. NO.</Text>
                    <Text style={styles.detailValue}>{packageData.packageCode}</Text>
                  </View>
                  
                  <View style={packageData.hotelEntries.length > 1 ? {
                    width: '32%',
                    backgroundColor: '#f8f9fa',
                    border: '1px solid #e0e0e0',
                    padding: 2,
                    marginBottom: 2,
                    minHeight: 20,
                  } : styles.detailBox}>
                    <Text style={styles.detailLabel}>CHECK-IN</Text>
                    <Text style={styles.detailValue}>{formatDate(hotelEntry.checkinDate)}</Text>
                  </View>
                  
                  <View style={packageData.hotelEntries.length > 1 ? {
                    width: '32%',
                    backgroundColor: '#f8f9fa',
                    border: '1px solid #e0e0e0',
                    padding: 2,
                    marginBottom: 2,
                    minHeight: 20,
                  } : styles.detailBox}>
                    <Text style={styles.detailLabel}>CHECK-OUT</Text>
                    <Text style={styles.detailValue}>{formatDate(hotelEntry.checkoutDate)}</Text>
                  </View>
                  
                  <View style={packageData.hotelEntries.length > 1 ? {
                    width: '32%',
                    backgroundColor: '#f8f9fa',
                    border: '1px solid #e0e0e0',
                    padding: 2,
                    marginBottom: 2,
                    minHeight: 20,
                  } : styles.detailBox}>
                    <Text style={styles.detailLabel}>NO. OF PAX</Text>
                    <Text style={styles.detailValue}>{packageData.noOfPax}</Text>
                  </View>
                  
                  <View style={packageData.hotelEntries.length > 1 ? {
                    width: '32%',
                    backgroundColor: '#f8f9fa',
                    border: '1px solid #e0e0e0',
                    padding: 2,
                    marginBottom: 2,
                    minHeight: 20,
                  } : styles.detailBox}>
                    <Text style={styles.detailLabel}>NO. OF NIGHTS</Text>
                    <Text style={styles.detailValue}>{calculateNights(hotelEntry.checkinDate, hotelEntry.checkoutDate)}</Text>
                  </View>
                  
                  <View style={packageData.hotelEntries.length > 1 ? {
                    width: '32%',
                    backgroundColor: '#f8f9fa',
                    border: '1px solid #e0e0e0',
                    padding: 2,
                    marginBottom: 2,
                    minHeight: 20,
                  } : styles.detailBox}>
                    <Text style={styles.detailLabel}>NO. OF ROOMS</Text>
                    <Text style={styles.detailValue}>{hotelEntry.noOfRooms}</Text>
                  </View>
                  
                  <View style={packageData.hotelEntries.length > 1 ? {
                    width: '32%',
                    backgroundColor: '#f8f9fa',
                    border: '1px solid #e0e0e0',
                    padding: 2,
                    marginBottom: 2,
                    minHeight: 20,
                  } : styles.detailBox}>
                    <Text style={styles.detailLabel}>EXTRA BED</Text>
                    <Text style={styles.detailValue}>{hotelEntry.noOfExtraBed || '0'}</Text>
                  </View>
                  
                  <View style={packageData.hotelEntries.length > 1 ? {
                    width: '32%',
                    backgroundColor: '#f8f9fa',
                    border: '1px solid #e0e0e0',
                    padding: 2,
                    marginBottom: 2,
                    minHeight: 20,
                  } : styles.detailBox}>
                    <Text style={styles.detailLabel}>ROOM CATEGORY</Text>
                    <Text style={styles.detailValue}>{hotelEntry.roomCategory}</Text>
                  </View>
                  
                  <View style={packageData.hotelEntries.length > 1 ? {
                    width: '32%',
                    backgroundColor: '#f8f9fa',
                    border: '1px solid #e0e0e0',
                    padding: 2,
                    marginBottom: 2,
                    minHeight: 20,
                  } : styles.detailBox}>
                    <Text style={styles.detailLabel}>MEAL PLAN</Text>
                    <Text style={styles.detailValue}>CPAI</Text>
                  </View>
                </View>
              </View>
            ))
          ) : (
            // Fallback for legacy single hotel data
            <View style={styles.detailsGrid}>
              <View style={styles.detailBox}>
                <Text style={styles.detailLabel}>DESTINATION</Text>
                <Text style={styles.detailValue}>{packageData.destination?.destinationName || 'N/A'}</Text>
              </View>
              
              <View style={styles.detailBox}>
                <Text style={styles.detailLabel}>HOTEL</Text>
                <Text style={styles.detailValue}>{packageData.hotelName?.hotelName || 'N/A'}</Text>
              </View>
              
              <View style={styles.detailBox}>
                <Text style={styles.detailLabel}>CONF. NO.</Text>
                <Text style={styles.detailValue}>{packageData.packageCode}</Text>
              </View>
              
              <View style={styles.detailBox}>
                <Text style={styles.detailLabel}>CHECK-IN</Text>
                <Text style={styles.detailValue}>{formatDate(packageData.checkinDate)}</Text>
              </View>
              
              <View style={styles.detailBox}>
                <Text style={styles.detailLabel}>CHECK-OUT</Text>
                <Text style={styles.detailValue}>{formatDate(packageData.checkoutDate)}</Text>
              </View>
              
              <View style={styles.detailBox}>
                <Text style={styles.detailLabel}>NO. OF PAX</Text>
                <Text style={styles.detailValue}>{packageData.noOfPax}</Text>
              </View>
              
              <View style={styles.detailBox}>
                <Text style={styles.detailLabel}>NO. OF NIGHTS</Text>
                <Text style={styles.detailValue}>{calculateNights(packageData.checkinDate, packageData.checkoutDate)}</Text>
              </View>
              
              <View style={styles.detailBox}>
                <Text style={styles.detailLabel}>NO. OF ROOMS</Text>
                <Text style={styles.detailValue}>{packageData.noOfRooms}</Text>
              </View>
              
              <View style={styles.detailBox}>
                <Text style={styles.detailLabel}>EXTRA BED</Text>
                <Text style={styles.detailValue}>{packageData.noOfExtraBed || '0'}</Text>
              </View>
              
              <View style={styles.detailBox}>
                <Text style={styles.detailLabel}>ROOM CATEGORY</Text>
                <Text style={styles.detailValue}>{packageData.roomCategory}</Text>
              </View>
              
              <View style={styles.detailBox}>
                <Text style={styles.detailLabel}>MEAL PLAN</Text>
                <Text style={styles.detailValue}>CPAI</Text>
              </View>
            </View>
          )}
        </View>

        {/* Notes Section - Compact */}
        <View style={styles.notes}>
          <Text style={styles.notesTitle}>Note:-</Text>
          <View style={styles.notesList}>
            <Text style={styles.notesItem}>• Check In: 1400 Hrs, Check out: 1200 Hrs</Text>
            <Text style={styles.notesItem}>• Present this voucher with ID proof at hotel reception</Text>
            <Text style={styles.notesItem}>• Contact hotel reception for additional services</Text>
            <Text style={styles.notesItem}>• Help line: +91 75609 01999, +91 70259 01901</Text>
          </View>
        </View>

        {/* Company Seal - Compact */}
        <View style={styles.sealContainer}>
          <Image style={styles.seal} src={sealImage} />
        </View>

      </Page>
    </Document>
  );
};

const ReceiptGenerationPage = () => {
  const [packages, setPackages] = useState([]);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    fetchPackages();
  }, []);

  const API_BASE_URL = import.meta.env.VITE_ADMIN_API_URL;
  const fetchPackages = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`${API_BASE_URL}/packages/hotel`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setPackages(data);
      } else {
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const filteredPackages = packages.filter(pkg => 
    pkg.nameOfGuest.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pkg.packageCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pkg.nationality.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 pb-24">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-2">Receipt Generation</h1>
        <p className="text-gray-400">Generate tour confirmation vouchers for customers</p>
      </div>

      {/* Search and Package Selection */}
      <div className="bg-gray-800 rounded-lg p-6 mb-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Search Packages
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search by guest name, package code, or nationality..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
            <p className="text-gray-400 mt-2">Loading packages...</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {filteredPackages.map((pkg) => (
              <div
                key={pkg._id}
                className={`p-4 rounded-lg border transition-colors ${
                  selectedPackage?._id === pkg._id
                    ? 'bg-blue-600 border-blue-500'
                    : 'bg-gray-700 border-gray-600 hover:bg-gray-600 cursor-pointer'
                }`}
                onClick={() => setSelectedPackage(pkg)}
              >
                <div>
                  <h3 className="text-white font-semibold">{pkg.nameOfGuest}</h3>
                  <p className="text-gray-300 text-sm">Package: {pkg.packageCode}</p>
                </div>
                
                {/* Buttons appear only when this package is selected */}
                {selectedPackage?._id === pkg._id && (
                  <div className="mt-4 flex gap-2 flex-wrap" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => setShowPreview(true)}
                      className="inline-flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                    >
                      <Eye className="w-4 h-4" />
                      Preview PDF
                    </button>
                    
                    <PDFDownloadLink
                      document={<TourConfirmationVoucher packageData={selectedPackage} />}
                      fileName={`tour-confirmation-${selectedPackage.packageCode}.pdf`}
                      className="inline-flex items-center gap-2 px-3 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition-colors text-sm"
                    >
                      <Download className="w-4 h-4" />
                      Download PDF
                    </PDFDownloadLink>
                    
                    <button
                      onClick={() => setSelectedPackage(null)}
                      className="inline-flex items-center gap-2 px-3 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition-colors text-sm"
                    >
                      <Package className="w-4 h-4" />
                      Deselect
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {packages.length === 0 && !loading && (
        <div className="bg-gray-800 rounded-lg p-6 text-center">
          <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">No Packages Found</h3>
          <p className="text-gray-400">No packages are available for receipt generation</p>
        </div>
      )}

      {/* PDF Preview Modal */}
      {showPreview && selectedPackage && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-6xl h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                PDF Preview - {selectedPackage.packageCode}
              </h3>
              <button
                onClick={() => setShowPreview(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            
            {/* PDF Viewer */}
            <div className="flex-1 overflow-hidden">
              <PDFViewer
                width="100%"
                height="100%"
                showToolbar={true}
                className="border-0"
              >
                <TourConfirmationVoucher packageData={selectedPackage} />
              </PDFViewer>
            </div>
            
            {/* Modal Footer */}
            <div className="flex items-center justify-between p-4 border-t border-gray-200 bg-gray-50">
              <div className="text-sm text-gray-600">
                Preview of tour confirmation voucher for {selectedPackage.nameOfGuest}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowPreview(false)}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Close Preview
                </button>
                <PDFDownloadLink
                  document={<TourConfirmationVoucher packageData={selectedPackage} />}
                  fileName={`tour-confirmation-${selectedPackage.packageCode}.pdf`}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Download PDF
                </PDFDownloadLink>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReceiptGenerationPage;

