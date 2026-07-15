# syntax=docker/dockerfile:1

##########  1. Dependencies  ##########
FROM node:20-alpine AS deps
WORKDIR /app
# libc compat for some native-ish deps
RUN apk add --no-cache libc6-compat
COPY package.json package-lock.json* ./
# Use npm ci when a lockfile is present, otherwise fall back to npm install
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi

##########  2. Builder  ##########
FROM node:20-alpine AS builder
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

##########  3. Runtime  ##########
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Non-root user for security
RUN addgroup --system --gid 1001 nodejs \
 && adduser --system --uid 1001 nextjs

# Standalone output (server + minimal node_modules)
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Writable uploads directory (mounted as a volume in docker-compose)
RUN mkdir -p /app/uploads && chown -R nextjs:nodejs /app/uploads

USER nextjs
EXPOSE 3000

CMD ["node", "server.js"]
