FROM node:20.11.0-alpine AS base

# Установка рабочей директории
WORKDIR /app

# Копирование package.json и package-lock.json
COPY package*.json ./

# Установка зависимостей
FROM base AS deps
RUN npm ci

# Сборка приложения
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Итоговое приложение
FROM base AS runner
ENV NODE_ENV production

# Копирование собранного приложения
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json


# Запуск приложения
EXPOSE 3006
CMD ["npm", "start"]