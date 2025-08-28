import React from 'react'
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from '@react-pdf/renderer'

// Register fonts for better rendering
Font.register({
  family: 'Helvetica',
  fonts: [
    { src: 'https://fonts.gstatic.com/s/helveticaneue/v70/1Ptsg8zYS_SKggPNyC0IT4ttDfA.ttf', fontWeight: 'normal' },
    { src: 'https://fonts.gstatic.com/s/helveticaneue/v70/1Ptsg8zYS_SKggPNyC0IT4ttDfB.ttf', fontWeight: 'bold' },
  ]
})

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 10,
    fontFamily: 'Helvetica',
  },
  
  // Section styles
  section: {
    marginBottom: 8,
    border: '1px solid #333333',
  },
  
  sectionHeader: {
    backgroundColor: '#2d4a2d',
    padding: '4px 8px',
    borderBottom: '1px solid #333333',
  },
  
  sectionHeaderRed: {
    backgroundColor: '#8B4513',
    padding: '4px 8px',
    borderBottom: '1px solid #333333',
  },
  
  sectionTitle: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  
  sectionContent: {
    backgroundColor: '#ffffff',
    padding: 6,
  },
  
  // Grid styles
  gridRow: {
    flexDirection: 'row',
    marginBottom: 4,
    borderBottom: '1px solid #e0e0e0',
    paddingBottom: 4,
  },
  
  gridCell: {
    flex: 1,
    padding: 3,
    borderRight: '1px solid #e0e0e0',
    minHeight: 20,
  },
  
  gridCellLast: {
    borderRight: 'none',
  },
  
  // Text styles
  label: {
    color: '#2d4a2d',
    fontSize: 6,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    marginBottom: 1,
  },
  
  value: {
    color: '#000000',
    fontSize: 8,
  },
  
  valueLarge: {
    color: '#000000',
    fontSize: 9,
    fontWeight: 'bold',
  },
  
  // Table styles
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  
  tableHeader: {
    backgroundColor: '#2d4a2d',
    flexDirection: 'row',
  },
  
  tableHeaderCell: {
    flex: 1,
    padding: 6,
    border: '1px solid #333333',
    textAlign: 'left',
  },
  
  tableHeaderText: {
    color: '#ffffff',
    fontSize: 7,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  
  tableRow: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
  },
  
  tableCell: {
    flex: 1,
    padding: 6,
    border: '1px solid #e0e0e0',
    textAlign: 'left',
  },
  
  tableCellText: {
    color: '#000000',
    fontSize: 8,
  },
  
  // Special styles
  noDataMessage: {
    color: '#666666',
    fontSize: 8,
    textAlign: 'center',
    padding: 10,
  },
  
  // Signature section
  signatureGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  
  signatureCell: {
    flex: '1 1 45%',
    backgroundColor: '#ffffff',
    padding: 4,
    border: '1px solid #e0e0e0',
    minHeight: 25,
  },
  
  signatureCellFull: {
    flex: '1 1 100%',
    backgroundColor: '#ffffff',
    padding: 4,
    border: '1px solid #e0e0e0',
    minHeight: 25,
  },
  
  // Total row styles
  totalRow: {
    backgroundColor: '#2d4a2d',
    flexDirection: 'row',
    padding: 8,
  },
  
  totalCell: {
    flex: 1,
    padding: 6,
    borderRight: '1px solid #ffffff',
  },
  
  totalCellLast: {
    borderRight: 'none',
  },
  
  totalText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
})

