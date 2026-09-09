import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  TextInput,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { useStore } from '@/store/useStore';
import { router } from 'expo-router';

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

import { playKitchenBellChime, playSuccessChime } from '@/utils/soundEffects';

export default function AdminScreen() {
  const { activeOrder } = useStore();
  const [storeOpen, setStoreOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'preparing' | 'ready'>('all');
  const [orders, setOrders] = useState<KitchenOrder[]>(INITIAL_ORDERS);
  const [tokenInput, setTokenInput] = useState('');
  const [stock, setStock] = useState({
    kajuKatli: 14.5,
    motichoor: 3.0,
    rasgulla: 18,
  });

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

  const handleMarkReady = (orderId: string) => {
    playKitchenBellChime();
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: 'ready' } : o))
    );
    Alert.alert('Order Ready', `Order ${orderId} marked ready at counter!`);
  };

  const handleComplete = (orderId: string) => {
    playSuccessChime();
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: 'completed' } : o))
    );
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
    <SafeAreaView style={styles.safeArea}>
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
            onPress={() => router.push('/')}>
            <Ionicons name="phone-portrait-outline" size={16} color={Colors.light.primary} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        {/* Real-time Shift Metrics Banner */}
        <View style={styles.metricsRow}>
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>TODAY'S REVENUE</Text>
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

        {/* Orders Queue Filter Tabs */}
        <View style={styles.queueTabsRow}>
          {[
            { key: 'all', label: 'All Active' },
            { key: 'preparing', label: 'Preparing (2)' },
            { key: 'ready', label: 'Ready for Pickup (3)' },
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
  scrollContent: {
    padding: 16,
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
});
