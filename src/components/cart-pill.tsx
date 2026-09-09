import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { useStore } from '@/store/useStore';
import { router } from 'expo-router';

export default function CartPill() {
  const { cartCount, itemTotal } = useStore();

  if (cartCount === 0) return null;

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.pill}
        activeOpacity={0.9}
        onPress={() => router.push('/cart')}>
        <View style={styles.left}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{cartCount}</Text>
          </View>
          <View>
            <Text style={styles.itemsLabel}>
              {cartCount} {cartCount === 1 ? 'item' : 'items'} added
            </Text>
            <Text style={styles.priceLabel}>₹{itemTotal} + taxes</Text>
          </View>
        </View>

        <View style={styles.right}>
          <Text style={styles.viewCartText}>View Cart</Text>
          <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 24,
    left: 16,
    right: 16,
    zIndex: 99,
  },
  pill: {
    backgroundColor: Colors.light.primary,
    borderRadius: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: Colors.light.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  badge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.light.primary,
  },
  itemsLabel: {
    fontSize: 11,
    color: '#FFE2D5',
    fontWeight: '600',
  },
  priceLabel: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  viewCartText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
