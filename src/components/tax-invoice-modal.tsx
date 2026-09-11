import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  Alert,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { OrderState } from '@/store/useStore';

interface TaxInvoiceModalProps {
  visible: boolean;
  onClose: () => void;
  order: OrderState | null;
}

export default function TaxInvoiceModal({
  visible,
  onClose,
  order,
}: TaxInvoiceModalProps) {
  if (!order) return null;

  const handleDownloadInvoice = () => {
    Alert.alert(
      'Tax Invoice Downloaded',
      `Official GST Tax Invoice for Order ${order.orderId} saved to your device.`,
      [{ text: 'OK' }]
    );
  };

  const handleSendReceiptSms = () => {
    const msg = `Gaurav Dairy Official Tax Invoice for Order ${order.orderId}: Total Paid ₹${order.grandTotal}. Token #${order.token}. FSSAI Lic #10021064000184.`;
    Linking.openURL(`sms:?body=${encodeURIComponent(msg)}`);
  };

  const cgst = Math.round(order.tax / 2);
  const sgst = order.tax - cgst;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.modalCard}>
          {/* Top Bar */}
          <View style={styles.topBar}>
            <View style={styles.headerTitleWrap}>
              <Text style={styles.invoiceTitle}>OFFICIAL TAX INVOICE</Text>
              <Text style={styles.invoiceSub}>Original for Recipient</Text>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <Ionicons name="close" size={20} color={Colors.light.text} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            {/* Store Information & Badges */}
            <View style={styles.storeHeader}>
              <Text style={styles.storeName}>Gaurav Dairy</Text>
              <Text style={styles.storeAddress}>
                Shop 12, Central Market, Sector 29, Gurugram, Haryana - 122009
              </Text>
              <View style={styles.complianceRow}>
                <Text style={styles.complianceBadge}>GSTIN: 07AAAAA0000A1Z5</Text>
                <Text style={styles.complianceBadge}>FSSAI Lic: 10021064000184</Text>
              </View>
            </View>

            <View style={styles.divider} />

            {/* Bill To & Invoice Meta */}
            <View style={styles.metaGrid}>
              <View style={styles.metaCol}>
                <Text style={styles.metaLabel}>Invoice No:</Text>
                <Text style={styles.metaVal}>{order.orderId}</Text>
                <Text style={styles.metaLabel}>Date & Time:</Text>
                <Text style={styles.metaVal}>{order.placedAt} • Today</Text>
              </View>
              <View style={styles.metaColRight}>
                <Text style={styles.metaLabel}>Pickup Token:</Text>
                <Text style={[styles.metaVal, { color: Colors.light.primary, fontSize: 16, fontWeight: '900' }]}>
                  TOKEN #{order.token}
                </Text>
                <Text style={styles.metaLabel}>Payment Mode:</Text>
                <Text style={styles.metaVal}>{order.paymentMethod}</Text>
              </View>
            </View>

            <View style={styles.divider} />

            {/* Line Items Table */}
            <Text style={styles.tableHeaderTitle}>Itemized Sweet Particulars</Text>
            <View style={styles.tableHead}>
              <Text style={[styles.thText, { flex: 2 }]}>Sweet & Weight</Text>
              <Text style={[styles.thText, { flex: 1, textAlign: 'center' }]}>Qty</Text>
              <Text style={[styles.thText, { flex: 1, textAlign: 'right' }]}>Amount</Text>
            </View>

            {order.items.map((item, idx) => (
              <View key={idx} style={styles.tableRow}>
                <View style={{ flex: 2 }}>
                  <Text style={styles.itemName}>{item.sweet.name}</Text>
                  <Text style={styles.itemVariant}>{item.variant.label}</Text>
                </View>
                <Text style={[styles.tdText, { flex: 1, textAlign: 'center' }]}>{item.quantity}</Text>
                <Text style={[styles.tdText, { flex: 1, textAlign: 'right', fontWeight: '700' }]}>
                  ₹{item.variant.price * item.quantity}
                </Text>
              </View>
            ))}

            <View style={styles.divider} />

            {/* Financial Summary & Taxes */}
            <View style={styles.summaryWrap}>
              <View style={styles.summaryRow}>
                <Text style={styles.sumLabel}>Item Subtotal</Text>
                <Text style={styles.sumVal}>₹{order.itemTotal}</Text>
              </View>
              {order.hasGiftWrap && (
                <View style={styles.summaryRow}>
                  <Text style={styles.sumLabel}>Royal Velvet Gift Packaging</Text>
                  <Text style={styles.sumVal}>₹{order.packagingFee}</Text>
                </View>
              )}
              {order.deliveryFee > 0 && (
                <View style={styles.summaryRow}>
                  <Text style={styles.sumLabel}>Delivery Charge</Text>
                  <Text style={styles.sumVal}>₹{order.deliveryFee}</Text>
                </View>
              )}
              {order.discount > 0 && (
                <View style={styles.summaryRow}>
                  <Text style={[styles.sumLabel, { color: '#059669', fontWeight: '700' }]}>Festive Coupon Discount</Text>
                  <Text style={[styles.sumVal, { color: '#059669', fontWeight: '700' }]}>-₹{order.discount}</Text>
                </View>
              )}
              <View style={styles.summaryRow}>
                <Text style={styles.sumLabel}>CGST (2.5%)</Text>
                <Text style={styles.sumVal}>₹{cgst}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.sumLabel}>SGST (2.5%)</Text>
                <Text style={styles.sumVal}>₹{sgst}</Text>
              </View>

              <View style={styles.thickDivider} />

              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Grand Total (Incl. Taxes)</Text>
                <Text style={styles.totalVal}>₹{order.grandTotal}</Text>
              </View>
            </View>

            {/* Declaration & Digital Verification Footnote */}
            <View style={styles.footnoteBox}>
              <Ionicons name="shield-checkmark-outline" size={14} color="#059669" />
              <Text style={styles.footnoteText}>
                Computer-generated Tax Invoice. No signature required under Rule 54 of CGST Rules 2017. 100% Verified Pure Desi Ghee.
              </Text>
            </View>
          </ScrollView>

          {/* Action Footer */}
          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={styles.downloadBtn}
              activeOpacity={0.8}
              onPress={handleDownloadInvoice}>
              <Ionicons name="download-outline" size={16} color="#FFFFFF" />
              <Text style={styles.downloadBtnText}>Save PDF</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.shareBtn}
              activeOpacity={0.8}
              onPress={handleSendReceiptSms}>
              <Ionicons name="send-outline" size={16} color={Colors.light.primary} />
              <Text style={styles.shareBtnText}>SMS Receipt</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
    padding: 16,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.outlineVariant,
  },
  headerTitleWrap: {
    gap: 2,
  },
  invoiceTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: Colors.light.text,
    letterSpacing: 0.5,
  },
  invoiceSub: {
    fontSize: 10,
    color: Colors.light.textSecondary,
    fontWeight: '600',
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3EFEA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingVertical: 14,
    gap: 10,
  },
  storeHeader: {
    alignItems: 'center',
    gap: 2,
  },
  storeName: {
    fontSize: 18,
    fontWeight: '900',
    color: Colors.light.primary,
  },
  storeAddress: {
    fontSize: 11,
    color: Colors.light.textSecondary,
    textAlign: 'center',
  },
  complianceRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 6,
  },
  complianceBadge: {
    fontSize: 9,
    fontWeight: '800',
    color: Colors.light.text,
    backgroundColor: '#FAF7F2',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Colors.light.outlineVariant,
  },
  divider: {
    height: 1,
    backgroundColor: '#F0EDE9',
    marginVertical: 4,
  },
  thickDivider: {
    height: 2,
    backgroundColor: Colors.light.primary,
    marginVertical: 6,
  },
  metaGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metaCol: {
    gap: 2,
  },
  metaColRight: {
    alignItems: 'flex-end',
    gap: 2,
  },
  metaLabel: {
    fontSize: 10,
    color: Colors.light.outline,
    fontWeight: '600',
  },
  metaVal: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.light.text,
  },
  tableHeaderTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.light.text,
    marginBottom: 4,
  },
  tableHead: {
    flexDirection: 'row',
    backgroundColor: '#FAF7F2',
    padding: 8,
    borderRadius: 6,
  },
  thText: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.light.textSecondary,
    textTransform: 'uppercase',
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3EFEA',
  },
  itemName: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.light.text,
  },
  itemVariant: {
    fontSize: 11,
    color: Colors.light.textSecondary,
  },
  tdText: {
    fontSize: 12,
    color: Colors.light.text,
  },
  summaryWrap: {
    gap: 4,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sumLabel: {
    fontSize: 12,
    color: Colors.light.textSecondary,
  },
  sumVal: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.light.text,
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
    fontSize: 17,
    fontWeight: '900',
    color: Colors.light.primary,
  },
  footnoteBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#ECFDF5',
    padding: 10,
    borderRadius: 8,
    marginTop: 6,
  },
  footnoteText: {
    fontSize: 10,
    color: '#065F46',
    flex: 1,
    lineHeight: 14,
  },
  modalFooter: {
    flexDirection: 'row',
    gap: 10,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.light.outlineVariant,
  },
  downloadBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.light.primary,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 6,
  },
  downloadBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  shareBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: Colors.light.primary,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 6,
  },
  shareBtnText: {
    color: Colors.light.primary,
    fontSize: 13,
    fontWeight: '800',
  },
});
