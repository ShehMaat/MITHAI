import { io, Socket } from 'socket.io-client';

const SOCKET_URL = process.env.EXPO_PUBLIC_API_URL
  ? process.env.EXPO_PUBLIC_API_URL.replace('/api/v1', '')
  : 'http://192.168.1.10:5000';

class SocketService {
  private socket: Socket | null = null;

  public connect(): Socket {
    if (!this.socket) {
      this.socket = io(SOCKET_URL, {
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 10,
        reconnectionDelay: 1000,
      });

      this.socket.on('connect', () => {
        console.log('🔌 [SocketService] Connected to live server:', this.socket?.id);
      });

      this.socket.on('disconnect', (reason) => {
        console.log('🔌 [SocketService] Disconnected:', reason);
      });
    }
    return this.socket;
  }

  public joinOrder(orderId: string) {
    const s = this.connect();
    s.emit('join_order', orderId);
    console.log('🔌 [SocketService] Requested room join for order:', orderId);
  }

  public onOrderStatusUpdate(
    callback: (data: { orderId: string; status: string; orderData?: any }) => void
  ) {
    const s = this.connect();
    s.on('order:status_updated', callback);
    s.on('order:updated', callback);
  }

  public offOrderStatusUpdate(callback: (data: any) => void) {
    if (this.socket) {
      this.socket.off('order:status_updated', callback);
      this.socket.off('order:updated', callback);
    }
  }

  public disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
}

export const socketService = new SocketService();
