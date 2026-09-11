import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';

interface AdminPinModalProps {
  visible: boolean;
  onSuccess: () => void;
}

const CORRECT_PIN = '1984';

export default function AdminPinModal({ visible, onSuccess }: AdminPinModalProps) {
  const [pin, setPin] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleKeyPress = (num: string) => {
    if (pin.length < 4) {
      const nextPin = pin + num;
      setPin(nextPin);
      setErrorMsg('');

      if (nextPin.length === 4) {
        if (nextPin === CORRECT_PIN) {
          AsyncStorage.setItem('GBM_ADMIN_AUTH', 'true').catch(() => {});
          setPin('');
          onSuccess();
        } else {
          setErrorMsg('Invalid Staff Security PIN. Please try again.');
          setTimeout(() => setPin(''), 600);
        }
      }
    }
  };

  const handleDelete = () => {
    setPin((prev) => prev.slice(0, -1));
    setErrorMsg('');
  };

  return (
    <Modal visible={visible} animationType="fade" transparent={false}>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor="#FAF7F2" />
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.topRow}>
            <TouchableOpacity
              style={styles.backBtn}
              activeOpacity={0.7}
              onPress={() => router.replace('/')}>
              <Ionicons name="arrow-back" size={20} color={Colors.light.text} />
              <Text style={styles.backText}>Customer App</Text>
            </TouchableOpacity>
          </View>

          {/* Center Content */}
          <View style={styles.content}>
            <View style={styles.iconCircle}>
              <Ionicons name="shield-checkmark" size={36} color={Colors.light.primary} />
            </View>
            <Text style={styles.title}>Kitchen & Staff Access</Text>
            <Text style={styles.subtitle}>
              Enter 4-digit Store Manager Security PIN to unlock live kitchen operations
            </Text>

            {/* PIN Dots */}
            <View style={styles.dotsRow}>
              {[0, 1, 2, 3].map((idx) => {
                const filled = pin.length > idx;
                return (
                  <View
                    key={idx}
                    style={[styles.dot, filled && styles.dotFilled]}
                  />
                );
              })}
            </View>

            {errorMsg ? <Text style={styles.errorText}>{errorMsg}</Text> : null}
            <Text style={styles.hintText}>Default Master PIN: 1984</Text>

            {/* Keypad */}
            <View style={styles.keypad}>
              {[
                ['1', '2', '3'],
                ['4', '5', '6'],
                ['7', '8', '9'],
                ['', '0', 'delete'],
              ].map((row, rIdx) => (
                <View key={rIdx} style={styles.keyRow}>
                  {row.map((val, cIdx) => {
                    if (val === '') {
                      return <View key={cIdx} style={styles.keyEmpty} />;
                    }
                    if (val === 'delete') {
                      return (
                        <TouchableOpacity
                          key={cIdx}
                          style={styles.keyBtn}
                          activeOpacity={0.6}
                          onPress={handleDelete}>
                          <Ionicons name="backspace-outline" size={24} color={Colors.light.text} />
                        </TouchableOpacity>
                      );
                    }
                    return (
                      <TouchableOpacity
                        key={cIdx}
                        style={styles.keyBtn}
                        activeOpacity={0.6}
                        onPress={() => handleKeyPress(val)}>
                        <Text style={styles.keyText}>{val}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              ))}
            </View>
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FAF7F2',
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    padding: 8,
  },
  backText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.text,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    maxWidth: 360,
    alignSelf: 'center',
    width: '100%',
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#FFF0E0',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: '#FBD4B4',
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.light.text,
    marginBottom: 6,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 13,
    color: Colors.light.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 28,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  dot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#D4C3B3',
    backgroundColor: 'transparent',
  },
  dotFilled: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
  },
  errorText: {
    fontSize: 13,
    color: '#DC2626',
    fontWeight: '600',
    marginBottom: 10,
    textAlign: 'center',
  },
  hintText: {
    fontSize: 11,
    color: Colors.light.textSecondary,
    marginBottom: 24,
  },
  keypad: {
    width: '100%',
    gap: 12,
  },
  keyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  keyBtn: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#EFE7DE',
  },
  keyEmpty: {
    width: 72,
    height: 72,
  },
  keyText: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.light.text,
  },
});
