# Use the official Bun image
FROM oven/bun:1 as base

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json bun.lockb ./

# Install dependencies
RUN bun install

# Copy source code
COPY . .

# Build arguments for environment variables
ARG NEXT_PUBLIC_SERVER_URL
ENV NEXT_PUBLIC_SERVER_URL=$NEXT_PUBLIC_SERVER_URL

# Build the application
RUN bun run build

# Production stage
FROM oven/bun:1 as production

WORKDIR /app

# Copy package files
COPY package.json bun.lockb ./

# Install only production dependencies
RUN bun install --production

# Copy built application from build stage
COPY --from=base /app/.next ./.next
COPY --from=base /app/public ./public
COPY --from=base /app/next.config.ts ./

# Expose port
EXPOSE 3000

# Start the application
CMD ["bun", "run", "start"] 