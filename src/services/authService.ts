import { apiClient } from './apiClient';

export interface UserSession {
  id: string;
  name: string;
  phone: string;
  role: 'customer' | 'admin' | 'rider';
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
      async () => {
        const clean = phone.replace(/[^0-9]/g, '').slice(-10);
        let role: 'customer' | 'admin' | 'rider' = 'customer';
        let defaultName = name;
        if (clean === '6262750616') {
          role = 'admin';
          defaultName = defaultName || 'Store Manager (Admin)';
        } else if (clean === '9993393853') {
          role = 'rider';
          defaultName = defaultName || 'Delivery Fleet Partner';
        } else {
          defaultName = defaultName || 'Mithai Connoisseur';
        }

        return {
          user: {
            id: `usr-${clean}`,
            name: defaultName,
            phone: clean,
            role,
            points: 450,
            tier: role === 'admin' ? 'Store Administrator' : role === 'rider' ? 'Fleet Partner' : 'Gold Club Connoisseur',
            createdAt: new Date().toISOString(),
          },
          token: `mock_token_${Date.now()}`,
        };
      }
    );
  }
}

export const authService = new AuthService();
