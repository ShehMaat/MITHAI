import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';

interface PickupQrModalProps {
  visible: boolean;
  orderId: string;
  token: string;
  onClose: () => void;
}

export default function PickupQrModal({
  visible,
  orderId,
  token,
  onClose,
}: PickupQrModalProps) {
  const handleCopyToken = () => {
    Alert.alert('Token Ready', `Token ${token} has been noted for Counter Handover.`);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View style={styles.backdrop}>
        <SafeAreaView style={styles.modalContainer}>
          <StatusBar barStyle="dark-content" />
          <View style={styles.card}>
            {/* Header */}
            <View style={styles.header}>
              <View>
                <Text style={styles.headerBadge}>STORE PICKUP PASS</Text>
                <Text style={styles.headerTitle}>Counter Verification QR</Text>
              </View>
              <TouchableOpacity
                style={styles.closeBtn}
                activeOpacity={0.7}
                onPress={onClose}>
                <Ionicons name="close" size={22} color={Colors.light.text} />
              </TouchableOpacity>
            </View>

            {/* Token Badge */}
            <View style={styles.tokenCard}>
              <Text style={styles.tokenLabel}>YOUR PICKUP TOKEN</Text>
              <Text style={styles.tokenValue}>{token}</Text>
              <Text style={styles.orderNumber}>Order {orderId}</Text>
            </View>

            {/* QR Code Container */}
            <View style={styles.qrContainer}>
              <View style={styles.qrFrame}>
                {/* SVG-like Simulated QR Matrix */}
                <View style={styles.qrMatrix}>
                  {/* Top-left marker */}
                  <View style={[styles.cornerMarker, styles.topLeft]}>
                    <View style={styles.markerInner} />
                  </View>
                  {/* Top-right marker */}
                  <View style={[styles.cornerMarker, styles.topRight]}>
                    <View style={styles.markerInner} />
                  </View>
                  {/* Bottom-left marker */}
                  <View style={[styles.cornerMarker, styles.bottomLeft]}>
                    <View style={styles.markerInner} />
                  </View>

                  {/* Matrix Dots */}
                  <View style={styles.dotsGrid}>
                    <View style={styles.dotCluster}>
                      <Ionicons name="qr-code" size={120} color="#1F160F" />
                    </View>
                  </View>
                </View>
              </View>
              <Text style={styles.qrScanText}>Scan at Boutique Counter</Text>
            </View>

            {/* Store Location */}
            <View style={styles.storeLocation}>
              <Ionicons name="location" size={18} color={Colors.light.primary} />
              <View style={{ flex: 1 }}>
                <Text style={styles.storeName}>Gaurav Dairy Boutique</Text>
                <Text style={styles.storeAddress}>
                  Counter 2, Central Market, Sector 29, Gurugram
                </Text>
              </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.actions}>
              <TouchableOpacity
                style={styles.copyBtn}
                activeOpacity={0.8}
                onPress={handleCopyToken}>
                <Ionicons name="copy-outline" size={18} color={Colors.light.primary} />
                <Text style={styles.copyBtnText}>Copy Token Number</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.doneBtn}
                activeOpacity={0.85}
                onPress={onClose}>
                <Text style={styles.doneBtnText}>Done</Text>
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#FAF7F2',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '90%',
  },
  card: {
    padding: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerBadge: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    color: Colors.light.primary,
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.light.text,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EFE7DE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tokenCard: {
    backgroundColor: '#FFF0E0',
    borderWidth: 1.5,
    borderColor: '#FBD4B4',
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  tokenLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    color: Colors.light.primary,
    marginBottom: 4,
  },
  tokenValue: {
    fontSize: 32,
    fontWeight: '900',
    color: '#8A2B0E',
    letterSpacing: 1.5,
  },
  orderNumber: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.light.textSecondary,
    marginTop: 2,
  },
  qrContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  qrFrame: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#EFE7DE',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  qrMatrix: {
    width: 170,
    height: 170,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cornerMarker: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderWidth: 3,
    borderColor: '#1F160F',
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerInner: {
    width: 14,
    height: 14,
    backgroundColor: '#1F160F',
    borderRadius: 3,
  },
  topLeft: {
    top: 4,
    left: 4,
  },
  topRight: {
    top: 4,
    right: 4,
  },
  bottomLeft: {
    bottom: 4,
    left: 4,
  },
  dotsGrid: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotCluster: {
    opacity: 0.95,
  },
  qrScanText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.light.textSecondary,
    marginTop: 10,
  },
  storeLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FFFFFF',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#EFE7DE',
    marginBottom: 20,
  },
  storeName: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.light.text,
  },
  storeAddress: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    marginTop: 2,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  copyBtn: {
    flex: 1,
    height: 50,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: Colors.light.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  copyBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.light.primary,
  },
  doneBtn: {
    flex: 1,
    height: 50,
    borderRadius: 14,
    backgroundColor: Colors.light.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  doneBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
