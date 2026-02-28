# Tur Paket Hesaplama — Easypanel / Docker
FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

ENV NODE_ENV=production
EXPOSE 3001

# Veritabanı data/ klasöründe; volume ile kalıcı yapılacak
CMD ["node", "server/index.js"]
