# syntax=docker/dockerfile:1

FROM node:22-bookworm-slim AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

FROM node:22-bookworm-slim AS build
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1 \
    BUILD_STANDALONE=1
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:22-bookworm-slim AS runner
LABEL org.opencontainers.image.source="https://github.com/ndesv21/linkcliq" \
      org.opencontainers.image.description="LinkCliq: open source link in bio with click analytics and in-app browser escape" \
      org.opencontainers.image.licenses="MIT"
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0 \
    DATABASE_URL=file:/app/data/linkcliq.db

RUN groupadd --system --gid 1001 linkcliq \
 && useradd --system --uid 1001 --gid linkcliq linkcliq \
 && mkdir -p /app/data \
 && chown linkcliq:linkcliq /app/data

COPY --from=build --chown=linkcliq:linkcliq /app/.next/standalone ./
COPY --from=build --chown=linkcliq:linkcliq /app/.next/static ./.next/static
COPY --from=build --chown=linkcliq:linkcliq /app/public ./public
COPY --from=build --chown=linkcliq:linkcliq /app/drizzle ./drizzle
COPY --chown=linkcliq:linkcliq docker-entrypoint.sh ./

USER linkcliq
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:3000/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

ENTRYPOINT ["./docker-entrypoint.sh"]
