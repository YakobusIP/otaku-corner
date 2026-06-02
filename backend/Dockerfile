FROM node:22-slim

RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@11.1.1 --activate

COPY package.json pnpm-lock.yaml ./
COPY prisma ./prisma

RUN pnpm install --frozen-lockfile
RUN pnpm exec prisma generate

COPY . .

RUN pnpm run build

ENV NODE_ENV=production
EXPOSE 5000

CMD ["sh", "-c", "pnpm exec prisma migrate deploy && node dist/src/main.js"]
