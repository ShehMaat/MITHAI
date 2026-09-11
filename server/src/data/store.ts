import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { PrismaClient } from '@prisma/client';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_FILE = path.join(__dirname, 'db.json');

export const prisma = new PrismaClient();

export interface DatabaseSchema {
  categories: string[];
  products: any[];
  coupons: any[];
  slots: { dates: string[]; timeSlots: string[] };
  orders: any[];
  inventory: any[];
  users: any[];
  bulkOrders: any[];
}

class Store {
  private data: DatabaseSchema;
  private isInitialized = false;

  constructor() {
    this.data = this.load();
    if (!this.data.users) this.data.users = [];
    if (!this.data.bulkOrders) this.data.bulkOrders = [];
    this.syncFromPrisma();
  }

  public async syncFromPrisma() {
    try {
      const categories = await prisma.category.findMany({ orderBy: { displayOrder: 'asc' } });
      const products = await prisma.product.findMany({ include: { variants: true } });
      const coupons = await prisma.coupon.findMany();
      const orders = await prisma.order.findMany({ include: { items: true }, orderBy: { createdAt: 'desc' } });
      const users = await prisma.user.findMany({ include: { addresses: true } });
      const bulkOrders = await prisma.bulkOrder.findMany({ orderBy: { createdAt: 'desc' } });

      if (categories.length > 0) this.data.categories = categories.map((c) => c.name);
      if (products.length > 0) this.data.products = products;
      if (coupons.length > 0) this.data.coupons = coupons;
      if (orders.length > 0) {
        // Map Prisma orders to match frontend expectation
        this.data.orders = orders.map((o) => ({
          ...o,
          orderId: o.orderId,
          token: o.token,
          items: o.items.map((it) => ({
            price: it.price,
            quantity: it.quantity,
            name: it.sweetName,
            variant: { label: it.variantLabel, price: it.price },
          })),
        }));
      }
      if (users.length > 0) this.data.users = users;
      if (bulkOrders.length > 0) this.data.bulkOrders = bulkOrders;

      this.isInitialized = true;
      this.persist();
      console.log(`[Store] Synced from Prisma: ${this.data.products.length} sweets, ${this.data.categories.length} categories.`);
    } catch (err) {
      console.warn('[Store] Prisma sync notice (using cache):', err);
    }
  }

