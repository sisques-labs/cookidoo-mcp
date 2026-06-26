# syntax=docker/dockerfile:1

FROM node:22-bookworm-slim AS deps
WORKDIR /app

ENV HUSKY=0
RUN corepack enable && corepack prepare pnpm@10.33.0 --activate

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

FROM node:22-bookworm-slim AS builder
WORKDIR /app

ENV HUSKY=0
RUN corepack enable && corepack prepare pnpm@10.33.0 --activate

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN pnpm build

FROM node:22-bookworm-slim AS prod-deps
WORKDIR /app

ENV HUSKY=0
RUN corepack enable && corepack prepare pnpm@10.33.0 --activate

COPY --from=deps /app/node_modules ./node_modules
COPY package.json pnpm-lock.yaml ./
RUN pnpm prune --prod

FROM node:22-bookworm-slim AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
ENV HUSKY=0

COPY --from=prod-deps --chown=node:node /app/node_modules ./node_modules
COPY --from=builder --chown=node:node /app/dist ./dist

USER node
EXPOSE 3000

CMD ["node", "dist/main"]
