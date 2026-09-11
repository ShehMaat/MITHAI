import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  TextInput,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useStore } from '@/store/useStore';

interface RiderOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  phone: string;
  address: string;
  distance: string;
  eta: string;
  items: string[];
  totalAmount: number;
  paymentStatus: 'Paid (UPI)' | 'Cash on Delivery';
  packaging: string;
  status: 'assigned' | 'picked_up' | 'delivered';
  otp: string;
}

const INITIAL_RIDER_ORDERS: RiderOrder[] = [
  {
    id: 'ro-1',
    orderNumber: '#GBM-84920',
    customerName: 'Gaurav Jain',
    phone: '+91 98765 43210',
    address: 'Flat 402, Nirvana Courtyard, Sector 50, Gurugram',
    distance: '3.4 km',
    eta: '14 mins',
    items: ['1x Kaju Katli (500g)', '1x Desi Ghee Motichoor (500g)'],
    totalAmount: 1073,
    paymentStatus: 'Paid (UPI)',
    packaging: 'Royal Velvet Gift Box',
    status: 'picked_up',
    otp: '8492',
  },
  {
    id: 'ro-2',
    orderNumber: '#GBM-84931',
    customerName: 'Priya Sharma',
    phone: '+91 98123 45678',
    address: 'B-1204, Magnolias, Golf Course Road, DLF Phase 5',
    distance: '5.1 km',
    eta: 'Next in queue',
    items: ['2x Custom Mithai Hamper (4-box)', '1x Besan Ladoo (1kg)'],
    totalAmount: 1680,
    paymentStatus: 'Cash on Delivery',
    packaging: 'Heritage Brass Box',
    status: 'assigned',
    otp: '4931',
  },
];

