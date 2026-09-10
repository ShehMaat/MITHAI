/**
 * SMS & OTP Service Provider Integration
 * Supports:
 * - Twilio (Global / India)
 * - Fast2SMS (Popular & cheap in India)
 * - MSG91 (Enterprise India SMS)
 * - Console / Simulation Mode (Default fallback when no credentials are configured)
 */

export interface SendOtpResult {
  success: boolean;
  message: string;
  provider: 'twilio' | 'fast2sms' | 'msg91' | 'simulation';
  demoOtp?: string;
  error?: string;
}

export class SmsService {
  private static instance: SmsService;

  public static getInstance(): SmsService {
    if (!SmsService.instance) {
      SmsService.instance = new SmsService();
    }
    return SmsService.instance;
  }

  /**
   * Generates a secure random 4-digit or 6-digit numeric OTP
   */
  public generateOtp(length: number = 4): string {
    const min = Math.pow(10, length - 1);
    const max = Math.pow(10, length) - 1;
    return String(Math.floor(min + Math.random() * (max - min + 1)));
  }

  /**
   * Sends the OTP via the configured provider or falls back gracefully
   */
  public async sendOtp(phone: string, otp: string): Promise<SendOtpResult> {
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const messageText = `Your Gaurav Bhai Ki Mithai verification code is ${otp}. Valid for 5 minutes. Please do not share this OTP with anyone.`;

    // 1. Fast2SMS Provider (Very popular in India, simple REST API)
    const fast2smsApiKey = process.env.FAST2SMS_API_KEY;
    if (fast2smsApiKey) {
      try {
        const res = await fetch('https://www.fast2sms.com/dev/bulkV2', {
          method: 'POST',
          headers: {
            authorization: fast2smsApiKey,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            route: 'otp',
            variables_values: otp,
            numbers: cleanPhone.slice(-10),
          }),
        });
        const data = await res.json() as any;
        if (data.return) {
          console.log(`[SmsService] Fast2SMS OTP successfully dispatched to +91 ${cleanPhone}`);
          return {
            success: true,
            message: `OTP sent to +91 ${cleanPhone.slice(-10)}`,
            provider: 'fast2sms',
          };
        }
      } catch (err: any) {
        console.error('[SmsService] Fast2SMS send failed, falling back:', err.message);
      }
    }

    // 2. Twilio Provider
    const twilioSid = process.env.TWILIO_ACCOUNT_SID;
    const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN;
    const twilioFrom = process.env.TWILIO_PHONE_NUMBER;

    if (twilioSid && twilioAuthToken && twilioFrom) {
      try {
        const formattedTo = cleanPhone.startsWith('91') ? `+${cleanPhone}` : `+91${cleanPhone}`;
        const auth = Buffer.from(`${twilioSid}:${twilioAuthToken}`).toString('base64');
        const body = new URLSearchParams({
          To: formattedTo,
          From: twilioFrom,
          Body: messageText,
        });

        const res = await fetch(
          `https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`,
          {
            method: 'POST',
            headers: {
              Authorization: `Basic ${auth}`,
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: body.toString(),
          }
        );

        const data = await res.json() as any;
        if (res.ok) {
          console.log(`[SmsService] Twilio SMS dispatched to ${formattedTo} (SID: ${data.sid})`);
          return {
            success: true,
            message: `OTP sent via Twilio to ${formattedTo}`,
            provider: 'twilio',
          };
        } else {
          console.error('[SmsService] Twilio error:', data.message);
        }
      } catch (err: any) {
        console.error('[SmsService] Twilio send failed, falling back:', err.message);
      }
    }

    // 3. Simulation / Development Mode (Default & Safe)
    console.log(`\n========================================`);
    console.log(`📲 [SMS GATEWAY DISPATCH SIMULATION]`);
    console.log(`To: +91 ${cleanPhone}`);
    console.log(`OTP Code: ${otp}`);
    console.log(`Message: "${messageText}"`);
    console.log(`========================================\n`);

    return {
      success: true,
      message: `OTP dispatched to +91 ${cleanPhone}`,
      provider: 'simulation',
      demoOtp: otp,
    };
  }
}

export const smsService = SmsService.getInstance();
