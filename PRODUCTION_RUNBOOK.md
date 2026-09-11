# Gaurav Dairy — Production Operations Runbook

> **Version:** 1.0.0  
> **Environment:** Staging / Production  
> **Target Audience:** DevOps Engineers, System Administrators, Store Managers, Kitchen Floor Supervisors

---

## 1. System Topology & Architecture

```
                                [ Mobile Clients (iOS / Android) ]
                                                │
                                    HTTPS / WSS (Port 5000)
                                                ▼
                          ┌───────────────────────────────────────────┐
                          │         Nginx / Cloudflare Proxy          │
                          │   (SSL Termination & Rate Limiting)       │
                          └─────────────────────┬─────────────────────┘
                                                │
                                                ▼
     ┌──────────────────────────────────────────────────────────────────────────────────┐
     │                       Docker Container / PM2 Cluster Node                        │
     │                                                                                  │
     │   ┌─────────────────────┐    ┌─────────────────────┐    ┌─────────────────────┐  │
     │   │ Express REST API    │    │ Socket.io Engine    │    │ Auth & RBAC Guard   │  │
     │   │ (/api/v1/*)         │    │ (Room Broadcasts)   │    │ (Store PIN 1984)    │  │
     │   └──────────┬──────────┘    └──────────┬──────────┘    └──────────┬──────────┘  │
     │              └──────────────────────────┼──────────────────────────┘             │
     │                                         ▼                                        │
     │                                 [ Prisma ORM v6 ]                                │
     │                                         │                                        │
     │                                         ▼                                        │
     │                          [ SQLite: /app/prisma/dev.db ]                          │
     │                              (Volume: gbm_db_data)                               │
     └──────────────────────────────────────────────────────────────────────────────────┘
```

### Core Services & Port Bindings
- **Primary Backend API**: Port `5000` (Express + Socket.io)
- **Health Check Endpoint**: `GET http://localhost:5000/health`
- **Root Status Probe**: `GET http://localhost:5000/`
- **Database Engine**: Embedded zero-latency SQLite with Prisma Client

---

## 2. Deployment Procedures

### Option A: Docker Compose (Recommended for Container Platforms)

1. **Build and start services in detached mode:**
   ```bash
   cd server
   docker compose up -d --build
   ```

2. **Verify container health:**
   ```bash
   docker compose ps
   # Inspect automated healthcheck status
   curl -f http://localhost:5000/health
   ```

3. **View live streaming container logs:**
   ```bash
   docker compose logs -f api
   ```

4. **Stop or tear down services:**
   ```bash
   docker compose down
   # Note: Persistent database is preserved in volume 'gbm_db_data'
   ```

---

### Option B: PM2 Cluster Mode (Bare-Metal / Virtual Machines)

1. **Install production dependencies & compile:**
   ```bash
   cd server
   npm ci --production=false
   npm run build
   npx prisma generate
   ```

2. **Start with PM2 ecosystem:**
   ```bash
   pm2 start ecosystem.config.cjs --env production
   pm2 save
   ```

3. **Zero-Downtime Rolling Reload:**
   ```bash
   pm2 reload gbm-backend-api
   ```

4. **Monitor memory & cluster metrics:**
   ```bash
   pm2 monit
   ```

---

### Option C: Mobile Application Release (EAS Build)

1. **Internal QA Testing APK (Android):**
   ```bash
   eas build --profile preview --platform android
   ```

2. **Production App Store & Play Store Bundles:**
   ```bash
   eas build --profile production --platform all
   ```

---

## 3. Database Backup & Disaster Recovery (SOP)

SQLite utilizes a single file (`prisma/dev.db`). The following procedure enables hot snapshots without downtime.

### Automated Hot Backup (Run Hourly via Cron)
```bash
# Snapshot sqlite database using online backup API
sqlite3 server/prisma/dev.db ".backup 'server/backups/dev_$(date +%Y%m%d_%H%M%S).db'"

# Retain last 14 days of hourly backups
find server/backups/ -name "dev_*.db" -type f -mtime +14 -delete
```

### Disaster Recovery Restore Procedure
If database corruption is suspected:
1. **Stop the backend process:**
   ```bash
   docker compose stop api
   # OR: pm2 stop gbm-backend-api
   ```

2. **Verify integrity of backup snapshot:**
   ```bash
   sqlite3 server/backups/dev_TARGET.db "PRAGMA integrity_check;"
   # Output must be: ok
   ```

