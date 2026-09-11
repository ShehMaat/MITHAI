import { io } from 'socket.io-client';
import http from 'http';

const socket = io('http://localhost:5000', {
  transports: ['websocket', 'polling'],
});

socket.on('connect', () => {
  console.log('✅ Connected to WebSocket server, socket ID:', socket.id);

  // 1. Create order
  const createReq = http.request('http://localhost:5000/api/v1/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  }, (res) => {
    let data = '';
    res.on('data', c => data += c);
    res.on('end', () => {
      const order = JSON.parse(data).data;
      console.log('📦 Created test order:', order.orderId);
      socket.emit('join_order', order.orderId);

      // 2. Trigger status update
      const updateReq = http.request(`http://localhost:5000/api/v1/orders/${order.orderId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      updateReq.write(JSON.stringify({ status: 'ready' }));
      updateReq.end();
    });
  });
  createReq.write(JSON.stringify({ items: [{ price: 500, quantity: 1 }] }));
  createReq.end();
});

socket.on('order:status_updated', (data) => {
  console.log('✅ Received live broadcast order:status_updated ->', data);
  socket.disconnect();
  process.exit(0);
});

setTimeout(() => {
  console.error('❌ Socket timeout');
  process.exit(1);
}, 5000);
