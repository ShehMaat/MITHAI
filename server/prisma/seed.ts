import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const CATEGORIES = [
  'All Sweets',
  'Pure Desi Ghee',
  'Kaju & Dry Fruit',
  'Bengali Specials',
  'Khoya Delights',
  'Sugar-Free',
  'Savories & Namkeen',
];

const SWEETS = [
  {
    id: 'kaju-katli',
    name: 'Premium Kaju Katli',
    tagline: 'Pure Goan Kaju & Authentic Silver Vark',
    description: 'Melt-in-mouth diamond cut diamond mithai made from 100% premium grade Goan cashews and purified silver leaf. Zero artificial flavors.',
    category: 'Kaju & Dry Fruit',
    imageUrl: 'https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=800&auto=format&fit=crop&q=80',
    rating: 4.9,
    reviewsCount: 1240,
    badge: 'Bestseller',
    pureGhee: true,
    shelfLife: '15 Days at Room Temp',
    freshBatchMinsAgo: 15,
    variants: [
      { id: 'kaju-katli-250g', label: '250g', price: 280, weightInGrams: 250 },
      { id: 'kaju-katli-500g', label: '500g', price: 540, weightInGrams: 500 },
      { id: 'kaju-katli-1kg', label: '1kg', price: 1050, weightInGrams: 1000 },
    ],
  },
  {
    id: 'motichoor-ladoo',
    name: 'Desi Ghee Motichoor Ladoo',
    tagline: 'Fine Boondi with Pure Desi Ghee & Saffron',
    description: 'Traditional pearl-sized gram flour boondi simmered in fragrant saffron syrup and bound in hand-churned desi ghee with melon seeds.',
    category: 'Pure Desi Ghee',
    imageUrl: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800&auto=format&fit=crop&q=80',
    rating: 4.8,
    reviewsCount: 890,
    badge: 'Festive Favorite',
    pureGhee: true,
    shelfLife: '7 Days',
    freshBatchMinsAgo: 25,
    variants: [
      { id: 'motichoor-500g', label: '500g', price: 320, weightInGrams: 500 },
      { id: 'motichoor-1kg', label: '1kg', price: 620, weightInGrams: 1000 },
    ],
  },
  {
    id: 'sponge-rasgulla',
    name: 'Classic Sponge Rasgulla',
    tagline: 'Fresh Chhena Cooked in Light Rose Syrup',
    description: 'Ultra-spongy, juicy chhena dumplings prepared daily with cow milk and dipped in delicate rose-scented light cardamom syrup.',
    category: 'Bengali Specials',
    imageUrl: 'https://images.unsplash.com/photo-1627834377411-8da5f4f09de8?w=800&auto=format&fit=crop&q=80',
    rating: 4.9,
    reviewsCount: 920,
    badge: 'Chilled Fresh',
    pureGhee: false,
    shelfLife: '3 Days (Keep Refrigerated)',
    freshBatchMinsAgo: 10,
    variants: [
      { id: 'rasgulla-p6', label: 'Pack of 6', price: 180, weightInGrams: 300 },
      { id: 'rasgulla-p12', label: 'Pack of 12', price: 340, weightInGrams: 600 },
    ],
  },
  {
    id: 'gulab-jamun',
    name: 'Shahi Angoori Gulab Jamun',
    tagline: 'Soft Mawa Balls in Saffron & Cardamom Chashni',
    description: 'Golden fried fresh mawa dumplings soaked slowly in warm, saffron-infused syrup. Served warm with crushed pistachios.',
    category: 'Pure Desi Ghee',
    imageUrl: 'https://images.unsplash.com/photo-1541832676-9b763b0239ab?w=800&auto=format&fit=crop&q=80',
    rating: 4.9,
    reviewsCount: 1520,
    badge: 'Chef Special',
    pureGhee: true,
    shelfLife: '5 Days',
    freshBatchMinsAgo: 30,
    variants: [
      { id: 'gulab-jamun-500g', label: '500g', price: 290, weightInGrams: 500 },
      { id: 'gulab-jamun-1kg', label: '1kg', price: 560, weightInGrams: 1000 },
    ],
  },
  {
    id: 'kaju-pista-roll',
    name: 'Kaju Pista Roll',
    tagline: 'Layered Cashew Dough with Pistachio Core',
    description: 'Rich pistachio filling encased in smooth cashew fondant and finished with edible silver leaf.',
    category: 'Kaju & Dry Fruit',
    imageUrl: 'https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=800&auto=format&fit=crop&q=80',
    rating: 4.8,
    reviewsCount: 640,
    badge: null,
    pureGhee: false,
    shelfLife: '15 Days',
    freshBatchMinsAgo: 45,
    variants: [
      { id: 'kaju-roll-250g', label: '250g', price: 340, weightInGrams: 250 },
      { id: 'kaju-roll-500g', label: '500g', price: 650, weightInGrams: 500 },
    ],
  },
  {
    id: 'mathura-peda',
    name: 'Mathura Ke Shahi Peda',
    tagline: 'Slow Caramelized Khoya with Nutmeg & Cardamom',
    description: 'Authentic Braj-style caramelized pedas made from continuous slow reduction of full cream milk with boora sugar.',
    category: 'Khoya Delights',
    imageUrl: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800&auto=format&fit=crop&q=80',
    rating: 4.7,
    reviewsCount: 480,
    badge: null,
    pureGhee: true,
    shelfLife: '20 Days',
    freshBatchMinsAgo: 60,
    variants: [
      { id: 'mathura-peda-250g', label: '250g', price: 220, weightInGrams: 250 },
      { id: 'mathura-peda-500g', label: '500g', price: 420, weightInGrams: 500 },
    ],
  },
];

