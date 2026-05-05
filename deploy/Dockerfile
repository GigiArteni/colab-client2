# syntax=docker/dockerfile:1.7
#
# Static PWA build for colab-client2 (Quasar 2 + Vite + TypeScript).
# Env vars are compile-time: read by quasar.config.ts `build.env` → baked into bundle.

# ---------- Stage 1: build ----------
FROM node:22-alpine AS build

ARG API_URL
ARG APP_PUSHER_APP_KEY
ARG APP_PUSHER_HOST
ARG APP_PUSHER_PORT
ARG APP_PUSHER_SCHEME
ARG APP_PUSHER_AUTH_URL

ENV API_URL=$API_URL \
    APP_PUSHER_APP_KEY=$APP_PUSHER_APP_KEY \
    APP_PUSHER_HOST=$APP_PUSHER_HOST \
    APP_PUSHER_PORT=$APP_PUSHER_PORT \
    APP_PUSHER_SCHEME=$APP_PUSHER_SCHEME \
    APP_PUSHER_AUTH_URL=$APP_PUSHER_AUTH_URL \
    NODE_ENV=production

WORKDIR /app

COPY package*.json ./
RUN --mount=type=cache,target=/root/.npm \
    npm ci --no-audit --no-fund

COPY . .

RUN test -n "$API_URL"             || (echo "API_URL is required" && exit 1)
RUN test -n "$APP_PUSHER_APP_KEY"  || (echo "APP_PUSHER_APP_KEY is required" && exit 1)

RUN npm run build

# ---------- Stage 2: runtime (Caddy) ----------
FROM caddy:2-alpine AS runtime

COPY --from=build /app/dist/spa /srv
COPY deploy/Caddyfile /etc/caddy/Caddyfile

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD wget -qO- http://127.0.0.1/ >/dev/null 2>&1 || exit 1
