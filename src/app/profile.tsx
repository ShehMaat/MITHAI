import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Linking,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { useStore } from '@/store/useStore';
import { router } from 'expo-router';
import { MOCK_SWEETS } from '@/constants/mockData';

import { AddressModal } from '@/components/address-modal';

export default function ProfileScreen() {
  const { user, logout, activeOrder, addToCart, savedAddresses, addAddress, setDeliveryAddress, favorites } = useStore();
  const [showAddressModal, setShowAddressModal] = React.useState(false);

  const handleReorder = () => {
    // 1-tap re-order: add Kaju Katli and Motichoor Ladoo to cart
    addToCart(MOCK_SWEETS[0], MOCK_SWEETS[0].variants[1]);
    addToCart(MOCK_SWEETS[1], MOCK_SWEETS[1].variants[0]);
    Alert.alert('Reorder Added', 'Items added to your sweet cart!', [
      { text: 'Go to Cart', onPress: () => router.push('/cart') },
      { text: 'OK' },
    ]);
  };

  const handleWhatsApp = () => {
    Linking.openURL('https://wa.me/919876543210?text=Hello%20Gaurav%20Bhai%20Ki%20Mithai%2C%20I%20have%20an%20inquiry%20regarding%20fresh%20sweets.');
  };

  const handleCall = () => {
    Linking.openURL('tel:+911244920194');
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom', 'left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.light.background} />

      {/* Top Navigation */}
      <View style={styles.topNav}>
        <TouchableOpacity
          style={styles.navBtn}
          activeOpacity={0.7}
          onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color={Colors.light.text} />
        </TouchableOpacity>
        <Text style={styles.navTitle}>My Connoisseur Profile</Text>
        <TouchableOpacity style={styles.navBtn} activeOpacity={0.7}>
          <Ionicons name="settings-outline" size={19} color={Colors.light.text} />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        {/* Profile Card Header */}
        {user ? (
          <View style={styles.profileHeaderCard}>
            <View style={styles.avatarRing}>
              <View style={styles.avatarCircle}>
                <Text style={styles.avatarText}>
                  {user.name ? user.name.substring(0, 2).toUpperCase() : 'GJ'}
                </Text>
              </View>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{user.name}</Text>
              <Text style={styles.profileContact}>+91 {user.phone}</Text>
              <View style={styles.tierBadge}>
                <Ionicons name="ribbon" size={13} color="#855300" />
                <Text style={styles.tierBadgeText}>{user.tier || 'Gold Club Connoisseur'}</Text>
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.profileHeaderCard}>
            <View style={styles.avatarRing}>
              <View style={styles.avatarCircle}>
                <Ionicons name="person-outline" size={24} color="#FFFFFF" />
              </View>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>Browsing as Guest</Text>
              <Text style={styles.profileContact}>Sign in to save addresses & earn points</Text>
              <TouchableOpacity
                style={styles.signInBtnInline}
                activeOpacity={0.8}
                onPress={() => router.push('/welcome' as any)}>
                <Text style={styles.signInBtnInlineText}>Sign In / Register</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Royalty Mithai Points Card */}
        <View style={styles.loyaltyCard}>
          <View style={styles.loyaltyTop}>
            <View>
              <Text style={styles.loyaltyLabel}>MITHAI REWARD CREDITS</Text>
              <Text style={styles.loyaltyPoints}>450 Points</Text>
              <Text style={styles.loyaltySub}>1 Point = ₹1 • Worth ₹450 on next order</Text>
            </View>
            <TouchableOpacity style={styles.redeemBtn} activeOpacity={0.85}>
              <Text style={styles.redeemBtnText}>Redeem</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.progressBarWrapper}>
            <View style={styles.progressBarTrack}>
              <View style={[styles.progressBarFill, { width: '65%' }]} />
            </View>
            <Text style={styles.progressText}>Spend ₹1,550 more to unlock Platinum Club</Text>
          </View>
        </View>

        {/* Recent Orders Section */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Recent Orders</Text>
          <TouchableOpacity activeOpacity={0.7}>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>

        {/* Active Order Card */}
        {activeOrder && (
          <View style={styles.orderCard}>
            <View style={styles.orderCardTop}>
              <View>
                <Text style={styles.orderIdText}>{activeOrder.orderId}</Text>
                <Text style={styles.orderMetaText}>
                  {activeOrder.slotDate} • {activeOrder.slotTime}
                </Text>
              </View>
              <View style={styles.kitchenBadge}>
                <View style={styles.pulseDot} />
                <Text style={styles.kitchenBadgeText}>Kitchen Preparing</Text>
              </View>
            </View>

            <View style={styles.orderItemsList}>
              {activeOrder.items.map((it) => (
                <Text key={it.sweet.id} style={styles.orderItemBullet}>
                  • {it.quantity}x {it.sweet.name} ({it.variant.label})
                </Text>
              ))}
            </View>

            <View style={styles.orderBottomRow}>
              <Text style={styles.orderTotal}>Total: ₹{activeOrder.grandTotal}</Text>
              <View style={styles.orderBtnRow}>
                <TouchableOpacity
                  style={styles.viewTokenBtn}
                  onPress={() => router.push('/order-tracking')}>
                  <Text style={styles.viewTokenText}>Token {activeOrder.token}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.trackBtn}
                  onPress={() => router.push('/order-tracking')}>
                  <Text style={styles.trackBtnText}>Track Live</Text>
                  <Ionicons name="arrow-forward" size={13} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        {/* Past Completed Order */}
        <View style={styles.orderCard}>
          <View style={styles.orderCardTop}>
            <View>
              <Text style={styles.orderIdText}>#GBM-71024</Text>
              <Text style={styles.orderMetaText}>28 Aug 2026 • Home Delivery</Text>
            </View>
            <View style={styles.deliveredBadge}>
              <Ionicons name="checkmark-circle" size={13} color="#065F46" />
              <Text style={styles.deliveredBadgeText}>Delivered</Text>
            </View>
          </View>

          <View style={styles.orderItemsList}>
            <Text style={styles.orderItemBullet}>
              • 1x Shahi Angoori Gulab Jamun (1kg)
            </Text>
            <Text style={styles.orderItemBullet}>
              • 1x Classic Sponge Rasgulla (Pack of 12)
            </Text>
          </View>

          <View style={styles.orderBottomRow}>
            <Text style={styles.orderTotal}>Total: ₹1,460</Text>
            <TouchableOpacity
              style={styles.reorderBtn}
              activeOpacity={0.85}
              onPress={handleReorder}>
              <Ionicons name="repeat-outline" size={15} color="#FFFFFF" />
              <Text style={styles.reorderBtnText}>Reorder in 1-Tap</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Saved Addresses Section */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Saved Delivery Addresses ({savedAddresses.length})</Text>
          <TouchableOpacity activeOpacity={0.7} onPress={() => setShowAddressModal(true)}>
            <Text style={{ fontSize: 13, fontWeight: '700', color: Colors.light.primary }}>+ Add Address</Text>
          </TouchableOpacity>
        </View>

        {savedAddresses.map((addr) => (
          <View key={addr.id} style={styles.addressCard}>
            <View style={styles.addressHeader}>
              <View style={styles.addressTagRow}>
                <Ionicons
                  name={addr.type === 'Home' ? 'home' : 'business-outline'}
                  size={15}
                  color={Colors.light.saffron}
                />
                <Text style={styles.addressTag}>{addr.type}</Text>
                {addr.isDefault && (
                  <View style={styles.defaultBadge}>
                    <Text style={styles.defaultBadgeText}>DEFAULT</Text>
                  </View>
                )}
              </View>
              <Text style={{ fontSize: 12, color: Colors.light.pistachio, fontWeight: '700' }}>Pincode: {addr.pincode}</Text>
            </View>
            <Text style={styles.addressFull}>
              {addr.houseNo}, {addr.area}, {addr.city} - {addr.pincode}
            </Text>
          </View>
        ))}

        {/* Boutique Concierge & Support */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Boutique Concierge & Assistance</Text>
        </View>

        <View style={styles.conciergeCard}>
          <TouchableOpacity
            style={styles.conciergeRow}
            activeOpacity={0.7}
            onPress={() => router.push('/bulk-orders' as any)}>
            <View style={[styles.phoneIconCircle, { backgroundColor: '#FFF2EB' }]}>
              <Ionicons name="gift" size={16} color={Colors.light.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.conciergeLabel}>Bulk & Wedding Festival Quotes</Text>
              <Text style={styles.conciergeSub}>Wholesale rates & custom stamped velvet boxes</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={Colors.light.outline} />
          </TouchableOpacity>

          <View style={styles.cardDivider} />

          <TouchableOpacity
            style={styles.conciergeRow}
            activeOpacity={0.7}
            onPress={handleWhatsApp}>
            <View style={styles.whatsappIconCircle}>
              <Ionicons name="logo-whatsapp" size={18} color="#FFFFFF" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.conciergeLabel}>WhatsApp Sweet Concierge</Text>
              <Text style={styles.conciergeSub}>Direct chat for custom bulk & wedding hampers</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={Colors.light.outline} />
          </TouchableOpacity>

          <View style={styles.cardDivider} />

          <TouchableOpacity
            style={styles.conciergeRow}
            activeOpacity={0.7}
            onPress={handleCall}>
            <View style={styles.phoneIconCircle}>
              <Ionicons name="call" size={16} color={Colors.light.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.conciergeLabel}>Call Central Market Flagship</Text>
              <Text style={styles.conciergeSub}>+91 124 4920194 • 10:00 AM - 10:00 PM</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={Colors.light.outline} />
          </TouchableOpacity>
        </View>

        {/* Operations Hub: Staff / Kitchen & Delivery Rider - Visible ONLY to Admin or Rider */}
        {(user?.role === 'admin' || user?.role === 'rider') && (
          <View style={styles.operationsCard}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <Text style={styles.operationsTitle}>
                {user.role === 'admin' ? 'Store Management Portal' : 'Fleet Partner Portal'}
              </Text>
              <View
                style={{
                  backgroundColor: user.role === 'admin' ? '#FEF3C7' : '#E0F2FE',
                  paddingHorizontal: 8,
                  paddingVertical: 3,
                  borderRadius: 6,
                }}>
                <Text
                  style={{
                    fontSize: 10,
                    fontWeight: '800',
                    color: user.role === 'admin' ? '#B45309' : '#0369A1',
                  }}>
                  {user.role === 'admin' ? 'ADMIN ACCESS' : 'RIDER ACCESS'}
                </Text>
              </View>
            </View>

            <View style={styles.operationsButtonsRow}>
              {user.role === 'admin' && (
                <TouchableOpacity
                  style={[styles.staffModeBtn, { flex: 1 }]}
                  activeOpacity={0.85}
                  onPress={() => router.push('/admin' as any)}>
                  <Ionicons name="restaurant-outline" size={16} color="#FFFFFF" />
                  <Text style={styles.staffModeText}>Kitchen & Counter Ops</Text>
                </TouchableOpacity>
              )}

              {user.role === 'rider' && (
                <TouchableOpacity
                  style={[styles.riderModeBtn, { flex: 1 }]}
                  activeOpacity={0.85}
                  onPress={() => router.push('/rider' as any)}>
                  <Ionicons name="bicycle-outline" size={16} color="#FFFFFF" />
                  <Text style={styles.riderModeText}>Delivery Fleet Partner</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}

        {/* Logout / Sign In Action */}
        {user ? (
          <TouchableOpacity
            style={styles.logoutBtn}
            activeOpacity={0.8}
            onPress={() => {
              logout();
              router.replace('/welcome' as any);
            }}>
            <Ionicons name="log-out-outline" size={18} color={Colors.light.textSecondary} />
            <Text style={styles.logoutText}>Sign Out of Connoisseur Account</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.logoutBtn}
            activeOpacity={0.8}
            onPress={() => router.push('/welcome' as any)}>
            <Ionicons name="log-in-outline" size={18} color={Colors.light.primary} />
            <Text style={[styles.logoutText, { color: Colors.light.primary, fontWeight: '800' }]}>
              Sign In to Your Account
            </Text>
          </TouchableOpacity>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>

      <AddressModal
        visible={showAddressModal}
        onClose={() => setShowAddressModal(false)}
        savedAddresses={savedAddresses}
        onSelectAddress={(addr) => {
          setDeliveryAddress(`${addr.houseNo}, ${addr.area}, ${addr.city}`);
        }}
        onAddAddress={addAddress}
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
  navTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.light.text,
  },
  scrollContent: {
    padding: 16,
    maxWidth: 600,
    width: '100%',
    alignSelf: 'center',
  },
  profileHeaderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.light.outlineVariant,
    marginBottom: 14,
    gap: 14,
  },
  avatarRing: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: '#FFF2EB',
    borderWidth: 2,
    borderColor: Colors.light.saffron,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.light.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 17,
    fontWeight: '800',
    color: Colors.light.text,
  },
  profileContact: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    marginVertical: 2,
  },
  tierBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  tierBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#855300',
  },
  loyaltyCard: {
    backgroundColor: '#78350F',
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
  },
  loyaltyTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  loyaltyLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FDE68A',
    letterSpacing: 1,
  },
  loyaltyPoints: {
    fontSize: 24,
    fontWeight: '900',
    color: '#FFFFFF',
    marginTop: 2,
  },
  loyaltySub: {
    fontSize: 11,
    color: '#FDE68A',
    marginTop: 2,
  },
  redeemBtn: {
    backgroundColor: '#FEA619',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 10,
  },
  redeemBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#78350F',
  },
  progressBarWrapper: {
    marginTop: 14,
  },
  progressBarTrack: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#F59E0B',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 10,
    color: '#FDE68A',
    marginTop: 6,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    marginTop: 6,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.light.text,
  },
  viewAllText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.light.primary,
  },
  orderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.light.outlineVariant,
    marginBottom: 12,
  },
  orderCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  orderIdText: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.light.text,
  },
  orderMetaText: {
    fontSize: 11,
    color: Colors.light.textSecondary,
    marginTop: 1,
  },
  kitchenBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#F59E0B',
  },
  kitchenBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#92400E',
  },
  deliveredBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  deliveredBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#065F46',
  },
  orderItemsList: {
    paddingVertical: 6,
    gap: 3,
  },
  orderItemBullet: {
    fontSize: 12,
    color: Colors.light.textSecondary,
  },
  orderBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F3EFEA',
    paddingTop: 10,
    marginTop: 6,
  },
  orderTotal: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.light.text,
  },
  orderBtnRow: {
    flexDirection: 'row',
    gap: 8,
  },
  viewTokenBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#FFF2EB',
    borderWidth: 1,
    borderColor: Colors.light.outlineVariant,
  },
  viewTokenText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.light.primary,
  },
  trackBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: Colors.light.primary,
  },
  trackBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  reorderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 8,
    backgroundColor: Colors.light.primary,
  },
  reorderBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  addressCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.light.outlineVariant,
    marginBottom: 8,
  },
  addressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  addressTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  addressTag: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.light.text,
  },
  defaultBadge: {
    backgroundColor: '#FFE9DF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  defaultBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: Colors.light.primary,
  },
  addressFull: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    lineHeight: 16,
  },
  conciergeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.light.outlineVariant,
    paddingVertical: 4,
    marginBottom: 16,
  },
  conciergeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 12,
  },
  whatsappIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#25D366',
    alignItems: 'center',
    justifyContent: 'center',
  },
  phoneIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#FFE9DF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  conciergeLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.light.text,
  },
  conciergeSub: {
    fontSize: 11,
    color: Colors.light.textSecondary,
    marginTop: 1,
  },
  cardDivider: {
    height: 1,
    backgroundColor: '#F3EFEA',
    marginHorizontal: 14,
  },
  operationsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.light.outlineVariant,
    marginBottom: 16,
    gap: 10,
  },
  operationsTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.light.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  operationsButtonsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  staffModeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 12,
    backgroundColor: Colors.light.primary,
    gap: 6,
  },
  staffModeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  riderModeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 12,
    backgroundColor: Colors.light.tertiary,
    gap: 6,
  },
  riderModeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  logoutBtn: {
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
  logoutText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.light.textSecondary,
  },
  signInBtnInline: {
    marginTop: 6,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#FED7AA',
  },
  signInBtnInlineText: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.light.primary,
  },
});
