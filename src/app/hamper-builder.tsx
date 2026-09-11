import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Image,
  TextInput,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { useStore } from '@/store/useStore';
import { router } from 'expo-router';
import { MOCK_SWEETS, SweetItem } from '@/constants/mockData';

interface BoxStyle {
  id: string;
  name: string;
  capacityGrams: number;
  slotsCount: number;
  boxFee: number;
  description: string;
}

const BOX_STYLES: BoxStyle[] = [
  {
    id: 'velvet-4',
    name: 'Royal Velvet 4-Compartment Box',
    capacityGrams: 1000,
    slotsCount: 4,
    boxFee: 150,
    description: 'Deep Maroon Velvet • Brass Latch • Monogram Silk Ribbon',
  },
  {
    id: 'brass-6',
    name: 'Heritage Imperial Brass 6-Box',
    capacityGrams: 1500,
    slotsCount: 6,
    boxFee: 280,
    description: 'Hand-Engraved Royal Brass • Velvet Lining',
  },
];

export default function HamperBuilderScreen() {
  const { addHamperToCart } = useStore();
  const [selectedBox, setSelectedBox] = useState<BoxStyle>(BOX_STYLES[0]);

  // Selected sweets in slots: array of (SweetItem | null)
  const [slots, setSlots] = useState<(SweetItem | null)[]>([
    MOCK_SWEETS[0], // Kaju Katli (pre-filled slot 1)
    MOCK_SWEETS[1], // Motichoor Ladoo (pre-filled slot 2)
    null,
    null,
  ]);

  const [recipientName, setRecipientName] = useState('The Sharma Family');
  const [cardMessage, setCardMessage] = useState(
    'Wishing you sweetness, joy, and festive prosperity!'
  );
  const [hasCard, setHasCard] = useState(true);

  // Switch box style
  const handleBoxSelect = (box: BoxStyle) => {
    setSelectedBox(box);
    if (box.slotsCount === 6 && slots.length === 4) {
      setSlots([...slots, null, null]);
    } else if (box.slotsCount === 4 && slots.length === 6) {
      setSlots(slots.slice(0, 4));
    }
  };

  // Add sweet to next available slot
  const handleAddSweetToSlot = (sweet: SweetItem) => {
    const emptyIndex = slots.findIndex((s) => s === null);
    if (emptyIndex === -1) {
      Alert.alert('Box is Full', 'All compartments in this box are filled! Remove an item to add this sweet.');
      return;
    }
    const copy = [...slots];
    copy[emptyIndex] = sweet;
    setSlots(copy);
  };

  // Remove sweet from slot
  const handleRemoveFromSlot = (index: number) => {
    const copy = [...slots];
    copy[index] = null;
    setSlots(copy);
  };

  // Calculate totals
  const filledCount = slots.filter(Boolean).length;
  const slotWeightGrams = Math.round(selectedBox.capacityGrams / selectedBox.slotsCount);
  const filledWeight = filledCount * slotWeightGrams;

  const sweetsTotal = slots.reduce((sum, s) => {
    if (!s) return sum;
    // calculate price for 250g
    const v = s.variants.find((vr) => vr.label === '250g') || s.variants[0];
    return sum + v.price;
  }, 0);

  const grandTotal = selectedBox.boxFee + sweetsTotal;

  const handleAddToCart = () => {
    if (filledCount === 0) {
      Alert.alert('Box is Empty', 'Please select sweets to fill your festive box.');
      return;
    }
    const filledSweets = slots.filter((s): s is SweetItem => s !== null);
    addHamperToCart({
      box: selectedBox,
      recipientName,
      giftMessage: cardMessage,
      sweets: filledSweets,
    });
    Alert.alert('Custom Box Added!', `Your ${selectedBox.name} with custom monogram ribbon has been added to your sweet cart.`, [
      { text: 'View Cart', onPress: () => router.push('/cart') },
      { text: 'Continue' },
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.light.background} />

      {/* Top Navigation */}
      <View style={styles.topNav}>
        <TouchableOpacity
          style={styles.navBtn}
          activeOpacity={0.7}
          onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color={Colors.light.text} />
        </TouchableOpacity>
        <View style={styles.navCenter}>
          <Text style={styles.navTitle}>Royal Mithai Box Builder</Text>
          <Text style={styles.navSubtitle}>Curate Artisanal Sweet Hampers</Text>
        </View>
        <TouchableOpacity style={styles.navBtn} activeOpacity={0.7}>
          <Ionicons name="information-circle-outline" size={20} color={Colors.light.text} />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        {/* 1. Box Style Selector */}
        <Text style={styles.sectionHeader}>1. Select Luxury Packaging</Text>
        <View style={styles.boxTypeRow}>
          {BOX_STYLES.map((box) => {
            const isSelected = box.id === selectedBox.id;
            return (
              <TouchableOpacity
                key={box.id}
                activeOpacity={0.85}
                style={[styles.boxCard, isSelected && styles.boxCardSelected]}
                onPress={() => handleBoxSelect(box)}>
                <View style={styles.boxHeaderRow}>
                  <Ionicons
                    name="gift"
                    size={16}
                    color={isSelected ? Colors.light.primary : Colors.light.textSecondary}
                  />
                  <Text
                    style={[
                      styles.boxPriceTag,
                      isSelected && styles.boxPriceTagSelected,
                    ]}>
                    +₹{box.boxFee} Box Fee
                  </Text>
                </View>
                <Text style={styles.boxCardTitle}>{box.name}</Text>
                <Text style={styles.boxCardCapacity}>
                  {box.capacityGrams}g Capacity • {box.slotsCount} Compartments
                </Text>
                <Text style={styles.boxCardDesc}>{box.description}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* 2. Visual Box Tray Preview */}
        <View style={styles.boxPreviewSection}>
          <View style={styles.previewHeaderRow}>
            <Text style={styles.sectionHeader}>2. Box Composition</Text>
            <View style={styles.capacityBadge}>
              <Text style={styles.capacityText}>
                {filledWeight}g / {selectedBox.capacityGrams}g ({filledCount}/{selectedBox.slotsCount} filled)
              </Text>
            </View>
          </View>

          {/* Progress Bar */}
          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                { width: `${(filledCount / selectedBox.slotsCount) * 100}%` },
              ]}
            />
          </View>

          {/* Compartment Grid */}
          <View
            style={[
              styles.trayGrid,
              selectedBox.slotsCount === 6 ? styles.trayGrid6 : styles.trayGrid4,
            ]}>
            {slots.map((item, idx) => {
              return (
                <View
                  key={idx}
                  style={[
                    styles.slotContainer,
                    item ? styles.slotFilled : styles.slotEmpty,
                  ]}>
                  {item ? (
                    <>
                      <Image
                        source={{ uri: item.imageUrl }}
                        style={styles.slotImage}
                      />
                      <TouchableOpacity
                        style={styles.slotRemoveBtn}
                        activeOpacity={0.7}
                        onPress={() => handleRemoveFromSlot(idx)}>
                        <Ionicons name="close" size={13} color="#FFFFFF" />
                      </TouchableOpacity>
                      <View style={styles.slotTextOverlay}>
                        <Text numberOfLines={1} style={styles.slotSweetName}>
                          {item.name}
                        </Text>
                        <Text style={styles.slotSweetWeight}>
                          {slotWeightGrams}g
                        </Text>
                      </View>
                    </>
                  ) : (
                    <View style={styles.emptySlotContent}>
                      <Ionicons
                        name="add-circle-outline"
                        size={24}
                        color={Colors.light.saffron}
                      />
                      <Text style={styles.emptySlotLabel}>Slot #{idx + 1}</Text>
                      <Text style={styles.emptySlotSub}>Tap sweet below</Text>
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        </View>

        {/* 3. Available Sweets Tray */}
        <Text style={styles.sectionHeader}>
          3. Tap to Fill Remaining Slots ({selectedBox.slotsCount - filledCount} needed)
        </Text>
        <View style={styles.sweetsTray}>
          {MOCK_SWEETS.map((sweet) => {
            const v = sweet.variants.find((vr) => vr.label === '250g') || sweet.variants[0];
            return (
              <TouchableOpacity
                key={sweet.id}
                style={styles.traySweetCard}
                activeOpacity={0.8}
                onPress={() => handleAddSweetToSlot(sweet)}>
                <Image source={{ uri: sweet.imageUrl }} style={styles.traySweetImg} />
                <View style={styles.traySweetInfo}>
                  <Text style={styles.traySweetTitle} numberOfLines={1}>
                    {sweet.name}
                  </Text>
                  <Text style={styles.traySweetSub} numberOfLines={1}>
                    {sweet.tagline}
                  </Text>
                  <Text style={styles.traySweetPrice}>
                    ₹{v.price} / {slotWeightGrams}g
                  </Text>
                </View>
                <View style={styles.trayAddBtn}>
                  <Ionicons name="add" size={16} color="#FFFFFF" />
                  <Text style={styles.trayAddText}>Add</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* 4. Personalization & Festive Card */}
        <Text style={styles.sectionHeader}>4. Gold-Foil Greeting Card</Text>
        <View style={styles.cardContainer}>
          <TouchableOpacity
            style={styles.cardCheckRow}
            activeOpacity={0.8}
            onPress={() => setHasCard(!hasCard)}>
            <View style={[styles.checkbox, hasCard && styles.checkboxChecked]}>
              {hasCard && <Ionicons name="checkmark" size={14} color="#FFFFFF" />}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardCheckTitle}>
                Complimentary Royal Gold-Foil Card
              </Text>
              <Text style={styles.cardCheckSub}>
                Embossed on handmade ivory deckle paper with a royal gold wax seal
              </Text>
            </View>
          </TouchableOpacity>

          {hasCard && (
            <View style={styles.inputsWrapper}>
              <Text style={styles.inputLabel}>RECIPIENT NAME</Text>
              <TextInput
                style={styles.textInput}
                value={recipientName}
                onChangeText={setRecipientName}
                placeholder="E.g., The Sharma Family"
                placeholderTextColor={Colors.light.outline}
              />

              <Text style={[styles.inputLabel, { marginTop: 10 }]}>CARD MESSAGE</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                value={cardMessage}
                onChangeText={setCardMessage}
                placeholder="Write your heartfelt festive wishes..."
                placeholderTextColor={Colors.light.outline}
                multiline
                numberOfLines={3}
              />
            </View>
          )}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Sticky Bottom Action Bar */}
      <View style={styles.bottomBar}>
        <View>
          <Text style={styles.bottomBarSub}>
            Box ₹{selectedBox.boxFee} + Sweets ₹{sweetsTotal}
          </Text>
          <Text style={styles.bottomBarTotal}>Total: ₹{grandTotal}</Text>
        </View>

        <TouchableOpacity
          style={[
            styles.checkoutBtn,
            filledCount === 0 && styles.checkoutBtnDisabled,
          ]}
          activeOpacity={0.85}
          onPress={handleAddToCart}>
          <Text style={styles.checkoutBtnText}>Add Box to Cart</Text>
          <Ionicons name="arrow-forward" size={15} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
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
  navSubtitle: {
    fontSize: 11,
    color: Colors.light.textSecondary,
    marginTop: 1,
  },
  scrollContent: {
    padding: 16,
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.light.text,
    marginBottom: 10,
    marginTop: 6,
  },
  boxTypeRow: {
    gap: 10,
    marginBottom: 14,
  },
  boxCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1.5,
    borderColor: Colors.light.outlineVariant,
  },
  boxCardSelected: {
    borderColor: Colors.light.saffron,
    backgroundColor: '#FFF7ED',
  },
  boxHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  boxPriceTag: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.light.textSecondary,
  },
  boxPriceTagSelected: {
    color: Colors.light.primary,
    fontWeight: '800',
  },
  boxCardTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.light.text,
  },
  boxCardCapacity: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.light.saffron,
    marginVertical: 2,
  },
  boxCardDesc: {
    fontSize: 11,
    color: Colors.light.textSecondary,
  },
  boxPreviewSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.light.outlineVariant,
    marginBottom: 16,
  },
  previewHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  capacityBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  capacityText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#855300',
  },
  progressTrack: {
    height: 6,
    backgroundColor: Colors.light.backgroundElement,
    borderRadius: 3,
    marginVertical: 10,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.light.saffron,
    borderRadius: 3,
  },
  trayGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  trayGrid4: {
    justifyContent: 'space-between',
  },
  trayGrid6: {
    justifyContent: 'space-between',
  },
  slotContainer: {
    width: '48%',
    height: 120,
    borderRadius: 14,
    overflow: 'hidden',
    position: 'relative',
  },
  slotFilled: {
    borderWidth: 1,
    borderColor: Colors.light.outlineVariant,
  },
  slotEmpty: {
    borderWidth: 1.5,
    borderColor: '#FED7AA',
    borderStyle: 'dashed',
    backgroundColor: '#FFFDF9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  slotImage: {
    width: '100%',
    height: '100%',
  },
  slotRemoveBtn: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  slotTextOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  slotSweetName: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  slotSweetWeight: {
    fontSize: 9,
    color: '#FDE68A',
  },
  emptySlotContent: {
    alignItems: 'center',
    gap: 2,
  },
  emptySlotLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.light.text,
    marginTop: 2,
  },
  emptySlotSub: {
    fontSize: 10,
    color: Colors.light.textSecondary,
  },
  sweetsTray: {
    gap: 8,
    marginBottom: 16,
  },
  traySweetCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 10,
    borderWidth: 1,
    borderColor: Colors.light.outlineVariant,
    gap: 10,
  },
  traySweetImg: {
    width: 50,
    height: 50,
    borderRadius: 10,
  },
  traySweetInfo: {
    flex: 1,
  },
  traySweetTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.light.text,
  },
  traySweetSub: {
    fontSize: 11,
    color: Colors.light.textSecondary,
    marginVertical: 1,
  },
  traySweetPrice: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.light.primary,
  },
  trayAddBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.primary,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    gap: 4,
  },
  trayAddText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  cardContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.light.outlineVariant,
    marginBottom: 16,
  },
  cardCheckRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: Colors.light.outline,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  checkboxChecked: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
  },
  cardCheckTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.light.text,
  },
  cardCheckSub: {
    fontSize: 11,
    color: Colors.light.textSecondary,
    marginTop: 2,
  },
  inputsWrapper: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F3EFEA',
  },
  inputLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.light.textSecondary,
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  textInput: {
    backgroundColor: '#FAF7F2',
    borderWidth: 1,
    borderColor: Colors.light.outlineVariant,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 12,
    color: Colors.light.text,
  },
  textArea: {
    height: 60,
    textAlignVertical: 'top',
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
    justifyContent: 'space-between',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  bottomBarSub: {
    fontSize: 10,
    color: Colors.light.textSecondary,
    fontWeight: '600',
  },
  bottomBarTotal: {
    fontSize: 17,
    fontWeight: '900',
    color: Colors.light.text,
  },
  checkoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.primary,
    paddingHorizontal: 18,
    paddingVertical: 11,
    borderRadius: 12,
    gap: 6,
  },
  checkoutBtnDisabled: {
    backgroundColor: Colors.light.outline,
  },
  checkoutBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
});
