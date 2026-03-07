# ─── Stage 1: Install dependencies ──────────────────────────────────────────
FROM node:20-alpine AS deps
WORKDIR /app

# Install openssl for Prisma
RUN apk add --no-cache openssl

COPY package.json package-lock.json* ./
RUN npm ci --legacy-peer-deps

# ─── Stage 2: Build ──────────────────────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

RUN apk add --no-cache openssl

# Copy installed node_modules from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma client before building
RUN npx prisma generate

# Build Next.js (outputs to .next/standalone with output: "standalone")
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# ─── Stage 3: Production runner ──────────────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app

RUN apk add --no-cache openssl

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy standalone server bundle
COPY --from=builder /app/.next/standalone ./

# Copy static assets (not included in standalone)
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# Copy Prisma schema + migrations so migrate deploy works at runtime
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
# Copy the project-local Prisma CLI (v5) so the entrypoint doesn't pull npx latest
COPY --from=builder /app/node_modules/prisma ./node_modules/prisma
COPY --from=builder /app/node_modules/.bin/prisma ./node_modules/.bin/prisma

# Entrypoint script
COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# SQLite data directory (mount a volume here for persistence)
RUN mkdir -p /app/data && chown nextjs:nodejs /app/data

USER nextjs

EXPOSE 3000

ENTRYPOINT ["docker-entrypoint.sh"]
