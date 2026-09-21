# syntax=docker/dockerfile:1

FROM node:22-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate
RUN apk add --no-cache libc6-compat openssl
RUN pnpm config set store-dir /pnpm/store
RUN pnpm config set fetch-retries 5
RUN pnpm config set fetch-retry-maxtimeout 120000
RUN pnpm config set fetch-timeout 60000

# Stage 1: Prune monorepo for api
FROM base AS pruner
WORKDIR /app
RUN npm install -g turbo
COPY . .
RUN turbo prune api --docker

# Stage 2: Install dependencies (without running postinstall scripts yet)
FROM base AS installer
WORKDIR /app
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile --ignore-scripts

# Stage 3: Build api app & dependent packages
FROM base AS builder
WORKDIR /app
COPY --from=installer /app/ .
COPY --from=pruner /app/out/full/ .
COPY turbo.json turbo.json

ENV NODE_ENV=production
# Generate Prisma client now that schema.prisma is present in the build stage
RUN pnpm --filter @repo/database run db:generate
RUN npx turbo run build --filter=api

# Stage 4: Production runner
FROM node:22-alpine AS runner
WORKDIR /app

RUN apk add --no-cache libc6-compat openssl

ENV NODE_ENV=production
ENV PORT=3000

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 apinode

# Copy root node_modules and built packages/apps
COPY --from=builder --chown=apinode:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=apinode:nodejs /app/packages ./packages
COPY --from=builder --chown=apinode:nodejs /app/apps/api ./apps/api
COPY --from=builder --chown=apinode:nodejs /app/package.json ./package.json

USER apinode
WORKDIR /app/apps/api
EXPOSE 3000

CMD ["node", "dist/server.js"]
