# ============================================================
# Buku Tamu API - Production Dockerfile
# ============================================================
FROM node:20-alpine AS base
WORKDIR /app

# Dependencies yang dibutuhkan Prisma + Argon2
RUN apk add --no-cache openssl python3 make g++

RUN corepack enable

# ============================================================
# Stage 1: Install dependencies
# ============================================================
FROM base AS deps

COPY pnpm-workspace.yaml package.json pnpm-lock.yaml* ./
COPY apps/api/package.json apps/api/
COPY packages/shared/package.json packages/shared/
COPY packages/ui/package.json packages/ui/

RUN pnpm install --frozen-lockfile=false

# ============================================================
# Stage 2: Copy source + generate Prisma + build
# ============================================================
FROM deps AS build

COPY . .

# Generate Prisma Client
RUN pnpm --filter @buku-tamu/api prisma:generate

# Build TypeScript -> dist (skip kalau tidak ada script build)
RUN pnpm --filter @buku-tamu/api build 2>/dev/null || echo "No build step, using tsx"

# ============================================================
# Stage 3: Production runtime
# ============================================================
FROM base AS runtime

# Copy node_modules + source dari build stage
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/apps ./apps
COPY --from=build /app/packages ./packages
COPY --from=build /app/package.json /app/pnpm-workspace.yaml ./

WORKDIR /app/apps/api

# Non-root user untuk keamanan
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 && \
    chown -R nodejs:nodejs /app

USER nodejs

EXPOSE 3000

ENV NODE_ENV=production
ENV PORT=3000

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

# Jalankan dengan tsx (karena source code ada di TypeScript)
CMD ["pnpm", "--filter", "@buku-tamu/api", "dev"]