import React from 'react';
import { View, Text, StyleSheet, ImageBackground, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';

export default function FestiveHero({ onOrderPress }: { onOrderPress: () => void }) {
  return (
    <View style={styles.container}>
      <ImageBackground
        source={{
          uri: 'https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=1000&auto=format&fit=crop&q=80',
        }}
        style={styles.heroCard}
        imageStyle={styles.imageStyle}>
        <View style={styles.overlay}>
          {/* Badge */}
          <View style={styles.badgeRow}>
            <View style={styles.goldBadge}>
              <Ionicons name="sparkles" size={12} color="#855300" />
              <Text style={styles.goldBadgeText}>100% Pure Desi Ghee</Text>
            </View>
            <View style={styles.freshBadge}>
              <View style={styles.pulseDot} />
              <Text style={styles.freshBadgeText}>Kitchen Fresh</Text>
            </View>
          </View>

          {/* Titles */}
          <Text style={styles.heroSub}>FESTIVE DELIGHT</Text>
          <Text style={styles.heroTitle}>Artisanal Sweets Crafted Fresh Daily</Text>

          {/* CTA */}
          <TouchableOpacity style={styles.ctaButton} activeOpacity={0.85} onPress={onOrderPress}>
            <Text style={styles.ctaText}>Order Fresh Box</Text>
            <Ionicons name="arrow-forward" size={15} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  heroCard: {
    height: 180,
    borderRadius: 20,
    overflow: 'hidden',
    justifyContent: 'flex-end',
    elevation: 3,
    shadowColor: Colors.light.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
  },
  imageStyle: {
    borderRadius: 20,
  },
  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(28, 28, 25, 0.65)',
    padding: 16,
    justifyContent: 'center',
    borderRadius: 20,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  goldBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    gap: 4,
  },
  goldBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#855300',
    textTransform: 'uppercase',
  },
  freshBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    gap: 4,
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  freshBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#065F46',
  },
  heroSub: {
    fontSize: 11,
    color: '#FEA619',
    letterSpacing: 1.2,
    fontWeight: '700',
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: 2,
    marginBottom: 12,
    lineHeight: 24,
    maxWidth: 240,
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: Colors.light.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 6,
  },
  ctaText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});