const PackageDetailsPDF = ({ packageData }) => {
  const formatDate = (dateString) => {
    if (!dateString) return ''
    return new Date(dateString).toLocaleDateString('en-GB')
  }

  const formatNumber = (amount) => {
    return new Intl.NumberFormat('en-IN').format(amount || 0)
  }

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Guest & Package Overview Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Guest & Package Overview</Text>
          </View>
          <View style={styles.sectionContent}>
            {/* Guest Details Row */}
            <View style={styles.gridRow}>
              <View style={styles.gridCell}>
                <Text style={styles.label}>NAME OF GUEST</Text>
                <Text style={styles.value}>{packageData.customer?.name || 'N/A'}</Text>
              </View>
              <View style={styles.gridCell}>
                <Text style={styles.label}>MR.</Text>
                <Text style={styles.value}>-</Text>
              </View>
              <View style={styles.gridCell}>
                <Text style={styles.label}>PHONE</Text>
                <Text style={styles.value}>{packageData.customer?.phone || 'N/A'}</Text>
              </View>
              <View style={styles.gridCell}>
                <Text style={styles.label}>NATIONALITY</Text>
                <Text style={styles.value}>{packageData.customer?.nationality || 'N/A'}</Text>
              </View>
              <View style={styles.gridCell}>
                <Text style={styles.label}>NO. OF PAX</Text>
                <Text style={styles.valueLarge}>{packageData.customer?.noOfPax || 0}</Text>
              </View>
              <View style={[styles.gridCell, styles.gridCellLast]}>
                <Text style={styles.label}>PACKAGE CODE</Text>
                <Text style={styles.value}>{packageData.packageCode || 'N/A'}</Text>
              </View>
            </View>

            {/* Arrival Details */}
            <View style={styles.gridRow}>
              <View style={styles.gridCell}>
                <Text style={styles.label}>DATE OF ARRIVAL</Text>
                <Text style={styles.value}>{formatDate(packageData.arrival?.date)}</Text>
              </View>
              <View style={styles.gridCell}>
                <Text style={styles.label}>CITY</Text>
                <Text style={styles.value}>{packageData.arrival?.city || 'N/A'}</Text>
              </View>
              <View style={styles.gridCell}>
                <Text style={styles.label}>FLIGHT</Text>
                <Text style={styles.value}>{packageData.arrival?.flight || 'N/A'}</Text>
              </View>
              <View style={[styles.gridCell, styles.gridCellLast]}>
                <Text style={styles.label}>TIME</Text>
                <Text style={styles.value}>{packageData.arrival?.time || 'N/A'}</Text>
              </View>
            </View>

            {/* Departure Details */}
            <View style={styles.gridRow}>
              <View style={styles.gridCell}>
                <Text style={styles.label}>DATE OF DEPARTURE</Text>
                <Text style={styles.value}>{formatDate(packageData.departure?.date)}</Text>
              </View>
              <View style={styles.gridCell}>
                <Text style={styles.label}>CITY</Text>
                <Text style={styles.value}>{packageData.departure?.city || 'N/A'}</Text>
              </View>
              <View style={styles.gridCell}>
                <Text style={styles.label}>FLIGHT</Text>
                <Text style={styles.value}>{packageData.departure?.flight || 'N/A'}</Text>
              </View>
              <View style={styles.gridCell}>
                <Text style={styles.label}>TIME</Text>
                <Text style={styles.value}>{packageData.departure?.time || 'N/A'}</Text>
              </View>
              <View style={styles.gridCell}>
                <Text style={styles.label}>NO. OF DAY/NIGHT</Text>
                <Text style={styles.value}>{packageData.days}/{packageData.nights}</Text>
              </View>
              <View style={styles.gridCell}>
                <Text style={styles.label}>NO. OF CHILDREN</Text>
                <Text style={styles.value}>{packageData.customer?.children || 0}</Text>
              </View>
              <View style={[styles.gridCell, styles.gridCellLast]}>
                <Text style={styles.label}>NO. OF INFANT</Text>
                <Text style={styles.value}>{packageData.customer?.infants || 0}</Text>
              </View>
            </View>

            {/* Package Financials */}
            <View style={styles.gridRow}>
              <View style={styles.gridCell}>
                <Text style={styles.label}>PACKAGE PRIZE</Text>
                <Text style={styles.valueLarge}>{formatNumber(packageData.prizeINR)}</Text>
                <Text style={styles.value}>INR</Text>
              </View>
              <View style={styles.gridCell}>
                <Text style={styles.label}>PACKAGE EXPENDITURE</Text>
                <Text style={styles.value}>{formatNumber(packageData.expenditure)}</Text>
              </View>
              <View style={styles.gridCell}>
                <Text style={styles.label}>PACKAGE PROFIT</Text>
                <Text style={styles.value}>{formatNumber(packageData.profit)}</Text>
              </View>
              <View style={styles.gridCell}>
                <Text style={styles.label}>TOTAL</Text>
                <Text style={styles.value}>{formatNumber(packageData.prizeINR)}</Text>
              </View>
              <View style={[styles.gridCell, styles.gridCellLast]}>
                <Text style={styles.label}>ADVANCE</Text>
                <Text style={styles.value}>{formatNumber(packageData.advance || 0)}</Text>
              </View>
            </View>

            {/* Payment Details */}
            {packageData.payments && packageData.payments.length > 0 && (
              <View style={styles.gridRow}>
                <View style={styles.gridCell}>
                  <Text style={styles.label}>PAYMENT DETAILS</Text>
                  <Text style={styles.value}>DATE</Text>
                  <Text style={styles.value}>{formatDate(packageData.payments[0]?.date)}</Text>
                </View>
                <View style={styles.gridCell}>
                  <Text style={styles.label}>AMOUNT</Text>
                  <Text style={styles.value}>{formatNumber(packageData.payments[0]?.amount)}</Text>
                </View>
                <View style={styles.gridCell}>
                  <Text style={styles.label}>CONVERSION RATE</Text>
                  <Text style={styles.value}>{packageData.payments[0]?.conversionRate || 0}</Text>
                </View>
                <View style={styles.gridCell}>
                  <Text style={styles.label}>AMOUNT IN INR</Text>
                  <Text style={styles.value}>{formatNumber(packageData.payments[0]?.amountInINR)}</Text>
                </View>
                <View style={[styles.gridCell, styles.gridCellLast]}>
                  <Text style={styles.label}>TOTAL</Text>
                  <Text style={styles.value}>{formatNumber(packageData.payments[0]?.amountInINR)}</Text>
                </View>
              </View>
            )}
          </View>
        </View>

        {/* Driver & Transport Details Section */}
        {packageData.transport ? (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Driver & Transport Details</Text>
            </View>
            <View style={styles.sectionContent}>
              {/* Driver Info */}
              <View style={styles.gridRow}>
                <View style={styles.gridCell}>
                  <Text style={styles.label}>NAME OF DRIVER</Text>
                  <Text style={styles.value}>{packageData.transport.driverName || 'N/A'}</Text>
                </View>
                <View style={styles.gridCell}>
                  <Text style={styles.label}>PHONE</Text>
                  <Text style={styles.value}>{packageData.transport.phone || 'N/A'}</Text>
                </View>
                <View style={styles.gridCell}>
                  <Text style={styles.label}>VEHICLE TYPE</Text>
                  <Text style={styles.value}>{packageData.transport.vehicleType || 'INNOVA'}</Text>
                </View>
                <View style={styles.gridCell}>
                  <Text style={styles.label}>REGN NO.</Text>
                  <Text style={styles.value}>{packageData.transport.regNo || 'N/A'}</Text>
                </View>
                <View style={[styles.gridCell, styles.gridCellLast]}>
                  <Text style={styles.label}>ADVANCE</Text>
                  <Text style={styles.value}>{formatNumber(packageData.transport.advance)}</Text>
                </View>
              </View>

              {/* Transport Hire Details */}
              <View style={styles.gridRow}>
                <View style={styles.gridCell}>
                  <Text style={styles.label}>TRANSPORT HIRE</Text>
                  <Text style={styles.value}>-</Text>
                </View>
                <View style={styles.gridCell}>
                  <Text style={styles.label}>DAILY RENT</Text>
                  <Text style={styles.value}>{formatNumber(packageData.transport.hire?.dailyRent)}</Text>
                </View>
                <View style={styles.gridCell}>
                  <Text style={styles.label}>NO. OF DAYS</Text>
                  <Text style={styles.value}>{packageData.transport.hire?.noOfDays || 0}</Text>
                </View>
                <View style={styles.gridCell}>
                  <Text style={styles.label}>RENT TOTAL</Text>
                  <Text style={styles.value}>{formatNumber(packageData.transport.hire?.totalRent)}</Text>
                </View>
                <View style={[styles.gridCell, styles.gridCellLast]}>
                  <Text style={styles.label}>NET TOTAL</Text>
                  <Text style={styles.value}>{formatNumber(packageData.transport.hire?.netTotal)}</Text>
                </View>
              </View>

              <View style={styles.gridRow}>
                <View style={styles.gridCell}>
                  <Text style={styles.label}>PARKING & TOLL</Text>
                  <Text style={styles.value}>{formatNumber(packageData.transport.hire?.parkingToll)}</Text>
                </View>
                <View style={styles.gridCell}>
                  <Text style={styles.label}>EXTRA KM</Text>
                  <Text style={styles.value}>{packageData.transport.hire?.extraKm || 0}</Text>
                </View>
                <View style={styles.gridCell}>
                  <Text style={styles.label}>EXTRA KM RATE</Text>
                  <Text style={styles.value}>{formatNumber(packageData.transport.hire?.extraKmRate)}</Text>
                </View>
                <View style={[styles.gridCell, styles.gridCellLast]}>
                  <Text style={styles.label}>EXTRA KM TOTAL</Text>
                  <Text style={styles.value}>{formatNumber(packageData.transport.hire?.extraKmTotal)}</Text>
                </View>
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Driver & Transport Details</Text>
            </View>
            <View style={styles.sectionContent}>
              <Text style={styles.noDataMessage}>No transport details available for this package</Text>
            </View>
          </View>
        )}

        {/* Package Expenditure Details Section */}
        {packageData.hotelBookings && packageData.hotelBookings.length > 0 ? (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Package Expenditure Details</Text>
            </View>
            <View style={styles.sectionContent}>
              {packageData.hotelBookings.map((booking, index) => (
                <View key={index} style={styles.section}>
                  <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Booking {index + 1}</Text>
                  </View>
                  <View style={styles.sectionContent}>
                    {/* First Row */}
                    <View style={styles.gridRow}>
                      <View style={styles.gridCell}>
                        <Text style={styles.label}>HOTEL</Text>
                        <Text style={styles.value}>{booking.hotel?.hotelName || 'N/A'}</Text>
                      </View>
                      <View style={styles.gridCell}>
                        <Text style={styles.label}>DESTINATION</Text>
                        <Text style={styles.value}>{booking.destination?.destinationName || 'N/A'}</Text>
                      </View>
                      <View style={styles.gridCell}>
                        <Text style={styles.label}>CHECK IN</Text>
                        <Text style={styles.value}>{formatDate(booking.checkIn)}</Text>
                      </View>
                      <View style={styles.gridCell}>
                        <Text style={styles.label}>CHECK OUT</Text>
                        <Text style={styles.value}>{formatDate(booking.checkOut)}</Text>
                      </View>
                      <View style={styles.gridCell}>
                        <Text style={styles.label}>NIGHTS</Text>
                        <Text style={styles.value}>{booking.noOfNights}</Text>
                      </View>
                      <View style={styles.gridCell}>
                        <Text style={styles.label}>PAX</Text>
                        <Text style={styles.value}>{booking.noOfPaxs}</Text>
                      </View>
                      <View style={styles.gridCell}>
                        <Text style={styles.label}>ROOMS</Text>
                        <Text style={styles.value}>{booking.noOfRooms}</Text>
                      </View>
                      <View style={[styles.gridCell, styles.gridCellLast]}>
                        <Text style={styles.label}>ROOM RATE</Text>
                        <Text style={styles.value}>{formatNumber(booking.roomRate)}</Text>
                      </View>
                    </View>

                    {/* Second Row */}
                    <View style={styles.gridRow}>
                      <View style={styles.gridCell}>
                        <Text style={styles.label}>ROOM TYPE</Text>
                        <Text style={styles.value}>{booking.typeOfRoom}</Text>
                      </View>
                      <View style={styles.gridCell}>
                        <Text style={styles.label}>TOTAL</Text>
                        <Text style={styles.value}>{formatNumber(booking.total)}</Text>
                      </View>
                      <View style={styles.gridCell}>
                        <Text style={styles.label}>EXTRA BED RATE</Text>
                        <Text style={styles.value}>{formatNumber(booking.extraBedRate)}</Text>
                      </View>
                      <View style={styles.gridCell}>
                        <Text style={styles.label}>EXTRA BED</Text>
                        <Text style={styles.value}>{formatNumber(booking.extraBedTotal)}</Text>
                      </View>
                      <View style={styles.gridCell}>
                        <Text style={styles.label}>NET TOTAL</Text>
                        <Text style={styles.valueLarge}>{formatNumber(booking.netTotal)}</Text>
                      </View>
                      <View style={styles.gridCell}>
                        <Text style={styles.label}>PAID</Text>
                        <Text style={styles.value}>{formatNumber(booking.paid)}</Text>
                      </View>
                      <View style={styles.gridCell}>
                        <Text style={styles.label}>BALANCE</Text>
                        <Text style={styles.value}>{formatNumber(booking.balance)}</Text>
                      </View>
                      <View style={[styles.gridCell, styles.gridCellLast]}>
                        <Text style={styles.label}>CUT OFF DATE</Text>
                        <Text style={styles.value}>{formatDate(booking.cutOffDate)}</Text>
                      </View>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </View>
        ) : (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Package Expenditure Details</Text>
            </View>
            <View style={styles.sectionContent}>
              <Text style={styles.noDataMessage}>No hotel bookings available for this package</Text>
            </View>
          </View>
        )}

        {/* Other Expenses Section */}
        {packageData.expense ? (
          <View style={styles.section}>
            <View style={styles.sectionHeaderRed}>
              <Text style={styles.sectionTitle}>Other Expenses</Text>
            </View>
            <View style={styles.sectionContent}>
              <View style={styles.gridRow}>
                <View style={styles.gridCell}>
                  <Text style={styles.label}>CIAL Parking</Text>
                  <Text style={styles.value}>{formatNumber(packageData.expense.parking)}</Text>
                </View>
                <View style={styles.gridCell}>
                  <Text style={styles.label}>CIAL Entry</Text>
                  <Text style={styles.value}>{formatNumber(packageData.expense.entry)}</Text>
                </View>
                <View style={styles.gridCell}>
                  <Text style={styles.label}>Bouquet</Text>
                  <Text style={styles.value}>{formatNumber(packageData.expense.bouquet)}</Text>
                </View>
                <View style={styles.gridCell}>
                  <Text style={styles.label}>SIM Card</Text>
                  <Text style={styles.value}>{formatNumber(packageData.expense.simCard)}</Text>
                </View>
                <View style={styles.gridCell}>
                  <Text style={styles.label}>Room</Text>
                  <Text style={styles.value}>{formatNumber(packageData.expense.room || 600)}</Text>
                </View>
                <View style={styles.gridCell}>
                  <Text style={styles.label}>Food</Text>
                  <Text style={styles.value}>{formatNumber(packageData.expense.food)}</Text>
                </View>
                <View style={styles.gridCell}>
                  <Text style={styles.label}>Transportation</Text>
                  <Text style={styles.value}>{formatNumber(packageData.expense.transportation)}</Text>
                </View>
                <View style={[styles.gridCell, styles.gridCellLast]}>
                  <Text style={styles.label}>Total</Text>
                  <Text style={styles.valueLarge}>{formatNumber(packageData.expense.total)}</Text>
                </View>
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.section}>
            <View style={styles.sectionHeaderRed}>
              <Text style={styles.sectionTitle}>Other Expenses</Text>
            </View>
            <View style={styles.sectionContent}>
              <Text style={styles.noDataMessage}>No expense details available for this package</Text>
            </View>
          </View>
        )}

        {/* Signatures Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRed}>
            <Text style={styles.sectionTitle}>Signatures</Text>
          </View>
          <View style={styles.sectionContent}>
            <View style={styles.signatureGrid}>
              <View style={styles.signatureCell}>
                <Text style={styles.label}>Tour Executive</Text>
                <Text style={styles.value}>{packageData.tourExecutive || 'UMMAR'}</Text>
              </View>
              <View style={styles.signatureCell}>
                <Text style={styles.label}>Transporter</Text>
                <Text style={styles.value}>{packageData.transporter || 'ANSARI'}</Text>
              </View>
              <View style={styles.signatureCell}>
                <Text style={styles.label}>Reservation Officer</Text>
                <Text style={styles.value}>{packageData.reservationOfficer || 'N/A'}</Text>
              </View>
              <View style={styles.signatureCell}>
                <Text style={styles.label}>Handling Officer</Text>
                <Text style={styles.value}>{packageData.handlingOfficer || 'N/A'}</Text>
              </View>
              <View style={styles.signatureCellFull}>
                <Text style={styles.label}>Source of Enquiry</Text>
                <Text style={styles.value}>{packageData.sourceOfEnquiry || 'N/A'}</Text>
              </View>
            </View>
          </View>
        </View>
      </Page>
    </Document>
  )
}

export default PackageDetailsPDF
