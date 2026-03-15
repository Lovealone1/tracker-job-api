# Use Node.js 22 Bullseye for maximum compatibility with RenderCV system dependencies
FROM node:22-bullseye

# Install Python 3 and essential build tools
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    python3-venv \
    python3-dev \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Install pnpm globally
RUN npm install -g pnpm

# Install RenderCV with full features (including LaTeX dependencies managed by RenderCV)
# We use --break-system-packages for system-wide installation in a container environment
RUN pip3 install --no-cache-dir "rendercv[full]" --break-system-packages

# Verify RenderCV installation
RUN python3 -m rendercv --version

# Set working directory
WORKDIR /app

# Copy dependency files first for better caching
COPY package.json pnpm-lock.yaml ./

# Install Node.js dependencies
RUN pnpm install --frozen-lockfile

# Copy the rest of the application
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build the NestJS application
RUN pnpm run build

# Default port for Railway or local testing
ENV PORT=3000
EXPOSE 3000

# Start the application in production mode
CMD ["pnpm", "run", "start:prod"]
