import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  TextInput,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { useStore } from '@/store/useStore';
import { router } from 'expo-router';

export default function AuthScreen() {
  const { sendOtp, verifyOtp } = useStore();

  const [step, setStep] = useState<'phone' | 'otp' | 'profile'>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [resendTimer, setResendTimer] = useState(30);

  useEffect(() => {
    let interval: any;
    if (step === 'otp' && resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [step, resendTimer]);

  const handleSendOtp = async () => {
    const clean = phone.replace(/[^0-9]/g, '').slice(-10);
    if (clean.length < 10) {
      setErrorMessage('Please enter a valid 10-digit mobile number');
      return;
    }

    setLoading(true);
    setErrorMessage('');
    try {
      await sendOtp(clean);
      setStep('otp');
      setResendTimer(30);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.length < 4) {
      setErrorMessage('Please enter the 4-digit OTP code');
      return;
    }

    setLoading(true);
    setErrorMessage('');
    try {
      const clean = phone.replace(/[^0-9]/g, '').slice(-10);
      const verifiedUser = await verifyOtp(clean, otp, fullName);
      if (verifiedUser) {
        // Automatic Role-Based Routing
        if (verifiedUser.role === 'admin') {
          router.replace('/admin' as any);
        } else if (verifiedUser.role === 'rider') {
          router.replace('/rider' as any);
        } else {
          router.replace('/' as any);
        }
      } else {
        setErrorMessage('Invalid OTP code. Try demo code 4920.');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Verification failed. Try demo code 4920.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.light.background} />

      {/* Top Bar */}
      <View style={styles.topNav}>
        <TouchableOpacity
          style={styles.backButton}
          activeOpacity={0.7}
          onPress={() => {
            if (step === 'otp') setStep('phone');
            else router.back();
          }}>
          <Ionicons name="arrow-back" size={20} color={Colors.light.text} />
        </TouchableOpacity>

        <Text style={styles.navTitle}>
          {step === 'phone' ? 'Sign In / Register' : 'Verify Mobile OTP'}
        </Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled">
        {/* Brand Icon Header */}
        <View style={styles.brandHeader}>
          <View style={styles.brandIconCircle}>
            <Ionicons name="shield-checkmark" size={28} color={Colors.light.primary} />
          </View>
          <Text style={styles.brandTitle}>Gaurav Bhai Ki Mithai</Text>
          <Text style={styles.brandSubtitle}>
            {step === 'phone'
              ? 'Enter your 10-digit mobile number to receive a 4-digit verification code.'
              : `Verification code sent to +91 ${phone}`}
          </Text>
        </View>

        {step === 'phone' ? (
          /* Step 1: Mobile Phone Number */
          <View style={styles.formContainer}>
            <Text style={styles.inputLabel}>Mobile Phone Number</Text>
            <View style={styles.phoneInputRow}>
              <View style={styles.countryCodeBox}>
                <Text style={styles.countryCodeText}>🇮🇳 +91</Text>
              </View>
              <TextInput
                style={styles.phoneInput}
                placeholder="Enter 10-digit number"
                placeholderTextColor={Colors.light.outline}
                keyboardType="number-pad"
                maxLength={10}
                value={phone}
                onChangeText={(val) => {
                  setPhone(val);
                  setErrorMessage('');
                }}
              />
            </View>

            {/* Quick Testing Presets */}
            <View style={styles.rolePresetsContainer}>
              <Text style={styles.rolePresetsLabel}>ROLE ACCESS PRESETS</Text>
              <View style={styles.roleChipsRow}>
                <TouchableOpacity
                  style={[
                    styles.roleChip,
                    phone === '6262750616' && styles.roleChipActive,
                  ]}
                  activeOpacity={0.7}
                  onPress={() => {
                    setPhone('6262750616');
                    setFullName('Store Manager (Admin)');
                    setErrorMessage('');
                  }}>
                  <Text style={styles.roleChipText}>👑 Admin (6262750616)</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.roleChip,
                    phone === '9993393853' && styles.roleChipActive,
                  ]}
                  activeOpacity={0.7}
                  onPress={() => {
                    setPhone('9993393853');
                    setFullName('Delivery Partner');
                    setErrorMessage('');
                  }}>
                  <Text style={styles.roleChipText}>🛵 Rider (9993393853)</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.roleChip,
                    phone === '9876543210' && styles.roleChipActive,
                  ]}
                  activeOpacity={0.7}
                  onPress={() => {
                    setPhone('9876543210');
                    setFullName('Gaurav Jain');
                    setErrorMessage('');
                  }}>
                  <Text style={styles.roleChipText}>🛍️ Customer</Text>
                </TouchableOpacity>
              </View>
            </View>

            {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

            <TouchableOpacity
              style={[styles.primaryBtn, loading && styles.primaryBtnDisabled]}
              disabled={loading}
              activeOpacity={0.85}
              onPress={handleSendOtp}>
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <Text style={styles.primaryBtnText}>Get Verification Code</Text>
                  <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
                </>
              )}
            </TouchableOpacity>

            <View style={styles.privacyNote}>
              <Ionicons name="lock-closed-outline" size={12} color={Colors.light.outline} />
              <Text style={styles.privacyText}>
                Your details are 100% safe. We never spam.
              </Text>
            </View>
          </View>
        ) : (
          /* Step 2: 4-Digit OTP Code */
          <View style={styles.formContainer}>
            {/* Dynamic Role Destination Badge */}
            {phone.replace(/[^0-9]/g, '').slice(-10) === '6262750616' ? (
              <View style={[styles.roleDestinationBanner, { backgroundColor: '#FEF3C7', borderColor: '#F59E0B' }]}>
                <Ionicons name="shield-checkmark" size={16} color="#D97706" />
                <Text style={[styles.roleDestinationText, { color: '#92400E' }]}>
                  ADMIN ACCOUNT • Auto-routes to Kitchen & Store Dashboard (/admin)
                </Text>
              </View>
            ) : phone.replace(/[^0-9]/g, '').slice(-10) === '9993393853' ? (
              <View style={[styles.roleDestinationBanner, { backgroundColor: '#E0F2FE', borderColor: '#38BDF8' }]}>
                <Ionicons name="bicycle" size={16} color="#0284C7" />
                <Text style={[styles.roleDestinationText, { color: '#0369A1' }]}>
                  FLEET PARTNER • Auto-routes to Delivery Partner Portal (/rider)
                </Text>
              </View>
            ) : (
              <View style={[styles.roleDestinationBanner, { backgroundColor: '#ECFDF5', borderColor: '#34D399' }]}>
                <Ionicons name="sparkles" size={16} color="#059669" />
                <Text style={[styles.roleDestinationText, { color: '#065F46' }]}>
                  CUSTOMER ACCOUNT • Auto-routes to Artisanal Mithai Catalog (/)
                </Text>
              </View>
            )}

            <TouchableOpacity
              style={styles.demoOtpNotice}
              activeOpacity={0.7}
              onPress={() => {
                setOtp('4920');
                setErrorMessage('');
              }}>
              <Ionicons name="sparkles" size={16} color={Colors.light.primary} />
              <Text style={styles.demoOtpNoticeText}>
                Demo Master OTP: <Text style={{ fontWeight: '900' }}>4920</Text> (Tap to Auto-fill)
              </Text>
            </TouchableOpacity>

            <Text style={styles.inputLabel}>Enter 4-Digit Verification Code</Text>
            <TextInput
              style={styles.otpInput}
              placeholder="4 9 2 0"
              placeholderTextColor={Colors.light.outline}
              keyboardType="number-pad"
              maxLength={4}
              value={otp}
              onChangeText={(val) => {
                setOtp(val);
                setErrorMessage('');
              }}
              autoFocus
            />

            <Text style={styles.inputLabel}>Your Name (Optional)</Text>
            <TextInput
              style={styles.nameInput}
              placeholder="e.g. Gaurav Jain"
              placeholderTextColor={Colors.light.outline}
              value={fullName}
              onChangeText={setFullName}
            />

            {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

            <TouchableOpacity
              style={[
                styles.primaryBtn,
                (otp.length < 4 || loading) && styles.primaryBtnDisabled,
              ]}
              disabled={otp.length < 4 || loading}
              activeOpacity={0.85}
              onPress={handleVerifyOtp}>
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <Text style={styles.primaryBtnText}>Verify & Continue</Text>
                  <Ionicons name="checkmark-circle" size={18} color="#FFFFFF" />
                </>
              )}
            </TouchableOpacity>

            <View style={styles.resendRow}>
              {resendTimer > 0 ? (
                <Text style={styles.resendTimerText}>
                  Resend code in <Text style={{ fontWeight: '700' }}>{resendTimer}s</Text>
                </Text>
              ) : (
                <TouchableOpacity
                  onPress={() => {
                    handleSendOtp();
                    setResendTimer(30);
                  }}>
                  <Text style={styles.resendLinkText}>Resend Verification Code</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
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
  navTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.light.text,
  },
  scrollContent: {
    padding: 20,
  },
  brandHeader: {
    alignItems: 'center',
    marginVertical: 20,
  },
  brandIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FFF2EB',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#FED7AA',
  },
  brandTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: Colors.light.text,
  },
  brandSubtitle: {
    fontSize: 13,
    color: Colors.light.textSecondary,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
    paddingHorizontal: 20,
  },
  formContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.light.outlineVariant,
    gap: 12,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.light.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  phoneInputRow: {
    flexDirection: 'row',
    gap: 8,
  },
  countryCodeBox: {
    backgroundColor: '#FAF7F2',
    borderWidth: 1,
    borderColor: Colors.light.outlineVariant,
    borderRadius: 12,
    paddingHorizontal: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  countryCodeText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.light.text,
  },
  phoneInput: {
    flex: 1,
    height: 48,
    backgroundColor: '#FAF7F2',
    borderWidth: 1,
    borderColor: Colors.light.outlineVariant,
    borderRadius: 12,
    paddingHorizontal: 14,
    fontSize: 16,
    fontWeight: '700',
    color: Colors.light.text,
    letterSpacing: 1,
  },
  otpInput: {
    height: 52,
    backgroundColor: '#FFF7ED',
    borderWidth: 1.5,
    borderColor: Colors.light.saffron,
    borderRadius: 12,
    paddingHorizontal: 14,
    fontSize: 22,
    fontWeight: '900',
    color: Colors.light.primary,
    letterSpacing: 8,
    textAlign: 'center',
  },
  nameInput: {
    height: 48,
    backgroundColor: '#FAF7F2',
    borderWidth: 1,
    borderColor: Colors.light.outlineVariant,
    borderRadius: 12,
    paddingHorizontal: 14,
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.text,
  },
  demoOtpNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FED7AA',
    borderRadius: 10,
    padding: 10,
    marginBottom: 4,
  },
  demoOtpNoticeText: {
    fontSize: 12,
    color: Colors.light.primary,
    fontWeight: '600',
  },
  errorText: {
    fontSize: 12,
    color: '#DC2626',
    fontWeight: '600',
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.light.primary,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
    marginTop: 6,
  },
  primaryBtnDisabled: {
    opacity: 0.5,
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  privacyNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 4,
  },
  privacyText: {
    fontSize: 11,
    color: Colors.light.outline,
  },
  resendRow: {
    alignItems: 'center',
    marginTop: 8,
  },
  resendTimerText: {
    fontSize: 12,
    color: Colors.light.textSecondary,
  },
  resendLinkText: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.light.primary,
  },
  rolePresetsContainer: {
    marginTop: 10,
    marginBottom: 6,
  },
  rolePresetsLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.light.textSecondary,
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  roleChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  roleChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#F3EDE4',
    borderWidth: 1,
    borderColor: '#E7DFD4',
  },
  roleChipActive: {
    backgroundColor: '#FFF0E5',
    borderColor: Colors.light.primary,
  },
  roleChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.light.text,
  },
  roleDestinationBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
  },
  roleDestinationText: {
    flex: 1,
    fontSize: 11,
    fontWeight: '700',
    lineHeight: 15,
  },
});
