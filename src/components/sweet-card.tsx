import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { SweetItem, WeightVariant } from '@/constants/mockData';
import { useStore } from '@/store/useStore';
import { router } from 'expo-router';

export default function SweetCard({ item }: { item: SweetItem }) {
  const [selectedVariant, setSelectedVariant] = useState<WeightVariant>(
    item.variants[0]
  );
  const { addToCart, updateQuantity, getCartQuantity } = useStore();

  const currentQty = getCartQuantity(item.id, selectedVariant.id);

  const handleOpenDetail = () => {
    router.push({
      pathname: '/product-detail' as any,
      params: { id: item.id },
    });
  };

  return (
    <View style={styles.card}>
      {/* Product Image & Badges */}
      <TouchableOpacity
        style={styles.imageContainer}
        activeOpacity={0.9}
        onPress={handleOpenDetail}>
        <Image source={{ uri: item.imageUrl }} style={styles.image} resizeMode="cover" />
        {item.badge && (
          <View style={styles.topBadge}>
            <Text style={styles.topBadgeText}>{item.badge}</Text>
          </View>
        )}
        <View style={styles.ratingBadge}>
          <Ionicons name="star" size={11} color="#F59E0B" />
          <Text style={styles.ratingText}>{item.rating}</Text>
          <Text style={styles.reviewCount}>({item.reviewsCount})</Text>
        </View>
      </TouchableOpacity>

      {/* Content */}
      <View style={styles.details}>
        <TouchableOpacity activeOpacity={0.8} onPress={handleOpenDetail}>
          <Text style={styles.sweetName} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={styles.sweetTagline} numberOfLines={1}>
            {item.tagline}
          </Text>
        </TouchableOpacity>

        {/* Live Kitchen Time & Shelf Life */}
        <View style={styles.metaRow}>
          <View style={styles.freshTag}>
            <View style={styles.greenPulse} />
            <Text style={styles.freshText}>Fresh batch {item.freshBatchMinsAgo}m ago</Text>
          </View>
        </View>

        {/* Weight Selector Chips */}
        <View style={styles.variantRow}>
          {item.variants.map((v) => {
            const isSelected = v.id === selectedVariant.id;
            return (
              <TouchableOpacity
                key={v.id}
                activeOpacity={0.7}
                style={[styles.variantChip, isSelected && styles.variantChipSelected]}
                onPress={() => setSelectedVariant(v)}>
                <Text
                  style={[
                    styles.variantChipText,
                    isSelected && styles.variantChipTextSelected,
                  ]}>
                  {v.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Price & Action Row */}
        <View style={styles.priceActionRow}>
          <View>
            <Text style={styles.priceUnit}>Price ({selectedVariant.label})</Text>
            <Text style={styles.priceValue}>₹{selectedVariant.price}</Text>
          </View>

          {currentQty === 0 ? (
            <TouchableOpacity
              style={styles.addButton}
              activeOpacity={0.8}
              onPress={() => addToCart(item, selectedVariant)}>
              <Ionicons name="add" size={16} color="#FFFFFF" />
              <Text style={styles.addButtonText}>ADD</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.stepper}>
              <TouchableOpacity
                style={styles.stepperBtn}
                onPress={() => updateQuantity(item.id, selectedVariant.id, -1)}>
                <Ionicons name="remove" size={14} color={Colors.light.primary} />
              </TouchableOpacity>
              <Text style={styles.stepperValue}>{currentQty}</Text>
              <TouchableOpacity
                style={styles.stepperBtn}
                onPress={() => updateQuantity(item.id, selectedVariant.id, 1)}>
                <Ionicons name="add" size={14} color={Colors.light.primary} />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.light.outlineVariant,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  imageContainer: {
    height: 160,
    width: '100%',
    position: 'relative',
    backgroundColor: '#F7F4EF',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  topBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: Colors.light.saffron,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  topBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
    textTransform: 'uppercase',
  },
  ratingBadge: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 10,
    gap: 3,
  },
  ratingText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.light.text,
  },
  reviewCount: {
    fontSize: 10,
    color: Colors.light.textSecondary,
  },
  details: {
    padding: 14,
  },
  sweetName: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.light.text,
    marginBottom: 2,
  },
  sweetTagline: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    marginBottom: 8,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  freshTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    gap: 4,
  },
  greenPulse: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  freshText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#047857',
  },
  variantRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 12,
  },
  variantChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: Colors.light.backgroundElement,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  variantChipSelected: {
    backgroundColor: '#FFF2EB',
    borderColor: Colors.light.saffron,
  },
  variantChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.light.textSecondary,
  },
  variantChipTextSelected: {
    color: Colors.light.saffron,
    fontWeight: '700',
  },
  priceActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#F3EFEA',
  },
  priceUnit: {
    fontSize: 10,
    color: Colors.light.textSecondary,
  },
  priceValue: {
    fontSize: 17,
    fontWeight: '800',
    color: Colors.light.text,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
    gap: 4,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF2EB',
    borderWidth: 1,
    borderColor: Colors.light.primary,
    borderRadius: 10,
    paddingHorizontal: 4,
    paddingVertical: 3,
    gap: 8,
  },
  stepperBtn: {
    width: 24,
    height: 24,
    borderRadius: 6,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperValue: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.light.primary,
    minWidth: 16,
    textAlign: 'center',
  },
});
