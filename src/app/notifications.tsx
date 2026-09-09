import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { router } from 'expo-router';

interface NotificationItem {
  id: string;
  category: 'order' | 'kitchen' | 'offer' | 'points';
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  actionText?: string;
  actionRoute?: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconBg: string;
  iconColor: string;
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    category: 'order',
    title: 'Order #GBM-84920 Packed & Ready',
    message: 'Your royal box of Kaju Katli & Motichoor Laddoos is hand-sealed with golden ribbon. Token #42 is active.',
    timestamp: '10 mins ago',
    isRead: false,
    actionText: 'View Live Token',
    actionRoute: '/order-tracking',
    icon: 'bag-check',
    iconBg: '#ECFDF5',
    iconColor: '#059669',
  },
  {
    id: 'notif-2',
    category: 'kitchen',
    title: 'Fresh Warm Batch from Kadhai',
    message: 'Authentic Desi Ghee Motichoor Laddoos just finished cooling. Soft, melt-in-mouth and fragrant with cardamom.',
    timestamp: '35 mins ago',
    isRead: false,
    actionText: 'Order Fresh Batch',
    actionRoute: '/product-detail?id=motichoor-ladoo',
    icon: 'flame',
    iconBg: '#FFF7ED',
    iconColor: '#EA580C',
  },
  {
    id: 'notif-3',
    category: 'offer',
    title: 'Royal Privilege Offer: ₹100 Off',
    message: 'Use promo code GOLD100 at checkout on handcrafted festive boxes above ₹500 today.',
    timestamp: '2 hours ago',
    isRead: false,
    actionText: 'Apply in Cart',
    actionRoute: '/cart',
    icon: 'sparkles',
    iconBg: '#FEF3C7',
    iconColor: '#D97706',
  },
  {
    id: 'notif-4',
    category: 'points',
    title: '45 Mithai Points Credited',
    message: 'Congratulations! You are now only 50 points away from unlocking Platinum Connoisseur perks.',
    timestamp: 'Yesterday',
    isRead: true,
    actionText: 'Check Loyalty Tier',
    actionRoute: '/profile',
    icon: 'star',
    iconBg: '#F3E8FF',
    iconColor: '#7E22CE',
  },
];

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [activeFilter, setActiveFilter] = useState<'all' | 'order' | 'kitchen' | 'offer'>('all');

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const markSingleAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const filteredList = notifications.filter((item) => {
    if (activeFilter === 'all') return true;
    return item.category === activeFilter;
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.light.background} />

      {/* Header */}
      <View style={styles.headerBar}>
        <TouchableOpacity
          style={styles.backButton}
          activeOpacity={0.7}
          onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color={Colors.light.text} />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Notifications & Alerts</Text>
          {unreadCount > 0 && (
            <View style={styles.unreadPill}>
              <Text style={styles.unreadPillText}>{unreadCount} New</Text>
            </View>
          )}
        </View>

        {unreadCount > 0 ? (
          <TouchableOpacity
            style={styles.markAllBtn}
            activeOpacity={0.7}
            onPress={markAllAsRead}>
            <Text style={styles.markAllText}>Mark Read</Text>
          </TouchableOpacity>
        ) : (
          <View style={{ width: 60 }} />
        )}
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterScrollWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterContainer}>
          {[
            { id: 'all', label: 'All Updates' },
            { id: 'order', label: 'Orders' },
            { id: 'kitchen', label: 'Kitchen Batches' },
            { id: 'offer', label: 'Festive Offers' },
          ].map((tab) => {
            const isSelected = activeFilter === tab.id;
            return (
              <TouchableOpacity
                key={tab.id}
                style={[styles.filterChip, isSelected && styles.filterChipActive]}
                activeOpacity={0.8}
                onPress={() => setActiveFilter(tab.id as any)}>
                <Text
                  style={[
                    styles.filterChipText,
                    isSelected && styles.filterChipTextActive,
                  ]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Notifications List */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {filteredList.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconCircle}>
              <Ionicons name="notifications-off-outline" size={32} color={Colors.light.outline} />
            </View>
            <Text style={styles.emptyTitle}>No Notifications Here</Text>
            <Text style={styles.emptySub}>
              You're completely caught up with fresh batches, royal offers, and order statuses.
            </Text>
          </View>
        ) : (
          filteredList.map((item) => (
            <TouchableOpacity
              key={item.id}
              activeOpacity={0.9}
              style={[
                styles.notifCard,
                !item.isRead && styles.notifCardUnread,
              ]}
              onPress={() => {
                markSingleAsRead(item.id);
                if (item.actionRoute) {
                  router.push(item.actionRoute as any);
                }
              }}>
              <View style={[styles.iconBox, { backgroundColor: item.iconBg }]}>
                <Ionicons name={item.icon} size={20} color={item.iconColor} />
              </View>

              <View style={styles.contentWrap}>
                <View style={styles.topMetaRow}>
                  <Text style={styles.itemTitle}>{item.title}</Text>
                  {!item.isRead && <View style={styles.unreadDot} />}
                </View>

                <Text style={styles.itemMessage}>{item.message}</Text>

                <View style={styles.bottomRow}>
                  <Text style={styles.timeText}>{item.timestamp}</Text>

                  {item.actionText && (
                    <TouchableOpacity
                      style={styles.actionBtn}
                      activeOpacity={0.8}
                      onPress={() => {
                        markSingleAsRead(item.id);
                        if (item.actionRoute) {
                          router.push(item.actionRoute as any);
                        }
                      }}>
                      <Text style={styles.actionBtnText}>{item.actionText}</Text>
                      <Ionicons name="arrow-forward" size={12} color={Colors.light.primary} />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  headerBar: {
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
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.light.text,
  },
  unreadPill: {
    backgroundColor: Colors.light.primary,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 10,
  },
  unreadPillText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  markAllBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  markAllText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.light.primary,
  },
  filterScrollWrapper: {
    backgroundColor: Colors.light.background,
    borderBottomWidth: 1,
    borderBottomColor: '#F0EBE1',
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: Colors.light.backgroundElement,
  },
  filterChipActive: {
    backgroundColor: Colors.light.primary,
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.light.textSecondary,
  },
  filterChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  scrollContent: {
    padding: 16,
    gap: 12,
  },
  notifCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.light.outlineVariant,
    gap: 12,
  },
  notifCardUnread: {
    backgroundColor: '#FFFDF9',
    borderColor: '#FED7AA',
    borderLeftWidth: 4,
    borderLeftColor: Colors.light.primary,
  },
  iconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentWrap: {
    flex: 1,
  },
  topMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.light.text,
    flex: 1,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.light.primary,
    marginLeft: 6,
  },
  itemMessage: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    lineHeight: 18,
    marginBottom: 8,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  timeText: {
    fontSize: 11,
    color: Colors.light.outline,
    fontWeight: '500',
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.light.primary,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 24,
    gap: 10,
  },
  emptyIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.light.backgroundElement,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.light.text,
  },
  emptySub: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
});
