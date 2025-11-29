# Use Node.js 18 Alpine for smaller image size
ARG NODE_VERSION=22

# Install dependencies only when needed
FROM node:${NODE_VERSION}-alpine AS pruner
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk update && apk add --no-cache libc6-compat

RUN npm install -g turbo

WORKDIR /app

# Copy Everything
COPY . .

# Install pnpm and dependencies
RUN turbo prune auth-service --docker

# Rebuild the source code only when needed
FROM node:${NODE_VERSION}-alpine AS installer

RUN apk update && apk add --no-cache libc6-compat openssl

WORKDIR /app

COPY --from=pruner /app/out/json .

RUN npm ci --omit=dev --ignore-scripts

COPY --from=pruner /app/out/full/apps/auth-service/prisma ./apps/auth-service/prisma

RUN cd apps/auth-service && npx prisma generate

FROM node:${NODE_VERSION}-alpine AS builder

RUN apk update && apk add --no-cache libc6-compat openssl

WORKDIR /app

COPY --from=installer /app/ .

COPY --from=pruner /app/out/full/ .

RUN npm ci

RUN cd apps/auth-service && npx prisma generate

RUN npm run build

# Production image, copy all the files and run nest
FROM node:${NODE_VERSION}-alpine AS runner

RUN apk update && apk add --no-cache libc6-compat curl openssl

WORKDIR /app

RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nestjs

COPY --from=installer --chown=nestjs:nodejs /app/node_modules ./node_modules

COPY --from=builder --chown=nestjs:nodejs /app/apps/auth-service/dist ./dist

COPY --from=builder --chown=nestjs:nodejs /app/package*.json ./

USER nestjs

EXPOSE 3033

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:${AUTH_PORT:-3033}/api/v1/health || exit 1

CMD ["node", "dist/main.js"]
