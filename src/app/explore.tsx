import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { CATEGORIES, MOCK_SWEETS, SweetItem } from '@/constants/mockData';
import SweetCard from '@/components/sweet-card';
import CartPill from '@/components/cart-pill';
import { router } from 'expo-router';

export default function ExploreCatalogScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Sweets');
  const [priceFilter, setPriceFilter] = useState<'all' | 'under300' | '300to600' | 'above600'>('all');
  const [sortBy, setSortBy] = useState<'rating' | 'fresh' | 'priceAsc'>('rating');

  const filteredSweets = useMemo(() => {
    let result = MOCK_SWEETS.filter((item) => {
      const matchesCategory =
        selectedCategory === 'All Sweets' || item.category === selectedCategory;
      const matchesSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.tagline.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase());

      const basePrice = item.variants[0]?.price || 0;
      let matchesPrice = true;
      if (priceFilter === 'under300') matchesPrice = basePrice < 300;
      else if (priceFilter === '300to600') matchesPrice = basePrice >= 300 && basePrice <= 600;
      else if (priceFilter === 'above600') matchesPrice = basePrice > 600;

      return matchesCategory && matchesSearch && matchesPrice;
    });

    if (sortBy === 'rating') {
      result.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === 'fresh') {
      result.sort((a, b) => a.freshBatchMinsAgo - b.freshBatchMinsAgo);
    } else if (sortBy === 'priceAsc') {
      result.sort((a, b) => (a.variants[0]?.price || 0) - (b.variants[0]?.price || 0));
    }

    return result;
  }, [selectedCategory, searchQuery, priceFilter, sortBy]);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom', 'left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.light.background} />

      {/* Top Header */}
      <View style={styles.headerNav}>
        <TouchableOpacity
          style={styles.backBtn}
          activeOpacity={0.7}
          onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color={Colors.light.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Boutique Sweets Search</Text>
        <TouchableOpacity
          style={styles.bulkIconBtn}
          activeOpacity={0.8}
          onPress={() => router.push('/bulk-orders' as any)}>
          <Ionicons name="gift-outline" size={19} color={Colors.light.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        {/* Search Bar */}
        <View style={styles.searchBox}>
          <Ionicons name="search" size={18} color={Colors.light.primary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search Kaju Katli, Motichoor, Gulab Jamun..."
            placeholderTextColor={Colors.light.outline}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color={Colors.light.outline} />
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Categories Pills */}
        <View style={styles.filterSection}>
          <Text style={styles.filterLabel}>CATEGORIES:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsRow}>
            {CATEGORIES.map((cat) => {
              const isSelected = cat === selectedCategory;
              return (
                <TouchableOpacity
                  key={cat}
                  style={[styles.chip, isSelected && styles.chipSelected]}
                  activeOpacity={0.8}
                  onPress={() => setSelectedCategory(cat)}>
                  <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                    {cat}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Price & Sort Controls */}
        <View style={styles.controlsRow}>
          {/* Price Filter */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsRow}>
            {[
              { id: 'all', label: 'All Prices' },
              { id: 'under300', label: 'Under ₹300' },
              { id: '300to600', label: '₹300 - ₹600' },
              { id: 'above600', label: 'Above ₹600' },
            ].map((p) => {
              const isSelected = priceFilter === p.id;
              return (
                <TouchableOpacity
                  key={p.id}
                  style={[styles.smallChip, isSelected && styles.smallChipSelected]}
                  activeOpacity={0.8}
                  onPress={() => setPriceFilter(p.id as any)}>
                  <Text style={[styles.smallChipText, isSelected && styles.smallChipTextSelected]}>
                    {p.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Sort Switcher */}
        <View style={styles.sortRow}>
          <Text style={styles.resultsCount}>
            Showing <Text style={{ fontWeight: '800' }}>{filteredSweets.length}</Text> authentic sweets
          </Text>

          <View style={styles.sortPills}>
            <TouchableOpacity
              style={[styles.sortBtn, sortBy === 'rating' && styles.sortBtnActive]}
              onPress={() => setSortBy('rating')}>
              <Ionicons name="star" size={11} color={sortBy === 'rating' ? '#FFFFFF' : Colors.light.textSecondary} />
              <Text style={[styles.sortBtnText, sortBy === 'rating' && styles.sortBtnTextActive]}>Top Rated</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.sortBtn, sortBy === 'fresh' && styles.sortBtnActive]}
              onPress={() => setSortBy('fresh')}>
              <Ionicons name="flame" size={11} color={sortBy === 'fresh' ? '#FFFFFF' : Colors.light.textSecondary} />
              <Text style={[styles.sortBtnText, sortBy === 'fresh' && styles.sortBtnTextActive]}>Fresh First</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Sweets Grid */}
        {filteredSweets.length === 0 ? (
          <View style={styles.emptyBox}>
            <Ionicons name="search-outline" size={48} color={Colors.light.outline} />
            <Text style={styles.emptyTitle}>No Sweets Matched</Text>
            <Text style={styles.emptySub}>Try resetting filters or searching for another sweet name.</Text>
          </View>
        ) : (
          <View style={styles.sweetsList}>
            {filteredSweets.map((sweet) => (
              <SweetCard key={sweet.id} item={sweet} />
            ))}
          </View>
        )}

        <View style={{ height: 90 }} />
      </ScrollView>

      {/* Floating Cart Dock */}
      <CartPill />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  headerNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.light.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.outlineVariant,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: Colors.light.outlineVariant,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.light.text,
  },
  bulkIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFF2EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    padding: 16,
    gap: 12,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 46,
    borderWidth: 1,
    borderColor: Colors.light.outlineVariant,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: Colors.light.text,
    fontWeight: '600',
  },
  filterSection: {
    gap: 6,
  },
  filterLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.light.outline,
    letterSpacing: 0.6,
  },
  chipsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: Colors.light.backgroundElement,
  },
  chipSelected: {
    backgroundColor: Colors.light.primary,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.light.textSecondary,
  },
  chipTextSelected: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  controlsRow: {
    marginTop: 2,
  },
  smallChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: '#FAF7F2',
    borderWidth: 1,
    borderColor: Colors.light.outlineVariant,
  },
  smallChipSelected: {
    backgroundColor: '#FFF2EB',
    borderColor: Colors.light.primary,
  },
  smallChipText: {
    fontSize: 11,
    color: Colors.light.textSecondary,
    fontWeight: '600',
  },
  smallChipTextSelected: {
    color: Colors.light.primary,
    fontWeight: '800',
  },
  sortRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 4,
  },
  resultsCount: {
    fontSize: 12,
    color: Colors.light.textSecondary,
  },
  sortPills: {
    flexDirection: 'row',
    gap: 6,
  },
  sortBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.light.backgroundElement,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  sortBtnActive: {
    backgroundColor: Colors.light.primary,
  },
  sortBtnText: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.light.textSecondary,
  },
  sortBtnTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  sweetsList: {
    gap: 14,
  },
  emptyBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.light.text,
  },
  emptySub: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    textAlign: 'center',
  },
});
