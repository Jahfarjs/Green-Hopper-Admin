import React, { useState, useEffect } from 'react';
import { Document, Page, Text, View, StyleSheet, PDFDownloadLink, Font, Image } from '@react-pdf/renderer';
import { Download, FileText, Search, Package } from 'lucide-react';
// Import logo as URL for better compatibility with react-pdf
const logoWhite = new URL('../../assets/logo-white.png', import.meta.url).href;

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
      padding: 10,
      flexDirection: 'row',
      alignItems: 'center',
      borderBottom: '1px solid #e0e0e0',
    },
    logo: {
      width: 50,
      height: 50,
    },
    greetingContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    greeting: {
      color: '#333333',
      fontSize: 10,
      textAlign: 'center',
      fontWeight: 'bold',
      marginBottom: 2,
    },
    title: {
      fontSize: 18,
      color: '#333333',
      textAlign: 'center',
      marginTop: 10,
      marginBottom: 10,
      fontFamily: 'Helvetica-Bold',
    },
    bookingInfo: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 10,
      paddingHorizontal: 15,
      gap: 20,
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
      padding: 4,
      fontSize: 8,
      marginBottom: 3,
      fontWeight: 'bold',
      borderRadius: 2,
    },
    infoValue: {
      fontSize: 10,
      marginBottom: 8,
      fontWeight: 'bold',
      color: '#333333',
    },
    infoValueNormal: {
      fontSize: 10,
      marginBottom: 8,
      color: '#333333',
    },
    packageDetailsSection: {
      marginHorizontal: 10,
      marginBottom: 10,
    },
    sectionTitle: {
      backgroundColor: '#556B2F',
      color: '#ffffff',
      fontSize: 9,
      fontWeight: 'bold',
      textAlign: 'center',
      padding: 6,
      marginBottom: 8,
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
      padding: 6,
      marginBottom: 5,
      minHeight: 35,
    },
    detailLabel: {
      fontSize: 7,
      color: '#666666',
      fontWeight: 'bold',
      marginBottom: 2,
    },
    detailValue: {
      fontSize: 8,
      color: '#333333',
      fontWeight: 'bold',
    },
    notes: {
      marginHorizontal: 10,
      marginBottom: 10,
      padding: 8,
      backgroundColor: '#f8f9fa',
      borderRadius: 3,
    },
    notesTitle: {
      fontSize: 9,
      fontWeight: 'bold',
      marginBottom: 5,
      color: '#333333',
    },
    notesList: {
      fontSize: 7,
      lineHeight: 1.3,
    },
    notesItem: {
      marginBottom: 3,
      paddingLeft: 2,
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
        </View>

        {/* Notes Section */}
        <View style={styles.notes}>
          <Text style={styles.notesTitle}>Note:-</Text>
          <View style={styles.notesList}>
            <Text style={styles.notesItem}>• Check In time is 1400 Hrs & Check out time is 1200 Hrs</Text>
            <Text style={styles.notesItem}>• Please present this confirmation voucher along with ID proof at the Hotel / Resort reception at the time of check-in.</Text>
            <Text style={styles.notesItem}>• For any additional services at the Hotel / Resort, please contact directly to the reception.</Text>
            <Text style={styles.notesItem}>• For any clarification or amendment regarding your booking, please contact our help line No +91 75609 01999, +91 70259 01901</Text>
          </View>
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
        console.error('Failed to fetch packages');
      }
    } catch (error) {
      console.error('Error fetching packages:', error);
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
    <div className="p-6">
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
                className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                  selectedPackage?._id === pkg._id
                    ? 'bg-blue-600 border-blue-500'
                    : 'bg-gray-700 border-gray-600 hover:bg-gray-600'
                }`}
                onClick={() => setSelectedPackage(pkg)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-white font-semibold">{pkg.nameOfGuest}</h3>
                    <p className="text-gray-300 text-sm">Package: {pkg.packageCode}</p>
                    <p className="text-gray-400 text-sm">
                      {pkg.nationality} • {pkg.noOfPax} Pax • {pkg.currency} {pkg.packagePrice}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-400 text-sm">
                      {new Date(pkg.checkinDate).toLocaleDateString()} - {new Date(pkg.checkoutDate).toLocaleDateString()}
                    </p>
                    <p className="text-gray-400 text-sm">{pkg.hotelName?.hotelName || 'N/A'}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* PDF Generation */}
      {selectedPackage && (
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center gap-4 mb-4">
            <FileText className="w-6 h-6 text-blue-500" />
            <h2 className="text-xl font-semibold text-white">Generate Receipt</h2>
          </div>

          <div className="bg-gray-700 rounded-lg p-4 mb-4">
            <h3 className="text-white font-semibold mb-2">Selected Package Details:</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-400">Guest:</span>
                <span className="text-white ml-2">{selectedPackage.nameOfGuest}</span>
              </div>
              <div>
                <span className="text-gray-400">Package Code:</span>
                <span className="text-white ml-2">{selectedPackage.packageCode}</span>
              </div>
              <div>
                <span className="text-gray-400">Nationality:</span>
                <span className="text-white ml-2">{selectedPackage.nationality}</span>
              </div>
              <div>
                <span className="text-gray-400">No. of Pax:</span>
                <span className="text-white ml-2">{selectedPackage.noOfPax}</span>
              </div>
              <div>
                <span className="text-gray-400">Hotel:</span>
                <span className="text-white ml-2">{selectedPackage.hotelName?.hotelName || 'N/A'}</span>
              </div>
              <div>
                <span className="text-gray-400">Room Category:</span>
                <span className="text-white ml-2">{selectedPackage.roomCategory}</span>
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <PDFDownloadLink
              document={<TourConfirmationVoucher packageData={selectedPackage} />}
              fileName={`tour-confirmation-${selectedPackage.packageCode}.pdf`}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              Download PDF
            </PDFDownloadLink>
            
            <button
              onClick={() => setSelectedPackage(null)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              <Package className="w-4 h-4" />
              Select Different Package
            </button>
          </div>
        </div>
      )}

      {!selectedPackage && packages.length > 0 && (
        <div className="bg-gray-800 rounded-lg p-6 text-center">
          <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">Select a Package</h3>
          <p className="text-gray-400">Choose a package from the list above to generate a receipt</p>
        </div>
      )}

      {packages.length === 0 && !loading && (
        <div className="bg-gray-800 rounded-lg p-6 text-center">
          <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">No Packages Found</h3>
          <p className="text-gray-400">No packages are available for receipt generation</p>
        </div>
      )}
    </div>
  );
};

export default ReceiptGenerationPage;

