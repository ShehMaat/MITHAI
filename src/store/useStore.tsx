import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { socketService } from '@/services/socketService';
import { MOCK_SWEETS, SweetItem, WeightVariant } from '@/constants/mockData';
import { cartService } from '@/services/cartService';
import { orderService } from '@/services/orderService';
import { apiClient } from '@/services/apiClient';
import { authService, UserSession } from '@/services/authService';
import { Address } from '@/components/address-modal';
import { playKitchenBellChime, playSuccessChime } from '@/utils/soundEffects';

export interface ToastNotification {
  id: string;
  title: string;
  message: string;
  orderId?: string;
  type?: 'info' | 'success' | 'warning';
}


export interface CartItem {
  sweet: SweetItem;
  variant: WeightVariant;
  quantity: number;
  isHamper?: boolean;
  hamperBox?: { id: string; name: string; boxFee: number };
  hamperRecipient?: string;
  hamperMessage?: string;
  hamperSweets?: { sweet: SweetItem; variant: WeightVariant }[];
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
  status: 'placed' | 'kitchen' | 'packed' | 'ready' | 'delivered' | 'cancelled';
  riderOtp?: string;
}

interface StoreContextType {
  user: UserSession | null;
  isHydrated: boolean;
  sendOtp: (phone: string) => Promise<{ message: string; demoOtp: string }>;
  verifyOtp: (phone: string, otp: string, name?: string) => Promise<UserSession | null>;
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
  addHamperToCart: (hamper: {
    box: { id: string; name: string; boxFee: number };
    recipientName: string;
    giftMessage: string;
    sweets: SweetItem[];
  }) => void;
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
  activeToast: ToastNotification | null;
  showToast: (toast: Omit<ToastNotification, 'id'>) => void;
  dismissToast: () => void;
}

