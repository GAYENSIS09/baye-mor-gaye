FROM node:22-alpine AS builder

ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
ARG NEXT_PUBLIC_OWNER_NOM
ENV NEXT_PUBLIC_OWNER_NOM=${NEXT_PUBLIC_OWNER_NOM}
ARG NEXT_PUBLIC_OWNER_TITRE
ENV NEXT_PUBLIC_OWNER_TITRE=${NEXT_PUBLIC_OWNER_TITRE}

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
RUN mkdir -p public

EXPOSE 3000

CMD ["node", "server.js"]