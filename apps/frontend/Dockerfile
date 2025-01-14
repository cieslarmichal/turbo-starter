FROM node:22.12.0-alpine AS base

RUN apk update
RUN apk add --no-cache libc6-compat bash

WORKDIR /app

FROM base AS builder

RUN npm i -g turbo@2.3.3

COPY package*.json ./
COPY turbo.json ./
COPY apps/ ./apps
COPY common/ ./common
COPY tsconfig.json ./

RUN turbo prune --scope="@apps/frontend" --docker

FROM base AS installer

COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/package-lock.json ./package-lock.json
COPY tsconfig.json ./

RUN npm ci

COPY --from=builder /app/out/full/ .

RUN npm run build --filter="@apps/frontend"

FROM nginx as static

COPY --from=installer /app/apps/frontend/nginx/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=installer /app/apps/frontend/nginx/.htpasswd /etc/nginx/conf.d/.htpasswd

COPY --from=installer /app/apps/frontend/dist /usr/share/nginx/html
