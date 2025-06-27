# Use Bun Alpine for smaller image size
FROM oven/bun:1-alpine as base

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json ./

# Install dependencies
RUN bun install --production

# Development stage
FROM oven/bun:1-alpine as development

WORKDIR /app

# Copy package files
COPY package.json ./

# Install all dependencies (including dev dependencies)
RUN bun install

# Copy source code
COPY . .

# Build TypeScript
RUN bun run build

# Expose port
EXPOSE 3001

# Start development server
CMD ["bun", "run", "dev"]

# Production stage
FROM oven/bun:1-alpine as production

WORKDIR /app

# Copy package files
COPY package.json ./

# Install only production dependencies
RUN bun install --production

# Copy built application from development stage
COPY --from=development /app/dist ./dist

# Expose port
EXPOSE 3001

# Start the application
CMD ["bun", "start"] 