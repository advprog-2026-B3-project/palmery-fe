FROM node:22-alpine AS deps

WORKDIR /app
RUN corepack enable
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

FROM node:22-alpine AS builder

WORKDIR /app
RUN corepack enable
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ARG NEXT_PUBLIC_MANAGE_API_BASE_URL=http://localhost:8081
ARG NEXT_PUBLIC_PAYMENT_API_BASE_URL=http://localhost:8082
ENV NEXT_PUBLIC_MANAGE_API_BASE_URL=${NEXT_PUBLIC_MANAGE_API_BASE_URL}
ENV NEXT_PUBLIC_PAYMENT_API_BASE_URL=${NEXT_PUBLIC_PAYMENT_API_BASE_URL}
ENV NEXT_TELEMETRY_DISABLED=1
RUN pnpm build

FROM node:22-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
EXPOSE 3000
CMD ["node", "server.js"]
