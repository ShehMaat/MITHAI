import { apiClient } from './apiClient';

export interface UserSession {
  id: string;
  name: string;
  phone: string;
  points: number;
  tier: string;
  createdAt: string;
}

export class AuthService {
  public async sendOtp(phone: string): Promise<{ message: string; demoOtp: string }> {
    return apiClient.post<{ message: string; demoOtp: string }>(
      '/auth/send-otp',
      { phone },
      async () => ({
        message: `OTP sent successfully to +91 ${phone}`,
        demoOtp: '4920',
      })
    );
  }

  public async verifyOtp(
    phone: string,
    otp: string,
    name?: string
  ): Promise<{ user: UserSession; token: string }> {
    return apiClient.post<{ user: UserSession; token: string }>(
      '/auth/verify-otp',
      { phone, otp, name },
      async () => ({
        user: {
          id: 'usr-98765',
          name: name || 'Gaurav Jain',
          phone,
          points: 450,
          tier: 'Gold Club Connoisseur',
          createdAt: new Date().toISOString(),
        },
        token: `mock_token_${Date.now()}`,
      })
    );
  }
}

export const authService = new AuthService();
