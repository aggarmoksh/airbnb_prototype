# Server Dockerfile (Node.js + Express + Prisma)
# Use Debian-based image for better Prisma/OpenSSL compatibility
FROM node:18-slim AS builder

WORKDIR /app

# Install OpenSSL for Prisma
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm install --legacy-peer-deps

# Generate Prisma Client
RUN npx prisma generate

# Copy source code
COPY . .

# Production stage
FROM node:18-slim

WORKDIR /app

# Install OpenSSL
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

# Copy from builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/src ./src

# Create uploads directory
RUN mkdir -p uploads/avatars uploads/properties

# Expose port
EXPOSE 4000

# Wait for MySQL and run migrations, then start server
CMD ["sh", "-c", "npx prisma migrate deploy && node src/index.js"]