const COUPONS = [
  {
    code: 'FESTIVE50',
    discountAmount: 50,
    minOrderValue: 499,
    description: 'Flat ₹50 OFF on orders above ₹499',
  },
  {
    code: 'MITHAI100',
    discountAmount: 100,
    minOrderValue: 899,
    description: 'Royal ₹100 OFF on orders above ₹899',
  },
  {
    code: 'GOLD200',
    discountAmount: 200,
    minOrderValue: 1499,
    description: 'Gold Club ₹200 OFF on orders above ₹1499',
  },
];

async function main() {
  console.log('🌱 Starting database seeding...');

  // 1. Seed Categories
  for (let i = 0; i < CATEGORIES.length; i++) {
    const name = CATEGORIES[i];
    await prisma.category.upsert({
      where: { name },
      update: { displayOrder: i },
      create: { name, displayOrder: i },
    });
  }
  console.log(`✅ Seeded ${CATEGORIES.length} categories.`);

  // 2. Seed Sweets & Variants
  for (const s of SWEETS) {
    await prisma.product.upsert({
      where: { id: s.id },
      update: {
        name: s.name,
        tagline: s.tagline,
        description: s.description,
        category: s.category,
        imageUrl: s.imageUrl,
        rating: s.rating,
        reviewsCount: s.reviewsCount,
        badge: s.badge,
        pureGhee: s.pureGhee,
        shelfLife: s.shelfLife,
        freshBatchMinsAgo: s.freshBatchMinsAgo,
      },
      create: {
        id: s.id,
        name: s.name,
        tagline: s.tagline,
        description: s.description,
        category: s.category,
        imageUrl: s.imageUrl,
        rating: s.rating,
        reviewsCount: s.reviewsCount,
        badge: s.badge,
        pureGhee: s.pureGhee,
        shelfLife: s.shelfLife,
        freshBatchMinsAgo: s.freshBatchMinsAgo,
      },
    });

    for (const v of s.variants) {
      await prisma.productVariant.upsert({
        where: { id: v.id },
        update: {
          label: v.label,
          price: v.price,
          weightInGrams: v.weightInGrams,
        },
        create: {
          id: v.id,
          productId: s.id,
          label: v.label,
          price: v.price,
          weightInGrams: v.weightInGrams,
        },
      });
    }
  }
  console.log(`✅ Seeded ${SWEETS.length} sweets with variants.`);

  // 3. Seed Coupons
  for (const c of COUPONS) {
    await prisma.coupon.upsert({
      where: { code: c.code },
      update: {
        discountAmount: c.discountAmount,
        minOrderValue: c.minOrderValue,
        description: c.description,
      },
      create: {
        code: c.code,
        discountAmount: c.discountAmount,
        minOrderValue: c.minOrderValue,
        description: c.description,
      },
    });
  }
  console.log(`✅ Seeded ${COUPONS.length} promotional coupons.`);

  // 4. Seed Default Admin/Demo User
  await prisma.user.upsert({
    where: { phone: '9876543210' },
    update: {},
    create: {
      phone: '9876543210',
      name: 'Gaurav Jain',
      points: 450,
      tier: 'Gold Club Connoisseur',
      addresses: {
        create: [
          {
            type: 'Home',
            name: 'Gaurav Jain',
            phone: '9876543210',
            houseNo: 'A-402, Nirvana Courtyard',
            area: 'Sector 50',
            city: 'Gurugram',
            state: 'Haryana',
            pincode: '122018',
            isDefault: true,
          },
        ],
      },
    },
  });
  console.log('✅ Seeded default demo user with address.');

  console.log('🎉 Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
