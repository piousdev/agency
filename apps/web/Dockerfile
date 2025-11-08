# syntax = docker/dockerfile:1

# Base stage for dependencies
FROM node:lts-alpine AS base
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate
WORKDIR /app

# Builder stage - install dependencies and build
FROM base AS builder

# Copy root workspace files
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY packages ./packages

# Copy Web app files
COPY apps/web ./apps/web

# Install all dependencies (including devDependencies for build)
RUN pnpm install --frozen-lockfile

# Build the Next.js app
WORKDIR /app/apps/web

# Build arguments for NEXT_PUBLIC_* environment variables
# These must be set at build time
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}

RUN pnpm build

# Production stage - minimal runtime image
FROM node:lts-alpine AS production

# Install pnpm
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate

# Run as non-root user for security
USER node
WORKDIR /home/node/app

# Copy only standalone output (optimized by Next.js)
COPY --chown=node:node --from=builder /app/apps/web/.next/standalone ./
COPY --chown=node:node --from=builder /app/apps/web/.next/static ./apps/web/.next/static
COPY --chown=node:node --from=builder /app/apps/web/public ./apps/web/public

# Set working directory to web app
WORKDIR /home/node/app/apps/web

# Configure port
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start the application
CMD ["node", "../../server.js"]