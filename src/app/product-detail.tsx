import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Image,
  Share,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { useStore } from '@/store/useStore';
import { router, useLocalSearchParams } from 'expo-router';
import { MOCK_SWEETS, SweetItem, WeightVariant } from '@/constants/mockData';

import { ReviewModal } from '@/components/review-modal';

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { addToCart, submitReview, favorites, toggleFavorite } = useStore();

  // Find sweet by id, default to Kaju Katli
  const sweet: SweetItem =
    MOCK_SWEETS.find((s) => s.id === id) || MOCK_SWEETS[0];

  const [selectedVariant, setSelectedVariant] = useState<WeightVariant>(
    sweet.variants.length > 1 ? sweet.variants[1] : sweet.variants[0]
  );
  const [quantity, setQuantity] = useState(1);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const isFavorite = favorites.includes(sweet.id);

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out ${sweet.name} from Gaurav Bhai Ki Mithai! Crafted fresh daily with pure desi ghee: ₹${selectedVariant.price} for ${selectedVariant.label}.`,
      });
    } catch (e) {
      // ignore
    }
  };

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addToCart(sweet, selectedVariant);
    }
    Alert.alert(
      'Added to Sweet Cart',
      `${quantity}x ${sweet.name} (${selectedVariant.label}) added to your cart!`,
      [
        { text: 'View Cart', onPress: () => router.push('/cart') },
        { text: 'Keep Browsing' },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom', 'left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.light.background} />

      {/* Floating Top Nav over Hero */}
      <View style={styles.floatingNav}>
        <TouchableOpacity
          style={styles.floatingBtn}
          activeOpacity={0.8}
          onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color="#1C1C19" />
        </TouchableOpacity>

        <View style={styles.floatingRightBtns}>
          <TouchableOpacity
            style={styles.floatingBtn}
            activeOpacity={0.8}
            onPress={handleShare}>
            <Ionicons name="share-social-outline" size={19} color="#1C1C19" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.floatingBtn}
            activeOpacity={0.8}
            onPress={() => toggleFavorite(sweet.id)}>
            <Ionicons
              name={isFavorite ? 'heart' : 'heart-outline'}
              size={20}
              color={isFavorite ? '#EF4444' : '#1C1C19'}
            />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        {/* Hero Image Section */}
        <View style={styles.heroWrapper}>
          <Image source={{ uri: sweet.imageUrl }} style={styles.heroImage} />
          <View style={styles.heroOverlayBadge}>
            <View style={styles.freshBatchDot} />
            <Text style={styles.freshBatchText}>
              Freshly Made at 4:30 AM Today
            </Text>
          </View>
          <View style={styles.photoCountBadge}>
            <Text style={styles.photoCountText}>1 / 4 Photos</Text>
          </View>
        </View>

        {/* Product Meta Header */}
        <View style={styles.detailsCard}>
          <Text style={styles.categoryLabel}>
            {sweet.category.toUpperCase()} • ARTISANAL KARIGAR RECIPE
          </Text>
          <Text style={styles.sweetName}>{sweet.name}</Text>
          <Text style={styles.sweetTagline}>{sweet.tagline}</Text>

          {/* Price & Rating Bar */}
          <View style={styles.priceRatingRow}>
            <View style={styles.priceBlock}>
              <Text style={styles.priceValue}>₹{selectedVariant.price}</Text>
              <Text style={styles.originalPrice}>₹{Math.round(selectedVariant.price * 1.12)}</Text>
              <View style={styles.discountBadge}>
                <Text style={styles.discountText}>10% OFF</Text>
              </View>
            </View>

            <View style={styles.ratingBox}>
              <View style={styles.starsRow}>
                <Ionicons name="star" size={13} color="#F59E0B" />
                <Text style={styles.ratingNumber}>{sweet.rating}</Text>
              </View>
              <Text style={styles.reviewsCount}>({sweet.reviewsCount} reviews)</Text>
            </View>
          </View>

          {/* Purity Badges Pill Row */}
          <View style={styles.badgesRow}>
            <View style={styles.purityPill}>
              <View style={styles.vegSquare}>
                <View style={styles.vegDot} />
              </View>
              <Text style={styles.purityPillText}>100% Pure Veg</Text>
            </View>

            <View style={styles.purityPill}>
              <Ionicons name="sparkles" size={13} color="#855300" />
              <Text style={styles.purityPillText}>Certified Silver Vark</Text>
            </View>

            <View style={styles.purityPill}>
              <Ionicons name="shield-checkmark" size={13} color="#065F46" />
              <Text style={styles.purityPillText}>Pure Desi Ghee</Text>
            </View>
          </View>
        </View>

        {/* Portion & Weight Selector */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Select Box Weight & Quantity</Text>
          <Text style={styles.cardSubtitle}>
            Hand-packed in airtight gold-foil trays to preserve crispness
          </Text>

          <View style={styles.variantsGrid}>
            {sweet.variants.map((v) => {
              const isSelected = v.id === selectedVariant.id;
              return (
                <TouchableOpacity
                  key={v.id}
                  activeOpacity={0.85}
                  style={[
                    styles.variantCard,
                    isSelected && styles.variantCardSelected,
                  ]}
                  onPress={() => setSelectedVariant(v)}>
                  <View style={styles.variantHeader}>
                    <Text
                      style={[
                        styles.variantWeight,
                        isSelected && styles.variantWeightSelected,
                      ]}>
                      {v.label}
                    </Text>
                    {isSelected && (
                      <View style={styles.selectedTick}>
                        <Ionicons name="checkmark" size={11} color="#FFFFFF" />
                      </View>
                    )}
                  </View>
                  <Text
                    style={[
                      styles.variantPrice,
                      isSelected && styles.variantPriceSelected,
                    ]}>
                    ₹{v.price}
                  </Text>
                  <Text style={styles.variantPerGram}>
                    {v.weightInGrams ? `~₹${Math.round((v.price / v.weightInGrams) * 100)}/100g` : 'Fresh Pack'}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Tasting Notes & Karigar Story */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Tasting Notes & Artisanal Craft</Text>
          <Text style={styles.craftStory}>{sweet.description}</Text>

          <View style={styles.quoteCard}>
            <Ionicons name="chatbubble-ellipses" size={20} color="#F59E0B" />
            <View style={{ flex: 1 }}>
              <Text style={styles.quoteText}>
                &quot;Best Kaju Katli in Gurugram, melt in mouth texture without any excess sweetness. The silver vark is authentic and delicate.&quot;
              </Text>
              <Text style={styles.quoteAuthor}>Rajesh K. • Verified Buyer (5.0 ★)</Text>
            </View>
          </View>
        </View>

        {/* Ingredients & Storage Guide */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Ingredients & Storage Guide</Text>

          <View style={styles.specRow}>
            <Ionicons name="nutrition-outline" size={18} color={Colors.light.saffron} />
            <View style={{ flex: 1 }}>
              <Text style={styles.specLabel}>Ingredients</Text>
              <Text style={styles.specVal}>
                Premium Cashew Nuts (72%), Fine Cane Sugar, Hand-pounded Cardamom, Certified Vegetarian Silver Leaf.
              </Text>
            </View>
          </View>

          <View style={styles.specRow}>
            <Ionicons name="time-outline" size={18} color={Colors.light.saffron} />
            <View style={{ flex: 1 }}>
              <Text style={styles.specLabel}>Shelf Life</Text>
              <Text style={styles.specVal}>{sweet.shelfLife}</Text>
            </View>
          </View>

          <View style={styles.specRow}>
            <Ionicons name="snow-outline" size={18} color={Colors.light.saffron} />
            <View style={{ flex: 1 }}>
              <Text style={styles.specLabel}>Storage Instructions</Text>
              <Text style={styles.specVal}>
                Store in a cool, dry place away from direct sunlight. Refrigeration recommended after opening.
              </Text>
            </View>
          </View>
        </View>

        {/* Reviews Section */}
        <View style={styles.card}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <View>
              <Text style={styles.cardTitle}>Customer Reviews ({sweet.reviewsCount || 148})</Text>
              <Text style={{ fontSize: 12, color: Colors.light.pistachio, fontWeight: '700' }}>
                ★ {sweet.rating} / 5.0 Rating
              </Text>
            </View>
            <TouchableOpacity
              style={{ backgroundColor: '#FFF5EB', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 }}
              onPress={() => setShowReviewModal(true)}>
              <Text style={{ fontSize: 12, fontWeight: '700', color: Colors.light.primary }}>+ Write Review</Text>
            </TouchableOpacity>
          </View>

          {/* Sample Review */}
          <View style={{ backgroundColor: '#FCF9F4', padding: 12, borderRadius: 10, borderWidth: 1, borderColor: '#F1E8DB' }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
              <Text style={{ fontSize: 13, fontWeight: '700', color: Colors.light.text }}>Rajesh Sharma</Text>
              <Text style={{ fontSize: 11, color: Colors.light.textSecondary }}>Verified Buyer • 2 days ago</Text>
            </View>
            <Text style={{ fontSize: 12, color: Colors.light.saffron, fontWeight: '700', marginBottom: 4 }}>★★★★★ Royal Perfection</Text>
            <Text style={{ fontSize: 13, color: Colors.light.textSecondary }}>
              Absolutely melt-in-the-mouth texture! The silver leaf is genuine and sweetness is well balanced. Arrived in a royal velvet box.
            </Text>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Fixed Bottom Action Bar */}
      <View style={styles.bottomBar}>
        {/* Quantity Stepper */}
        <View style={styles.stepper}>
          <TouchableOpacity
            style={styles.stepperBtn}
            onPress={() => setQuantity(Math.max(1, quantity - 1))}>
            <Ionicons name="remove" size={16} color={Colors.light.primary} />
          </TouchableOpacity>
          <Text style={styles.stepperText}>{quantity}</Text>
          <TouchableOpacity
            style={styles.stepperBtn}
            onPress={() => setQuantity(quantity + 1)}>
            <Ionicons name="add" size={16} color={Colors.light.primary} />
          </TouchableOpacity>
        </View>

        {/* Add to Cart CTA */}
        <TouchableOpacity
          style={styles.addToCartBtn}
          activeOpacity={0.85}
          onPress={handleAddToCart}>
          <Ionicons name="bag-handle" size={17} color="#FFFFFF" />
          <Text style={styles.addToCartText}>
            Add to Cart • ₹{selectedVariant.price * quantity}
          </Text>
        </TouchableOpacity>
      </View>

      <ReviewModal
        visible={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        productId={sweet.id}
        productName={sweet.name}
        onSubmitReview={async (pId, rating, comment) => {
          await submitReview(pId, rating, comment);
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  floatingNav: {
    position: 'absolute',
    top: 14,
    left: 16,
    right: 16,
    zIndex: 99,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  floatingBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  floatingRightBtns: {
    flexDirection: 'row',
    gap: 8,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  heroWrapper: {
    height: 280,
    width: '100%',
    position: 'relative',
    backgroundColor: '#F3EFEA',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroOverlayBadge: {
    position: 'absolute',
    bottom: 12,
    left: 16,
    backgroundColor: 'rgba(28, 28, 25, 0.75)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  freshBatchDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  freshBatchText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  photoCountBadge: {
    position: 'absolute',
    bottom: 12,
    right: 16,
    backgroundColor: 'rgba(28, 28, 25, 0.75)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  photoCountText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  detailsCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.outlineVariant,
  },
  categoryLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.light.saffron,
    letterSpacing: 1,
    marginBottom: 4,
  },
  sweetName: {
    fontSize: 22,
    fontWeight: '900',
    color: Colors.light.text,
  },
  sweetTagline: {
    fontSize: 13,
    color: Colors.light.textSecondary,
    marginVertical: 4,
  },
  priceRatingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 12,
  },
  priceBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  priceValue: {
    fontSize: 24,
    fontWeight: '900',
    color: Colors.light.text,
  },
  originalPrice: {
    fontSize: 15,
    color: Colors.light.textSecondary,
    textDecorationLine: 'line-through',
  },
  discountBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  discountText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#065F46',
  },
  ratingBox: {
    alignItems: 'flex-end',
  },
  starsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingNumber: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.light.text,
  },
  reviewsCount: {
    fontSize: 10,
    color: Colors.light.textSecondary,
  },
  badgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F3EFEA',
  },
  purityPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF7F2',
    borderWidth: 1,
    borderColor: Colors.light.outlineVariant,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 5,
  },
  vegSquare: {
    width: 12,
    height: 12,
    borderWidth: 1.5,
    borderColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 2,
  },
  vegDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#10B981',
  },
  purityPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.light.text,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    marginHorizontal: 16,
    marginTop: 12,
    borderWidth: 1,
    borderColor: Colors.light.outlineVariant,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.light.text,
  },
  cardSubtitle: {
    fontSize: 11,
    color: Colors.light.textSecondary,
    marginTop: 2,
    marginBottom: 10,
  },
  variantsGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  variantCard: {
    flex: 1,
    padding: 10,
    borderRadius: 12,
    backgroundColor: '#FAF7F2',
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  variantCardSelected: {
    backgroundColor: '#FFF2EB',
    borderColor: Colors.light.saffron,
  },
  variantHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  variantWeight: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.light.text,
  },
  variantWeightSelected: {
    color: Colors.light.saffron,
    fontWeight: '800',
  },
  selectedTick: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: Colors.light.saffron,
    alignItems: 'center',
    justifyContent: 'center',
  },
  variantPrice: {
    fontSize: 15,
    fontWeight: '900',
    color: Colors.light.text,
    marginVertical: 4,
  },
  variantPriceSelected: {
    color: Colors.light.primary,
  },
  variantPerGram: {
    fontSize: 10,
    color: Colors.light.textSecondary,
  },
  craftStory: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    lineHeight: 18,
    marginVertical: 8,
  },
  quoteCard: {
    backgroundColor: '#FFF7ED',
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    gap: 10,
    borderWidth: 1,
    borderColor: '#FED7AA',
    marginTop: 6,
  },
  quoteText: {
    fontSize: 11,
    fontStyle: 'italic',
    color: '#78350F',
    lineHeight: 16,
  },
  quoteAuthor: {
    fontSize: 10,
    fontWeight: '700',
    color: '#92400E',
    marginTop: 4,
  },
  specRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },
  specLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.light.text,
  },
  specVal: {
    fontSize: 11,
    color: Colors.light.textSecondary,
    marginTop: 1,
    lineHeight: 15,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.light.outlineVariant,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF2EB',
    borderWidth: 1,
    borderColor: Colors.light.primary,
    borderRadius: 12,
    paddingHorizontal: 6,
    paddingVertical: 6,
    gap: 10,
  },
  stepperBtn: {
    width: 26,
    height: 26,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperText: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.light.primary,
    minWidth: 16,
    textAlign: 'center',
  },
  addToCartBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.light.primary,
    paddingVertical: 12,
    borderRadius: 14,
    gap: 8,
  },
  addToCartText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
});