3. **Swap corrupted database file with verified snapshot:**
   ```bash
   cp server/prisma/dev.db server/prisma/dev.corrupt.$(date +%s)
   cp server/backups/dev_TARGET.db server/prisma/dev.db
   ```

4. **Restart API service & verify health:**
   ```bash
   docker compose start api
   curl -f http://localhost:5000/api/v1/products
   ```

---

## 4. Secrets & Configuration Rotation Guide

All sensitive variables are configured via environment files:

| Variable Name | Production Default / Description | Rotation Guidance |
| :--- | :--- | :--- |
| `DATABASE_URL` | `"file:./prisma/dev.db"` | Zero downtime; path constant. |
| `JWT_SECRET` | 32+ character cryptographically secure hex string | Rotate quarterly. Invalidates active user session tokens; does not erase cart state. |
| `RAZORPAY_KEY_ID` | Production Merchant Key ID | Change during annual bank gateway audit. |
| `RAZORPAY_KEY_SECRET` | Production Merchant Secret | Update synchronously with Razorpay Dashboard. |
| `RAZORPAY_WEBHOOK_SECRET` | Secret configured in Webhook Settings | Rotate when webhook replay issues are suspected. |

### Zero-Downtime Secret Rotation:
1. Update `.env.production` on host server.
2. Trigger graceful zero-downtime cluster reload:
   ```bash
   pm2 reload gbm-backend-api --update-env
   ```

---

## 5. Store Staff Standard Operating Procedures (SOP)

### A. Morning Opening Routine (08:30 AM)
1. **Access Terminal**: Navigate to `/admin` in Chrome / Safari on shop counter tablet.
2. **Authenticate**: Enter Store Manager PIN `1984` into the royal numeric keypad.
3. **Verify Slots**: Check `/slots` capacity for Today & Tomorrow (standard cap: 30 pickup / 20 delivery slots).
4. **Check Inventory**: Review low-stock banners. If any sweet is below 5.0 kg, prepare fresh morning batch and click "+ Restock 5kg".

### B. Counter Pickup & Token Handover
1. Customer presents digital **Royal Pickup Pass (QR Code & Token #)**.
2. Scan QR or type Token Number into Admin Search Bar.
3. Verify matched order details (sweets, weight variants, gift packaging).
4. Click **"Verify & Handover"** to mark order as `delivered`. An acoustic bell chime confirms the transaction and emits live updates to the customer's phone.

### C. Rider Dispatch Procedure
1. Rider arrives at kitchen counter, enters mobile number to authenticate.
2. Staff assigns packed festive boxes to rider.
3. When rider arrives at customer doorstep, customer provides 4-digit **Delivery OTP** (e.g. `4157`).
4. Rider enters OTP into rider terminal to complete delivery.

### D. Evening Reconciliation & Terminal Close (10:00 PM)
1. In `/admin`, review **Total Revenue**, **Orders Placed**, and **Completed Count**.
2. Compare UPI gateway receipts with physical packaging counts.
3. Click the **"Lock"** button in the top operations bar to secure the terminal overnight.

---

## 6. Incident Response & Emergency Escalation Matrix

### Scenario 1: Payment Webhook Latency / Failure
- **Symptom**: Customer paid via UPI, but mobile screen shows `Pending` or `Placed` instead of moving to `Kitchen`.
- **Action**:
  1. Open Razorpay Dashboard -> Transactions -> Search customer phone / amount.
  2. If status is `Captured`, locate Payment ID (`pay_xxx`).
  3. Send reconciliation request or trigger status update via `/admin`:
     ```bash
     curl -X POST http://localhost:5000/api/v1/payments/verify \
       -H "Content-Type: application/json" \
       -d '{"razorpay_payment_id": "pay_xxx", "orderId": "#GBM-xxxxx"}'
     ```
  4. Order automatically moves to `kitchen` and customer receives real-time toast notification.

### Scenario 2: Festive Demand Surge / Kitchen Overload
- **Symptom**: Karigars are backlogged by more than 40 minutes.
- **Action**:
  1. In `/admin`, block upcoming slots or adjust preparation lead-times.
  2. Increase default ETA from 25 mins to 45 mins.

### Scenario 3: Emergency Instant Rollback
- **Symptom**: Uncaught runtime regression after code release.
- **Action**:
  ```bash
  # Option 1: Docker
  docker compose down
  docker tag gbm-backend-api:previous gbm-backend-api:latest
  docker compose up -d

  # Option 2: PM2
  pm2 revert gbm-backend-api
  ```
