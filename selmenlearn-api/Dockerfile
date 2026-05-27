FROM node:20-slim AS base
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

# Production runner (Debian slim — no Alpine musl/OpenSSL mismatch)
FROM node:20-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

COPY --from=builder /app/dist         ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma       ./prisma
COPY --from=builder /app/package.json ./

EXPOSE 4000

CMD ["sh", "-c", "npx prisma db push --skip-generate && node dist/index.js 2>&1 || (echo \"=== NODE CRASHED exit=$? ===\"; exit 1)"]
