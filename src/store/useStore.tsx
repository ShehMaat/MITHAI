import React, { createContext, useContext, useState, useMemo } from 'react';
import { MOCK_SWEETS, SweetItem, WeightVariant } from '@/constants/mockData';
import { cartService } from '@/services/cartService';
import { orderService } from '@/services/orderService';
import { apiClient } from '@/services/apiClient';
import { authService, UserSession } from '@/services/authService';
import { Address } from '@/components/address-modal';

export interface CartItem {
  sweet: SweetItem;
  variant: WeightVariant;
  quantity: number;
}

export type FulfillmentMode = 'delivery' | 'pickup';

export interface OrderState {
  orderId: string;
  token: string;
  items: CartItem[];
  fulfillmentMode: FulfillmentMode;
  slotDate: string;
  slotTime: string;
  address: string;
  hasGiftWrap: boolean;
  giftMessage: string;
  itemTotal: number;
  packagingFee: number;
  deliveryFee: number;
  tax: number;
  discount: number;
  grandTotal: number;
  paymentMethod: string;
  placedAt: string;
  eta: string;
  status: 'placed' | 'kitchen' | 'packed' | 'ready' | 'cancelled';
}

interface StoreContextType {
  user: UserSession | null;
  sendOtp: (phone: string) => Promise<{ message: string; demoOtp: string }>;
  verifyOtp: (phone: string, otp: string, name?: string) => Promise<boolean>;
  logout: () => void;
  fulfillmentMode: FulfillmentMode;
  setFulfillmentMode: (mode: FulfillmentMode) => void;
  deliveryAddress: string;
  setDeliveryAddress: (address: string) => void;
  savedAddresses: Address[];
  addAddress: (address: Omit<Address, 'id'>) => void;
  favorites: string[];
  toggleFavorite: (sweetId: string) => void;
  cart: CartItem[];
  addToCart: (sweet: SweetItem, variant: WeightVariant) => void;
  updateQuantity: (sweetId: string, variantId: string, delta: number) => void;
  removeFromCart: (sweetId: string, variantId: string) => void;
  getCartQuantity: (sweetId: string, variantId?: string) => number;
  cartCount: number;
  itemTotal: number;
  packagingFee: number;
  deliveryFee: number;
  tax: number;
  discount: number;
  grandTotal: number;
  couponCode: string;
  couponMessage: string;
  applyCouponCode: (code: string) => boolean;
  removeCoupon: () => void;
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  selectedSlot: string;
  setSelectedSlot: (slot: string) => void;
  addGiftWrap: boolean;
  setAddGiftWrap: (wrap: boolean) => void;
  giftMessage: string;
  setGiftMessage: (msg: string) => void;
  activeOrder: OrderState | null;
  placeOrder: (paymentMethod: string) => OrderState;
  cancelActiveOrder: (reason: string) => Promise<boolean>;
  submitReview: (productId: string, rating: number, comment: string) => Promise<boolean>;
  isMockMode: boolean;
  toggleMockMode: () => void;
}