  private load(): DatabaseSchema {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        return JSON.parse(raw);
      }
    } catch (err) {
      console.error('[Store] Error loading db.json, using fallback', err);
    }
    return {
      categories: [],
      products: [],
      coupons: [],
      slots: { dates: [], timeSlots: [] },
      orders: [],
      inventory: [],
      users: [],
      bulkOrders: [],
    };
  }

  private persist() {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('[Store] Error saving to db.json', err);
    }
  }

  public getProducts() {
    return this.data.products;
  }

  public getProductById(id: string) {
    return this.data.products.find((p) => p.id === id);
  }

  public getCategories() {
    return this.data.categories;
  }

  public getCoupons() {
    return this.data.coupons;
  }

  public getCouponByCode(code: string) {
    return this.data.coupons.find(
      (c) => c.code.toUpperCase() === code.trim().toUpperCase()
    );
  }

  public getSlots() {
    return this.data.slots;
  }

  public getOrders() {
    return this.data.orders;
  }

  public getOrderById(orderId: string) {
    return this.data.orders.find(
      (o) =>
        o.orderId === orderId ||
        o.orderId.replace('#', '') === orderId.replace('#', '')
    );
  }

  public addOrder(order: any) {
    this.data.orders.unshift(order);
    this.persist();

    prisma.order.create({
      data: {
        orderId: order.orderId,
        token: String(order.token || '01'),
        customerName: order.customerName || 'Gaurav Jain',
        phone: order.phone || '9876543210',
        fulfillmentMode: order.fulfillmentMode || 'delivery',
        slotDate: order.slotDate || '',
        slotTime: order.slotTime || '',
        address: order.address || '',
        hasGiftWrap: !!order.hasGiftWrap,
        giftMessage: order.giftMessage || '',
        itemTotal: order.itemTotal || 0,
        packagingFee: order.packagingFee || 0,
        deliveryFee: order.deliveryFee || 0,
        tax: order.tax || 0,
        discount: order.discount || 0,
        grandTotal: order.grandTotal || 0,
        paymentMethod: order.paymentMethod || 'UPI (Instant)',
        placedAt: order.placedAt || '',
        eta: order.eta || '',
        status: order.status || 'kitchen',
        riderOtp: order.riderOtp || '',
        items: {
          create: (order.items || []).map((it: any) => ({
            sweetName: it.sweet?.name || it.name || 'Artisanal Sweet',
            variantLabel: it.variant?.label || it.label || '250g',
            price: it.price || it.variant?.price || 0,
            quantity: it.quantity || 1,
          })),
        },
      },
    }).catch((err) => console.error('[Store] Prisma order insert error:', err));

    return order;
  }

  public updateOrderStatus(orderId: string, status: string) {
    const order = this.getOrderById(orderId);
    if (order) {
      order.status = status;
      this.persist();

      prisma.order.updateMany({
        where: { orderId },
        data: { status },
      }).catch((err) => console.error('[Store] Prisma update status error:', err));

      return order;
    }
    return null;
  }

  public cancelOrder(orderId: string) {
    const order = this.getOrderById(orderId);
    if (order) {
      order.status = 'cancelled';
      order.refundId = `ref_${Date.now()}`;
      order.cancelledAt = new Date().toISOString();
      this.persist();

      prisma.order.updateMany({
        where: { orderId },
        data: { status: 'cancelled' },
      }).catch((err) => console.error('[Store] Prisma cancel order error:', err));

      return order;
    }
    return null;
  }

  public addProductReview(productId: string, review: { rating: number; author: string; text: string }) {
    const product = this.getProductById(productId);
    if (product) {
      if (!product.reviewsList) product.reviewsList = [];
      product.reviewsList.unshift({
        id: `rev-${Date.now()}`,
        ...review,
        date: 'Just now',
      });
      product.reviewsCount = (product.reviewsCount || 100) + 1;
      this.persist();
      return product;
    }
    return null;
  }

  public getInventory() {
    return this.data.inventory;
  }

  public restockItem(id: string, addKg: number) {
    const item = this.data.inventory.find((inv) => inv.id === id);
    if (item) {
      item.stockKg = parseFloat((item.stockKg + addKg).toFixed(1));
      if (item.stockKg > 5) {
        item.status = 'In Stock';
      }
      this.persist();
      return item;
    }
    return null;
  }

  public getUserByPhone(phone: string) {
    const cleanPhone = phone.replace(/[^0-9]/g, '').slice(-10);
    return this.data.users.find((u) => u.phone.replace(/[^0-9]/g, '').slice(-10) === cleanPhone);
  }

  public getUserById(id: string) {
    return this.data.users.find((u) => u.id === id);
  }

  public upsertUser(user: { phone: string; name?: string; role?: 'customer' | 'admin' | 'rider' }) {
    const cleanPhone = user.phone.replace(/[^0-9]/g, '').slice(-10);

    // Determine designated role based on phone number
    let role: 'customer' | 'admin' | 'rider' = user.role || 'customer';
    let defaultName = user.name;
    if (cleanPhone === '6262750616') {
      role = 'admin';
      defaultName = defaultName || 'Store Manager (Admin)';
    } else if (cleanPhone === '9993393853') {
      role = 'rider';
      defaultName = defaultName || 'Delivery Fleet Partner';
    } else {
      role = 'customer';
      defaultName = defaultName || 'Mithai Connoisseur';
    }

    let existing = this.getUserByPhone(cleanPhone);
    if (existing) {
      if (user.name) existing.name = user.name;
      existing.role = role;
      this.persist();
      return existing;
    }

    const newUser = {
      id: `usr-${Date.now()}`,
      phone: cleanPhone,
      name: defaultName,
      role: role,
      points: 450,
      tier: role === 'admin' ? 'Store Administrator' : role === 'rider' ? 'Fleet Partner' : 'Gold Club Connoisseur',
      addresses: [
        {
          id: 'addr-1',
          type: 'Home',
          name: defaultName,
          phone: cleanPhone,
          houseNo: 'A-402, Nirvana Courtyard',
          area: 'Sector 50',
          city: 'Gurugram',
          state: 'Haryana',
          pincode: '122018',
          isDefault: true,
        },
      ],
      createdAt: new Date().toISOString(),
    };
    this.data.users.push(newUser);
    this.persist();

    prisma.user.create({
      data: {
        phone: cleanPhone,
        name: defaultName,
        points: 450,
        tier: newUser.tier,
        addresses: {
          create: [
            {
              type: 'Home',
              name: defaultName,
              phone: cleanPhone,
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
    }).catch((err) => console.warn('[Store] Prisma upsertUser notice:', err));

    return newUser;
  }

  public getUserAddresses(phone: string) {
    const user = this.getUserByPhone(phone);
    return user?.addresses || [];
  }

  public addUserAddress(phone: string, address: any) {
    const user = this.getUserByPhone(phone);
    if (user) {
      if (!user.addresses) user.addresses = [];
      const newAddr = {
        ...address,
        id: `addr-${Date.now()}`,
      };
      user.addresses.unshift(newAddr);
      this.persist();
      return newAddr;
    }
    return null;
  }

  public getBulkOrders() {
    return this.data.bulkOrders;
  }

  public addBulkOrder(quoteReq: any) {
    this.data.bulkOrders.unshift(quoteReq);
    this.persist();

    prisma.bulkOrder.create({
      data: {
        quoteId: quoteReq.quoteId || `#GBM-BULK-${Date.now()}`,
        occasion: quoteReq.occasion || 'Wedding',
        quantityKg: quoteReq.quantityKg || 50,
        sweets: JSON.stringify(quoteReq.sweets || []),
        boxStyle: quoteReq.boxStyle || 'Standard',
        customFoilText: quoteReq.customFoilText || null,
        targetDate: quoteReq.targetDate || '',
        customerName: quoteReq.customerName || 'Customer',
        phone: quoteReq.phone || '9876543210',
        retailSubtotal: quoteReq.pricing?.retailSubtotal || 0,
        wholesaleDiscount: quoteReq.pricing?.wholesaleDiscount || 0,
        discountPercentage: quoteReq.pricing?.discountPercentage || 0,
        estimatedTotal: quoteReq.pricing?.estimatedTotal || 0,
        depositRequired: quoteReq.pricing?.depositRequired || 0,
        status: 'submitted',
      },
    }).catch((err) => console.warn('[Store] Prisma addBulkOrder notice:', err));

    return quoteReq;
  }
}

export const store = new Store();
