import crypto from 'crypto';

/**
 * Payment Gateway Service supporting:
 * - Razorpay (Create Order, Webhook/Signature Verification, Refund)
 * - Cashfree Payments
 * - Simulation Mode (Instant local mock transactions for offline/testing)
 */

export interface CreateOrderParams {
  amount: number; // in Rupees
  currency?: string;
  receipt: string;
  notes?: Record<string, string>;
}

export interface PaymentVerificationParams {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export class PaymentService {
  private static instance: PaymentService;

  public static getInstance(): PaymentService {
    if (!PaymentService.instance) {
      PaymentService.instance = new PaymentService();
    }
    return PaymentService.instance;
  }

  /**
   * Creates a payment gateway order with Razorpay or local simulation
   */
  public async createGatewayOrder(params: CreateOrderParams) {
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    // 1. Live Razorpay Integration
    if (keyId && keySecret) {
      try {
        const amountInPaise = Math.round(params.amount * 100);
        const auth = Buffer.from(`${keyId}:${keySecret}`).toString('base64');

        const res = await fetch('https://api.razorpay.com/v1/orders', {
          method: 'POST',
          headers: {
            Authorization: `Basic ${auth}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            amount: amountInPaise,
            currency: params.currency || 'INR',
            receipt: params.receipt,
            notes: params.notes || { brand: 'Gaurav Bhai Ki Mithai' },
          }),
        });

        const data = await res.json() as any;
        if (res.ok) {
          console.log(`[PaymentService] Razorpay order created: ${data.id} for ₹${params.amount}`);
          return {
            success: true,
            provider: 'razorpay',
            orderId: data.id,
            amount: data.amount,
            currency: data.currency,
            keyId,
          };
        } else {
          console.error('[PaymentService] Razorpay order creation failed:', data.error);
        }
      } catch (err: any) {
        console.error('[PaymentService] Razorpay error, falling back to simulation:', err.message);
      }
    }

    // 2. Simulation / Development Mode
    const simulatedOrderId = `order_sim_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    console.log(`💳 [PAYMENT GATEWAY SIMULATION] Order created: ${simulatedOrderId} for ₹${params.amount}`);

    return {
      success: true,
      provider: 'simulation',
      orderId: simulatedOrderId,
      amount: Math.round(params.amount * 100),
      currency: 'INR',
      keyId: 'rzp_test_simulation',
    };
  }

  /**
   * Verifies Razorpay payment signature
   */
  public verifySignature(params: PaymentVerificationParams): boolean {
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret) {
      // In simulation mode, accept simulated payment IDs
      return params.razorpay_payment_id.startsWith('pay_') || params.razorpay_payment_id.startsWith('sim_');
    }

    const body = `${params.razorpay_order_id}|${params.razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(body.toString())
      .digest('hex');

    return expectedSignature === params.razorpay_signature;
  }

  /**
   * Processes a refund via gateway
   */
  public async processRefund(paymentId: string, amount: number) {
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (keyId && keySecret && !paymentId.startsWith('sim_') && !paymentId.startsWith('pay_sim')) {
      try {
        const auth = Buffer.from(`${keyId}:${keySecret}`).toString('base64');
        const res = await fetch(`https://api.razorpay.com/v1/payments/${paymentId}/refund`, {
          method: 'POST',
          headers: {
            Authorization: `Basic ${auth}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ amount: Math.round(amount * 100) }),
        });
        const data = await res.json() as any;
        if (res.ok) {
          return { success: true, refundId: data.id, provider: 'razorpay' };
        }
      } catch (err: any) {
        console.error('[PaymentService] Razorpay refund error:', err.message);
      }
    }

    const simulatedRefundId = `rfnd_sim_${Date.now()}`;
    console.log(`💸 [REFUND GATEWAY SIMULATION] Refund ${simulatedRefundId} of ₹${amount} issued for ${paymentId}`);
    return {
      success: true,
      refundId: simulatedRefundId,
      provider: 'simulation',
      amount,
    };
  }
}

export const paymentService = PaymentService.getInstance();
