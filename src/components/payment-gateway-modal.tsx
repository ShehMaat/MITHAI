import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface PaymentGatewayModalProps {
  visible: boolean;
  onClose: () => void;
  amount: number;
  onSuccess: (paymentDetails: { paymentId: string; method: string }) => void;
}

export const PaymentGatewayModal: React.FC<PaymentGatewayModalProps> = ({
  visible,
  onClose,
  amount,
  onSuccess,
}) => {
  const [selectedMethod, setSelectedMethod] = useState<'upi' | 'card' | 'cod'>('upi');
  const [upiId, setUpiId] = useState('');
  const [cardNo, setCardNo] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [step, setStep] = useState<'select' | 'otp' | 'processing' | 'success'>('select');
  const [otp, setOtp] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePay = () => {
    if (selectedMethod === 'cod') {
      triggerSuccess('COD');
      return;
    }

    if (selectedMethod === 'card') {
      setStep('otp');
      return;
    }

    // UPI Direct Intent
    setIsProcessing(true);
    setStep('processing');
    setTimeout(() => {
      triggerSuccess('UPI');
    }, 2000);
  };

  const handleVerifyOtp = () => {
    setIsProcessing(true);
    setStep('processing');
    setTimeout(() => {
      triggerSuccess('CARD');
    }, 2000);
  };

  const triggerSuccess = (method: string) => {
    setIsProcessing(false);
    setStep('success');
    const paymentId = `pay_${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
    setTimeout(() => {
      onSuccess({ paymentId, method });
      setStep('select');
    }, 1500);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerBrandRow}>
              <Ionicons name="shield-checkmark" size={24} color="#10B981" />
              <View>
                <Text style={styles.headerBrand}>Gaurav Dairy Secure Pay</Text>
                <Text style={styles.headerSub}>256-bit Encrypted Checkout</Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={20} color="#64748B" />
            </TouchableOpacity>
          </View>

          {/* Amount Badge */}
          <View style={styles.amountBanner}>
            <Text style={styles.amountLabel}>Total Payable Amount</Text>
            <Text style={styles.amountValue}>₹{amount.toLocaleString('en-IN')}</Text>
          </View>

          {step === 'select' && (
            <View style={styles.body}>
              <Text style={styles.sectionTitle}>Select Payment Method</Text>

              {/* UPI Option */}
              <TouchableOpacity
                style={[styles.methodCard, selectedMethod === 'upi' && styles.methodCardSelected]}
                onPress={() => setSelectedMethod('upi')}
              >
                <View style={styles.methodIconWrapper}>
                  <Ionicons name="phone-portrait-outline" size={22} color="#A43700" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.methodTitle}>GPay / PhonePe / Paytm / UPI</Text>
                  <Text style={styles.methodSub}>Instant checkout with 1-tap app approval</Text>
                </View>
                <View style={[styles.radio, selectedMethod === 'upi' && styles.radioSelected]} />
              </TouchableOpacity>

              {selectedMethod === 'upi' && (
                <View style={styles.methodInputBox}>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter UPI ID (e.g. mobile@upi)"
                    placeholderTextColor="#94A3B8"
                    value={upiId}
                    onChangeText={setUpiId}
                  />
                  <Text style={styles.helperText}>Or select your installed UPI app at next prompt</Text>
                </View>
              )}

              {/* Credit / Debit Card Option */}
              <TouchableOpacity
                style={[styles.methodCard, selectedMethod === 'card' && styles.methodCardSelected]}
                onPress={() => setSelectedMethod('card')}
              >
                <View style={styles.methodIconWrapper}>
                  <Ionicons name="card-outline" size={22} color="#A43700" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.methodTitle}>Credit / Debit Card</Text>
                  <Text style={styles.methodSub}>Visa, Mastercard, RuPay, Amex</Text>
                </View>
                <View style={[styles.radio, selectedMethod === 'card' && styles.radioSelected]} />
              </TouchableOpacity>

              {selectedMethod === 'card' && (
                <View style={styles.methodInputBox}>
                  <TextInput
                    style={styles.input}
                    placeholder="Card Number (16 digits)"
                    placeholderTextColor="#94A3B8"
                    keyboardType="number-pad"
                    maxLength={16}
                    value={cardNo}
                    onChangeText={setCardNo}
                  />
                  <View style={styles.row}>
                    <TextInput
                      style={[styles.input, { flex: 1, marginRight: 8 }]}
                      placeholder="MM / YY"
                      placeholderTextColor="#94A3B8"
                      maxLength={5}
                      value={expiry}
                      onChangeText={setExpiry}
                    />
                    <TextInput
                      style={[styles.input, { flex: 1 }]}
                      placeholder="CVV"
                      placeholderTextColor="#94A3B8"
                      keyboardType="number-pad"
                      secureTextEntry
                      maxLength={3}
                      value={cvv}
                      onChangeText={setCvv}
                    />
                  </View>
                </View>
              )}

              {/* Cash On Delivery Option */}
              <TouchableOpacity
                style={[styles.methodCard, selectedMethod === 'cod' && styles.methodCardSelected]}
                onPress={() => setSelectedMethod('cod')}
              >
                <View style={styles.methodIconWrapper}>
                  <Ionicons name="lock-closed-outline" size={22} color="#A43700" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.methodTitle}>Cash on Delivery (COD)</Text>
                  <Text style={styles.methodSub}>Pay cash or QR at your doorstep</Text>
                </View>
                <View style={[styles.radio, selectedMethod === 'cod' && styles.radioSelected]} />
              </TouchableOpacity>

              <TouchableOpacity style={styles.payBtn} onPress={handlePay}>
                <Text style={styles.payBtnText}>
                  {selectedMethod === 'cod' ? 'Confirm COD Order' : `Pay ₹${amount.toLocaleString('en-IN')}`}
                </Text>
                <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          )}

          {step === 'otp' && (
            <View style={styles.bodyCenter}>
              <Ionicons name="shield-checkmark" size={48} color="#A43700" />
              <Text style={styles.otpTitle}>Bank OTP Verification</Text>
              <Text style={styles.otpSub}>Enter the 6-digit OTP sent to your registered mobile number ending in **89</Text>

              <TextInput
                style={styles.otpInput}
                placeholder="1 2 3 4 5 6"
                placeholderTextColor="#94A3B8"
                keyboardType="number-pad"
                maxLength={6}
                value={otp}
                onChangeText={setOtp}
              />

              <TouchableOpacity
                style={[styles.payBtn, { width: '100%', marginTop: 20 }, otp.length !== 6 && { opacity: 0.5 }]}
                disabled={otp.length !== 6}
                onPress={handleVerifyOtp}
              >
                <Text style={styles.payBtnText}>Submit & Pay ₹{amount.toLocaleString('en-IN')}</Text>
              </TouchableOpacity>
            </View>
          )}

          {step === 'processing' && (
            <View style={styles.bodyCenter}>
              <ActivityIndicator size="large" color="#A43700" />
              <Text style={styles.processingText}>Processing Payment securely with Bank Gateway...</Text>
              <Text style={styles.processingSub}>Please do not close or refresh this screen</Text>
            </View>
          )}

          {step === 'success' && (
            <View style={styles.bodyCenter}>
              <Ionicons name="checkmark-circle" size={56} color="#10B981" />
              <Text style={styles.successTitle}>Payment Successful!</Text>
              <Text style={styles.successSub}>Your royal sweets order is confirmed.</Text>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 24,
    minHeight: 480,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerBrandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerBrand: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
  },
  headerSub: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '600',
  },
  closeBtn: {
    padding: 6,
    borderRadius: 20,
    backgroundColor: '#F8FAFC',
  },
  amountBanner: {
    backgroundColor: '#FCF9F4',
    paddingHorizontal: 20,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F1E8DB',
  },
  amountLabel: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '600',
  },
  amountValue: {
    fontSize: 22,
    fontWeight: '800',
    color: '#A43700',
    fontFamily: 'PlayfairDisplay_700Bold',
  },
  body: {
    paddingHorizontal: 20,
    paddingTop: 16,
    gap: 12,
  },
  bodyCenter: {
    paddingHorizontal: 24,
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  methodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    padding: 14,
    backgroundColor: '#FFFFFF',
  },
  methodCardSelected: {
    borderColor: '#A43700',
    backgroundColor: '#FFF5EB',
  },
  methodIconWrapper: {
    width: 42,
    height: 42,
    borderRadius: 10,
    backgroundColor: '#FCF9F4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  methodTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
  },
  methodSub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#CBD5E1',
  },
  radioSelected: {
    borderColor: '#A43700',
    borderWidth: 6,
  },
  methodInputBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    gap: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: '#1E293B',
  },
  row: {
    flexDirection: 'row',
  },
  helperText: {
    fontSize: 11,
    color: '#64748B',
    fontStyle: 'italic',
  },
  payBtn: {
    backgroundColor: '#A43700',
    borderRadius: 14,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginTop: 10,
  },
  payBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  otpTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
    marginTop: 16,
  },
  otpSub: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 20,
  },
  otpInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 2,
    borderColor: '#A43700',
    borderRadius: 14,
    paddingHorizontal: 20,
    paddingVertical: 14,
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: 8,
    textAlign: 'center',
    width: 220,
    color: '#1E293B',
  },
  processingText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
    marginTop: 20,
    textAlign: 'center',
  },
  processingSub: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 6,
  },
  successTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#10B981',
    marginTop: 16,
  },
  successSub: {
    fontSize: 14,
    color: '#475569',
    marginTop: 6,
  },
});
