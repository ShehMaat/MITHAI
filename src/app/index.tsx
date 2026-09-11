import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Image,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import HeaderBar from '@/components/header-bar';
import FestiveHero from '@/components/festive-hero';
import SweetCard from '@/components/sweet-card';
import CartPill from '@/components/cart-pill';
import { CATEGORIES, MOCK_SWEETS, SweetItem } from '@/constants/mockData';
import { productService } from '@/services/productService';
import { router } from 'expo-router';

export default function HomeScreen() {
  const [selectedCategory, setSelectedCategory] = useState('All Sweets');
  const [searchQuery, setSearchQuery] = useState('');
  const [sweets, setSweets] = useState<SweetItem[]>(MOCK_SWEETS);
  const [refreshing, setRefreshing] = useState(false);

  const loadProducts = useCallback(async (isPullToRefresh = false) => {
    if (isPullToRefresh) setRefreshing(true);
    try {
      const res = await productService.getProducts(selectedCategory);
      if (Array.isArray(res) && res.length > 0) {
        setSweets(res);
      }
    } catch (err) {
      console.warn('[HomeScreen] Live catalog fetch notice (using cache):', err);
    } finally {
      if (isPullToRefresh) setRefreshing(false);
    }
  }, [selectedCategory]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const filteredSweets = useMemo(() => {
    return sweets.filter((item) => {
      const matchesCategory =
        selectedCategory === 'All Sweets' || item.category === selectedCategory;
      const matchesSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.tagline.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [sweets, selectedCategory, searchQuery]);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom', 'left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.light.background} />
      <View style={styles.mainContainer}>
        {/* Sticky Header */}
        <HeaderBar searchQuery={searchQuery} onSearchChange={setSearchQuery} />

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => loadProducts(true)}
              tintColor={Colors.light.primary}
              colors={[Colors.light.primary]}
            />
          }>
          {/* Festive Banner */}
          <FestiveHero onOrderPress={() => setSelectedCategory('All Sweets')} />

          {/* Category Horizontal Filter Pills */}
          <View style={styles.categorySection}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoryScroll}>
              {CATEGORIES.map((cat) => {
                const isSelected = cat === selectedCategory;
                return (
                  <TouchableOpacity
                    key={cat}
                    activeOpacity={0.8}
                    style={[
                      styles.categoryChip,
                      isSelected && styles.categoryChipSelected,
                    ]}
                    onPress={() => setSelectedCategory(cat)}>
                    <Text
                      style={[
                        styles.categoryText,
                        isSelected && styles.categoryTextSelected,
                      ]}>
                      {cat}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* Fresh From Kitchen Header */}
          <View style={styles.sectionHeader}>
            <View>
              <View style={styles.sectionTitleRow}>
                <View style={styles.pulseDot} />
                <Text style={styles.sectionTitle}>Fresh From Kitchen Today</Text>
              </View>
              <Text style={styles.sectionSubtitle}>
                Authentic karigars preparing hot batches in pure bilona desi ghee
              </Text>
            </View>
          </View>

          {/* Sweet Cards Grid / List */}
          <View style={styles.sweetsList}>
            {filteredSweets.map((sweet) => (
              <SweetCard key={sweet.id} item={sweet} />
            ))}
          </View>

          {/* Custom Hamper Promo Card */}
          <View style={styles.hamperCard}>
            <View style={styles.hamperLeft}>
              <View style={styles.hamperTag}>
                <Ionicons name="gift" size={13} color="#855300" />
                <Text style={styles.hamperTagText}>Royal Festive Hampers</Text>
              </View>
              <Text style={styles.hamperTitle}>Design Your Custom Mithai Box</Text>
              <Text style={styles.hamperDesc}>
                Mix & match up to 4 fresh varieties in handcrafted velvet & brass boxes with custom foil cards.
              </Text>
              <TouchableOpacity
                style={styles.hamperButton}
                activeOpacity={0.85}
                onPress={() => router.push('/hamper-builder' as any)}>
                <Text style={styles.hamperBtnText}>Build Box</Text>
                <Ionicons name="arrow-forward" size={14} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
            <Image
              source={{
                uri: 'https://images.unsplash.com/photo-1541832676-9b763b0239ab?w=400&auto=format&fit=crop&q=80',
              }}
              style={styles.hamperImage}
            />
          </View>

          {/* Bottom spacing for floating cart pill */}
          <View style={{ height: 90 }} />
        </ScrollView>

        {/* Floating Cart Indicator */}
        <CartPill />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  mainContainer: {
    flex: 1,
    position: 'relative',
    maxWidth: 600,
    width: '100%',
    alignSelf: 'center',
  },
  scrollContent: {
    paddingBottom: 24,
  },
  categorySection: {
    marginBottom: 16,
  },
  categoryScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: Colors.light.outlineVariant,
  },
  categoryChipSelected: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
    shadowColor: Colors.light.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  categoryText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.light.textSecondary,
  },
  categoryTextSelected: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  sectionHeader: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.light.pistachio,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.light.text,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    marginTop: 2,
  },
  sweetsList: {
    paddingHorizontal: 16,
  },
  hamperCard: {
    marginHorizontal: 16,
    backgroundColor: '#FFF7ED',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#FED7AA',
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 8,
  },
  hamperLeft: {
    flex: 1,
  },
  hamperTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 6,
  },
  hamperTagText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#855300',
  },
  hamperTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.light.text,
    marginBottom: 4,
  },
  hamperDesc: {
    fontSize: 11,
    color: Colors.light.textSecondary,
    lineHeight: 15,
    marginBottom: 10,
  },
  hamperButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: 'flex-start',
    gap: 4,
  },
  hamperBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  hamperImage: {
    width: 90,
    height: 90,
    borderRadius: 12,
  },
});