const StoreContext = createContext<StoreContextType | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserSession | null>({
    id: 'usr-98765',
    name: 'Gaurav Jain',
    phone: '9876543210',
    points: 450,
    tier: 'Gold Club Connoisseur',
    createdAt: new Date().toISOString(),
  });

  const sendOtp = async (phone: string) => {
    return authService.sendOtp(phone);
  };

  const verifyOtp = async (phone: string, otp: string, name?: string) => {
    try {
      const res = await authService.verifyOtp(phone, otp, name);
      if (res && res.user) {
        setUser(res.user);
        apiClient.setAuthToken(res.token);
        return true;
      }
    } catch (err) {
      console.error('[Store] Auth verify failed:', err);
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    apiClient.setAuthToken(null);
  };

  const [fulfillmentMode, setFulfillmentMode] = useState<FulfillmentMode>('delivery');
  const [deliveryAddress, setDeliveryAddress] = useState(
    'A-402, Nirvana Courtyard, Sector 50, Gurugram'
  );

  const [savedAddresses, setSavedAddresses] = useState<Address[]>([
    {
      id: 'addr-1',
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
    {
      id: 'addr-2',
      type: 'Work',
      name: 'Gaurav Jain',
      phone: '9876543210',
      houseNo: 'Tower B, 14th Floor, DLF Cyber City',
      area: 'Phase 2',
      city: 'Gurugram',
      state: 'Haryana',
      pincode: '122002',
    },
  ]);

  const addAddress = (newAddr: Omit<Address, 'id'>) => {
    const created: Address = {
      ...newAddr,
      id: `addr-${Date.now()}`,
    };
    setSavedAddresses((prev) => [created, ...prev]);
    setDeliveryAddress(`${created.houseNo}, ${created.area}, ${created.city}`);
  };

  // Favorites / Wishlist
  const [favorites, setFavorites] = useState<string[]>(['1', '3']);

  const toggleFavorite = (sweetId: string) => {
    setFavorites((prev) =>
      prev.includes(sweetId) ? prev.filter((id) => id !== sweetId) : [...prev, sweetId]
    );
  };

  const [selectedDate, setSelectedDate] = useState('Today (8 Sep)');
  const [selectedSlot, setSelectedSlot] = useState('5:00 PM - 6:00 PM');
  const [addGiftWrap, setAddGiftWrap] = useState(true);
  const [giftMessage, setGiftMessage] = useState('Best wishes for the festival!');

  // Coupon State
  const [couponCode, setCouponCode] = useState('');
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponMessage, setCouponMessage] = useState('');

  // Pre-seed cart
  const [cart, setCart] = useState<CartItem[]>([
    {
      sweet: MOCK_SWEETS[0],
      variant: MOCK_SWEETS[0].variants[1], // 500g - ₹540
      quantity: 1,
    },
    {
      sweet: MOCK_SWEETS[1],
      variant: MOCK_SWEETS[1].variants[0], // 500g - ₹320
      quantity: 1,
    },
  ]);

  const [activeOrder, setActiveOrder] = useState<OrderState | null>(null);
  const [isMockMode, setIsMockMode] = useState<boolean>(apiClient.isMockMode());

  const toggleMockMode = () => {
    const next = !isMockMode;
    apiClient.setMockMode(next);
    setIsMockMode(next);
  };

  const addToCart = (sweet: SweetItem, variant: WeightVariant) => {
    setCart((prev) => {
      const existingIndex = prev.findIndex(
        (c) => c.sweet.id === sweet.id && c.variant.id === variant.id
      );
      if (existingIndex > -1) {
        const copy = [...prev];
        copy[existingIndex].quantity += 1;
        return copy;
      }
      return [...prev, { sweet, variant, quantity: 1 }];
    });
  };

  const updateQuantity = (sweetId: string, variantId: string, delta: number) => {
    setCart((prev) => {
      return prev
        .map((item) => {
          if (item.sweet.id === sweetId && item.variant.id === variantId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[];
    });
  };

  const removeFromCart = (sweetId: string, variantId: string) => {
    setCart((prev) =>
      prev.filter((item) => !(item.sweet.id === sweetId && item.variant.id === variantId))
    );
  };

  const getCartQuantity = (sweetId: string, variantId?: string) => {
    if (variantId) {
      const found = cart.find(
        (c) => c.sweet.id === sweetId && c.variant.id === variantId
      );
      return found?.quantity || 0;
    }
    return cart
      .filter((c) => c.sweet.id === sweetId)
      .reduce((sum, item) => sum + item.quantity, 0);
  };

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const bill = useMemo(() => {
    return cartService.calculateBill(
      cart,
      fulfillmentMode,
      addGiftWrap,
      couponDiscount
    );
  }, [cart, fulfillmentMode, addGiftWrap, couponDiscount]);

  const applyCouponCode = (code: string): boolean => {
    const result = cartService.validateCoupon(code, bill.itemTotal);
    if (result.isValid) {
      setCouponCode(code.toUpperCase());
      setCouponDiscount(result.discountAmount);
      setCouponMessage(result.message);
      return true;
    } else {
      setCouponMessage(result.message);
      return false;
    }
  };

  const removeCoupon = () => {
    setCouponCode('');
    setCouponDiscount(0);
    setCouponMessage('');
  };

  const placeOrder = (paymentMethod: string): OrderState => {
    const tokenNum = String(Math.floor(10 + Math.random() * 89));
    const newOrder: OrderState = {
      orderId: `#GBM-${Math.floor(10000 + Math.random() * 90000)}`,
      token: `#TOKEN-${tokenNum}`,
      items: [...cart],
      fulfillmentMode,
      slotDate: selectedDate,
      slotTime: selectedSlot,
      address: deliveryAddress,
      hasGiftWrap: addGiftWrap,
      giftMessage,
      itemTotal: bill.itemTotal,
      packagingFee: bill.packagingFee,
      deliveryFee: bill.deliveryFee,
      tax: bill.tax,
      discount: bill.discount,
      grandTotal: bill.grandTotal,
      paymentMethod,
      placedAt: '5:15 PM',
      eta: '5:45 PM (in ~25 mins)',
      status: 'kitchen',
    };

    orderService.createOrder({
      items: cart.map((c) => ({
        sweetId: c.sweet.id,
        variantId: c.variant.id,
        quantity: c.quantity,
      })),
      fulfillmentMode,
      slotDate: selectedDate,
      slotTime: selectedSlot,
      address: deliveryAddress,
      hasGiftWrap: addGiftWrap,
      giftMessage,
      paymentMethod,
    });

    setActiveOrder(newOrder);
    setCart([]);
    removeCoupon();
    return newOrder;
  };

  const cancelActiveOrder = async (reason: string): Promise<boolean> => {
    if (!activeOrder) return false;
    try {
      if (!isMockMode) {
        await apiClient.post(`/orders/${activeOrder.orderId}/cancel`, { reason });
      }
      setActiveOrder((prev) => (prev ? { ...prev, status: 'cancelled' } : null));
      return true;
    } catch (e) {
      console.error('[Store] Cancel order error:', e);
      setActiveOrder((prev) => (prev ? { ...prev, status: 'cancelled' } : null));
      return true;
    }
  };

  const submitReview = async (productId: string, rating: number, comment: string): Promise<boolean> => {
    try {
      if (!isMockMode) {
        await apiClient.post(`/products/${productId}/reviews`, { rating, comment });
      }
      return true;
    } catch (e) {
      console.error('[Store] Submit review error:', e);
      return true;
    }
  };

  return (
    <StoreContext.Provider
      value={{
        user,
        sendOtp,
        verifyOtp,
        logout,
        fulfillmentMode,
        setFulfillmentMode,
        deliveryAddress,
        setDeliveryAddress,
        savedAddresses,
        addAddress,
        favorites,
        toggleFavorite,
        cart,
        addToCart,
        updateQuantity,
        removeFromCart,
        getCartQuantity,
        cartCount,
        itemTotal: bill.itemTotal,
        packagingFee: bill.packagingFee,
        deliveryFee: bill.deliveryFee,
        tax: bill.tax,
        discount: bill.discount,
        grandTotal: bill.grandTotal,
        couponCode,
        couponMessage,
        applyCouponCode,
        removeCoupon,
        selectedDate,
        setSelectedDate,
        selectedSlot,
        setSelectedSlot,
        addGiftWrap,
        setAddGiftWrap,
        giftMessage,
        setGiftMessage,
        activeOrder,
        placeOrder,
        cancelActiveOrder,
        submitReview,
        isMockMode,
        toggleMockMode,
      }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
}
