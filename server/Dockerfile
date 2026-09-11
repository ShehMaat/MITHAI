# ==========================================
# Gaurav Dairy - Backend Dockerfile
# Multi-stage production build (Node 22 Alpine)
# ==========================================

# Stage 1: Build & Compile
FROM node:22-alpine AS builder

WORKDIR /app

# Install build dependencies
COPY package*.json ./
COPY prisma ./prisma/

RUN npm ci

# Copy source code
COPY tsconfig.json ./
COPY src ./src/

# Compile TypeScript & Generate Prisma Client
RUN npm run build
RUN npx prisma generate

# Stage 2: Production Runtime
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000
ENV DATABASE_URL="file:./prisma/dev.db"

# Install curl for health check
RUN apk add --no-cache curl

# Copy production artifacts
COPY package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

# Create volume for database persistence
VOLUME ["/app/prisma"]

EXPOSE 5000

# Health check probe
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:5000/health || exit 1

CMD ["node", "dist/server.js"]
