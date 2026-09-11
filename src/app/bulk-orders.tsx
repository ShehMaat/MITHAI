import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  TextInput,
  Linking,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { apiClient } from '@/services/apiClient';
import { router } from 'expo-router';

interface BulkQuoteResult {
  quoteId: string;
  quantityKg: number;
  occasion: string;
  pricing: {
    retailSubtotal: number;
    wholesaleDiscount: number;
    discountPercentage: number;
    estimatedTotal: number;
    depositRequired: number;
  };
}

export default function BulkOrdersScreen() {
  const [occasion, setOccasion] = useState('Wedding & Sangeet Samaroh');
  const [quantityKg, setQuantityKg] = useState(50);
  const [selectedSweets, setSelectedSweets] = useState<string[]>([
    'Premium Kaju Katli',
    'Desi Ghee Motichoor Ladoo',
  ]);
  const [boxStyle, setBoxStyle] = useState('4-Compartment Velvet Box');
  const [customFoilText, setCustomFoilText] = useState('With Best Compliments from Sharma Family');
  const [targetDate, setTargetDate] = useState('15 Nov 2026');
  const [customerName, setCustomerName] = useState('Gaurav Jain');
  const [phone, setPhone] = useState('9876543210');

  const [loading, setLoading] = useState(false);
  const [submittedQuote, setSubmittedQuote] = useState<BulkQuoteResult | null>(null);

  const availableSweetsList = [
    'Premium Kaju Katli',
    'Desi Ghee Motichoor Ladoo',
    'Shahi Angoori Gulab Jamun',
    'Classic Sponge Rasgulla',
    'Artisanal Kaju Pista Roll',
    'Mathura Ke Shahi Peda',
  ];

  const toggleSweetSelection = (sweetName: string) => {
    if (selectedSweets.includes(sweetName)) {
      if (selectedSweets.length > 1) {
        setSelectedSweets(selectedSweets.filter((s) => s !== sweetName));
      }
    } else {
      if (selectedSweets.length < 4) {
        setSelectedSweets([...selectedSweets, sweetName]);
      }
    }
  };

  // Live client-side pricing estimation
  const retailSubtotal = quantityKg * 750;
  let discountPercent = 0.15;
  if (quantityKg >= 100) discountPercent = 0.25;
  else if (quantityKg >= 50) discountPercent = 0.20;

  const wholesaleDiscount = Math.round(retailSubtotal * discountPercent);
  const estimatedTotal = retailSubtotal - wholesaleDiscount;
  const depositRequired = Math.round(estimatedTotal * 0.25);

  const handleSubmitQuote = async () => {
    setLoading(true);
    try {
      const res = await apiClient.post<any>('/bulk-orders', {
        occasion,
        quantityKg,
        sweets: selectedSweets,
        boxStyle,
        customFoilText,
        targetDate,
        customerName,
        phone,
      }, async () => ({
        quoteId: `#GBM-BULK-${Math.floor(10000 + Math.random() * 90000)}`,
        quantityKg,
        occasion,
        pricing: {
          retailSubtotal,
          wholesaleDiscount,
          discountPercentage: Math.round(discountPercent * 100),
          estimatedTotal,
          depositRequired,
        },
      }));

      setSubmittedQuote(res);
    } catch (err) {
      console.error('Failed to submit bulk quote:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleWhatsAppShare = () => {
    if (!submittedQuote) return;
    const msg = `Namaste! I would like to confirm my Bulk Sweet Quote ${submittedQuote.quoteId} for ${submittedQuote.quantityKg}kg (${submittedQuote.occasion}). Estimated Total: ₹${submittedQuote.pricing.estimatedTotal}.`;
    Linking.openURL(`https://wa.me/919876543210?text=${encodeURIComponent(msg)}`);
  };

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
        <View style={styles.headerTitleWrap}>
          <Text style={styles.headerTitle}>Bulk & Wedding Gifting</Text>
          <Text style={styles.headerSub}>Wholesale Rates • Custom Stamped Velvet Boxes</Text>
        </View>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        {submittedQuote ? (
          /* Confirmation State */
          <View style={styles.confirmationCard}>
            <View style={styles.successIconCircle}>
              <Ionicons name="checkmark-circle" size={40} color="#059669" />
            </View>

            <Text style={styles.confirmTitle}>Bulk Quote Request Submitted!</Text>
            <Text style={styles.confirmSub}>
              Reference Quote ID: <Text style={styles.quoteIdText}>{submittedQuote.quoteId}</Text>
            </Text>

            <View style={styles.summaryTable}>
              <View style={styles.tableRow}>
                <Text style={styles.tableLabel}>Occasion:</Text>
                <Text style={styles.tableVal}>{submittedQuote.occasion}</Text>
              </View>
              <View style={styles.tableRow}>
                <Text style={styles.tableLabel}>Total Quantity:</Text>
                <Text style={styles.tableVal}>{submittedQuote.quantityKg} kg</Text>
              </View>
              <View style={styles.tableRow}>
                <Text style={styles.tableLabel}>Wholesale Savings:</Text>
                <Text style={[styles.tableVal, { color: '#059669', fontWeight: '800' }]}>
                  {submittedQuote.pricing.discountPercentage}% OFF (₹{submittedQuote.pricing.wholesaleDiscount} saved)
                </Text>
              </View>
              <View style={styles.tableRow}>
                <Text style={styles.tableLabel}>Estimated Total:</Text>
                <Text style={[styles.tableVal, { fontSize: 16, fontWeight: '900', color: Colors.light.primary }]}>
                  ₹{submittedQuote.pricing.estimatedTotal}
                </Text>
              </View>
              <View style={styles.tableRow}>
                <Text style={styles.tableLabel}>25% Advance Booking Deposit:</Text>
                <Text style={[styles.tableVal, { fontWeight: '800' }]}>
                  ₹{submittedQuote.pricing.depositRequired}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.whatsappBtn}
              activeOpacity={0.85}
              onPress={handleWhatsAppShare}>
              <Ionicons name="logo-whatsapp" size={18} color="#FFFFFF" />
              <Text style={styles.whatsappBtnText}>Connect with Concierge on WhatsApp</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.anotherBtn}
              activeOpacity={0.7}
              onPress={() => setSubmittedQuote(null)}>
              <Text style={styles.anotherBtnText}>Request Another Quote</Text>
            </TouchableOpacity>
          </View>
        ) : (
          /* Form State */
          <>
            {/* Occasion Selector */}
            <View style={styles.card}>
              <Text style={styles.sectionHeading}>1. Select Event / Celebration Occasion</Text>
              <View style={styles.chipsWrap}>
                {[
                  'Wedding & Sangeet Samaroh',
                  'Diwali Corporate Gifting',
                  'Family Grand Celebration',
                  'Baby Announcement (Ladoo)',
                ].map((occ) => {
                  const isSelected = occ === occasion;
                  return (
                    <TouchableOpacity
                      key={occ}
                      style={[styles.occChip, isSelected && styles.occChipSelected]}
                      activeOpacity={0.8}
                      onPress={() => setOccasion(occ)}>
                      <Ionicons
                        name={isSelected ? 'checkmark-circle' : 'gift-outline'}
                        size={14}
                        color={isSelected ? Colors.light.primary : Colors.light.textSecondary}
                      />
                      <Text style={[styles.occChipText, isSelected && styles.occChipTextSelected]}>
                        {occ}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Sweets Mix Selection */}
            <View style={styles.card}>
              <Text style={styles.sectionHeading}>
                2. Select Sweets for Mix (Max 4 varieties)
              </Text>

              <View style={styles.sweetsCheckGrid}>
                {availableSweetsList.map((sw) => {
                  const isChecked = selectedSweets.includes(sw);
                  return (
                    <TouchableOpacity
                      key={sw}
                      style={[styles.sweetCheckRow, isChecked && styles.sweetCheckRowChecked]}
                      activeOpacity={0.8}
                      onPress={() => toggleSweetSelection(sw)}>
                      <View style={[styles.checkbox, isChecked && styles.checkboxChecked]}>
                        {isChecked && <Ionicons name="checkmark" size={12} color="#FFFFFF" />}
                      </View>
                      <Text style={[styles.sweetNameText, isChecked && styles.sweetNameTextChecked]}>
                        {sw}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Quantity Counter & Packaging Customization */}
            <View style={styles.card}>
              <Text style={styles.sectionHeading}>3. Order Quantity & Box Stamping</Text>
              
              {/* Counter */}
              <View style={styles.qtyCounterBox}>
                <View>
                  <Text style={styles.counterTitle}>Total Batch Quantity</Text>
                  <Text style={styles.counterSub}>Minimum bulk tier: 20 kg</Text>
                </View>

                <View style={styles.counterRow}>
                  <TouchableOpacity
                    style={styles.counterBtn}
                    onPress={() => setQuantityKg(Math.max(20, quantityKg - 5))}>
                    <Text style={styles.counterBtnText}>- 5kg</Text>
                  </TouchableOpacity>
                  <Text style={styles.counterValText}>{quantityKg} kg</Text>
                  <TouchableOpacity
                    style={styles.counterBtn}
                    onPress={() => setQuantityKg(quantityKg + 5)}>
                    <Text style={styles.counterBtnText}>+ 5kg</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Box Style */}
              <Text style={[styles.inputLabel, { marginTop: 12 }]}>Packaging Style Choice</Text>
              <View style={styles.boxStyleRow}>
                {[
                  '4-Compartment Velvet Box',
                  'Imperial Brass Tin Box',
                  'Heritage Saffron Box',
                ].map((st) => (
                  <TouchableOpacity
                    key={st}
                    style={[styles.boxStyleBtn, boxStyle === st && styles.boxStyleBtnSelected]}
                    onPress={() => setBoxStyle(st)}>
                    <Text style={[styles.boxStyleText, boxStyle === st && styles.boxStyleTextSelected]}>
                      {st}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Gold Foil Card Input */}
              <Text style={[styles.inputLabel, { marginTop: 10 }]}>Custom Foil Stamping / Message</Text>
              <TextInput
                style={styles.textInput}
                placeholder="e.g. With Compliments from Sharma Family"
                placeholderTextColor={Colors.light.outline}
                value={customFoilText}
                onChangeText={setCustomFoilText}
              />
            </View>

            {/* Live Pricing & Wholesale Savings Summary */}
            <View style={styles.card}>
              <View style={styles.pricingHeader}>
                <Ionicons name="sparkles" size={16} color={Colors.light.goldAccent} />
                <Text style={styles.sectionHeading}>Live Wholesale Estimate</Text>
              </View>

              <View style={styles.billLine}>
                <Text style={styles.billLineLabel}>Retail Equivalent ({quantityKg} kg @ ₹750/kg)</Text>
                <Text style={styles.billLineVal}>₹{retailSubtotal}</Text>
              </View>
              <View style={styles.billLine}>
                <Text style={[styles.billLineLabel, { color: '#059669', fontWeight: '700' }]}>
                  Wholesale Bulk Tier Discount ({Math.round(discountPercent * 100)}% OFF)
                </Text>
                <Text style={[styles.billLineVal, { color: '#059669', fontWeight: '700' }]}>
                  -₹{wholesaleDiscount}
                </Text>
              </View>

              <View style={styles.divider} />

              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Estimated Wholesale Total</Text>
                <Text style={styles.totalVal}>₹{estimatedTotal}</Text>
              </View>

              <View style={styles.depositNotice}>
                <Ionicons name="information-circle-outline" size={14} color={Colors.light.primary} />
                <Text style={styles.depositNoticeText}>
                  25% Advance Booking Deposit: <Text style={{ fontWeight: '900' }}>₹{depositRequired}</Text>
                </Text>
              </View>
            </View>

            {/* Submit CTA */}
            <TouchableOpacity
              style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
              disabled={loading}
              activeOpacity={0.85}
              onPress={handleSubmitQuote}>
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <Text style={styles.submitBtnText}>Request Formal Quote & Reserve Batch</Text>
                  <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
                </>
              )}
            </TouchableOpacity>

            <View style={{ height: 40 }} />
          </>
        )}
      </ScrollView>
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
  headerTitleWrap: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.light.text,
  },
  headerSub: {
    fontSize: 10,
    color: Colors.light.textSecondary,
    fontWeight: '600',
  },
  scrollContent: {
    padding: 16,
    gap: 12,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.light.outlineVariant,
  },
  sectionHeading: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.light.text,
    marginBottom: 10,
  },
  chipsWrap: {
    gap: 8,
  },
  occChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FAF7F2',
    borderWidth: 1,
    borderColor: Colors.light.outlineVariant,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  occChipSelected: {
    backgroundColor: '#FFF2EB',
    borderColor: Colors.light.primary,
  },
  occChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.light.textSecondary,
  },
  occChipTextSelected: {
    color: Colors.light.primary,
    fontWeight: '800',
  },
  sweetsCheckGrid: {
    gap: 8,
  },
  sweetCheckRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#FAF7F2',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  sweetCheckRowChecked: {
    backgroundColor: '#FFF7ED',
    borderColor: '#FED7AA',
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: Colors.light.outline,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
  },
  sweetNameText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.light.textSecondary,
  },
  sweetNameTextChecked: {
    fontWeight: '800',
    color: Colors.light.text,
  },
  qtyCounterBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FAF7F2',
    padding: 12,
    borderRadius: 12,
  },
  counterTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.light.text,
  },
  counterSub: {
    fontSize: 10,
    color: Colors.light.textSecondary,
  },
  counterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  counterBtn: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: Colors.light.outlineVariant,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  counterBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.light.primary,
  },
  counterValText: {
    fontSize: 16,
    fontWeight: '900',
    color: Colors.light.text,
    minWidth: 46,
    textAlign: 'center',
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.light.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  boxStyleRow: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
  },
  boxStyleBtn: {
    backgroundColor: '#FAF7F2',
    borderWidth: 1,
    borderColor: Colors.light.outlineVariant,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  boxStyleBtnSelected: {
    backgroundColor: '#FFF2EB',
    borderColor: Colors.light.primary,
  },
  boxStyleText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.light.textSecondary,
  },
  boxStyleTextSelected: {
    color: Colors.light.primary,
    fontWeight: '800',
  },
  textInput: {
    height: 44,
    backgroundColor: '#FAF7F2',
    borderWidth: 1,
    borderColor: Colors.light.outlineVariant,
    borderRadius: 10,
    paddingHorizontal: 12,
    fontSize: 12,
    color: Colors.light.text,
  },
  pricingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  billLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  billLineLabel: {
    fontSize: 12,
    color: Colors.light.textSecondary,
  },
  billLineVal: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.light.text,
  },
  divider: {
    height: 1,
    backgroundColor: '#F0EDE9',
    marginVertical: 8,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.light.text,
  },
  totalVal: {
    fontSize: 18,
    fontWeight: '900',
    color: Colors.light.primary,
  },
  depositNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFF7ED',
    padding: 8,
    borderRadius: 8,
    marginTop: 8,
  },
  depositNoticeText: {
    fontSize: 11,
    color: Colors.light.primary,
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.light.primary,
    paddingVertical: 14,
    borderRadius: 14,
    gap: 8,
  },
  submitBtnDisabled: {
    opacity: 0.5,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  confirmationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.light.outlineVariant,
    alignItems: 'center',
    gap: 12,
  },
  successIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: Colors.light.text,
    textAlign: 'center',
  },
  confirmSub: {
    fontSize: 12,
    color: Colors.light.textSecondary,
  },
  quoteIdText: {
    fontWeight: '900',
    color: Colors.light.primary,
  },
  summaryTable: {
    width: '100%',
    backgroundColor: '#FAF7F2',
    padding: 12,
    borderRadius: 12,
    gap: 8,
  },
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tableLabel: {
    fontSize: 12,
    color: Colors.light.textSecondary,
  },
  tableVal: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.light.text,
  },
  whatsappBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#25D366',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 8,
    width: '100%',
  },
  whatsappBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  anotherBtn: {
    paddingVertical: 6,
  },
  anotherBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.light.primary,
  },
});
