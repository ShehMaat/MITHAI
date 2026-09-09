import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_FILE = path.join(__dirname, 'db.json');

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

  constructor() {
    this.data = this.load();
    if (!this.data.users) this.data.users = [];
    if (!this.data.bulkOrders) this.data.bulkOrders = [];
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
    return order;
  }

  public updateOrderStatus(orderId: string, status: string) {
    const order = this.getOrderById(orderId);
    if (order) {
      order.status = status;
      this.persist();
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
      // Recalculate average rating
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
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    return this.data.users.find((u) => u.phone.replace(/[^0-9]/g, '') === cleanPhone);
  }

  public upsertUser(user: { phone: string; name?: string }) {
    const cleanPhone = user.phone.replace(/[^0-9]/g, '');
    let existing = this.getUserByPhone(cleanPhone);
    if (existing) {
      if (user.name) existing.name = user.name;
      this.persist();
      return existing;
    }

    const newUser = {
      id: `usr-${Date.now()}`,
      phone: user.phone,
      name: user.name || 'Gaurav Jain',
      points: 450,
      tier: 'Gold Club Connoisseur',
      addresses: [
        {
          id: 'addr-1',
          type: 'Home',
          name: user.name || 'Gaurav Jain',
          phone: user.phone,
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
    return quoteReq;
  }
}

export const store = new Store();
