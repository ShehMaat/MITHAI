import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  TextInput,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { useStore } from '@/store/useStore';
import { router } from 'expo-router';

export default function AuthScreen() {
  const { sendOtp, verifyOtp } = useStore();

  const [step, setStep] = useState<'phone' | 'otp'>('phone');
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
      setErrorMessage('Please enter the 4-digit verification code');
      return;
    }

    setLoading(true);
    setErrorMessage('');
    try {
      const clean = phone.replace(/[^0-9]/g, '').slice(-10);
      const verifiedUser = await verifyOtp(clean, otp, fullName.trim() || undefined);
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
        setErrorMessage('Invalid verification code. Try demo code 4920.');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Verification failed. Try demo code 4920.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom', 'left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.light.background} />

      {/* Top Bar */}
      <View style={styles.topNav}>
        {step === 'otp' ? (
          <TouchableOpacity
            style={styles.backButton}
            activeOpacity={0.7}
            onPress={() => setStep('phone')}>
            <Ionicons name="arrow-back" size={20} color={Colors.light.text} />
          </TouchableOpacity>
        ) : (
          <View style={{ width: 36 }} />
        )}

        <Text style={styles.navTitle}>
          {step === 'phone' ? 'Sign In / Register' : 'Verify Mobile OTP'}
        </Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <View style={styles.responsiveContainer}>
          {/* Brand Icon Header */}
          <View style={styles.brandHeader}>
            <View style={styles.brandIconCircle}>
              <Ionicons name="shield-checkmark" size={28} color={Colors.light.primary} />
            </View>
            <Text style={styles.brandTitle}>Gaurav Bhai Ki Mithai</Text>
            <Text style={styles.brandSubtitle}>
              {step === 'phone'
                ? 'Enter your 10-digit mobile number to receive a 4-digit verification code.'
                : `Verification code sent to +91 ${phone.replace(/[^0-9]/g, '').slice(-10)}`}
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
                  autoFocus
                />
              </View>

              {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

              <TouchableOpacity
                style={[styles.primaryBtn, (phone.replace(/[^0-9]/g, '').slice(-10).length < 10 || loading) && styles.primaryBtnDisabled]}
                disabled={phone.replace(/[^0-9]/g, '').slice(-10).length < 10 || loading}
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
              <TouchableOpacity
                style={styles.demoOtpNotice}
                activeOpacity={0.7}
                onPress={() => {
                  setOtp('4920');
                  setErrorMessage('');
                }}>
                <Ionicons name="key-outline" size={15} color={Colors.light.primary} />
                <Text style={styles.demoOtpNoticeText}>
                  Demo OTP Code: <Text style={{ fontWeight: '900' }}>4920</Text> (Tap to auto-fill)
                </Text>
              </TouchableOpacity>

              <Text style={styles.inputLabel}>Enter 4-Digit Verification Code</Text>
              <TextInput
                style={styles.otpInput}
                placeholder="• • • •"
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
        </View>
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
    fontSize: 16,
    fontWeight: '800',
    color: Colors.light.text,
  },
  scrollContent: {
    padding: 20,
    flexGrow: 1,
    justifyContent: 'center',
  },
  responsiveContainer: {
    maxWidth: 440,
    width: '100%',
    alignSelf: 'center',
  },
  brandHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  brandIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FFF2EB',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
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
    paddingHorizontal: 16,
  },
  formContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 22,
    borderWidth: 1,
    borderColor: Colors.light.outlineVariant,
    gap: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
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
    height: 50,
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
    height: 54,
    backgroundColor: '#FFF7ED',
    borderWidth: 1.5,
    borderColor: Colors.light.saffron,
    borderRadius: 12,
    paddingHorizontal: 14,
    fontSize: 24,
    fontWeight: '900',
    color: Colors.light.primary,
    letterSpacing: 12,
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
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FED7AA',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
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
    textAlign: 'center',
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.light.primary,
    paddingVertical: 15,
    borderRadius: 12,
    gap: 8,
    marginTop: 6,
  },
  primaryBtnDisabled: {
    opacity: 0.5,
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
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
    marginTop: 6,
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
