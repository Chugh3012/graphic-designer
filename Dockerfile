# Stage 1: Install dependencies
FROM node:22-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

# Stage 2: Build the application
FROM node:22-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build

# Stage: download the Litestream binary (static Go binary — runs on Alpine/musl).
FROM alpine:3.20 AS litestream
RUN apk add --no-cache curl \
 && curl -fsSL https://github.com/benbjohnson/litestream/releases/download/v0.5.12/litestream-0.5.12-linux-x86_64.tar.gz \
    | tar -xz -C /usr/local/bin

# Stage 3: Production runner
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# The production app runs `node server.js` and never needs npm. Remove npm,
# npx and corepack — they ship a bundled `node-tar` that Trivy flags for
# CVEs and is pure attack surface in a running container.
RUN rm -rf /usr/local/lib/node_modules/npm /usr/local/bin/npm /usr/local/bin/npx /usr/local/bin/corepack

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Litestream replicates the local SQLite DB to Azure Blob for durability.
COPY --from=litestream /usr/local/bin/litestream /usr/local/bin/litestream
COPY litestream.yml /etc/litestream.yml
COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# SQLite lives on LOCAL disk — never the Azure Files (SMB) mount, which breaks
# SQLite's file locking. Litestream handles durability to Blob instead.
RUN mkdir -p /data && chown nextjs:nodejs /data

COPY --from=builder /app/public ./public

# Set correct permissions for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Copy standalone output
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Litestream restores the DB on boot, then runs `node server.js` and streams writes.
ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]
