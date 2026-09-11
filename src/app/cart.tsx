import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Image,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { useStore } from '@/store/useStore';
import { router } from 'expo-router';

import { AddressModal } from '@/components/address-modal';
import { PaymentGatewayModal } from '@/components/payment-gateway-modal';

export default function CartScreen() {
  const {
    cart,
    updateQuantity,
    removeFromCart,
    fulfillmentMode,
    setFulfillmentMode,
    deliveryAddress,
    setDeliveryAddress,
    savedAddresses,
    addAddress,
    selectedDate,
    setSelectedDate,
    selectedSlot,
    setSelectedSlot,
    addGiftWrap,
    setAddGiftWrap,
    giftMessage,
    setGiftMessage,
    itemTotal,
    packagingFee,
    deliveryFee,
    tax,
    discount,
    grandTotal,
    couponCode,
    couponMessage,
    applyCouponCode,
    removeCoupon,
    placeOrder,
  } = useStore();

  const [selectedPayment, setSelectedPayment] = useState('UPI');
  const [enteredCoupon, setEnteredCoupon] = useState('');
  const [couponError, setCouponError] = useState('');
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const handleCheckout = () => {
    if (cart.length === 0) return;
    setShowPaymentModal(true);
  };

  const handlePaymentSuccess = (details: { paymentId: string; method: string }) => {
    setShowPaymentModal(false);
    placeOrder(details.method);
    router.replace('/order-tracking');
  };

  // Dynamic date generation (Defect #3 fix)
  const getDynamicDates = () => {
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return [
      `Today (${today.getDate()} ${monthNames[today.getMonth()]})`,
      `Tomorrow (${tomorrow.getDate()} ${monthNames[tomorrow.getMonth()]})`,
    ];
  };

  const dates = getDynamicDates();
  const timeSlots = ['5:00 PM - 6:00 PM', '6:00 PM - 7:00 PM', '7:00 PM - 8:00 PM'];

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom', 'left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.light.background} />

      {/* Top Navigation Header */}
      <View style={styles.topNav}>
        <TouchableOpacity
          style={styles.backButton}
          activeOpacity={0.7}
          onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color={Colors.light.text} />
        </TouchableOpacity>
        <View style={styles.navTitleCenter}>
          <Text style={styles.navTitle}>Your Mithai Cart & Checkout</Text>
          <View style={styles.secureRow}>
            <Ionicons name="shield-checkmark" size={11} color={Colors.light.pistachio} />
            <Text style={styles.secureText}>100% Safe & Secure</Text>
          </View>
        </View>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        {/* Fulfillment Method Switcher */}
        <View style={styles.fulfillmentWrapper}>
          <TouchableOpacity
            activeOpacity={0.8}
            style={[
              styles.fulfillmentTab,
              fulfillmentMode === 'delivery' && styles.fulfillmentTabActive,
            ]}
            onPress={() => setFulfillmentMode('delivery')}>
            <Ionicons
              name="bicycle"
              size={16}
              color={fulfillmentMode === 'delivery' ? '#FFFFFF' : Colors.light.textSecondary}
            />
            <Text
              style={[
                styles.fulfillmentText,
                fulfillmentMode === 'delivery' && styles.fulfillmentTextActive,
              ]}>
              Home Delivery
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            style={[
              styles.fulfillmentTab,
              fulfillmentMode === 'pickup' && styles.fulfillmentTabActive,
            ]}
            onPress={() => setFulfillmentMode('pickup')}>
            <Ionicons
              name="storefront"
              size={15}
              color={fulfillmentMode === 'pickup' ? '#FFFFFF' : Colors.light.textSecondary}
            />
            <Text
              style={[
                styles.fulfillmentText,
                fulfillmentMode === 'pickup' && styles.fulfillmentTextActive,
              ]}>
              Store Pickup (15m)
            </Text>
          </TouchableOpacity>
        </View>

        {/* Address Card */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <View style={styles.iconPin}>
              <Ionicons
                name={fulfillmentMode === 'delivery' ? 'location' : 'storefront'}
                size={16}
                color={Colors.light.saffron}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardHeaderTitle}>
                {fulfillmentMode === 'delivery' ? 'Delivering to' : 'Pickup at Boutique Store'}
              </Text>
              <Text style={styles.addressText}>
                {fulfillmentMode === 'delivery'
                  ? deliveryAddress
                  : 'Shop 12, Central Market, Sector 29, Gurugram'}
              </Text>
            </View>
            <TouchableOpacity activeOpacity={0.7} onPress={() => setShowAddressModal(true)}>
              <Text style={styles.changeBtn}>Change</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Cart Items List */}
        <View style={styles.card}>
          <Text style={styles.sectionHeading}>Selected Fresh Sweets ({cart.length})</Text>

          {cart.length === 0 ? (
            <View style={styles.emptyBox}>
              <Ionicons name="basket-outline" size={40} color={Colors.light.outline} />
              <Text style={styles.emptyText}>Your sweet cart is empty</Text>
              <TouchableOpacity
                style={styles.browseButton}
                onPress={() => router.push('/')}>
                <Text style={styles.browseBtnText}>Explore Sweets</Text>
              </TouchableOpacity>
            </View>
          ) : (
            cart.map((item, index) => (
              <View
                key={`${item.sweet.id}-${item.variant.id}`}
                style={[styles.cartItemRow, index > 0 && styles.itemDivider]}>
                <Image
                  source={{ uri: item.sweet.imageUrl }}
                  style={styles.itemImage}
                />
                <View style={styles.itemInfo}>
                  {item.isHamper ? (
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 2 }}>
                      <Ionicons name="gift" size={12} color="#D97706" />
                      <Text style={{ fontSize: 10, fontWeight: '800', color: '#D97706', letterSpacing: 0.5 }}>
                        CUSTOM ROYAL HAMPER
                      </Text>
                    </View>
                  ) : null}
                  <Text style={styles.itemName}>{item.sweet.name}</Text>
                  {item.isHamper ? (
                    <Text style={{ fontSize: 11, color: Colors.light.primary, fontWeight: '700', marginTop: 1 }}>
                      To: {item.hamperRecipient} • {item.hamperBox?.name}
                    </Text>
                  ) : (
                    <Text style={styles.itemVariant}>
                      {item.variant.label} Box • Pure Desi Ghee
                    </Text>
                  )}
                  <Text style={styles.itemPrice}>
                    ₹{item.variant.price * item.quantity}
                  </Text>
                </View>

                {/* Quantity Stepper */}
                <View style={styles.stepperWrap}>
                  <TouchableOpacity
                    style={styles.stepperBtn}
                    onPress={() =>
                      updateQuantity(item.sweet.id, item.variant.id, -1)
                    }>
                    <Ionicons name="remove" size={14} color={Colors.light.primary} />
                  </TouchableOpacity>
                  <Text style={styles.qtyValue}>{item.quantity}</Text>
                  <TouchableOpacity
                    style={styles.stepperBtn}
                    onPress={() =>
                      updateQuantity(item.sweet.id, item.variant.id, 1)
                    }>
                    <Ionicons name="add" size={14} color={Colors.light.primary} />
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  style={styles.deleteBtn}
                  onPress={() =>
                    removeFromCart(item.sweet.id, item.variant.id)
                  }>
                  <Ionicons name="trash-outline" size={16} color={Colors.light.outline} />
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>

        {/* Slot Selection */}
        <View style={styles.card}>
          <Text style={styles.sectionHeading}>Select Delivery / Pickup Slot</Text>

          {/* Date Selector */}
          <View style={styles.pillRow}>
            {dates.map((d) => {
              const isSelected = d === selectedDate;
              return (
                <TouchableOpacity
                  key={d}
                  activeOpacity={0.8}
                  style={[styles.slotPill, isSelected && styles.slotPillActive]}
                  onPress={() => setSelectedDate(d)}>
                  <Ionicons
                    name="calendar-outline"
                    size={14}
                    color={isSelected ? Colors.light.saffron : Colors.light.textSecondary}
                  />
                  <Text
                    style={[
                      styles.slotPillText,
                      isSelected && styles.slotPillTextActive,
                    ]}>
                    {d}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Time Slots */}
          <View style={styles.pillRow}>
            {timeSlots.map((slot) => {
              const isSelected = slot === selectedSlot;
              return (
                <TouchableOpacity
                  key={slot}
                  activeOpacity={0.8}
                  style={[styles.slotPill, isSelected && styles.slotPillActive]}
                  onPress={() => setSelectedSlot(slot)}>
                  <Ionicons
                    name="time-outline"
                    size={14}
                    color={isSelected ? Colors.light.saffron : Colors.light.textSecondary}
                  />
                  <Text
                    style={[
                      styles.slotPillText,
                      isSelected && styles.slotPillTextActive,
                    ]}>
                    {slot}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Royal Festive Gifting & Packaging */}
        <View style={styles.card}>
          <TouchableOpacity
            style={styles.giftCheckRow}
            activeOpacity={0.8}
            onPress={() => setAddGiftWrap(!addGiftWrap)}>
            <View
              style={[
                styles.checkbox,
                addGiftWrap && styles.checkboxChecked,
              ]}>
              {addGiftWrap && <Ionicons name="checkmark" size={14} color="#FFFFFF" />}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.giftTitle}>Add Royal Festive Gift Wrap & Card (+₹35)</Text>
              <Text style={styles.giftSubtitle}>
                Handcrafted maroon velvet box with royal seal & golden greeting card
              </Text>
            </View>
          </TouchableOpacity>

          {addGiftWrap && (
            <TextInput
              style={styles.messageInput}
              placeholder="Enter greeting message for recipient..."
              placeholderTextColor={Colors.light.outline}
              value={giftMessage}
              onChangeText={setGiftMessage}
            />
          )}
        </View>

        {/* Royal Festive Coupon / Promo Code Card */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <View style={styles.couponIconCircle}>
              <Ionicons name="pricetag" size={16} color={Colors.light.goldAccent} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.sectionHeading}>Apply Festive Coupon</Text>
              <Text style={styles.sectionSubtitle}>Exclusive artisanal celebration discounts</Text>
            </View>
          </View>

          {couponCode ? (
            <View style={styles.appliedCouponBox}>
              <View style={{ flex: 1 }}>
                <View style={styles.couponTagRow}>
                  <Ionicons name="checkmark-circle" size={16} color={Colors.light.pistachio} />
                  <Text style={styles.appliedCouponText}>Code &apos;{couponCode}&apos; Applied!</Text>
                </View>
                <Text style={styles.appliedCouponDesc}>{couponMessage}</Text>
              </View>
              <TouchableOpacity
                onPress={removeCoupon}
                activeOpacity={0.7}
                style={styles.removeCouponBtn}>
                <Text style={styles.removeCouponText}>Remove</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <View style={styles.couponInputRow}>
                <TextInput
                  style={styles.couponInput}
                  placeholder="Enter Code (e.g. MITHAI50)"
                  placeholderTextColor={Colors.light.outline}
                  value={enteredCoupon}
                  onChangeText={(val) => {
                    setEnteredCoupon(val.toUpperCase());
                    setCouponError('');
                  }}
                  autoCapitalize="characters"
                />
                <TouchableOpacity
                  style={[
                    styles.applyCouponBtn,
                    !enteredCoupon.trim() && styles.applyCouponBtnDisabled,
                  ]}
                  disabled={!enteredCoupon.trim()}
                  activeOpacity={0.8}
                  onPress={() => {
                    const success = applyCouponCode(enteredCoupon.trim());
                    if (!success) {
                      setCouponError('Invalid coupon code. Try MITHAI50 or GOLD100');
                    } else {
                      setCouponError('');
                      setEnteredCoupon('');
                    }
                  }}>
                  <Text style={styles.applyCouponBtnText}>APPLY</Text>
                </TouchableOpacity>
              </View>

              {couponError ? (
                <Text style={styles.couponErrorText}>{couponError}</Text>
              ) : null}

              {/* Quick Coupon Suggestions */}
              <View style={styles.quickCouponsContainer}>
                <Text style={styles.quickCouponsLabel}>AVAILABLE OFFERS:</Text>
                <View style={styles.quickCouponChipsRow}>
                  <TouchableOpacity
                    style={styles.quickCouponChip}
                    activeOpacity={0.7}
                    onPress={() => {
                      applyCouponCode('MITHAI50');
                      setCouponError('');
                    }}>
                    <Text style={styles.quickCouponCode}>MITHAI50</Text>
                    <Text style={styles.quickCouponValue}>₹50 OFF</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.quickCouponChip}
                    activeOpacity={0.7}
                    onPress={() => {
                      applyCouponCode('GOLD100');
                      setCouponError('');
                    }}>
                    <Text style={styles.quickCouponCode}>GOLD100</Text>
                    <Text style={styles.quickCouponValue}>₹100 OFF (Orders &gt; ₹500)</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </>
          )}
        </View>

        {/* Bill Summary */}
        <View style={styles.card}>
          <Text style={styles.sectionHeading}>Bill Breakdown</Text>
          <View style={styles.billRow}>
            <Text style={styles.billLabel}>Item Total</Text>
            <Text style={styles.billValue}>₹{itemTotal}</Text>
          </View>
          <View style={styles.billRow}>
            <Text style={styles.billLabel}>Royal Festive Packaging</Text>
            <Text style={styles.billValue}>₹{packagingFee}</Text>
          </View>
          <View style={styles.billRow}>
            <Text style={styles.billLabel}>
              Delivery Fee {itemTotal >= 1000 ? '(Free over ₹1000)' : ''}
            </Text>
            <Text style={styles.billValue}>
              {deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}
            </Text>
          </View>
          {discount > 0 && (
            <View style={styles.billRow}>
              <Text style={[styles.billLabel, { color: Colors.light.pistachio, fontWeight: '700' }]}>
                Coupon Discount ({couponCode})
              </Text>
              <Text style={[styles.billValue, { color: Colors.light.pistachio, fontWeight: '700' }]}>
                -₹{discount}
              </Text>
            </View>
          )}
          <View style={styles.billRow}>
            <Text style={styles.billLabel}>Taxes & GST (5%)</Text>
            <Text style={styles.billValue}>₹{tax}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Grand Total</Text>
            <Text style={styles.totalValue}>₹{grandTotal}</Text>
          </View>
          <View style={styles.savingsTag}>
            <Ionicons name="sparkles" size={12} color="#065F46" />
            <Text style={styles.savingsText}>
              {discount > 0
                ? `You saved ₹${discount + (deliveryFee === 0 ? 80 : 0)} on this royal order!`
                : 'You saved ₹80 on delivery fee today!'}
            </Text>
          </View>
        </View>

        {/* Payment Methods */}
        <View style={styles.card}>
          <Text style={styles.sectionHeading}>Payment Options</Text>
          {[
            { id: 'UPI', label: 'UPI (Google Pay, PhonePe, Paytm)', icon: 'qr-code-outline' },
            { id: 'Card', label: 'Credit / Debit / ATM Card', icon: 'card-outline' },
            { id: 'COD', label: 'Pay on Delivery / Counter', icon: 'cash-outline' },
          ].map((pay) => {
            const isSelected = pay.id === selectedPayment;
            return (
              <TouchableOpacity
                key={pay.id}
                activeOpacity={0.8}
                style={[
                  styles.paymentRow,
                  isSelected && styles.paymentRowSelected,
                ]}
                onPress={() => setSelectedPayment(pay.id)}>
                <Ionicons
                  name={pay.icon as any}
                  size={18}
                  color={isSelected ? Colors.light.primary : Colors.light.textSecondary}
                />
                <Text
                  style={[
                    styles.paymentLabel,
                    isSelected && styles.paymentLabelSelected,
                  ]}>
                  {pay.label}
                </Text>
                <View
                  style={[
                    styles.radioOuter,
                    isSelected && styles.radioOuterSelected,
                  ]}>
                  {isSelected && <View style={styles.radioInner} />}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Sticky Bottom Bar */}
      {cart.length > 0 && (
        <View style={styles.bottomBar}>
          <View>
            <Text style={styles.bottomTotalLabel}>Total Payable</Text>
            <Text style={styles.bottomTotalValue}>₹{grandTotal}</Text>
          </View>

          <TouchableOpacity
            style={styles.placeOrderBtn}
            activeOpacity={0.85}
            onPress={handleCheckout}>
            <Text style={styles.placeOrderText}>Place Order & Pay</Text>
            <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      )}
      {/* Address & Payment Modals */}
      <AddressModal
        visible={showAddressModal}
        onClose={() => setShowAddressModal(false)}
        savedAddresses={savedAddresses}
        onSelectAddress={(addr) => {
          setDeliveryAddress(`${addr.houseNo}, ${addr.area}, ${addr.city}`);
        }}
        onAddAddress={addAddress}
      />

      <PaymentGatewayModal
        visible={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        amount={grandTotal}
        onSuccess={handlePaymentSuccess}
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
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: Colors.light.outlineVariant,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navTitleCenter: {
    alignItems: 'center',
  },
  navTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.light.text,
  },
  secureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  secureText: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.light.pistachio,
  },
  scrollContent: {
    padding: 16,
  },
  fulfillmentWrapper: {
    flexDirection: 'row',
    backgroundColor: Colors.light.backgroundElement,
    borderRadius: 24,
    padding: 3,
    marginBottom: 14,
  },
  fulfillmentTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  fulfillmentTabActive: {
    backgroundColor: Colors.light.primary,
    elevation: 2,
  },
  fulfillmentText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.light.textSecondary,
  },
  fulfillmentTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: Colors.light.outlineVariant,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconPin: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#FFE9DF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardHeaderTitle: {
    fontSize: 11,
    textTransform: 'uppercase',
    fontWeight: '700',
    color: Colors.light.textSecondary,
  },
  addressText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.light.text,
    marginTop: 1,
  },
  changeBtn: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.light.primary,
  },
  sectionHeading: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.light.text,
    marginBottom: 12,
  },
  emptyBox: {
    alignItems: 'center',
    paddingVertical: 24,
    gap: 8,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.light.textSecondary,
  },
  browseButton: {
    backgroundColor: Colors.light.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
    marginTop: 6,
  },
  browseBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
  },
  cartItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
  },
  itemDivider: {
    borderTopWidth: 1,
    borderTopColor: '#F3EFEA',
  },
  itemImage: {
    width: 54,
    height: 54,
    borderRadius: 10,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.light.text,
  },
  itemVariant: {
    fontSize: 11,
    color: Colors.light.textSecondary,
    marginTop: 2,
  },
  itemPrice: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.light.text,
    marginTop: 2,
  },
  stepperWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF2EB',
    borderWidth: 1,
    borderColor: Colors.light.primary,
    borderRadius: 8,
    paddingHorizontal: 4,
    paddingVertical: 2,
    gap: 6,
  },
  stepperBtn: {
    width: 22,
    height: 22,
    borderRadius: 5,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyValue: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.light.primary,
    minWidth: 14,
    textAlign: 'center',
  },
  deleteBtn: {
    padding: 6,
  },
  pillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  slotPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.backgroundElement,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 10,
    gap: 6,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  slotPillActive: {
    backgroundColor: '#FFF2EB',
    borderColor: Colors.light.saffron,
  },
  slotPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.light.textSecondary,
  },
  slotPillTextActive: {
    color: Colors.light.saffron,
    fontWeight: '700',
  },
  giftCheckRow: {
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
  giftTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.light.text,
  },
  giftSubtitle: {
    fontSize: 11,
    color: Colors.light.textSecondary,
    marginTop: 2,
    lineHeight: 15,
  },
  messageInput: {
    marginTop: 10,
    backgroundColor: '#FAF7F2',
    borderWidth: 1,
    borderColor: Colors.light.outlineVariant,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 12,
    color: Colors.light.text,
  },
  billRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  billLabel: {
    fontSize: 13,
    color: Colors.light.textSecondary,
  },
  billValue: {
    fontSize: 13,
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
    fontSize: 15,
    fontWeight: '800',
    color: Colors.light.text,
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '900',
    color: Colors.light.primary,
  },
  savingsTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
    marginTop: 10,
  },
  savingsText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#065F46',
  },
  paymentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.light.outlineVariant,
    marginBottom: 8,
    gap: 10,
  },
  paymentRowSelected: {
    backgroundColor: '#FFF2EB',
    borderColor: Colors.light.primary,
  },
  paymentLabel: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: Colors.light.text,
  },
  paymentLabelSelected: {
    fontWeight: '700',
    color: Colors.light.primary,
  },
  radioOuter: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: Colors.light.outline,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOuterSelected: {
    borderColor: Colors.light.primary,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.light.primary,
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
  bottomTotalLabel: {
    fontSize: 11,
    color: Colors.light.textSecondary,
    fontWeight: '600',
  },
  bottomTotalValue: {
    fontSize: 18,
    fontWeight: '900',
    color: Colors.light.text,
  },
  placeOrderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 14,
    gap: 8,
  },
  placeOrderText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  couponIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFF7ED',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionSubtitle: {
    fontSize: 11,
    color: Colors.light.textSecondary,
    marginTop: 1,
  },
  appliedCouponBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    borderRadius: 12,
    padding: 12,
    marginTop: 10,
  },
  couponTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  appliedCouponText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#065F46',
  },
  appliedCouponDesc: {
    fontSize: 11,
    color: '#047857',
    marginTop: 2,
  },
  removeCouponBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  removeCouponText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#DC2626',
  },
  couponInputRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },
  couponInput: {
    flex: 1,
    height: 44,
    backgroundColor: '#F7F4EE',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.light.outlineVariant,
    paddingHorizontal: 12,
    fontSize: 13,
    fontWeight: '700',
    color: Colors.light.text,
    letterSpacing: 1,
  },
  applyCouponBtn: {
    backgroundColor: Colors.light.primary,
    borderRadius: 10,
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  applyCouponBtnDisabled: {
    opacity: 0.5,
  },
  applyCouponBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  couponErrorText: {
    fontSize: 11,
    color: '#DC2626',
    fontWeight: '600',
    marginTop: 4,
  },
  quickCouponsContainer: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F0EBE1',
  },
  quickCouponsLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.light.outline,
    letterSpacing: 0.6,
    marginBottom: 6,
  },
  quickCouponChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  quickCouponChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FED7AA',
    borderStyle: 'dashed',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  quickCouponCode: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.light.primary,
    letterSpacing: 0.5,
  },
  quickCouponValue: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.light.textSecondary,
  },
});