export default function RiderDashboardScreen() {
  const { user } = useStore();
  const [riderLoggedIn, setRiderLoggedIn] = useState(false);
  const [riderPhone, setRiderPhone] = useState(user?.role === 'rider' ? user.phone : '9993393853');
  const [phoneError, setPhoneError] = useState('');
  const [isOnDuty, setIsOnDuty] = useState(true);
  const [activeTab, setActiveTab] = useState<'active' | 'history'>('active');
  const [orders, setOrders] = useState<RiderOrder[]>(INITIAL_RIDER_ORDERS);
  const [enteredOtp, setEnteredOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [completedOrderSuccess, setCompletedOrderSuccess] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem('GBM_RIDER_AUTH').then((val) => {
      if (val === 'true' || user?.role === 'rider') {
        setRiderLoggedIn(true);
      }
    });
  }, [user]);

  const handleRiderLogin = () => {
    const clean = riderPhone.replace(/[^0-9]/g, '').slice(-10);
    if (clean === '9993393853') {
      AsyncStorage.setItem('GBM_RIDER_AUTH', 'true').catch(() => {});
      setRiderLoggedIn(true);
      setPhoneError('');
    } else {
      setPhoneError('Access Restricted: Only registered fleet numbers (9993393853) can activate delivery shifts.');
    }
  };

  const handleRiderLogout = () => {
    AsyncStorage.removeItem('GBM_RIDER_AUTH').catch(() => {});
    setRiderLoggedIn(false);
  };

  const activeOrders = orders.filter((o) => o.status !== 'delivered');
  const completedOrders = orders.filter((o) => o.status === 'delivered');

  const handleVerifyOtp = (orderId: string, expectedOtp: string) => {
    if (enteredOtp.trim() === expectedOtp) {
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: 'delivered' } : o))
      );
      setEnteredOtp('');
      setOtpError('');
      setCompletedOrderSuccess(true);
      setTimeout(() => setCompletedOrderSuccess(false), 4000);
    } else {
      setOtpError(`Invalid OTP. Enter the 4-digit code (${expectedOtp} for demo).`);
    }
  };

  const handleCall = (phone: string) => {
    Linking.openURL(`tel:${phone}`);
  };

  const handleWhatsApp = (phone: string) => {
    Linking.openURL(`https://wa.me/${phone.replace(/[^0-9]/g, '')}?text=Namaste! I am on my way with your Gaurav Bhai Ki Mithai fresh sweet order.`);
  };

  const handleNavigation = (address: string) => {
    Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`);
  };

  if (!riderLoggedIn) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor={Colors.light.background} />
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            activeOpacity={0.7}
            onPress={() => router.replace('/')}>
            <Ionicons name="arrow-back" size={20} color={Colors.light.text} />
          </TouchableOpacity>
          <View>
            <Text style={styles.headerTitle}>Delivery Fleet Partner</Text>
            <Text style={styles.headerSub}>Gaurav Bhai Ki Mithai Express</Text>
          </View>
        </View>

        <View style={{ flex: 1, padding: 24, justifyContent: 'center', maxWidth: 360, alignSelf: 'center', width: '100%' }}>
          <View style={{ width: 72, height: 72, borderRadius: 36, backgroundColor: '#FFF0E0', alignItems: 'center', justifyContent: 'center', marginBottom: 16, alignSelf: 'center' }}>
            <Ionicons name="bicycle" size={36} color={Colors.light.primary} />
          </View>

          <Text style={{ fontSize: 22, fontWeight: '800', color: Colors.light.text, textAlign: 'center', marginBottom: 6 }}>
            Rider Shift Login
          </Text>
          <Text style={{ fontSize: 13, color: Colors.light.textSecondary, textAlign: 'center', marginBottom: 24, lineHeight: 18 }}>
            Enter your registered 10-digit delivery partner mobile number to access assigned orders
          </Text>

          <View style={{ backgroundColor: '#FFFFFF', borderRadius: 14, borderWidth: 1, borderColor: '#EFE7DE', paddingHorizontal: 16, paddingVertical: 12, marginBottom: 12 }}>
            <Text style={{ fontSize: 11, fontWeight: '700', color: Colors.light.textSecondary, marginBottom: 4 }}>REGISTERED MOBILE</Text>
            <TextInput
              style={{ fontSize: 16, fontWeight: '700', color: Colors.light.text }}
              value={riderPhone}
              onChangeText={setRiderPhone}
              keyboardType="phone-pad"
              maxLength={10}
              placeholder="9876543210"
            />
          </View>

          {phoneError ? (
            <Text style={{ fontSize: 12, color: '#DC2626', fontWeight: '600', marginBottom: 12, textAlign: 'center' }}>
              {phoneError}
            </Text>
          ) : null}

          <TouchableOpacity
            style={{ backgroundColor: Colors.light.primary, height: 50, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginTop: 8 }}
            activeOpacity={0.85}
            onPress={handleRiderLogin}>
            <Text style={{ color: '#FFFFFF', fontSize: 15, fontWeight: '700' }}>Activate Delivery Shift</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{ marginTop: 16, alignItems: 'center' }}
            onPress={() => router.replace('/')}>
            <Text style={{ color: Colors.light.textSecondary, fontSize: 13, fontWeight: '600' }}>Return to Customer App</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.light.background} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          activeOpacity={0.7}
          onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color={Colors.light.text} />
        </TouchableOpacity>

        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>Fleet Delivery Partner</Text>
          <Text style={styles.headerSub}>Rider ID: #R-204 • Ramesh Verma</Text>
        </View>

        {/* Duty Status Switcher & Logout */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <TouchableOpacity
            style={[styles.dutyPill, isOnDuty ? styles.dutyPillOn : styles.dutyPillOff]}
            activeOpacity={0.8}
            onPress={() => setIsOnDuty(!isOnDuty)}>
            <View style={[styles.dutyDot, isOnDuty ? styles.dutyDotOn : styles.dutyDotOff]} />
            <Text style={[styles.dutyText, isOnDuty ? styles.dutyTextOn : styles.dutyTextOff]}>
              {isOnDuty ? 'ON DUTY' : 'BREAK'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#EFE7DE' }}
            activeOpacity={0.7}
            onPress={handleRiderLogout}>
            <Ionicons name="log-out-outline" size={16} color="#DC2626" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        {/* Today's Shift Metrics Banner */}
        <View style={styles.metricsCard}>
          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>Today&apos;s Earnings</Text>
            <Text style={styles.metricValue}>₹840</Text>
            <Text style={styles.metricSub}>+ ₹150 festive bonus</Text>
          </View>
          <View style={styles.metricDivider} />
          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>Trips Done</Text>
            <Text style={styles.metricValue}>7</Text>
            <Text style={styles.metricSub}>100% On-time</Text>
          </View>
          <View style={styles.metricDivider} />
          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>Rating</Text>
            <View style={styles.ratingRow}>
              <Ionicons name="star" size={14} color="#F59E0B" />
              <Text style={styles.metricValue}>4.98</Text>
            </View>
            <Text style={styles.metricSub}>Top Fleet</Text>
          </View>
        </View>

        {/* Fresh Artisanal Sweets Handling Warning */}
        <View style={styles.advisoryCard}>
          <View style={styles.advisoryIcon}>
            <Ionicons name="cube-outline" size={20} color={Colors.light.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.advisoryTitle}>Delicate Mithai Handling Advisory</Text>
            <Text style={styles.advisoryBody}>
              Keep sweet boxes horizontal at all times. Silver vark cashews and warm laddoos are fragile. Avoid sudden braking.
            </Text>
          </View>
        </View>

        {/* Success toast if completed */}
        {completedOrderSuccess && (
          <View style={styles.successToast}>
            <Ionicons name="checkmark-circle" size={20} color="#065F46" />
            <View style={{ flex: 1 }}>
              <Text style={styles.successTitle}>Delivery Completed Successfully!</Text>
              <Text style={styles.successSub}>+ ₹120 credited to your shift payout.</Text>
            </View>
          </View>
        )}

        {/* Tab Switcher */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'active' && styles.tabBtnActive]}
            activeOpacity={0.8}
            onPress={() => setActiveTab('active')}>
            <Text style={[styles.tabBtnText, activeTab === 'active' && styles.tabBtnTextActive]}>
              Active Trips ({activeOrders.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'history' && styles.tabBtnActive]}
            activeOpacity={0.8}
            onPress={() => setActiveTab('history')}>
            <Text style={[styles.tabBtnText, activeTab === 'history' && styles.tabBtnTextActive]}>
              Completed Today ({completedOrders.length})
            </Text>
          </TouchableOpacity>
        </View>

        {/* Active Order Card */}
        {activeTab === 'active' ? (
          activeOrders.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="bicycle-outline" size={48} color={Colors.light.outline} />
              <Text style={styles.emptyTitle}>No Active Deliveries</Text>
              <Text style={styles.emptySub}>
                All assigned boutique sweets delivered! Stay on duty for incoming orders from Hazratganj kitchen.
              </Text>
            </View>
          ) : (
            activeOrders.map((order, idx) => (
              <View key={order.id} style={styles.orderCard}>
                {/* Header row */}
                <View style={styles.orderCardHeader}>
                  <View>
                    <View style={styles.orderNumRow}>
                      <Text style={styles.orderNumber}>{order.orderNumber}</Text>
                      <View style={styles.priorityBadge}>
                        <Text style={styles.priorityBadgeText}>
                          {idx === 0 ? 'CURRENT TRIP' : 'NEXT UP'}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.orderPackaging}>{order.packaging}</Text>
                  </View>

                  <View style={styles.etaBox}>
                    <Ionicons name="time-outline" size={14} color={Colors.light.primary} />
                    <Text style={styles.etaText}>{order.eta}</Text>
                  </View>
                </View>

                {/* Items Summary */}
                <View style={styles.itemsBox}>
                  {order.items.map((it, i) => (
                    <Text key={i} style={styles.itemText}>• {it}</Text>
                  ))}
                  <View style={styles.payStatusRow}>
                    <Text style={styles.payStatusLabel}>Payment:</Text>
                    <Text style={[styles.payStatusVal, order.paymentStatus.includes('Paid') ? styles.paidText : styles.codText]}>
                      {order.paymentStatus} (₹{order.totalAmount})
                    </Text>
                  </View>
                </View>

                {/* Customer Address Card */}
                <View style={styles.addressBox}>
                  <View style={styles.addressIconWrap}>
                    <Ionicons name="location" size={18} color={Colors.light.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.customerName}>{order.customerName}</Text>
                    <Text style={styles.addressFull}>{order.address}</Text>
                    <Text style={styles.distanceText}>Distance: {order.distance}</Text>
                  </View>
                </View>

                {/* Action Buttons: Call, WhatsApp, Map Navigation */}
                <View style={styles.actionButtonsRow}>
                  <TouchableOpacity
                    style={styles.actionBtnSec}
                    activeOpacity={0.7}
                    onPress={() => handleCall(order.phone)}>
                    <Ionicons name="call" size={16} color={Colors.light.primary} />
                    <Text style={styles.actionBtnSecText}>Call</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.actionBtnSec}
                    activeOpacity={0.7}
                    onPress={() => handleWhatsApp(order.phone)}>
                    <Ionicons name="logo-whatsapp" size={16} color="#059669" />
                    <Text style={[styles.actionBtnSecText, { color: '#059669' }]}>WhatsApp</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.navBtnPrimary}
                    activeOpacity={0.8}
                    onPress={() => handleNavigation(order.address)}>
                    <Ionicons name="navigate" size={16} color="#FFFFFF" />
                    <Text style={styles.navBtnPrimaryText}>Maps</Text>
                  </TouchableOpacity>
                </View>

                {/* Handover OTP Verification */}
                <View style={styles.otpVerificationBox}>
                  <View style={styles.otpTitleRow}>
                    <Ionicons name="shield-checkmark" size={16} color={Colors.light.pistachio} />
                    <Text style={styles.otpTitle}>Customer Delivery Handover OTP</Text>
                  </View>
                  <Text style={styles.otpSubtitle}>
                    Ask customer for the 4-digit code displayed on their screen (Demo: {order.otp})
                  </Text>

                  <View style={styles.otpInputRow}>
                    <TextInput
                      style={styles.otpInput}
                      placeholder="Enter 4-digit OTP"
                      placeholderTextColor={Colors.light.outline}
                      keyboardType="number-pad"
                      maxLength={4}
                      value={enteredOtp}
                      onChangeText={(val) => {
                        setEnteredOtp(val);
                        setOtpError('');
                      }}
                    />
                    <TouchableOpacity
                      style={[
                        styles.verifyBtn,
                        enteredOtp.length < 4 && styles.verifyBtnDisabled,
                      ]}
                      disabled={enteredOtp.length < 4}
                      activeOpacity={0.85}
                      onPress={() => handleVerifyOtp(order.id, order.otp)}>
                      <Text style={styles.verifyBtnText}>Verify & Complete</Text>
                    </TouchableOpacity>
                  </View>

                  {otpError ? (
                    <Text style={styles.otpErrorText}>{otpError}</Text>
                  ) : null}
                </View>
              </View>
            ))
          )
        ) : (
          /* Completed History Tab */
          completedOrders.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="checkmark-done-circle-outline" size={48} color={Colors.light.outline} />
              <Text style={styles.emptyTitle}>No Completed Trips Yet</Text>
              <Text style={styles.emptySub}>Deliver your first order to see shift history here.</Text>
            </View>
          ) : (
            completedOrders.map((order) => (
              <View key={order.id} style={styles.historyCard}>
                <View style={styles.historyHeader}>
                  <View>
                    <Text style={styles.historyNum}>{order.orderNumber}</Text>
                    <Text style={styles.historyCust}>{order.customerName}</Text>
                  </View>
                  <View style={styles.historyStatusPill}>
                    <Ionicons name="checkmark-circle" size={14} color="#059669" />
                    <Text style={styles.historyStatusText}>Handover Done</Text>
                  </View>
                </View>
                <Text style={styles.historyAddr}>{order.address}</Text>
                <View style={styles.historyFooter}>
                  <Text style={styles.historyItems}>{order.items.join(', ')}</Text>
                  <Text style={styles.historyEarn}>+ ₹120</Text>
                </View>
              </View>
            ))
          )
        )}

        {/* Switch back to Customer Boutique link */}
        <TouchableOpacity
          style={styles.returnCustomerBtn}
          activeOpacity={0.8}
          onPress={() => router.push('/' as any)}>
          <Ionicons name="storefront-outline" size={16} color={Colors.light.primary} />
          <Text style={styles.returnCustomerText}>Return to Sweet Boutique Shop</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.light.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.outlineVariant,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: Colors.light.outlineVariant,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerInfo: {
    flex: 1,
    marginHorizontal: 12,
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.light.text,
  },
  headerSub: {
    fontSize: 11,
    color: Colors.light.textSecondary,
  },
  dutyPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
  },
  dutyPillOn: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  dutyPillOff: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  dutyDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dutyDotOn: {
    backgroundColor: '#059669',
  },
  dutyDotOff: {
    backgroundColor: '#DC2626',
  },
  dutyText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  dutyTextOn: {
    color: '#065F46',
  },
  dutyTextOff: {
    color: '#991B1B',
  },
  scrollContent: {
    padding: 16,
    gap: 14,
  },
  metricsCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.light.outlineVariant,
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  metricItem: {
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 11,
    color: Colors.light.textSecondary,
    fontWeight: '600',
    marginBottom: 2,
  },
  metricValue: {
    fontSize: 18,
    fontWeight: '900',
    color: Colors.light.text,
  },
  metricSub: {
    fontSize: 10,
    color: Colors.light.tertiary,
    fontWeight: '600',
    marginTop: 2,
  },
  metricDivider: {
    width: 1,
    height: 36,
    backgroundColor: '#F0EDE9',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  advisoryCard: {
    flexDirection: 'row',
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FED7AA',
    borderRadius: 12,
    padding: 12,
    gap: 10,
    alignItems: 'center',
  },
  advisoryIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFEDD5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  advisoryTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.light.primary,
  },
  advisoryBody: {
    fontSize: 11,
    color: '#7C2D12',
    marginTop: 2,
    lineHeight: 15,
  },
  successToast: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    borderWidth: 1,
    borderColor: '#86EFAC',
    borderRadius: 12,
    padding: 12,
    gap: 10,
  },
  successTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#065F46',
  },
  successSub: {
    fontSize: 11,
    color: '#047857',
    marginTop: 1,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.light.backgroundElement,
    borderRadius: 14,
    padding: 3,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 9,
    alignItems: 'center',
    borderRadius: 11,
  },
  tabBtnActive: {
    backgroundColor: '#FFFFFF',
    elevation: 2,
  },
  tabBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.light.textSecondary,
  },
  tabBtnTextActive: {
    color: Colors.light.primary,
    fontWeight: '800',
  },
  orderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.light.outlineVariant,
    gap: 12,
  },
  orderCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  orderNumRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  orderNumber: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.light.text,
  },
  priorityBadge: {
    backgroundColor: '#FFE4E6',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  priorityBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#E11D48',
    letterSpacing: 0.5,
  },
  orderPackaging: {
    fontSize: 11,
    color: Colors.light.textSecondary,
    fontWeight: '600',
    marginTop: 2,
  },
  etaBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFF2EB',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  etaText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.light.primary,
  },
  itemsBox: {
    backgroundColor: '#FAF7F2',
    padding: 10,
    borderRadius: 10,
    gap: 4,
  },
  itemText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.light.text,
  },
  payStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: '#EBE5DA',
  },
  payStatusLabel: {
    fontSize: 11,
    color: Colors.light.textSecondary,
  },
  payStatusVal: {
    fontSize: 11,
    fontWeight: '800',
  },
  paidText: {
    color: '#059669',
  },
  codText: {
    color: '#D97706',
  },
  addressBox: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
  },
  addressIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFE9DF',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  customerName: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.light.text,
  },
  addressFull: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    lineHeight: 16,
    marginTop: 2,
  },
  distanceText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.light.outline,
    marginTop: 2,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtnSec: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 9,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: Colors.light.outlineVariant,
  },
  actionBtnSecText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.light.primary,
  },
  navBtnPrimary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 9,
    borderRadius: 10,
    backgroundColor: Colors.light.primary,
  },
  navBtnPrimaryText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  otpVerificationBox: {
    marginTop: 4,
    backgroundColor: '#F8F6F1',
    borderWidth: 1,
    borderColor: '#E7DFC6',
    borderRadius: 12,
    padding: 12,
  },
  otpTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  otpTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.light.text,
  },
  otpSubtitle: {
    fontSize: 11,
    color: Colors.light.textSecondary,
    marginTop: 2,
    lineHeight: 15,
  },
  otpInputRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },
  otpInput: {
    flex: 1,
    height: 42,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.light.outlineVariant,
    paddingHorizontal: 12,
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 2,
    color: Colors.light.text,
  },
  verifyBtn: {
    backgroundColor: Colors.light.pistachio,
    paddingHorizontal: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  verifyBtnDisabled: {
    opacity: 0.5,
  },
  verifyBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  otpErrorText: {
    color: '#DC2626',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 6,
  },
  historyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.light.outlineVariant,
    gap: 6,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  historyNum: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.light.text,
  },
  historyCust: {
    fontSize: 11,
    color: Colors.light.textSecondary,
  },
  historyStatusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  historyStatusText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#059669',
  },
  historyAddr: {
    fontSize: 11,
    color: Colors.light.textSecondary,
  },
  historyFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#F3EFEA',
    marginTop: 4,
  },
  historyItems: {
    fontSize: 11,
    color: Colors.light.textSecondary,
    flex: 1,
  },
  historyEarn: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.light.pistachio,
  },
  returnCustomerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: Colors.light.primary,
    borderRadius: 12,
    paddingVertical: 12,
    marginTop: 10,
  },
  returnCustomerText: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.light.primary,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.light.text,
  },
  emptySub: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    textAlign: 'center',
    paddingHorizontal: 24,
    lineHeight: 16,
  },
});
