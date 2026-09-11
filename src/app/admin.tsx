import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { apiClient } from '@/services/apiClient';
import { router } from 'expo-router';
import { playKitchenBellChime, playSuccessChime } from '@/utils/soundEffects';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AdminPinModal from '@/components/admin-pin-modal';
import { useStore } from '@/store/useStore';

interface KitchenOrder {
  id: string;
  token: string;
  customerName: string;
  phone: string;
  time: string;
  items: string[];
  packaging: string;
  amount: number;
  paymentMethod: string;
  status: 'preparing' | 'ready' | 'completed';
}

const INITIAL_ORDERS: KitchenOrder[] = [
  {
    id: '#GBM-84920',
    token: '42',
    customerName: 'Gaurav Jain',
    phone: '+91 98765 43210',
    time: '5:15 PM (12m ago)',
    items: [
      '1x Premium Kaju Katli (500g box)',
      '1x Desi Ghee Motichoor Ladoo (500g box)',
    ],
    packaging: 'Royal Festive Velvet Box & Golden Card',
    amount: 980,
    paymentMethod: 'UPI (Google Pay)',
    status: 'preparing',
  },
  {
    id: '#GBM-84918',
    token: '41',
    customerName: 'Pooja Sharma',
    phone: '+91 98111 22334',
    time: '5:00 PM (27m ago)',
    items: [
      '2x Shahi Angoori Gulab Jamun (1kg)',
      '1x Classic Sponge Rasgulla (Pack of 12)',
    ],
    packaging: 'Standard Airtight Tray',
    amount: 1460,
    paymentMethod: 'Credit Card',
    status: 'ready',
  },
  {
    id: '#GBM-84915',
    token: '39',
    customerName: 'Amit Verma',
    phone: '+91 99223 44556',
    time: '4:40 PM',
    items: ['1x Mathura Ke Shahi Peda (500g)'],
    packaging: 'Standard Airtight Tray',
    amount: 420,
    paymentMethod: 'Cash on Counter',
    status: 'ready',
  },
];

