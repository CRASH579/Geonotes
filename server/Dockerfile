FROM node:20-alpine AS builder
WORKDIR /usr/src/app

# Install dependencies
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Copy source
COPY . .

# Generate Prisma client (requires schema present in repo)
RUN npx prisma generate

# Build
RUN npm run build

FROM node:20-alpine
WORKDIR /usr/src/app

# Production deps
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Copy build output
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/node_modules ./node_modules

ENV NODE_ENV=production
EXPOSE 3000

CMD ["node", "dist/main.js"]
