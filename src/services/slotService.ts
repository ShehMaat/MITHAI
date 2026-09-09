import { apiClient } from './apiClient';
import { SlotOption } from '@/types/api';

export class SlotService {
  public async getAvailableSlots(
    date: string,
    fulfillmentMode: 'delivery' | 'pickup'
  ): Promise<SlotOption[]> {
    return apiClient.get<SlotOption[]>(
      `/slots?date=${encodeURIComponent(date)}&mode=${fulfillmentMode}`,
      async () => [
        {
          id: 'slot-1',
          label: '5:00 PM - 6:00 PM',
          isAvailable: true,
          capacityRemaining: 8,
        },
        {
          id: 'slot-2',
          label: '6:00 PM - 7:00 PM',
          isAvailable: true,
          capacityRemaining: 5,
        },
        {
          id: 'slot-3',
          label: '7:00 PM - 8:00 PM',
          isAvailable: true,
          capacityRemaining: 3,
        },
        {
          id: 'slot-4',
          label: '8:00 PM - 9:00 PM',
          isAvailable: false,
          capacityRemaining: 0,
        },
      ]
    );
  }
}

export const slotService = new SlotService();