export default function AdminScreen() {
  const { user } = useStore();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [storeOpen, setStoreOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'preparing' | 'ready' | 'analytics'>('all');
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [orders, setOrders] = useState<KitchenOrder[]>(INITIAL_ORDERS);
  const [tokenInput, setTokenInput] = useState('');
  const [stock, setStock] = useState({
    kajuKatli: 14.5,
    motichoor: 3.0,
    rasgulla: 18,
  });

  const fetchAnalytics = async () => {
    try {
      const res = await apiClient.get<any>('/analytics/summary');
      if (res && res.data) {
        setAnalyticsData(res.data);
      }
    } catch (e) {
      console.warn('[Admin] Failed to fetch analytics:', e);
    }
  };

  useEffect(() => {
    if (activeTab === 'analytics') {
      fetchAnalytics();
    }
  }, [activeTab]);

  useEffect(() => {
    AsyncStorage.getItem('GBM_ADMIN_AUTH').then((val) => {
      if (val === 'true' || user?.role === 'admin') {
        setIsAuthenticated(true);
      }
      setCheckingAuth(false);
    });
  }, [user]);

  const handleLock = () => {
    AsyncStorage.removeItem('GBM_ADMIN_AUTH').catch(() => {});
    setIsAuthenticated(false);
  };

  const handleVerifyToken = () => {
    const cleanToken = tokenInput.trim().replace('#', '').replace('TOKEN', '').trim();
    if (!cleanToken) {
      Alert.alert('Enter Token', 'Please enter a token number (e.g. 42) to verify.');
      return;
    }

    const matched = orders.find((o) => o.token === cleanToken);
    if (matched) {
      playKitchenBellChime();
      Alert.alert(
        'Token Verified! ✅',
        `Order ${matched.id} for ${matched.customerName} matched!\nAmount: ₹${matched.amount} (${matched.paymentMethod})\nItems: ${matched.items.join(', ')}`,
        [
          {
            text: 'Complete Handover',
            onPress: () => {
              playSuccessChime();
              setOrders((prev) =>
                prev.map((o) =>
                  o.id === matched.id ? { ...o, status: 'completed' } : o
                )
              );
              setTokenInput('');
            },
          },
          { text: 'Cancel' },
        ]
      );
    } else {
      Alert.alert('Token Not Found', `No active order found for Token #${cleanToken}.`);
    }
  };

  const handleMarkReady = async (orderId: string) => {
    playKitchenBellChime();
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: 'ready' } : o))
    );
    try {
      await apiClient.post(`/orders/${orderId}/status`, { status: 'ready' });
    } catch (e) {
      console.warn('[Admin] Failed to sync ready status to server:', e);
    }
    Alert.alert('Order Ready', `Order ${orderId} marked ready at counter!`);
  };

  const handleComplete = async (orderId: string) => {
    playSuccessChime();
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: 'completed' } : o))
    );
    try {
      await apiClient.post(`/orders/${orderId}/status`, { status: 'delivered' });
    } catch (e) {
      console.warn('[Admin] Failed to sync delivered status to server:', e);
    }
    Alert.alert('Handover Complete', `Order ${orderId} completed successfully!`);
  };

  const handleRestockMotichoor = () => {
    playKitchenBellChime();
    setStock((prev) => ({ ...prev, motichoor: +(prev.motichoor + 5).toFixed(1) }));
    Alert.alert('Fresh Batch Cooked', 'Added +5.0 kg fresh Motichoor Ladoo to stock!');
  };

  const filteredOrders = orders.filter((o) => {
    if (activeTab === 'all') return o.status !== 'completed';
    return o.status === activeTab;
  });

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom', 'left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAF7F2" />

      {/* Top Operations Bar */}
      <View style={styles.topBar}>
        <View>
          <Text style={styles.storeBadge}>SECTOR 29 GURUGRAM BOUTIQUE</Text>
          <Text style={styles.pageTitle}>Kitchen & Counter Ops</Text>
        </View>

        <View style={styles.topRight}>
          <TouchableOpacity
            style={[styles.storeToggle, storeOpen ? styles.storeOpen : styles.storeClosed]}
            activeOpacity={0.8}
            onPress={() => setStoreOpen(!storeOpen)}>
            <View style={[styles.statusDot, { backgroundColor: storeOpen ? '#10B981' : '#EF4444' }]} />
            <Text style={styles.storeToggleText}>{storeOpen ? 'OPEN' : 'PAUSED'}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.switchModeBtn}
            activeOpacity={0.7}
            onPress={handleLock}>
            <Ionicons name="lock-closed" size={16} color="#DC2626" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.switchModeBtn}
            onPress={() => router.push('/')}>
            <Ionicons name="phone-portrait-outline" size={16} color={Colors.light.primary} />
          </TouchableOpacity>
        </View>
      </View>

      <AdminPinModal
        visible={!isAuthenticated && !checkingAuth}
        onSuccess={() => setIsAuthenticated(true)}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        {/* Real-time Shift Metrics Banner */}
        <View style={styles.metricsRow}>
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>TODAY&apos;S REVENUE</Text>
            <Text style={styles.metricValue}>₹48,650</Text>
            <Text style={styles.metricSub}>42 orders fulfilled</Text>
          </View>

          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>ACTIVE QUEUE</Text>
            <Text style={styles.metricValue}>
              {orders.filter((o) => o.status !== 'completed').length} Orders
            </Text>
            <Text style={styles.metricSub}>Avg prep: ~14m</Text>
          </View>
        </View>

        {/* Counter Token Handover Verification Box */}
        <View style={styles.verifyCard}>
          <View style={styles.verifyCardHeader}>
            <Ionicons name="qr-code-outline" size={20} color={Colors.light.saffron} />
            <Text style={styles.verifyCardTitle}>Counter Token Handover Tool</Text>
          </View>
          <Text style={styles.verifyCardSubtitle}>
            Enter the 2-digit customer pickup token or scan their digital QR code
          </Text>

          <View style={styles.verifyInputRow}>
            <TextInput
              style={styles.tokenInput}
              placeholder="Enter Token # (e.g. 42)"
              placeholderTextColor={Colors.light.outline}
              value={tokenInput}
              onChangeText={setTokenInput}
              keyboardType="number-pad"
            />
            <TouchableOpacity
              style={styles.verifyBtn}
              activeOpacity={0.85}
              onPress={handleVerifyToken}>
              <Text style={styles.verifyBtnText}>Verify</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Orders Queue & Analytics Filter Tabs */}
        <View style={styles.queueTabsRow}>
          {[
            { key: 'all', label: 'All Active' },
            { key: 'preparing', label: 'Preparing (2)' },
            { key: 'ready', label: 'Ready (3)' },
            { key: 'analytics', label: '📊 Sales & Analytics' },
          ].map((tab) => {
            const isSelected = activeTab === tab.key;
            return (
              <TouchableOpacity
                key={tab.key}
                activeOpacity={0.8}
                style={[styles.queueTab, isSelected && styles.queueTabActive]}
                onPress={() => setActiveTab(tab.key as any)}>
                <Text
                  style={[styles.queueTabText, isSelected && styles.queueTabTextActive]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {activeTab === 'analytics' ? (
          <View style={styles.analyticsContainer}>
            <View style={styles.analyticsHeaderRow}>
              <View>
                <Text style={styles.analyticsTitle}>Sales & Revenue Intelligence</Text>
                <Text style={styles.analyticsSubtitle}>
                  Real-time sync with Prisma database POS ledger
                </Text>
              </View>
              <TouchableOpacity
                style={styles.refreshAnalyticsBtn}
                onPress={fetchAnalytics}
                activeOpacity={0.7}>
                <Ionicons name="refresh" size={14} color={Colors.light.primary} />
                <Text style={styles.refreshAnalyticsText}>Refresh</Text>
              </TouchableOpacity>
            </View>

            {/* 4 KPI Metric Cards */}
            <View style={styles.kpiGrid}>
              <View style={styles.kpiCard}>
                <Text style={styles.kpiLabel}>GROSS REVENUE</Text>
                <Text style={styles.kpiValue}>
                  ₹{analyticsData?.totalRevenue ? Number(analyticsData.totalRevenue).toLocaleString() : '48,650'}
                </Text>
                <Text style={styles.kpiSub}>+18.4% this week</Text>
              </View>

              <View style={styles.kpiCard}>
                <Text style={styles.kpiLabel}>TOTAL ORDERS</Text>
                <Text style={styles.kpiValue}>
                  {analyticsData?.totalOrders || 42}
                </Text>
                <Text style={styles.kpiSub}>100% fulfilled</Text>
              </View>

              <View style={styles.kpiCard}>
                <Text style={styles.kpiLabel}>AVG ORDER VALUE</Text>
                <Text style={styles.kpiValue}>
                  ₹{analyticsData?.averageOrderValue || 1158}
                </Text>
                <Text style={styles.kpiSub}>Hamper bundle boost</Text>
              </View>

              <View style={styles.kpiCard}>
                <Text style={styles.kpiLabel}>PICKUP / DELIVERY</Text>
                <Text style={styles.kpiValue}>
                  {analyticsData?.fulfillment?.pickupPercentage || 45}% / {analyticsData?.fulfillment?.deliveryPercentage || 55}%
                </Text>
                <Text style={styles.kpiSub}>Counter vs Express</Text>
              </View>
            </View>

            {/* Payment Channels */}
            <View style={styles.analyticsSectionCard}>
              <Text style={styles.analyticsCardTitle}>Payment Channel Breakdown</Text>
              <View style={styles.paymentChannelRow}>
                <View style={styles.paymentBarItem}>
                  <Text style={styles.paymentBarLabel}>UPI Instant</Text>
                  <Text style={styles.paymentBarValue}>{analyticsData?.paymentMethods?.UPI || 29} Orders</Text>
                </View>
                <View style={styles.paymentBarItem}>
                  <Text style={styles.paymentBarLabel}>Cards</Text>
                  <Text style={styles.paymentBarValue}>{analyticsData?.paymentMethods?.Cards || 9} Orders</Text>
                </View>
                <View style={styles.paymentBarItem}>
                  <Text style={styles.paymentBarLabel}>Counter Cash</Text>
                  <Text style={styles.paymentBarValue}>{analyticsData?.paymentMethods?.Cash || 4} Orders</Text>
                </View>
              </View>
            </View>

            {/* Top Artisanal Sweets */}
            <View style={styles.analyticsSectionCard}>
              <Text style={styles.analyticsCardTitle}>🏆 Top-Selling Artisanal Sweets</Text>
              {(analyticsData?.topSweets || [
                { name: 'Royal Kaju Katli (24K Gold Leaf)', count: 28, revenue: 26600 },
                { name: 'Pure Bilona Desi Ghee Motichoor Ladoo', count: 34, revenue: 11900 },
                { name: 'Shahi Angoori Gulab Jamun', count: 19, revenue: 8550 },
              ]).map((sweet: any, idx: number) => (
                <View key={idx} style={styles.leaderboardRow}>
                  <View style={styles.rankPill}>
                    <Text style={styles.rankText}>#{idx + 1}</Text>
                  </View>
                  <View style={{ flex: 1, marginLeft: 10 }}>
                    <Text style={styles.leaderboardName}>{sweet.name}</Text>
                    <Text style={styles.leaderboardSub}>{sweet.count} units fulfilled</Text>
                  </View>
                  <Text style={styles.leaderboardRevenue}>₹{Number(sweet.revenue || 0).toLocaleString()}</Text>
                </View>
              ))}
            </View>
          </View>
        ) : (
          <>
            {/* Orders List */}
            <View style={styles.ordersSection}>
              {filteredOrders.map((order) => (
                <View key={order.id} style={styles.orderCard}>
                  <View style={styles.orderCardHeader}>
                    <View>
                      <Text style={styles.orderId}>{order.id}</Text>
                      <Text style={styles.customerInfo}>
                        {order.customerName} • {order.phone}
                      </Text>
                      <Text style={styles.orderTime}>{order.time}</Text>
                    </View>

                    <View style={styles.tokenBadge}>
                      <Text style={styles.tokenBadgeLabel}>TOKEN</Text>
                      <Text style={styles.tokenBadgeNumber}>#{order.token}</Text>
                    </View>
                  </View>

                  <View style={styles.itemsList}>
                    {order.items.map((it, idx) => (
                      <Text key={idx} style={styles.itemLine}>
                        • {it}
                      </Text>
                    ))}
                  </View>

                  <View style={styles.orderMetaBar}>
                    <Text style={styles.packagingTag}>{order.packaging}</Text>
                    <Text style={styles.orderTotal}>
                      ₹{order.amount} ({order.paymentMethod})
                    </Text>
                  </View>

                  {/* Status & Actions */}
                  <View style={styles.actionRow}>
                    {order.status === 'preparing' ? (
                      <TouchableOpacity
                        style={styles.markReadyBtn}
                        activeOpacity={0.85}
                        onPress={() => handleMarkReady(order.id)}>
                        <Ionicons name="checkmark-circle-outline" size={16} color="#FFFFFF" />
                        <Text style={styles.markReadyText}>Mark Ready for Handover</Text>
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity
                        style={styles.handoverBtn}
                        activeOpacity={0.85}
                        onPress={() => handleComplete(order.id)}>
                        <Ionicons name="bag-check" size={16} color="#FFFFFF" />
                        <Text style={styles.handoverText}>Complete Handover</Text>
                      </TouchableOpacity>
                    )}

                    <TouchableOpacity
                      style={styles.kotBtn}
                      activeOpacity={0.7}
                      onPress={() => Alert.alert('Printing KOT', `Kitchen slip printed for ${order.id}`)}>
                      <Ionicons name="print-outline" size={16} color={Colors.light.primary} />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>

            {/* Fresh Batch Stock & Low-Stock Alerts */}
            <Text style={styles.stockSectionTitle}>Fresh Kitchen Inventory & Alerts</Text>
            <View style={styles.stockCard}>
              <View style={styles.stockItemRow}>
                <View>
                  <Text style={styles.stockItemName}>Premium Kaju Katli</Text>
                  <Text style={styles.stockItemSub}>Fresh morning batch • 4:30 AM</Text>
                </View>
                <View style={styles.stockPillHealthy}>
                  <Text style={styles.stockPillTextHealthy}>{stock.kajuKatli} kg in stock</Text>
                </View>
              </View>

              <View style={styles.divider} />

              <View style={styles.stockItemRow}>
                <View style={{ flex: 1 }}>
                  <View style={styles.lowStockRow}>
                    <Ionicons name="warning" size={15} color="#DC2626" />
                    <Text style={styles.stockItemName}>Desi Ghee Motichoor Ladoo</Text>
                  </View>
                  <Text style={styles.lowStockAlertText}>
                    Low Stock Alert! ({stock.motichoor} kg left)
                  </Text>
                </View>

                <TouchableOpacity
                  style={styles.restockBtn}
                  activeOpacity={0.8}
                  onPress={handleRestockMotichoor}>
                  <Ionicons name="add" size={14} color="#FFFFFF" />
                  <Text style={styles.restockBtnText}>Cook +5kg</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.divider} />

              <View style={styles.stockItemRow}>
                <View>
                  <Text style={styles.stockItemName}>Classic Sponge Rasgulla</Text>
                  <Text style={styles.stockItemSub}>Chilled storage • Cow milk chhena</Text>
                </View>
                <View style={styles.stockPillHealthy}>
                  <Text style={styles.stockPillTextHealthy}>{stock.rasgulla} packs in stock</Text>
                </View>
              </View>
            </View>

            {/* Corporate & Wedding Bulk Quotes Section */}
            <Text style={styles.stockSectionTitle}>Wedding & Corporate Gifting Inquiries (2)</Text>
            <View style={styles.stockCard}>
              <View style={{ marginBottom: 12 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={{ fontSize: 15, fontWeight: '800', color: Colors.light.text }}>#GBM-BULK-94821</Text>
                  <View style={{ backgroundColor: '#FEF3C7', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 }}>
                    <Text style={{ fontSize: 11, fontWeight: '700', color: '#B45309' }}>Under Review</Text>
                  </View>
                </View>
                <Text style={{ fontSize: 13, color: Colors.light.textSecondary, marginTop: 4 }}>
                  Kapoor Family Wedding • 75 Kg Mithai Box
                </Text>
                <Text style={{ fontSize: 12, color: Colors.light.primary, fontWeight: '600', marginTop: 2 }}>
                  Foil: &quot;With Best Compliments from Kapoor Family&quot; • Est: ₹45,000
                </Text>
              </View>

              <View style={styles.divider} />

              <View style={{ marginTop: 8 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={{ fontSize: 15, fontWeight: '800', color: Colors.light.text }}>#GBM-BULK-94819</Text>
                  <View style={{ backgroundColor: '#ECFDF5', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 }}>
                    <Text style={{ fontSize: 11, fontWeight: '700', color: '#047857' }}>Deposit Paid</Text>
                  </View>
                </View>
                <Text style={{ fontSize: 13, color: Colors.light.textSecondary, marginTop: 4 }}>
                  TechCorp Diwali Gifting • 120 Velvet Boxes (60 Kg)
                </Text>
                <Text style={{ fontSize: 12, color: Colors.light.primary, fontWeight: '600', marginTop: 2 }}>
                  Target: 20 Oct 2026 • Est: ₹36,000 (Advance ₹9,000 Received)
                </Text>
              </View>
            </View>
          </>
        )}

        {/* Customer App Switcher */}
        <TouchableOpacity
          style={styles.returnCustomerBtn}
          activeOpacity={0.85}
          onPress={() => router.push('/')}>
          <Ionicons name="arrow-back" size={16} color={Colors.light.primary} />
          <Text style={styles.returnCustomerText}>Switch to Customer Mobile App View</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FAF7F2',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
    maxWidth: 640,
    width: '100%',
    alignSelf: 'center',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.outlineVariant,
  },
  storeBadge: {
    fontSize: 9,
    fontWeight: '800',
    color: Colors.light.saffron,
    letterSpacing: 0.8,
  },
  pageTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: Colors.light.text,
  },
  topRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  storeToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 5,
  },
  storeOpen: {
    backgroundColor: '#DCFCE7',
  },
  storeClosed: {
    backgroundColor: '#FEE2E2',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  storeToggleText: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.light.text,
  },
  switchModeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFF2EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 14,
  },
  metricCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.light.outlineVariant,
  },
  metricLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.light.textSecondary,
    letterSpacing: 0.6,
  },
  metricValue: {
    fontSize: 20,
    fontWeight: '900',
    color: Colors.light.primary,
    marginVertical: 2,
  },
  metricSub: {
    fontSize: 11,
    color: Colors.light.textSecondary,
  },
  verifyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.light.outlineVariant,
    marginBottom: 14,
  },
  verifyCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  verifyCardTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.light.text,
  },
  verifyCardSubtitle: {
    fontSize: 11,
    color: Colors.light.textSecondary,
    marginBottom: 10,
  },
  verifyInputRow: {
    flexDirection: 'row',
    gap: 10,
  },
  tokenInput: {
    flex: 1,
    backgroundColor: '#FAF7F2',
    borderWidth: 1,
    borderColor: Colors.light.outlineVariant,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 14,
    fontWeight: '700',
    color: Colors.light.text,
  },
  verifyBtn: {
    backgroundColor: Colors.light.primary,
    paddingHorizontal: 20,
    justifyContent: 'center',
    borderRadius: 10,
  },
  verifyBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  queueTabsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  queueTab: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: Colors.light.outlineVariant,
  },
  queueTabActive: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
  },
  queueTabText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.light.textSecondary,
  },
  queueTabTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  ordersSection: {
    gap: 12,
    marginBottom: 16,
  },
  orderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.light.outlineVariant,
  },
  orderCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  orderId: {
    fontSize: 15,
    fontWeight: '900',
    color: Colors.light.text,
  },
  customerInfo: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.light.textSecondary,
    marginTop: 2,
  },
  orderTime: {
    fontSize: 11,
    color: Colors.light.outline,
    marginTop: 1,
  },
  tokenBadge: {
    backgroundColor: '#FFF2EB',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.light.saffron,
    alignItems: 'center',
  },
  tokenBadgeLabel: {
    fontSize: 8,
    fontWeight: '800',
    color: Colors.light.textSecondary,
    letterSpacing: 0.5,
  },
  tokenBadgeNumber: {
    fontSize: 16,
    fontWeight: '900',
    color: Colors.light.saffron,
  },
  itemsList: {
    paddingVertical: 6,
    gap: 3,
  },
  itemLine: {
    fontSize: 12,
    color: Colors.light.text,
    fontWeight: '600',
  },
  orderMetaBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    borderTopWidth: 1,
    borderTopColor: '#F3EFEA',
    marginTop: 6,
  },
  packagingTag: {
    fontSize: 11,
    color: Colors.light.secondary,
    fontWeight: '700',
  },
  orderTotal: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.light.text,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  markReadyBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.light.saffron,
    paddingVertical: 9,
    borderRadius: 10,
    gap: 6,
  },
  markReadyText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  handoverBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10B981',
    paddingVertical: 9,
    borderRadius: 10,
    gap: 6,
  },
  handoverText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  kotBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.light.primary,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stockSectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.light.text,
    marginBottom: 10,
  },
  stockCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.light.outlineVariant,
    marginBottom: 16,
  },
  stockItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  stockItemName: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.light.text,
  },
  stockItemSub: {
    fontSize: 11,
    color: Colors.light.textSecondary,
    marginTop: 1,
  },
  stockPillHealthy: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  stockPillTextHealthy: {
    fontSize: 11,
    fontWeight: '700',
    color: '#047857',
  },
  lowStockRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  lowStockAlertText: {
    fontSize: 11,
    color: '#DC2626',
    fontWeight: '700',
    marginTop: 2,
  },
  restockBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.primary,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  restockBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  divider: {
    height: 1,
    backgroundColor: '#F3EFEA',
    marginVertical: 6,
  },
  returnCustomerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: Colors.light.outlineVariant,
    gap: 6,
  },
  returnCustomerText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.light.primary,
  },
  analyticsContainer: {
    gap: 14,
    marginBottom: 16,
  },
  analyticsHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  analyticsTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: Colors.light.text,
  },
  analyticsSubtitle: {
    fontSize: 11,
    color: Colors.light.textSecondary,
    marginTop: 2,
  },
  refreshAnalyticsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.light.outlineVariant,
  },
  refreshAnalyticsText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.light.primary,
  },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  kpiCard: {
    flex: 1,
    minWidth: '47%',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.light.outlineVariant,
  },
  kpiLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: Colors.light.outline,
    letterSpacing: 0.6,
  },
  kpiValue: {
    fontSize: 17,
    fontWeight: '900',
    color: Colors.light.primary,
    marginTop: 4,
  },
  kpiSub: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.light.pistachio,
    marginTop: 2,
  },
  analyticsSectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.light.outlineVariant,
  },
  analyticsCardTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.light.text,
    marginBottom: 12,
  },
  paymentChannelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  paymentBarItem: {
    flex: 1,
    backgroundColor: '#FAF7F2',
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.light.outlineVariant,
  },
  paymentBarLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.light.textSecondary,
  },
  paymentBarValue: {
    fontSize: 12,
    fontWeight: '900',
    color: Colors.light.text,
    marginTop: 4,
  },
  leaderboardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3EFEA',
  },
  rankPill: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FEA61920',
    justifyContent: 'center',
    alignItems: 'center',
  },
  rankText: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.light.primary,
  },
  leaderboardName: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.light.text,
  },
  leaderboardSub: {
    fontSize: 11,
    color: Colors.light.textSecondary,
    marginTop: 1,
  },
  leaderboardRevenue: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.light.primary,
  },
});
