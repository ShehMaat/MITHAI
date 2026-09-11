import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { router } from 'expo-router';

export default function WelcomeScreen() {
  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom', 'left', 'right']}>
      <StatusBar barStyle="light-content" backgroundColor="#521B00" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        {/* Luxury Hero Banner */}
        <View style={styles.heroSection}>
          <Image
            source={require('@/assets/images/logo.png')}
            style={{ width: 150, height: 95, marginBottom: 12 }}
            resizeMode="contain"
          />
          <View style={styles.badgeContainer}>
            <Ionicons name="sparkles" size={14} color="#F59E0B" />
            <Text style={styles.badgeText}>PURE DAIRY & ARTISANAL MITHAI</Text>
          </View>

          <Text style={styles.heroTitle}>Gaurav Dairy</Text>
          <Text style={styles.heroSubtitle}>
            Pure Milk, Desi Ghee & Fresh Artisanal Delicacies Crafted Daily
          </Text>

          <View style={styles.heroImageWrapper}>
            <Image
              source={{
                uri: 'https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=1000&auto=format&fit=crop&q=80',
              }}
              style={styles.heroImage}
            />
            <View style={styles.heroOverlay} />
            <View style={styles.imageCaptionPill}>
              <Ionicons name="ribbon-outline" size={14} color="#FFFFFF" />
              <Text style={styles.imageCaptionText}>100% Certified Silver Vark & Pure Cashews</Text>
            </View>
          </View>
        </View>

        {/* Purity Guarantee Cards */}
        <View style={styles.puritySection}>
          <Text style={styles.sectionHeaderTitle}>Our Royal Purity Promise</Text>
          
          <View style={styles.purityGrid}>
            <View style={styles.purityCard}>
              <View style={styles.purityIconBox}>
                <Ionicons name="flame" size={20} color={Colors.light.saffron} />
              </View>
              <Text style={styles.purityCardTitle}>100% Desi Ghee</Text>
              <Text style={styles.purityCardDesc}>
                Hand-churned A2 bilona desi ghee with zero artificial hydrogenated fats.
              </Text>
            </View>

            <View style={styles.purityCard}>
              <View style={styles.purityIconBox}>
                <Ionicons name="time" size={20} color={Colors.light.goldAccent} />
              </View>
              <Text style={styles.purityCardTitle}>Fresh Daily Batches</Text>
              <Text style={styles.purityCardDesc}>
                Cooked fresh every morning in open kadhais by heirloom karigars.
              </Text>
            </View>

            <View style={styles.purityCard}>
              <View style={styles.purityIconBox}>
                <Ionicons name="gift" size={20} color={Colors.light.pistachio} />
              </View>
              <Text style={styles.purityCardTitle}>Festive Velvet Boxes</Text>
              <Text style={styles.purityCardDesc}>
                Hand-sealed gift hampers with custom foil cards & royal sealing wax.
              </Text>
            </View>
          </View>
        </View>

        {/* Popular Delicacies Showcase Preview */}
        <View style={styles.showcaseSection}>
          <Text style={styles.sectionHeaderTitle}>Signature Delicacies</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.showcaseScroll}>
            {[
              {
                name: 'Premium Kaju Katli',
                tag: '100% Goan Cashew',
                img: 'https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=600&auto=format&fit=crop&q=80',
              },
              {
                name: 'Motichoor Ladoo',
                tag: 'Saffron & Desi Ghee',
                img: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&auto=format&fit=crop&q=80',
              },
              {
                name: 'Angoori Gulab Jamun',
                tag: 'Warm Khoya Elixir',
                img: 'https://images.unsplash.com/photo-1596797038530-2c107229654b?w=600&auto=format&fit=crop&q=80',
              },
            ].map((del, i) => (
              <View key={i} style={styles.delicacyCard}>
                <Image source={{ uri: del.img }} style={styles.delicacyImg} />
                <View style={styles.delicacyInfo}>
                  <Text style={styles.delicacyName}>{del.name}</Text>
                  <Text style={styles.delicacyTag}>{del.tag}</Text>
                </View>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Connoisseur Club Banner */}
        <View style={styles.clubCard}>
          <View style={styles.clubLeft}>
            <View style={styles.clubBadge}>
              <Ionicons name="star" size={12} color="#855300" />
              <Text style={styles.clubBadgeText}>GOLD CLUB</Text>
            </View>
            <Text style={styles.clubTitle}>Join Royal Connoisseur Privilege</Text>
            <Text style={styles.clubDesc}>
              Earn 1 Mithai Point for every ₹1 spent. Unlock instant ₹100 welcome coupons on sign up.
            </Text>
          </View>
        </View>

        <View style={{ height: 110 }} />
      </ScrollView>

      {/* Docked Action Footer */}
      <View style={styles.footerContainer}>
        <TouchableOpacity
          style={styles.primaryAuthBtn}
          activeOpacity={0.85}
          onPress={() => router.push('/auth' as any)}>
          <Ionicons name="call" size={18} color="#FFFFFF" />
          <Text style={styles.primaryAuthBtnText}>Sign In / Register with Phone</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.guestBtn}
          activeOpacity={0.8}
          onPress={() => router.replace('/' as any)}>
          <Text style={styles.guestBtnText}>Explore Sweets as Guest</Text>
          <Ionicons name="arrow-forward" size={14} color={Colors.light.textSecondary} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#3E1400',
  },
  scrollContent: {
    backgroundColor: Colors.light.background,
  },
  heroSection: {
    backgroundColor: '#521B00',
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 30,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    alignItems: 'center',
  },
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(254, 166, 25, 0.15)',
    borderWidth: 1,
    borderColor: '#FEA619',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    marginBottom: 12,
  },
  badgeText: {
    color: '#FEA619',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  heroSubtitle: {
    fontSize: 13,
    color: '#FCD34D',
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 19,
    paddingHorizontal: 12,
  },
  heroImageWrapper: {
    width: '100%',
    height: 180,
    borderRadius: 18,
    marginTop: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
  },
  imageCaptionPill: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  imageCaptionText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  puritySection: {
    padding: 20,
  },
  sectionHeaderTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: Colors.light.text,
    marginBottom: 14,
  },
  purityGrid: {
    gap: 12,
  },
  purityCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.light.outlineVariant,
  },
  purityIconBox: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFF7ED',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  purityCardTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.light.text,
  },
  purityCardDesc: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    marginTop: 2,
    lineHeight: 17,
  },
  showcaseSection: {
    paddingBottom: 20,
  },
  showcaseScroll: {
    paddingHorizontal: 20,
    gap: 12,
  },
  delicacyCard: {
    width: 170,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.light.outlineVariant,
    overflow: 'hidden',
  },
  delicacyImg: {
    width: '100%',
    height: 100,
  },
  delicacyInfo: {
    padding: 10,
  },
  delicacyName: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.light.text,
  },
  delicacyTag: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.light.primary,
    marginTop: 2,
  },
  clubCard: {
    marginHorizontal: 20,
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FED7AA',
    borderRadius: 16,
    padding: 16,
  },
  clubLeft: {
    gap: 6,
  },
  clubBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEF3C7',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  clubBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#855300',
    letterSpacing: 0.5,
  },
  clubTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.light.text,
  },
  clubDesc: {
    fontSize: 11,
    color: Colors.light.textSecondary,
    lineHeight: 16,
  },
  footerContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: Colors.light.outlineVariant,
    gap: 8,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  primaryAuthBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.light.primary,
    paddingVertical: 14,
    borderRadius: 14,
    gap: 10,
  },
  primaryAuthBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  guestBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 6,
  },
  guestBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.light.textSecondary,
  },
});