const StoreContext = createContext<StoreContextType | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [activeToast, setActiveToast] = useState<ToastNotification | null>(null);

  const showToast = (toast: Omit<ToastNotification, 'id'>) => {
    setActiveToast({
      ...toast,
      id: `toast-${Date.now()}`,
    });
  };

  const dismissToast = () => {
    setActiveToast(null);
  };

  const [user, setUser] = useState<UserSession | null>(null);

  const sendOtp = async (phone: string) => {
    return authService.sendOtp(phone);
  };

  const verifyOtp = async (phone: string, otp: string, name?: string): Promise<UserSession | null> => {
    try {
      const res = await authService.verifyOtp(phone, otp, name);
      if (res && res.user) {
        setUser(res.user);
        apiClient.setAuthToken(res.token);
        await AsyncStorage.setItem('GBM_USER', JSON.stringify({ user: res.user, token: res.token })).catch(() => {});

        // Synchronize role-based access keys
        if (res.user.role === 'admin') {
          await AsyncStorage.setItem('GBM_ADMIN_AUTH', 'true').catch(() => {});
          await AsyncStorage.removeItem('GBM_RIDER_AUTH').catch(() => {});
        } else if (res.user.role === 'rider') {
          await AsyncStorage.setItem('GBM_RIDER_AUTH', 'true').catch(() => {});
          await AsyncStorage.removeItem('GBM_ADMIN_AUTH').catch(() => {});
        } else {
          await AsyncStorage.removeItem('GBM_ADMIN_AUTH').catch(() => {});
          await AsyncStorage.removeItem('GBM_RIDER_AUTH').catch(() => {});
        }

        return res.user;
      }
    } catch (err) {
      console.error('[Store] Auth verify failed:', err);
    }
    return null;
  };

  const logout = () => {
    setUser(null);
    apiClient.setAuthToken(null);
    AsyncStorage.removeItem('GBM_USER').catch(() => {});
    AsyncStorage.removeItem('GBM_ADMIN_AUTH').catch(() => {});
    AsyncStorage.removeItem('GBM_RIDER_AUTH').catch(() => {});
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

  // Helper for dynamic date generation (Defect #3 fix)
  const getDynamicDates = () => {
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const todayStr = `Today (${today.getDate()} ${monthNames[today.getMonth()]})`;
    const tomorrowStr = `Tomorrow (${tomorrow.getDate()} ${monthNames[tomorrow.getMonth()]})`;
    return [todayStr, tomorrowStr];
  };

  const dynamicDateOptions = getDynamicDates();
  const [selectedDate, setSelectedDate] = useState(dynamicDateOptions[0]);
  const [selectedSlot, setSelectedSlot] = useState('5:00 PM - 6:00 PM');
  const [addGiftWrap, setAddGiftWrap] = useState(true);
  const [giftMessage, setGiftMessage] = useState('Best wishes for the festival!');

  // Coupon State
  const [couponCode, setCouponCode] = useState('');
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponMessage, setCouponMessage] = useState('');

  const [cart, setCart] = useState<CartItem[]>([]);

  const [activeOrder, setActiveOrder] = useState<OrderState | null>(null);
  const [isMockMode, setIsMockMode] = useState<boolean>(apiClient.isMockMode());

  const [isHydrated, setIsHydrated] = useState(false);

  // 1. Hydrate state from AsyncStorage on app launch
  useEffect(() => {
    async function hydrateStore() {
      try {
        const [savedCart, savedUser, savedAddrs, savedFavs, savedOrder] = await Promise.all([
          AsyncStorage.getItem('GBM_CART'),
          AsyncStorage.getItem('GBM_USER'),
          AsyncStorage.getItem('GBM_ADDRESSES'),
          AsyncStorage.getItem('GBM_FAVORITES'),
          AsyncStorage.getItem('GBM_ACTIVE_ORDER'),
        ]);

        if (savedCart) setCart(JSON.parse(savedCart));
        if (savedUser) {
          const parsed = JSON.parse(savedUser);
          if (parsed?.user) {
            setUser(parsed.user);
            if (parsed.user.role === 'admin') {
              AsyncStorage.setItem('GBM_ADMIN_AUTH', 'true').catch(() => {});
            } else if (parsed.user.role === 'rider') {
              AsyncStorage.setItem('GBM_RIDER_AUTH', 'true').catch(() => {});
            }
          }
          if (parsed?.token) apiClient.setAuthToken(parsed.token);
        }
        if (savedAddrs) setSavedAddresses(JSON.parse(savedAddrs));
        if (savedFavs) setFavorites(JSON.parse(savedFavs));
        if (savedOrder) {
          const ord = JSON.parse(savedOrder);
          setActiveOrder(ord);
          socketService.joinOrder(ord.orderId);
        }
      } catch (err) {
        console.warn('[Store] Hydration notice:', err);
      } finally {
        setIsHydrated(true);
      }
    }
    hydrateStore();
  }, []);

  // 2. Persist state changes to AsyncStorage
  useEffect(() => {
    AsyncStorage.setItem('GBM_CART', JSON.stringify(cart)).catch(() => {});
  }, [cart]);

  useEffect(() => {
    AsyncStorage.setItem('GBM_ADDRESSES', JSON.stringify(savedAddresses)).catch(() => {});
  }, [savedAddresses]);

  useEffect(() => {
    AsyncStorage.setItem('GBM_FAVORITES', JSON.stringify(favorites)).catch(() => {});
  }, [favorites]);

  useEffect(() => {
    if (activeOrder) {
      AsyncStorage.setItem('GBM_ACTIVE_ORDER', JSON.stringify(activeOrder)).catch(() => {});
    } else {
      AsyncStorage.removeItem('GBM_ACTIVE_ORDER').catch(() => {});
    }
  }, [activeOrder]);

  // 3. Real-Time Socket.io Order Lifecycle Listener
  useEffect(() => {
    const handleSocketUpdate = (data: { orderId: string; status: string; orderData?: any }) => {
      console.log('📡 [Store] Live WebSocket order status update received:', data);
      setActiveOrder((prev) => {
        if (!prev) return prev;
        const targetId = data.orderId ? data.orderId.replace('#', '') : '';
        const currentId = prev.orderId ? prev.orderId.replace('#', '') : '';
        if (targetId === currentId) {
          return {
            ...prev,
            status: data.status as any,
            ...(data.orderData || {}),
          };
        }
        return prev;
      });

      const statusMap: Record<string, { title: string; message: string; type: 'info' | 'success' | 'warning' }> = {
        kitchen: {
          title: '👨‍🍳 Fresh Preparation Started',
          message: 'Karigars are preparing fresh sweets with pure bilona desi ghee.',
          type: 'info',
        },
        packed: {
          title: '🎁 Packed in Royal Box',
          message: 'Order sealed with gold embossed festive seal.',
          type: 'info',
        },
        ready: {
          title: '🎉 Order Ready for Pickup!',
          message: 'Your sweets are packaged and ready at pickup counter.',
          type: 'success',
        },
        out_for_delivery: {
          title: '🛵 Out for Delivery',
          message: 'Our express rider is en route to your address.',
          type: 'info',
        },
        delivered: {
          title: '✨ Order Delivered',
          message: 'Thank you for choosing Gaurav Bhai Ki Mithai. Enjoy!',
          type: 'success',
        },
        cancelled: {
          title: '❌ Order Cancelled',
          message: '100% refund initiated to payment source.',
          type: 'warning',
        },
      };

      const notification = statusMap[data.status];
      if (notification) {
        if (['ready', 'delivered'].includes(data.status)) {
          playKitchenBellChime();
        } else {
          playSuccessChime();
        }
        showToast({
          title: notification.title,
          message: notification.message,
          orderId: data.orderId,
          type: notification.type,
        });
      }
    };

    socketService.onOrderStatusUpdate(handleSocketUpdate);
    return () => {
      socketService.offOrderStatusUpdate(handleSocketUpdate);
    };
  }, []);

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

  const addHamperToCart = (hamper: {
    box: { id: string; name: string; boxFee: number };
    recipientName: string;
    giftMessage: string;
    sweets: SweetItem[];
  }) => {
    const sweetsPrice = hamper.sweets.reduce((sum, s) => {
      const v = s.variants.find((vr) => vr.label === '250g') || s.variants[0];
      return sum + (v ? v.price : 250);
    }, 0);
    const totalPrice = sweetsPrice + hamper.box.boxFee;

    const hamperItem: CartItem = {
      isHamper: true,
      hamperBox: hamper.box,
      hamperRecipient: hamper.recipientName,
      hamperMessage: hamper.giftMessage,
      hamperSweets: hamper.sweets.map((s) => ({
        sweet: s,
        variant: s.variants.find((vr) => vr.label === '250g') || s.variants[0],
      })),
      sweet: {
        id: `hamper-${Date.now()}`,
        name: `Royal Mithai Box (${hamper.box.name})`,
        tagline: `Curated for ${hamper.recipientName}`,
        description: `Bespoke gift hamper with brass seal ribbon and engraved greeting: "${hamper.giftMessage}"`,
        category: 'Custom Hampers',
        imageUrl:
          hamper.sweets[0]?.imageUrl ||
          'https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=800&auto=format&fit=crop&q=80',
        rating: 5.0,
        reviewsCount: 1,
        pureGhee: true,
        shelfLife: '15 Days',
        freshBatchMinsAgo: 5,
        variants: [
          {
            id: `box-${hamper.box.id}`,
            label: `${hamper.box.name} (${hamper.sweets.length} Sweets)`,
            price: totalPrice,
          },
        ],
      },
      variant: {
        id: `box-${hamper.box.id}`,
        label: `${hamper.box.name} (${hamper.sweets.length} Sweets)`,
        price: totalPrice,
      },
      quantity: 1,
    };

    setCart((prev) => [hamperItem, ...prev]);
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
    const generatedOtp = String(Math.floor(1000 + Math.random() * 9000));
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
      placedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      eta: fulfillmentMode === 'pickup' ? 'Ready in 15-20 mins' : 'Delivery in 25-35 mins',
      status: 'kitchen',
      riderOtp: generatedOtp,
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
    socketService.joinOrder(newOrder.orderId);
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
        isHydrated,
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
        addHamperToCart,
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
        activeToast,
        showToast,
        dismissToast,
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
