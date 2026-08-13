# Use Python 3.12 Bookworm as base to satisfy RenderCV v2.7 requirements
FROM python:3.12-bookworm

# Install Node.js 22, LaTeX, and essential build tools
RUN apt-get update && apt-get install -y \
    curl \
    build-essential \
    texlive-latex-recommended \
    texlive-fonts-recommended \
    texlive-latex-extra \
    latexmk \
    && curl -fsSL https://deb.nodesource.com/setup_22.x | bash - \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*

# Install pnpm globally
RUN npm install -g pnpm

# Install RenderCV with full features (v2.7)
RUN pip install --no-cache-dir "rendercv[full]==2.7"

# Verify installations
RUN python3 -m rendercv --version && node --version && pnpm --version

# Set working directory
WORKDIR /app

# Copy dependency files first
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile --config.enable-pre-post-scripts=true

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
