# Use Node.js 22 Bullseye for maximum compatibility
FROM node:22-bullseye

# Install Python, LaTeX, and essential build tools
# We install texlive-latex-extra and latexmk which are common requirements for RenderCV
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    python3-venv \
    python3-dev \
    build-essential \
    texlive-latex-recommended \
    texlive-fonts-recommended \
    texlive-latex-extra \
    latexmk \
    && rm -rf /var/lib/apt/lists/*

# Install pnpm globally
RUN npm install -g pnpm

# Install RenderCV with full features
# Using python3 -m pip is more robust in some environments
RUN python3 -m pip install --no-cache-dir "rendercv[full]" --break-system-packages

# Verify installations
RUN python3 -m rendercv --version && pnpm --version

# Set working directory
WORKDIR /app

# Copy dependency files first
# Using explicit filenames to prevent any "Reading" issues
COPY package.json pnpm-lock.yaml ./

# Install Node.js dependencies
RUN pnpm install --frozen-lockfile

# Copy the rest of the application
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build the NestJS application
RUN pnpm run build

# Default configuration for production
ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000

# Start command
CMD ["pnpm", "run", "start:prod"]
