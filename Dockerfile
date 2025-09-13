# --- Build Stage ---
FROM node:20-alpine AS builder
WORKDIR /app

# Install build tools for native dependencies
RUN apk add --no-cache python3 g++ make

# Copy only package files and install all dependencies
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

# Build Nuxt app
RUN npm run build

# --- Production Stage ---
FROM node:20-alpine AS runner
WORKDIR /app

# Install only production dependencies (slimmer)
COPY package*.json ./
RUN npm ci --production --ignore-scripts --no-optional

# Copy built Nuxt output
COPY --from=builder /app/.output . 

# Remove unnecessary files to reduce image size
RUN rm -rf /root/.npm /tmp/*

# Expose port
EXPOSE 9006

# Start server
CMD ["node", ".output/server/index.mjs"]
