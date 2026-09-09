export interface WeightVariant {
  id: string;
  label: string; // e.g., '250g', '500g', '1kg' or 'Pack of 6'
  price: number;
  weightInGrams?: number;
}

export interface SweetItem {
  id: string;
  name: string;
  tagline: string;
  description: string;
  category: string;
  imageUrl: string;
  rating: number;
  reviewsCount: number;
  badge?: string;
  pureGhee?: boolean;
  shelfLife: string;
  variants: WeightVariant[];
  freshBatchMinsAgo: number;
}

export const CATEGORIES = [
  'All Sweets',
  'Pure Desi Ghee',
  'Kaju & Dry Fruit',
  'Bengali Specials',
  'Khoya Delights',
  'Sugar-Free',
  'Savories & Namkeen',
];

export const MOCK_SWEETS: SweetItem[] = [
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
      { id: '250g', label: '250g', price: 280, weightInGrams: 250 },
      { id: '500g', label: '500g', price: 540, weightInGrams: 500 },
      { id: '1kg', label: '1kg', price: 1050, weightInGrams: 1000 },
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
      { id: '500g', label: '500g', price: 320, weightInGrams: 500 },
      { id: '1kg', label: '1kg', price: 620, weightInGrams: 1000 },
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
    shelfLife: '3 Days (Keep Refrigerated)',
    freshBatchMinsAgo: 10,
    variants: [
      { id: 'p6', label: 'Pack of 6', price: 180 },
      { id: 'p12', label: 'Pack of 12', price: 340 },
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
      { id: '500g', label: '500g', price: 290, weightInGrams: 500 },
      { id: '1kg', label: '1kg', price: 560, weightInGrams: 1000 },
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
    shelfLife: '15 Days',
    freshBatchMinsAgo: 45,
    variants: [
      { id: '250g', label: '250g', price: 340, weightInGrams: 250 },
      { id: '500g', label: '500g', price: 650, weightInGrams: 500 },
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
    shelfLife: '20 Days',
    freshBatchMinsAgo: 60,
    variants: [
      { id: '250g', label: '250g', price: 220, weightInGrams: 250 },
      { id: '500g', label: '500g', price: 420, weightInGrams: 500 },
    ],
  },
];
