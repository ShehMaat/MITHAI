import { ApiResponse, ApiError } from '@/types/api';

export interface ApiClientConfig {
  baseUrl: string;
  timeoutMs: number;
  useMock: boolean;
}

class ApiClient {
  private config: ApiClientConfig;
  private authToken: string | null = null;

  constructor() {
    this.config = {
      baseUrl: process.env.EXPO_PUBLIC_API_URL || 'http://192.168.1.10:5000/api/v1',
      timeoutMs: 6000,
      useMock: false, // Default to live backend server
    };
  }

  public setAuthToken(token: string | null) {
    this.authToken = token;
  }

  public setMockMode(enabled: boolean) {
    this.config.useMock = enabled;
  }

  public isMockMode(): boolean {
    return this.config.useMock;
  }

  public async get<T>(endpoint: string, mockFallback?: () => Promise<T>): Promise<T> {
    if (this.config.useMock && mockFallback) {
      await new Promise((resolve) => setTimeout(resolve, 250));
      return mockFallback();
    }

    try {
      return await this.request<T>('GET', endpoint);
    } catch (err) {
      if (mockFallback) {
        console.warn(`[ApiClient] Live GET ${endpoint} unavailable, using fallback:`, err);
        return mockFallback();
      }
      throw err;
    }
  }

  public async post<T>(
    endpoint: string,
    body: any,
    mockFallback?: () => Promise<T>
  ): Promise<T> {
    if (this.config.useMock && mockFallback) {
      await new Promise((resolve) => setTimeout(resolve, 350));
      return mockFallback();
    }

    try {
      return await this.request<T>('POST', endpoint, body);
    } catch (err) {
      if (mockFallback) {
        console.warn(`[ApiClient] Live POST ${endpoint} unavailable, using fallback:`, err);
        return mockFallback();
      }
      throw err;
    }
  }

  private async request<T>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    endpoint: string,
    body?: any
  ): Promise<T> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeoutMs);

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-App-Version': '1.0.0',
    };

    if (this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`;
    }

    try {
      const response = await fetch(`${this.config.baseUrl}${endpoint}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData: ApiError = await response.json().catch(() => ({
          code: 'HTTP_ERROR',
          message: `Request failed with status ${response.status}`,
        }));
        throw errorData;
      }

      const json: ApiResponse<T> = await response.json();
      return json.data;
    } catch (err: any) {
      clearTimeout(timeoutId);
      if (err.name === 'AbortError') {
        throw { code: 'TIMEOUT', message: 'The request timed out. Please try again.' };
      }
      throw err;
    }
  }
}

export const apiClient = new ApiClient();
