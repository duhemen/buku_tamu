FROM node:20-alpine
WORKDIR /app
RUN apk add --no-cache openssl
RUN corepack enable
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml* ./
COPY apps/api/package.json apps/api/
COPY packages/shared/package.json packages/shared/
RUN pnpm install --frozen-lockfile=false
COPY . .
RUN pnpm --filter @buku-tamu/api prisma:generate
EXPOSE 3000
CMD ["pnpm", "--filter", "@buku-tamu/api", "dev"]