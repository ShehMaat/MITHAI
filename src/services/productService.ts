import { apiClient } from './apiClient';
import { MOCK_SWEETS, CATEGORIES, SweetItem } from '@/constants/mockData';

export class ProductService {
  public async getProducts(category?: string): Promise<SweetItem[]> {
    return apiClient.get<SweetItem[]>(
      category ? `/products?category=${encodeURIComponent(category)}` : '/products',
      async () => {
        if (!category || category === 'All Sweets') {
          return MOCK_SWEETS;
        }
        return MOCK_SWEETS.filter((s) => s.category === category);
      }
    );
  }

  public async getProductById(id: string): Promise<SweetItem | null> {
    return apiClient.get<SweetItem | null>(`/products/${id}`, async () => {
      const found = MOCK_SWEETS.find((s) => s.id === id);
      return found || null;
    });
  }

  public async getCategories(): Promise<string[]> {
    return apiClient.get<string[]>('/products/categories', async () => CATEGORIES);
  }
}

export const productService = new ProductService();
