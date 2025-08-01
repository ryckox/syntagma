# Multi-stage Dockerfile für Syntagma
FROM node:18-alpine AS builder

# Frontend Build
WORKDIR /app/frontend
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Backend Setup
FROM node:18-alpine AS backend-deps
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm install --production

# Final Runtime Image
FROM node:18-alpine
WORKDIR /app

# Copy backend
COPY --from=backend-deps /app/backend/node_modules ./backend/node_modules
COPY backend/ ./backend/

# Copy frontend build
COPY --from=builder /app/dist ./frontend/dist

# Create directories
RUN mkdir -p /app/data /app/uploads

# Environment setup
ENV NODE_ENV=production
ENV DB_PATH=/app/data/syntagma.db
ENV UPLOAD_PATH=/app/uploads
ENV PORT=3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node backend/health-check.js || exit 1

EXPOSE 3001

# Startup script
COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["node", "backend/server.js"]
