# ════════════════════════════════════════════════
#  Cyber Dreams – Dockerfile
#  Node.js 20 LTS (Alpine) – production image
# ════════════════════════════════════════════════

# ── Stage 1: install dependencies ───────────────
FROM node:20-alpine AS deps

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# ── Stage 2: final image ─────────────────────────
FROM node:20-alpine AS runner

# Non-root user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app

# Copy installed modules from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy application source
COPY . .

# Ensure the media/uploads folder exists and is writable
RUN mkdir -p media && chown -R appuser:appgroup /app

USER appuser

# Expose the app port (matches PORT env var)
EXPOSE 3000

# Healthcheck – calls the /api/health endpoint
HEALTHCHECK --interval=30s --timeout=10s --start-period=20s --retries=3 \
  CMD wget -qO- http://localhost:3000/api/health || exit 1

CMD ["node", "server.js"]
