import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { useStore } from '@/store/useStore';
import { router } from 'expo-router';

export default function HeaderBar({
  searchQuery,
  onSearchChange,
}: {
  searchQuery: string;
  onSearchChange: (text: string) => void;
}) {
  const { user, fulfillmentMode, setFulfillmentMode, deliveryAddress } = useStore();

  const getInitials = (name?: string) => {
    if (!name) return 'GJ';
    const parts = name.split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <View style={styles.container}>
      {/* Segmented Fulfillment Switcher */}
      <View style={styles.toggleWrapper}>
        <TouchableOpacity
          activeOpacity={0.8}
          style={[
            styles.toggleButton,
            fulfillmentMode === 'delivery' && styles.toggleButtonActive,
          ]}
          onPress={() => setFulfillmentMode('delivery')}>
          <Ionicons
            name="bicycle-outline"
            size={16}
            color={fulfillmentMode === 'delivery' ? '#FFFFFF' : Colors.light.textSecondary}
          />
          <Text
            style={[
              styles.toggleText,
              fulfillmentMode === 'delivery' && styles.toggleTextActive,
            ]}>
            Delivery (25-35m)
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.8}
          style={[
            styles.toggleButton,
            fulfillmentMode === 'pickup' && styles.toggleButtonActive,
          ]}
          onPress={() => setFulfillmentMode('pickup')}>
          <Ionicons
            name="storefront-outline"
            size={15}
            color={fulfillmentMode === 'pickup' ? '#FFFFFF' : Colors.light.textSecondary}
          />
          <Text
            style={[
              styles.toggleText,
              fulfillmentMode === 'pickup' && styles.toggleTextActive,
            ]}>
            Store Pickup (15m)
          </Text>
        </TouchableOpacity>
      </View>

      {/* Address & Store Bar */}
      <View style={styles.locationRow}>
        <View style={styles.locationLeft}>
          <View style={styles.iconCircle}>
            <Ionicons name="location" size={16} color={Colors.light.saffron} />
          </View>
          <View>
            <Text style={styles.locationSub}>
              {fulfillmentMode === 'delivery' ? 'Delivering to' : 'Pickup at Boutique Store'}
            </Text>
            <View style={styles.locationMainRow}>
              <Text numberOfLines={1} style={styles.locationMain}>
                {fulfillmentMode === 'delivery' ? deliveryAddress : 'Shop 12, Central Market, Gurugram'}
              </Text>
              <Ionicons name="chevron-down" size={14} color={Colors.light.primary} />
            </View>
          </View>
        </View>

        <View style={styles.headerRightActions}>
          {user ? (
            <TouchableOpacity
              style={styles.avatarButton}
              activeOpacity={0.8}
              onPress={() => router.push('/profile' as any)}>
              <Text style={styles.avatarMiniText}>{getInitials(user.name)}</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.signInPill}
              activeOpacity={0.8}
              onPress={() => router.push('/welcome' as any)}>
              <Text style={styles.signInPillText}>Sign In</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.bellButton}
            activeOpacity={0.7}
            onPress={() => router.push('/notifications' as any)}>
            <Ionicons name="notifications-outline" size={19} color={Colors.light.text} />
            <View style={styles.unreadDot} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={18} color={Colors.light.outline} />
          <TextInput
            placeholder="Search Kaju Katli, Motichoor, Rasgulla..."
            placeholderTextColor={Colors.light.outline}
            value={searchQuery}
            onChangeText={onSearchChange}
            style={styles.searchInput}
          />
          <TouchableOpacity activeOpacity={0.7}>
            <Ionicons name="mic-outline" size={18} color={Colors.light.saffron} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.filterButton} activeOpacity={0.7}>
          <Ionicons name="options-outline" size={18} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    backgroundColor: Colors.light.background,
  },
  toggleWrapper: {
    flexDirection: 'row',
    backgroundColor: Colors.light.backgroundElement,
    borderRadius: 24,
    padding: 3,
    marginBottom: 12,
  },
  toggleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 7,
    borderRadius: 20,
    gap: 6,
  },
  toggleButtonActive: {
    backgroundColor: Colors.light.primaryContainer,
    shadowColor: Colors.light.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  toggleText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.light.textSecondary,
  },
  toggleTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  locationLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
    gap: 8,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFE9DF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  locationSub: {
    fontSize: 11,
    color: Colors.light.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontWeight: '600',
  },
  locationMainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationMain: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.light.text,
    maxWidth: 240,
  },
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  avatarButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFF2EB',
    borderWidth: 1.5,
    borderColor: Colors.light.saffron,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarMiniText: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.light.primary,
  },
  signInPill: {
    backgroundColor: '#FFF2EB',
    borderWidth: 1,
    borderColor: Colors.light.primary,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
  },
  signInPillText: {
    color: Colors.light.primary,
    fontSize: 11,
    fontWeight: '800',
  },
  bellButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.light.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: Colors.light.surfaceContainerHigh,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  unreadDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: Colors.light.saffron,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderWidth: 1,
    borderColor: Colors.light.outlineVariant,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: Colors.light.text,
    padding: 0,
  },
  filterButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: Colors.light.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
