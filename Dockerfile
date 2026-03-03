# ============================================
# Stage 1: Install dependencies
# ============================================
FROM node:22-alpine AS deps

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm ci --no-audit --no-fund

# ============================================
# Stage 2: Build Next.js application
# ============================================
FROM node:22-alpine AS builder

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build-time env vars (NEXT_PUBLIC_* are inlined into the JS bundle)
ARG NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
ARG NEXT_PUBLIC_MEDUSA_RETAIL_PUBLISHABLE_KEY
ARG NEXT_PUBLIC_MEDUSA_PROFESSIONAL_PUBLISHABLE_KEY
ARG NEXT_PUBLIC_BASE_URL
ARG NEXT_PUBLIC_DEFAULT_REGION=ca
ARG NEXT_PUBLIC_STRIPE_KEY
ARG NEXT_PUBLIC_TURNSTILE_SITE_KEY
ARG MEDUSA_BACKEND_URL

ENV NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=$NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
ENV NEXT_PUBLIC_MEDUSA_RETAIL_PUBLISHABLE_KEY=$NEXT_PUBLIC_MEDUSA_RETAIL_PUBLISHABLE_KEY
ENV NEXT_PUBLIC_MEDUSA_PROFESSIONAL_PUBLISHABLE_KEY=$NEXT_PUBLIC_MEDUSA_PROFESSIONAL_PUBLISHABLE_KEY
ENV NEXT_PUBLIC_BASE_URL=$NEXT_PUBLIC_BASE_URL
ENV NEXT_PUBLIC_DEFAULT_REGION=$NEXT_PUBLIC_DEFAULT_REGION
ENV NEXT_PUBLIC_STRIPE_KEY=$NEXT_PUBLIC_STRIPE_KEY
ENV NEXT_PUBLIC_TURNSTILE_SITE_KEY=$NEXT_PUBLIC_TURNSTILE_SITE_KEY
ENV MEDUSA_BACKEND_URL=$MEDUSA_BACKEND_URL

RUN npm run build

# ============================================
# Stage 3: Production runtime
# ============================================
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8000
ENV HOSTNAME=0.0.0.0

RUN addgroup --system --gid 1001 nextjs && \
    adduser --system --uid 1001 nextjs

# Copy public assets
COPY --from=builder --chown=nextjs:nextjs /app/public ./public

# Prepare .next directory with correct permissions
RUN mkdir .next && chown nextjs:nextjs .next

# Copy standalone output (produced by output: "standalone" in next.config.js)
COPY --from=builder --chown=nextjs:nextjs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nextjs /app/.next/static ./.next/static

USER nextjs

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://127.0.0.1:8000/api/health || exit 1

CMD ["node", "server.js"]
