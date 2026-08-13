###############################################################################
# Stage 1 — Builder: install deps, generate Prisma client, compile NestJS
###############################################################################
FROM python:3.12-slim-bookworm AS builder

# Node.js 22 + toolchain for native modules (bcrypt compiles from source)
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    ca-certificates \
    build-essential \
    && curl -fsSL https://deb.nodesource.com/setup_22.x | bash - \
    && apt-get install -y --no-install-recommends nodejs \
    && rm -rf /var/lib/apt/lists/*

# Install pnpm globally (pinned: pnpm v11 removed onlyBuiltDependencies in favor of allowBuilds)
RUN npm install -g pnpm@11.21.0

# Set working directory
WORKDIR /app

# Copy dependency files first (better layer caching)
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile --config.enable-pre-post-scripts=true

# Copy specific source and config files
COPY src ./src
COPY prisma ./prisma
COPY tsconfig.json tsconfig.build.json nest-cli.json ./

# Generate Prisma client, compile the app, then strip devDependencies
RUN npx prisma generate \
    && pnpm run build \
    && pnpm prune --prod

###############################################################################
# Stage 2 — Runtime: only what the app needs to run
###############################################################################
FROM python:3.12-slim-bookworm

# libstdc++ is required by the Node.js binary; ca-certificates for TLS
RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    libstdc++6 \
    && rm -rf /var/lib/apt/lists/*

# RenderCV v2.7 renders PDFs with Typst (bundled in the pip package).
# No LaTeX/TeX Live needed (~1 GB saved).
RUN pip install --no-cache-dir "rendercv[full]==2.7"

# Copy just the Node.js binary from the builder (~100 MB instead of a full install)
COPY --from=builder /usr/bin/node /usr/local/bin/node

WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV PYTHONUNBUFFERED=1

COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

# Fail the image build early if the runtime is broken
RUN node --version && python -m rendercv --version

EXPOSE 3000
CMD ["node", "dist/src/main"]
