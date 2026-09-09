import { SweetItem, WeightVariant } from '@/constants/mockData';

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  timestamp: string;
}

export interface ApiError {
  code: string;
  message: string;
  field?: string;
}

export type OrderStatus =
  | 'placed'
  | 'kitchen'
  | 'packed'
  | 'ready'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled';

export interface CreateOrderPayload {
  items: {
    sweetId: string;
    variantId: string;
    quantity: number;
  }[];
  fulfillmentMode: 'delivery' | 'pickup';
  slotDate: string;
  slotTime: string;
  address: string;
  hasGiftWrap: boolean;
  giftMessage?: string;
  paymentMethod: string;
}

export interface OrderRecord {
  id: string;
  token: string;
  customerName: string;
  phone: string;
  items: {
    sweet: SweetItem;
    variant: WeightVariant;
    quantity: number;
  }[];
  fulfillmentMode: 'delivery' | 'pickup';
  slotDate: string;
  slotTime: string;
  address: string;
  hasGiftWrap: boolean;
  giftMessage?: string;
  itemTotal: number;
  packagingFee: number;
  deliveryFee: number;
  tax: number;
  grandTotal: number;
  paymentMethod: string;
  status: OrderStatus;
  placedAt: string;
  estimatedReadyTime: string;
}

export interface SlotOption {
  id: string;
  label: string; // e.g., '5:00 PM - 6:00 PM'
  isAvailable: boolean;
  capacityRemaining: number;
}
