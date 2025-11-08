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

# Copy API app files
COPY apps/api ./apps/api

# Install all dependencies (including devDependencies for build)
RUN pnpm install --frozen-lockfile

# Build the API
WORKDIR /app/apps/api
RUN pnpm build

# Production stage - minimal runtime image
FROM node:lts-alpine AS production

# Install pnpm
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate

# Run as non-root user for security
USER node
WORKDIR /home/node/app

# Copy root workspace files
COPY --chown=node:node pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY --chown=node:node packages ./packages

# Copy API package.json
COPY --chown=node:node apps/api/package.json ./apps/api/

# Install production dependencies only
RUN pnpm install --frozen-lockfile --prod --filter @repo/api

# Copy built application
COPY --chown=node:node --from=builder /app/apps/api/dist ./apps/api/dist

# Set working directory to API
WORKDIR /home/node/app/apps/api

# Configure port
ARG PORT=8000
ENV PORT=${PORT}
EXPOSE ${PORT}

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:${PORT}/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start the application
CMD ["node", "dist/index.js"]
