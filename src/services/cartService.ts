import { CartItem, FulfillmentMode } from '@/store/useStore';

export interface BillCalculation {
  itemTotal: number;
  packagingFee: number;
  deliveryFee: number;
  tax: number;
  discount: number;
  grandTotal: number;
}

export class CartService {
  public calculateBill(
    items: CartItem[],
    fulfillmentMode: FulfillmentMode,
    hasGiftWrap: boolean,
    couponDiscount: number = 0
  ): BillCalculation {
    const itemTotal = items.reduce(
      (sum, item) => sum + item.variant.price * item.quantity,
      0
    );

    // Defect #1 fix: Ensure packagingFee is 0 when cart has 0 items (even if hasGiftWrap is true)
    const packagingFee = itemTotal > 0 ? (hasGiftWrap ? 35 : 15) : 0;
    const deliveryFee =
      fulfillmentMode === 'pickup' || itemTotal === 0 ? 0 : (itemTotal >= 1000 ? 0 : 40);
    const tax = Math.round(itemTotal * 0.05); // 5% GST

    // Defect #2 fix: Cap coupon discount to itemTotal and prevent negative grand total
    const effectiveDiscount = Math.min(couponDiscount, itemTotal);
    const subtotal = itemTotal + packagingFee + deliveryFee + tax;
    const grandTotal = Math.max(0, subtotal - effectiveDiscount);

    return {
      itemTotal,
      packagingFee,
      deliveryFee,
      tax,
      discount: effectiveDiscount,
      grandTotal,
    };
  }

  public validateCoupon(
    code: string,
    itemTotal: number
  ): { isValid: boolean; discountAmount: number; message: string } {
    const upper = code.trim().toUpperCase();

    if (upper === 'MITHAI50' || upper === 'DIWALI50') {
      if (itemTotal < 500) {
        return {
          isValid: false,
          discountAmount: 0,
          message: 'Coupon requires a minimum order of ₹500',
        };
      }
      return {
        isValid: true,
        discountAmount: 50,
        message: '₹50 festive privilege applied!',
      };
    }

    if (upper === 'GOLD100') {
      if (itemTotal < 1000) {
        return {
          isValid: false,
          discountAmount: 0,
          message: 'Coupon requires a minimum order of ₹1000',
        };
      }
      return {
        isValid: true,
        discountAmount: 100,
        message: '₹100 Connoisseur Gold Club discount applied!',
      };
    }

    return {
      isValid: false,
      discountAmount: 0,
      message: 'Invalid or expired coupon code',
    };
  }
}

export const cartService = new CartService();
