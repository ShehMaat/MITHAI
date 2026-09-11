import http from 'http';

/**
 * 🚀 QA Test Runner for Gaurav Bhai Ki Mithai (Backend REST API)
 * Covers 35+ assertions across: Pricing, Security, Logic Parity, Integrations
 */

const API_BASE = 'http://localhost:5000/api/v1';

async function fetchJSON(endpoint, options = {}) {
  return new Promise((resolve, reject) => {
    const req = http.request(API_BASE + endpoint, {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });
    
    req.on('error', reject);
    if (options.body) req.write(JSON.stringify(options.body));
    req.end();
  });
}

const tests = [];
let passed = 0;
let failed = 0;

function assertEqual(testName, actual, expected) {
  if (actual === expected) {
    passed++;
    console.log(`✅ [PASS] ${testName}`);
  } else {
    failed++;
    console.error(`❌ [FAIL] ${testName}`);
    console.error(`   Expected: ${expected}`);
    console.error(`   Actual:   ${actual}`);
  }
}

function assertTruthy(testName, condition) {
  if (condition) {
    passed++;
    console.log(`✅ [PASS] ${testName}`);
  } else {
    failed++;
    console.error(`❌ [FAIL] ${testName}`);
  }
}

async function runTestSuite() {
  console.log('🧪 Starting Gaurav Bhai Ki Mithai Automated QA Suite...\n');

  try {
    // 1. Health & Core Routes
    let res = await fetchJSON('/products');
    assertEqual('GET /products returns 200', res.status, 200);
    assertTruthy('Products list has items', Array.isArray(res.data.data));
    
    res = await fetchJSON('/slots');
    assertTruthy('GET /slots returns dynamic dates', res.data.data.dates.length >= 2);

    // 2. Auth, OTP & Role Segregation
    res = await fetchJSON('/auth/send-otp', { method: 'POST', body: { phone: '9876543210' } });
    assertEqual('POST /auth/send-otp returns 200', res.status, 200);
    assertTruthy('OTP contains success true', res.data.success);

    // Customer OTP Verification
    res = await fetchJSON('/auth/verify-otp', { method: 'POST', body: { phone: '9876543210', otp: '4920' } });
    assertEqual('POST /auth/verify-otp handles demo code', res.status, 200);
    assertTruthy('Login returns user token', !!res.data.data.token);
    assertEqual('Customer phone 9876543210 assigned customer role', res.data.data.role, 'customer');

    // Admin Role Segregation Test (6262750616)
    const adminRes = await fetchJSON('/auth/verify-otp', { method: 'POST', body: { phone: '6262750616', otp: '4920' } });
    assertEqual('Admin login 6262750616 returns 200', adminRes.status, 200);
    assertEqual('Admin phone 6262750616 assigned admin role', adminRes.data.data.role, 'admin');
    assertEqual('Admin user object has admin role', adminRes.data.data.user.role, 'admin');

    // Delivery Partner Role Segregation Test (9993393853)
    const riderRes = await fetchJSON('/auth/verify-otp', { method: 'POST', body: { phone: '9993393853', otp: '4920' } });
    assertEqual('Rider login 9993393853 returns 200', riderRes.status, 200);
    assertEqual('Rider phone 9993393853 assigned rider role', riderRes.data.data.role, 'rider');
    assertEqual('Rider user object has rider role', riderRes.data.data.user.role, 'rider');

    // New Registration Role Default Test (Random Customer)
    const newCustRes = await fetchJSON('/auth/verify-otp', { method: 'POST', body: { phone: '9123456789', otp: '4920' } });
    assertEqual('New registration returns 200', newCustRes.status, 200);
    assertEqual('New registration assigned customer role', newCustRes.data.data.role, 'customer');

    // Profile Resolution from Token Test (/auth/me)
    const meAdminRes = await fetchJSON('/auth/me', {
      headers: { Authorization: `Bearer ${adminRes.data.data.token}` }
    });
    assertEqual('GET /auth/me returns admin user for admin token', meAdminRes.data.data.role, 'admin');
    assertEqual('GET /auth/me returns 6262750616 phone', meAdminRes.data.data.phone, '6262750616');

    // 3. Logic Parity & Orders
    // Empty Cart Order (Defect #1 Test)
    res = await fetchJSON('/orders', {
      method: 'POST',
      body: { items: [], fulfillmentMode: 'delivery', hasGiftWrap: true }
    });
    assertEqual('Empty cart creates order', res.status, 201);
    const emptyOrder = res.data.data;
    assertEqual('Empty cart itemTotal is 0', emptyOrder.itemTotal, 0);
    assertEqual('Empty cart packagingFee is 0 (was 35)', emptyOrder.packagingFee, 0);
    assertEqual('Empty cart deliveryFee is 0 (was 50)', emptyOrder.deliveryFee, 0);
    assertEqual('Empty cart grandTotal is 0', emptyOrder.grandTotal, 0);

    // Valid Cart Pricing Test
    res = await fetchJSON('/orders', {
      method: 'POST',
      body: { 
        items: [{ price: 500, quantity: 1 }], 
        fulfillmentMode: 'delivery', 
        hasGiftWrap: false 
      }
    });
    const stdOrder = res.data.data;
    assertEqual('Sub-1000 cart delivery fee is 40', stdOrder.deliveryFee, 40);
    assertEqual('Standard packaging fee is 15', stdOrder.packagingFee, 15);
    assertEqual('GST tax calculation is 5% (25)', stdOrder.tax, 25);
    assertEqual('Grand Total calculation', stdOrder.grandTotal, 500 + 40 + 15 + 25);

    // High Value Delivery Fee Waiver
    res = await fetchJSON('/orders', {
      method: 'POST',
      body: { items: [{ price: 1200, quantity: 1 }], fulfillmentMode: 'delivery' }
    });
    assertEqual('>=1000 delivery fee is waived (0)', res.data.data.deliveryFee, 0);

    // Pickup Delivery Fee Waiver
    res = await fetchJSON('/orders', {
      method: 'POST',
      body: { items: [{ price: 300, quantity: 1 }], fulfillmentMode: 'pickup' }
    });
    assertEqual('Pickup delivery fee is 0', res.data.data.deliveryFee, 0);

    // Coupon Discount Capping
    res = await fetchJSON('/orders', {
      method: 'POST',
      body: { items: [{ price: 400, quantity: 1 }], couponCode: 'GOLD100' } // Suppose coupon gives 500
    });
    assertTruthy('Grand Total never negative', res.data.data.grandTotal >= 0);

    // Dynamic placedAt Date
    assertTruthy('Order has valid placedAt string', !!stdOrder.placedAt && stdOrder.placedAt !== '5:15 PM');

    // 4. Payment Gateway Safety
    res = await fetchJSON('/payments/verify', {
      method: 'POST',
      body: { razorpay_payment_id: null }
    });
    assertEqual('Payment signature missing ID guard', res.status, 400);

    res = await fetchJSON('/payments/verify', {
      method: 'POST',
      body: { razorpay_payment_id: 'sim_12345' }
    });
    assertEqual('Simulation mode verifies valid sim_ id', res.status, 200);

    // 5. Payment Webhook Reconciliations & Idempotency
    // Create an order for webhook testing
    res = await fetchJSON('/orders', {
      method: 'POST',
      body: { items: [{ price: 250, quantity: 1 }], fulfillmentMode: 'pickup' }
    });
    const webhookTestOrder = res.data.data;
    assertEqual('Order created for webhook test', res.status, 201);
    assertEqual('Initial order payment status is Pending', webhookTestOrder.paymentStatus, 'Pending');

    // Fire payment.captured webhook
    const testEventId = `evt_${Date.now()}`;
    res = await fetchJSON('/payments/webhook', {
      method: 'POST',
      headers: { 'x-razorpay-event-id': testEventId },
      body: {
        event: 'payment.captured',
        payload: {
          payment: {
            entity: {
              id: 'pay_webhook_test_999',
              notes: { orderId: webhookTestOrder.orderId }
            }
          }
        }
      }
    });
    assertEqual('Webhook payment.captured returns 200', res.status, 200);
    assertTruthy('Webhook acknowledged receipt', res.data.data?.received === true);

    // Verify order status was automatically reconciled
    res = await fetchJSON(`/orders/${encodeURIComponent(webhookTestOrder.orderId)}`);
    assertEqual('Reconciled order found', res.status, 200);
    assertEqual('Order status transitioned to kitchen', res.data.data.status, 'kitchen');
    assertEqual('Order paymentStatus transitioned to Paid', res.data.data.paymentStatus, 'Paid');
    assertEqual('Order paymentId captured', res.data.data.paymentId, 'pay_webhook_test_999');

    // Verify Webhook Idempotency (Duplicate Event Handling)
    res = await fetchJSON('/payments/webhook', {
      method: 'POST',
      headers: { 'x-razorpay-event-id': testEventId },
      body: {
        event: 'payment.captured',
        payload: {
          payment: {
            entity: {
              id: 'pay_webhook_test_999',
              notes: { orderId: webhookTestOrder.orderId }
            }
          }
        }
      }
    });
    assertEqual('Duplicate webhook acknowledged with 200', res.status, 200);
    assertEqual('Duplicate webhook flagged as ALREADY_PROCESSED', res.data.idempotency, 'ALREADY_PROCESSED');

    // 6. Notifications & Communication (Phase 11)
    res = await fetchJSON('/notifications');
    assertEqual('GET /notifications returns 200', res.status, 200);
    assertTruthy('Notifications list is an array', Array.isArray(res.data.data));

    // Send targeted notification
    res = await fetchJSON('/notifications/send', {
      method: 'POST',
      body: {
        title: '🎉 Order Ready for Pickup',
        body: 'Your sweets are packaged and waiting at counter.',
        type: 'order',
        orderId: webhookTestOrder.orderId,
        targetPhone: '9876543210',
      },
    });
    assertEqual('POST /notifications/send returns 201', res.status, 201);
    const sentNotif = res.data.data;
    assertEqual('Created notification has correct title', sentNotif.title, '🎉 Order Ready for Pickup');
    assertEqual('Created notification initially unread', sentNotif.read, false);

    // Mark notification as read
    res = await fetchJSON(`/notifications/${sentNotif.id}/read`, { method: 'PATCH' });
    assertEqual('PATCH /notifications/:id/read returns 200', res.status, 200);
    assertEqual('Notification marked as read', res.data.data.read, true);

    // 7. Sales & Operational Analytics (Phase 8 & 15)
    res = await fetchJSON('/analytics/summary');
    assertEqual('GET /analytics/summary returns 200', res.status, 200);
    assertTruthy('Analytics has totalRevenue > 0', res.data.data?.totalRevenue > 0);
    assertTruthy('Analytics has totalOrders > 0', res.data.data?.totalOrders > 0);
    assertTruthy('Analytics has averageOrderValue > 0', res.data.data?.averageOrderValue > 0);
    assertTruthy('Analytics has valid fulfillment percentages', res.data.data?.fulfillment?.pickupPercentage >= 0);
    assertTruthy('Analytics has payment methods breakdown', !!res.data.data?.paymentMethods?.UPI);
    assertTruthy('Analytics has topSweets leaderboard', res.data.data?.topSweets?.length > 0);

    console.log(`\n🎉 QA Test Execution Complete!`);
    console.log(`Passed: ${passed} | Failed: ${failed}`);
    if (failed > 0) process.exit(1);
    process.exit(0);
  } catch (err) {
    console.error('Test Suite Exception:', err);
    process.exit(1);
  }
}

runTestSuite();
