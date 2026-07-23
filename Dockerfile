# ============================================================
# 🐳 DOCKERFILE — Multi-Stage Build
# ============================================================
#
# MODULE 3: Docker in CI/CD
#
# A Dockerfile is a recipe for building a container image.
# Think of it as: "Instructions to package your app so it
# runs EXACTLY the same everywhere."
#
# MULTI-STAGE BUILD:
#   Stage 1 (builder): Install deps + compile TypeScript
#   Stage 2 (production): Copy ONLY the compiled JS + prod deps
#
# Why multi-stage?
#   - Smaller image (no devDependencies, no TypeScript source)
#   - More secure (less attack surface)
#   - Faster deployments (smaller = faster to pull)
#
# Size comparison:
#   Single-stage: ~400MB (includes TS, devDeps, source code)
#   Multi-stage:  ~150MB (only compiled JS + prod deps)
#
# ============================================================


# ─── STAGE 1: BUILD ──────────────────────────────────
# This stage installs ALL dependencies and compiles TypeScript.
# It will be THROWN AWAY after we copy the compiled output.
FROM node:22-alpine AS builder
# "node:22-alpine" = Node.js 22 on Alpine Linux
#   - Alpine = tiny Linux distro (~5MB vs ~100MB for Ubuntu)
#   - Always use Alpine for smaller images!
# "AS builder" = give this stage a name so we can reference it later

# Set working directory inside the container
WORKDIR /app
# All subsequent commands run inside /app

# Copy package files FIRST (for better caching)
COPY package.json package-lock.json ./
# WHY COPY THESE FIRST?
# Docker caches each layer. If package.json hasn't changed,
# Docker reuses the cached npm install layer (saves ~1 minute!).
# This is called "layer caching" — a critical optimization.

# Install ALL dependencies (including devDeps for building)
RUN npm ci
# npm ci in Docker = clean, reproducible install from lock file

# Now copy the rest of the source code
COPY tsconfig.json ./
COPY src/ ./src/
# We copy source AFTER npm install so that code changes
# don't invalidate the npm install cache layer.

# Compile TypeScript → JavaScript
RUN npm run build
# Output goes to /app/dist/


# ─── STAGE 2: PRODUCTION ─────────────────────────────
# This is the FINAL image that gets deployed.
# It starts fresh — nothing from Stage 1 exists here
# unless we explicitly COPY it.
FROM node:22-alpine AS production

# Security best practice: don't run as root!
# Create a non-root user for the app
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
# In production, running as root is a MAJOR security risk.
# If an attacker breaks into your app, they'd have root access
# to the entire container. Non-root user limits the damage.

WORKDIR /app

# Copy only production package files
COPY package.json package-lock.json ./

# Install ONLY production dependencies (no devDeps!)
RUN npm ci --only=production
# --only=production = skip devDependencies
# No TypeScript, no ESLint, no Vitest in production image!

# Copy compiled JavaScript from the builder stage
COPY --from=builder /app/dist ./dist
# "--from=builder" = copy from Stage 1 (the builder stage)
# We only take the compiled output, not the source code!

# Change ownership to non-root user
RUN chown -R appuser:appgroup /app

# Switch to non-root user
USER appuser

# Document which port the app uses
EXPOSE 3000
# EXPOSE doesn't actually open the port — it's documentation.
# The actual port mapping happens when running the container.

# Health check — Docker/Kubernetes uses this to verify the container is alive
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1
# --interval=30s  = check every 30 seconds
# --timeout=3s    = wait max 3 seconds for response
# --start-period=5s = give app 5 seconds to start up
# --retries=3     = mark unhealthy after 3 consecutive failures
#
# This is the SAME /health endpoint we built in Module 1!
# Now you see why health endpoints are so important in CI/CD.

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Start the application
CMD ["node", "dist/server.js"]
# CMD = the command that runs when the container starts
# Use array syntax ["cmd", "arg"] (exec form) not string syntax
# Array syntax sends signals properly (important for graceful shutdown)
