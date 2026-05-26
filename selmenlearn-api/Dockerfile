FROM node:20-alpine AS base
WORKDIR /app

# Install dependencies
FROM base AS deps
COPY package.json package-lock.json* ./
RUN npm ci

# Build
FROM deps AS builder
COPY . .
RUN npx prisma generate
RUN npm run build

# Production runner
FROM base AS runner
ENV NODE_ENV=production
# openssl required by Prisma migration engine on Alpine
RUN apk add --no-cache openssl

COPY --from=builder /app/dist         ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma       ./prisma
COPY --from=builder /app/package.json ./

EXPOSE 4000

# Sync DB schema then start — prisma db push is idempotent (safe at every startup)
CMD ["sh", "-c", "npx prisma db push --skip-generate; node dist/index.js"]
