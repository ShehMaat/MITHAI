import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Image,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { useStore } from '@/store/useStore';
import { router } from 'expo-router';
import TaxInvoiceModal from '@/components/tax-invoice-modal';
import { playKitchenBellChime } from '@/utils/soundEffects';

import { socketService } from '@/services/socketService';
import PickupQrModal from '@/components/pickup-qr-modal';

export default function OrderTrackingScreen() {
  const { activeOrder, cancelActiveOrder } = useStore();
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);

  useEffect(() => {
    // Play bell chime when order tracking opens
    playKitchenBellChime();

    // Join Socket.io room for live status updates
    if (activeOrder?.orderId) {
      socketService.joinOrder(activeOrder.orderId);
    }
  }, [activeOrder?.orderId]);

  const orderId = activeOrder?.orderId || '#GBM-84920';
  const token = activeOrder?.token || 'TOKEN #42';
  const eta = activeOrder?.eta || '5:45 PM (in ~25 mins)';
  const grandTotal = activeOrder?.grandTotal || 980;
  const items = activeOrder?.items || [];
  const currentStatus = activeOrder?.status || 'kitchen';

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Tracking my fresh order from Gaurav Dairy! Order ID: ${orderId}, Pickup Token: ${token}`,
      });
    } catch (e) {
      // ignore
    }
  };

  const steps = [
    {
      id: 1,
      title: 'Order Placed & Confirmed',
      time: activeOrder?.placedAt || 'Just now',
      desc: 'Payment verified successfully via UPI',
      completed: true,
      active: currentStatus === 'placed',
    },
    {
      id: 2,
      title: 'Kitchen Preparing Fresh Sweets',
      time: currentStatus === 'kitchen' ? 'In Progress' : (['packed', 'ready', 'delivered'].includes(currentStatus) ? 'Done' : 'Pending'),
      desc: 'Karigars preparing fresh batch with pure bilona desi ghee',
      completed: ['packed', 'ready', 'delivered'].includes(currentStatus),
      active: currentStatus === 'kitchen',
    },
    {
      id: 3,
      title: 'Packed in Festive Velvet Box & Sealed',
      time: currentStatus === 'packed' ? 'In Progress' : (['ready', 'delivered'].includes(currentStatus) ? 'Done' : 'Upcoming'),
      desc: 'Brass seal & personalized golden greeting card',
      completed: ['ready', 'delivered'].includes(currentStatus),
      active: currentStatus === 'packed',
    },
    {
      id: 4,
      title: activeOrder?.fulfillmentMode === 'pickup' ? 'Ready for Priority Counter Handover' : 'Out for Delivery / Handed to Rider',
      time: currentStatus === 'ready' || currentStatus === 'delivered' ? 'Ready Now' : 'Upcoming',
      desc: activeOrder?.fulfillmentMode === 'pickup'
        ? 'Counter 2 priority handover at Central Market boutique store'
        : 'Rider is on the way to your delivery address',
      completed: currentStatus === 'delivered',
      active: currentStatus === 'ready',
    },
  ];

  // Defect #4 fix: Render clean Empty State if no order has been placed
  if (!activeOrder) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom', 'left', 'right']}>
        <StatusBar barStyle="dark-content" backgroundColor={Colors.light.background} />
        <View style={styles.topNav}>
          <TouchableOpacity style={styles.navBtn} activeOpacity={0.7} onPress={() => router.push('/')}>
            <Ionicons name="arrow-back" size={20} color={Colors.light.text} />
          </TouchableOpacity>
          <View style={styles.navCenter}>
            <Text style={styles.navTitle}>Order Status & Tracking</Text>
          </View>
          <View style={{ width: 36 }} />
        </View>

        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: '#FFF5EB', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
            <Ionicons name="receipt-outline" size={40} color={Colors.light.primary} />
          </View>
          <Text style={{ fontSize: 20, fontWeight: '800', color: Colors.light.text, marginBottom: 8, textAlign: 'center' }}>
            No Active Order Found
          </Text>
          <Text style={{ fontSize: 14, color: Colors.light.textSecondary, textAlign: 'center', lineHeight: 20, marginBottom: 24, maxWidth: 300 }}>
            You haven&apos;t placed an order yet. Explore our handcrafted artisanal mithai collection and order fresh sweets today!
          </Text>
          <TouchableOpacity
            style={{ backgroundColor: Colors.light.primary, paddingHorizontal: 28, paddingVertical: 14, borderRadius: 14, flexDirection: 'row', alignItems: 'center', gap: 8 }}
            activeOpacity={0.85}
            onPress={() => router.push('/explore' as any)}>
            <Ionicons name="sparkles" size={16} color="#FFFFFF" />
            <Text style={{ color: '#FFFFFF', fontSize: 15, fontWeight: '700' }}>Explore Sweets Collection</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom', 'left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.light.background} />

      {/* Top Header Bar */}
      <View style={styles.topNav}>
        <TouchableOpacity
          style={styles.navBtn}
          activeOpacity={0.7}
          onPress={() => router.push('/')}>
          <Ionicons name="arrow-back" size={20} color={Colors.light.text} />
        </TouchableOpacity>
        <View style={styles.navCenter}>
          <Text style={styles.navTitle}>Order Status & Tracking</Text>
          <Text style={styles.orderIdBadge}>{orderId}</Text>
        </View>
        <TouchableOpacity style={styles.navBtn} activeOpacity={0.7} onPress={handleShare}>
          <Ionicons name="share-social-outline" size={18} color={Colors.light.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        {/* Hero ETA Card */}
        <View style={styles.etaCard}>
          <View style={styles.etaHeaderRow}>
            <View style={styles.artisanalBadge}>
              <Ionicons name="sparkles" size={12} color="#855300" />
              <Text style={styles.artisanalText}>Crafted by Master Karigars</Text>
            </View>
            <View style={styles.livePulseTag}>
              <View style={styles.pulseDot} />
              <Text style={styles.livePulseText}>LIVE</Text>
            </View>
          </View>
          <Text style={styles.etaLabel}>Estimated Ready Time</Text>
          <Text style={styles.etaValue}>{eta}</Text>
          <Text style={styles.kitchenSub}>Kitchen is preparing your fresh order right now</Text>
        </View>

        {/* Store Pickup or Home Delivery Verification Card */}
        {activeOrder?.fulfillmentMode === 'delivery' ? (
          <View style={styles.verificationCard}>
            <View style={styles.verifyHeaderRow}>
              <Ionicons name="bicycle" size={18} color={Colors.light.saffron} />
              <Text style={styles.verifyTitle}>Delivery Handover Security Code</Text>
            </View>

            <View style={styles.tokenBox}>
              <Text style={styles.tokenLabel}>SHARE WITH DELIVERY PARTNER</Text>
              <Text style={styles.tokenNumber}>{activeOrder?.riderOtp || '8492'}</Text>
            </View>

            <View style={styles.qrContainer}>
              <Text style={styles.qrInstruction}>
                Please share this 4-digit OTP with your delivery partner only after receiving and inspecting your fresh sweets box.
              </Text>
            </View>
          </View>
        ) : (
          <View style={styles.verificationCard}>
            <View style={styles.verifyHeaderRow}>
              <Ionicons name="shield-checkmark" size={18} color={Colors.light.saffron} />
              <Text style={styles.verifyTitle}>Store Pickup Verification</Text>
            </View>

            <View style={styles.tokenBox}>
              <Text style={styles.tokenLabel}>YOUR PICKUP TOKEN</Text>
              <Text style={styles.tokenNumber}>{token}</Text>
            </View>

            {/* QR Code Graphic Clickable */}
            <TouchableOpacity
              style={styles.qrContainer}
              activeOpacity={0.8}
              onPress={() => setShowQrModal(true)}>
              <View style={styles.qrBox}>
                <Ionicons name="qr-code" size={120} color={Colors.light.primary} />
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 4 }}>
                <Ionicons name="scan-outline" size={14} color={Colors.light.primary} />
                <Text style={{ fontSize: 12, fontWeight: '700', color: Colors.light.primary }}>
                  Tap to Enlarge QR Pickup Pass
                </Text>
              </View>
              <Text style={styles.qrInstruction}>
                Show this QR code or Token #{token.replace('#', '')} at the boutique counter for priority collection
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Live Status Timeline Stepper */}
        <View style={styles.card}>
          <Text style={styles.cardHeading}>Live Preparation Timeline</Text>
          <View style={styles.timeline}>
            {steps.map((step, idx) => (
              <View key={step.id} style={styles.timelineRow}>
                {/* Dot & Line */}
                <View style={styles.stepperCol}>
                  <View
                    style={[
                      styles.stepDot,
                      step.completed && styles.stepDotCompleted,
                      step.active && styles.stepDotActive,
                    ]}>
                    {step.completed ? (
                      <Ionicons name="checkmark" size={12} color="#FFFFFF" />
                    ) : step.active ? (
                      <View style={styles.innerActiveDot} />
                    ) : (
                      <View style={styles.innerPendingDot} />
                    )}
                  </View>
                  {idx < steps.length - 1 && (
                    <View
                      style={[
                        styles.stepLine,
                        step.completed && styles.stepLineCompleted,
                      ]}
                    />
                  )}
                </View>

                {/* Step Info */}
                <View style={styles.stepContent}>
                  <View style={styles.stepTitleRow}>
                    <Text
                      style={[
                        styles.stepTitle,
                        step.active && styles.stepTitleActive,
                      ]}>
                      {step.title}
                    </Text>
                    <Text style={styles.stepTime}>{step.time}</Text>
                  </View>
                  <Text style={styles.stepDesc}>{step.desc}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Ordered Items Summary */}
        <View style={styles.card}>
          <Text style={styles.cardHeading}>Sweets in this Order</Text>
          {items.length > 0 ? (
            items.map((it) => (
              <View
                key={`${it.sweet.id}-${it.variant.id}`}
                style={styles.summaryItemRow}>
                <Image
                  source={{ uri: it.sweet.imageUrl }}
                  style={styles.summaryItemThumb}
                />
                <View style={{ flex: 1 }}>
                  <Text style={styles.summaryItemName}>{it.sweet.name}</Text>
                  <Text style={styles.summaryItemSub}>
                    {it.variant.label} box • Qty: {it.quantity}
                  </Text>
                </View>
                <Text style={styles.summaryItemPrice}>
                  ₹{it.variant.price * it.quantity}
                </Text>
              </View>
            ))
          ) : (
            <View style={styles.summaryItemRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.summaryItemName}>Premium Kaju Katli (500g)</Text>
                <Text style={styles.summaryItemSub}>Qty: 1 • Pure Desi Ghee</Text>
              </View>
              <Text style={styles.summaryItemPrice}>₹540</Text>
            </View>
          )}

          <View style={styles.paidBar}>
            <View style={styles.paidRow}>
              <Ionicons name="checkmark-circle" size={16} color={Colors.light.pistachio} />
              <Text style={styles.paidLabel}>Paid via UPI (Google Pay)</Text>
            </View>
            <Text style={styles.paidAmount}>₹{grandTotal}</Text>
          </View>

          {/* Tax Invoice Link Button */}
          <TouchableOpacity
            style={styles.taxInvoiceBtn}
            activeOpacity={0.8}
            onPress={() => setShowInvoiceModal(true)}>
            <Ionicons name="document-text-outline" size={16} color={Colors.light.primary} />
            <Text style={styles.taxInvoiceBtnText}>View Official Tax Invoice (GST / FSSAI)</Text>
          </TouchableOpacity>

          {/* Cancel Order & Refund Button */}
          {activeOrder?.status !== 'cancelled' ? (
            <TouchableOpacity
              style={[styles.taxInvoiceBtn, { marginTop: 8, borderColor: '#EF4444' }]}
              activeOpacity={0.8}
              onPress={async () => {
                const ok = await cancelActiveOrder('Customer requested cancellation from app');
                if (ok) {
                  alert('Order Cancelled! ₹' + grandTotal + ' has been instantly refunded to your original payment method.');
                }
              }}>
              <Ionicons name="close-circle-outline" size={16} color="#EF4444" />
              <Text style={[styles.taxInvoiceBtnText, { color: '#EF4444' }]}>Cancel Order & Instant Refund</Text>
            </TouchableOpacity>
          ) : (
            <View style={{ marginTop: 12, padding: 12, backgroundColor: '#FEF2F2', borderRadius: 10, alignItems: 'center' }}>
              <Text style={{ fontSize: 14, fontWeight: '700', color: '#991B1B' }}>Order Cancelled</Text>
              <Text style={{ fontSize: 12, color: '#B91C1C', marginTop: 2 }}>Refund of ₹{grandTotal} processed to bank account.</Text>
            </View>
          )}
        </View>

        {/* Tax Invoice Modal Component */}
        <TaxInvoiceModal
          visible={showInvoiceModal}
          onClose={() => setShowInvoiceModal(false)}
          order={activeOrder}
        />

        {/* Boutique Store Details & Quick Actions */}
        <View style={styles.card}>
          <Text style={styles.cardHeading}>Boutique Store Information</Text>
          <View style={styles.storeRow}>
            <View style={styles.storeIconWrap}>
              <Ionicons name="storefront" size={20} color={Colors.light.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.storeName}>Gaurav Dairy</Text>
              <Text style={styles.storeAddress}>
                Shop 12, Central Market, Sector 29, Gurugram, 122018
              </Text>
              <Text style={styles.storeTiming}>Open today until 10:00 PM • 0.8 km away</Text>
            </View>
          </View>

          <View style={styles.actionsRow}>
            <TouchableOpacity style={styles.secActionBtn} activeOpacity={0.8}>
              <Ionicons name="call-outline" size={16} color={Colors.light.primary} />
              <Text style={styles.secActionText}>Call Store</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.priActionBtn} activeOpacity={0.8}>
              <Ionicons name="navigate-outline" size={16} color="#FFFFFF" />
              <Text style={styles.priActionText}>Get Directions</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Back to Home Button */}
        <TouchableOpacity
          style={styles.homeBtn}
          activeOpacity={0.85}
          onPress={() => router.push('/')}>
          <Ionicons name="home-outline" size={16} color={Colors.light.primary} />
          <Text style={styles.homeBtnText}>Return to Sweet Shop</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>

      <PickupQrModal
        visible={showQrModal}
        orderId={orderId}
        token={token}
        onClose={() => setShowQrModal(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  topNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.light.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.outlineVariant,
  },
  navBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: Colors.light.outlineVariant,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navCenter: {
    alignItems: 'center',
  },
  navTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.light.text,
  },
  orderIdBadge: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.light.primary,
    marginTop: 2,
  },
  scrollContent: {
    padding: 16,
  },
  etaCard: {
    backgroundColor: '#FFF7ED',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#FED7AA',
    marginBottom: 14,
  },
  etaHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  artisanalBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  artisanalText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#855300',
    textTransform: 'uppercase',
  },
  livePulseTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  livePulseText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#065F46',
  },
  etaLabel: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    fontWeight: '600',
  },
  etaValue: {
    fontSize: 22,
    fontWeight: '900',
    color: Colors.light.primary,
    marginVertical: 4,
  },
  kitchenSub: {
    fontSize: 12,
    color: Colors.light.textSecondary,
  },
  verificationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: Colors.light.outlineVariant,
    alignItems: 'center',
  },
  verifyHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  verifyTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.light.text,
  },
  tokenBox: {
    backgroundColor: '#FFF2EB',
    paddingHorizontal: 24,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.light.saffron,
    alignItems: 'center',
    marginBottom: 14,
  },
  tokenLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.light.textSecondary,
    letterSpacing: 1,
  },
  tokenNumber: {
    fontSize: 22,
    fontWeight: '900',
    color: Colors.light.saffron,
  },
  qrContainer: {
    alignItems: 'center',
  },
  qrBox: {
    padding: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.light.outlineVariant,
    marginBottom: 8,
  },
  qrInstruction: {
    fontSize: 11,
    color: Colors.light.textSecondary,
    textAlign: 'center',
    maxWidth: 260,
    lineHeight: 15,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: Colors.light.outlineVariant,
  },
  cardHeading: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.light.text,
    marginBottom: 12,
  },
  timeline: {
    paddingLeft: 4,
  },
  timelineRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  stepperCol: {
    alignItems: 'center',
    width: 24,
    marginRight: 10,
  },
  stepDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.light.backgroundElement,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepDotCompleted: {
    backgroundColor: Colors.light.pistachio,
  },
  stepDotActive: {
    backgroundColor: Colors.light.saffron,
  },
  innerActiveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
  },
  innerPendingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.light.outline,
  },
  stepLine: {
    width: 2,
    height: 38,
    backgroundColor: Colors.light.outlineVariant,
  },
  stepLineCompleted: {
    backgroundColor: Colors.light.pistachio,
  },
  stepContent: {
    flex: 1,
    paddingBottom: 16,
  },
  stepTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stepTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.light.text,
  },
  stepTitleActive: {
    color: Colors.light.saffron,
    fontWeight: '800',
  },
  stepTime: {
    fontSize: 11,
    color: Colors.light.textSecondary,
  },
  stepDesc: {
    fontSize: 11,
    color: Colors.light.textSecondary,
    marginTop: 2,
    lineHeight: 15,
  },
  summaryItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  summaryItemThumb: {
    width: 40,
    height: 40,
    borderRadius: 8,
  },
  summaryItemName: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.light.text,
  },
  summaryItemSub: {
    fontSize: 11,
    color: Colors.light.textSecondary,
  },
  summaryItemPrice: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.light.text,
  },
  paidBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F7F4EF',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 8,
  },
  paidRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  paidLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.light.text,
  },
  paidAmount: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.light.primary,
  },
  storeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  storeIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFE9DF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  storeName: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.light.text,
  },
  storeAddress: {
    fontSize: 11,
    color: Colors.light.textSecondary,
    marginTop: 1,
  },
  storeTiming: {
    fontSize: 10,
    color: Colors.light.primary,
    fontWeight: '600',
    marginTop: 2,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  secActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.light.primary,
    backgroundColor: '#FFFFFF',
    gap: 6,
  },
  secActionText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.light.primary,
  },
  priActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    borderRadius: 10,
    backgroundColor: Colors.light.primary,
    gap: 6,
  },
  priActionText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  homeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: Colors.light.outlineVariant,
    paddingVertical: 12,
    borderRadius: 14,
    gap: 6,
  },
  homeBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.light.primary,
  },
  taxInvoiceBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 10,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#FFF2EB',
    borderWidth: 1,
    borderColor: '#FED7AA',
  },
  taxInvoiceBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.light.primary,
  },
});
