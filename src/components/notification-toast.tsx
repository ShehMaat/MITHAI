import React, { useEffect, useRef } from 'react';
import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  SafeAreaView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Colors } from '@/constants/theme';
import { useStore } from '@/store/useStore';

export default function NotificationToast() {
  const { activeToast, dismissToast } = useStore();
  const translateY = useRef(new Animated.Value(-120)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (activeToast) {
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          bounciness: 8,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();

      const timer = setTimeout(() => {
        handleDismiss();
      }, 4500);

      return () => clearTimeout(timer);
    } else {
      handleDismiss();
    }
  }, [activeToast]);

  const handleDismiss = () => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -120,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      dismissToast();
    });
  };

  const handlePress = () => {
    handleDismiss();
    if (activeToast?.orderId) {
      router.push('/order-tracking');
    }
  };

  if (!activeToast) return null;

  const isSuccess = activeToast.type === 'success';
  const isWarning = activeToast.type === 'warning';

  const iconName = isSuccess
    ? 'checkmark-circle'
    : isWarning
    ? 'alert-circle'
    : 'notifications';

  const iconColor = isSuccess
    ? Colors.light.pistachio
    : isWarning
    ? Colors.light.goldAccent
    : Colors.light.primary;

  return (
    <SafeAreaView pointerEvents="box-none" style={styles.safeContainer}>
      <Animated.View
        style={[
          styles.container,
          {
            transform: [{ translateY }],
            opacity,
          },
        ]}
      >
        <TouchableOpacity
          activeOpacity={0.92}
          onPress={handlePress}
          style={styles.innerCard}
        >
          <View style={[styles.iconBox, { backgroundColor: `${iconColor}15` }]}>
            <Ionicons name={iconName} size={24} color={iconColor} />
          </View>

          <View style={styles.textContainer}>
            <View style={styles.headerRow}>
              <Text style={styles.title} numberOfLines={1}>
                {activeToast.title}
              </Text>
              {activeToast.orderId ? (
                <View style={styles.tokenPill}>
                  <Text style={styles.tokenText}>{activeToast.orderId}</Text>
                </View>
              ) : null}
            </View>
            <Text style={styles.message} numberOfLines={2}>
              {activeToast.message}
            </Text>
          </View>

          <TouchableOpacity
            onPress={handleDismiss}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            style={styles.closeBtn}
          >
            <Ionicons name="close" size={18} color="#8F7066" />
          </TouchableOpacity>
        </TouchableOpacity>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    position: 'absolute',
    top: Platform.OS === 'android' ? 36 : 12,
    left: 0,
    right: 0,
    zIndex: 999999,
    alignItems: 'center',
  },
  container: {
    width: '92%',
    maxWidth: 480,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.16,
    shadowRadius: 12,
    elevation: 10,
  },
  innerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1.5,
    borderColor: '#FEA61940',
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
    marginRight: 8,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.light.text,
    flex: 1,
  },
  tokenPill: {
    backgroundColor: '#FEA61920',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginLeft: 6,
  },
  tokenText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.light.primary,
  },
  message: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    lineHeight: 16,
  },
  closeBtn: {
    padding: 4,
    borderRadius: 12,
    backgroundColor: '#F0EDE9',
  },
});
