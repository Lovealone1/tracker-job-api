# Use Node.js 22 Bookworm (Debian 12) to get Python 3.11+
FROM node:22-bookworm

# Install Python, LaTeX, and essential build tools
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    python3-venv \
    python3-dev \
    python-is-python3 \
    build-essential \
    texlive-latex-recommended \
    texlive-fonts-recommended \
    texlive-latex-extra \
    latexmk \
    && rm -rf /var/lib/apt/lists/*

# Install pnpm globally
RUN npm install -g pnpm

# Install RenderCV with full features
# Debian 12 requires --break-system-packages or a venv for system-wide pip
RUN python3 -m pip install --no-cache-dir "rendercv[full]" --break-system-packages

# Verify installations
RUN python3 -m rendercv --version && pnpm --version

# Set working directory
WORKDIR /app

# Copy dependency files first
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# Copy specific source and config files
COPY src ./src
COPY prisma ./prisma
COPY tsconfig.json tsconfig.build.json nest-cli.json ./

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
