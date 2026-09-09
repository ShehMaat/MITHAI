import { apiClient } from './apiClient';
import { CreateOrderPayload, OrderRecord, OrderStatus } from '@/types/api';
import { MOCK_SWEETS } from '@/constants/mockData';

export class OrderService {
  // In-memory orders store for stateful mock transitions
  private mockOrders: OrderRecord[] = [
    {
      id: '#GBM-84920',
      token: '42',
      customerName: 'Gaurav Jain',
      phone: '+91 98765 43210',
      items: [
        {
          sweet: MOCK_SWEETS[0],
          variant: MOCK_SWEETS[0].variants[1],
          quantity: 1,
        },
        {
          sweet: MOCK_SWEETS[1],
          variant: MOCK_SWEETS[1].variants[0],
          quantity: 1,
        },
      ],
      fulfillmentMode: 'pickup',
      slotDate: 'Today (8 Sep)',
      slotTime: '5:00 PM - 6:00 PM',
      address: 'Shop 12, Central Market, Sector 29, Gurugram',
      hasGiftWrap: true,
      giftMessage: 'Best wishes for the festival!',
      itemTotal: 860,
      packagingFee: 35,
      deliveryFee: 0,
      tax: 45,
      grandTotal: 980,
      paymentMethod: 'UPI (Google Pay)',
      status: 'kitchen',
      placedAt: '5:15 PM',
      estimatedReadyTime: '5:45 PM (in ~25 mins)',
    },
    {
      id: '#GBM-71024',
      token: '18',
      customerName: 'Gaurav Jain',
      phone: '+91 98765 43210',
      items: [
        {
          sweet: MOCK_SWEETS[3],
          variant: MOCK_SWEETS[3].variants[1],
          quantity: 2,
        },
        {
          sweet: MOCK_SWEETS[2],
          variant: MOCK_SWEETS[2].variants[1],
          quantity: 1,
        },
      ],
      fulfillmentMode: 'delivery',
      slotDate: '28 Aug 2026',
      slotTime: '4:00 PM - 5:00 PM',
      address: 'A-402, Nirvana Courtyard, Sector 50, Gurugram',
      hasGiftWrap: false,
      itemTotal: 1460,
      packagingFee: 0,
      deliveryFee: 0,
      tax: 70,
      grandTotal: 1460,
      paymentMethod: 'UPI (PhonePe)',
      status: 'delivered',
      placedAt: '4:10 PM',
      estimatedReadyTime: 'Delivered at 4:52 PM',
    },
  ];

  public async createOrder(payload: CreateOrderPayload): Promise<OrderRecord> {
    return apiClient.post<OrderRecord>('/orders', payload, async () => {
      const itemsDetailed = payload.items.map((it) => {
        const sweet = MOCK_SWEETS.find((s) => s.id === it.sweetId) || MOCK_SWEETS[0];
        const variant =
          sweet.variants.find((v) => v.id === it.variantId) || sweet.variants[0];
        return { sweet, variant, quantity: it.quantity };
      });

      const itemTotal = itemsDetailed.reduce(
        (sum, it) => sum + it.variant.price * it.quantity,
        0
      );
      const packagingFee = payload.hasGiftWrap ? 35 : (itemTotal > 0 ? 15 : 0);
      const deliveryFee = payload.fulfillmentMode === 'pickup' ? 0 : (itemTotal >= 1000 ? 0 : 40);
      const tax = Math.round(itemTotal * 0.05);
      const grandTotal = itemTotal + packagingFee + deliveryFee + tax;

      const randomToken = String(Math.floor(10 + Math.random() * 89));
      const orderId = `#GBM-${Math.floor(10000 + Math.random() * 90000)}`;

      const newOrder: OrderRecord = {
        id: orderId,
        token: randomToken,
        customerName: 'Gaurav Jain',
        phone: '+91 98765 43210',
        items: itemsDetailed,
        fulfillmentMode: payload.fulfillmentMode,
        slotDate: payload.slotDate,
        slotTime: payload.slotTime,
        address: payload.address,
        hasGiftWrap: payload.hasGiftWrap,
        giftMessage: payload.giftMessage,
        itemTotal,
        packagingFee,
        deliveryFee,
        tax,
        grandTotal,
        paymentMethod: payload.paymentMethod,
        status: 'kitchen',
        placedAt: 'Just now',
        estimatedReadyTime: 'In ~25 mins',
      };

      this.mockOrders.unshift(newOrder);
      return newOrder;
    });
  }

  public async getOrderById(id: string): Promise<OrderRecord | null> {
    return apiClient.get<OrderRecord | null>(`/orders/${id}`, async () => {
      const found = this.mockOrders.find((o) => o.id === id);
      return found || null;
    });
  }

  public async getRecentOrders(): Promise<OrderRecord[]> {
    return apiClient.get<OrderRecord[]>('/orders/recent', async () => this.mockOrders);
  }

  public async verifyToken(token: string): Promise<OrderRecord | null> {
    return apiClient.get<OrderRecord | null>(`/orders/verify?token=${token}`, async () => {
      const clean = token.replace('#', '').trim();
      const matched = this.mockOrders.find((o) => o.token === clean);
      return matched || null;
    });
  }

  public async updateOrderStatus(id: string, status: OrderStatus): Promise<boolean> {
    return apiClient.post<boolean>(`/orders/${id}/status`, { status }, async () => {
      const ord = this.mockOrders.find((o) => o.id === id);
      if (ord) {
        ord.status = status;
        return true;
      }
      return false;
    });
  }
}

export const orderService = new OrderService();
