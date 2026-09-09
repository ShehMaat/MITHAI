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
  const [phone, setPhone] = useState('9876543210');
  const [otp, setOtp] = useState('');
  const [fullName, setFullName] = useState('Gaurav Jain');
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
    if (phone.replace(/[^0-9]/g, '').length < 10) {
      setErrorMessage('Please enter a valid 10-digit mobile number');
      return;
    }

    setLoading(true);
    setErrorMessage('');
    try {
      await sendOtp(phone);
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
      const success = await verifyOtp(phone, otp, fullName);
      if (success) {
        // Successfully logged in! Redirect to main home dashboard
        router.replace('/' as any);
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
                placeholder="98765 43210"
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
            <View style={styles.demoOtpNotice}>
              <Ionicons name="information-circle" size={16} color={Colors.light.primary} />
              <Text style={styles.demoOtpNoticeText}>
                Demo OTP Code: <Text style={{ fontWeight: '900' }}>4920</Text>
              </Text>
            </View>

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

            <Text style={styles.inputLabel}>Your Full Name (For Delivery & Rewards)</Text>
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
});
