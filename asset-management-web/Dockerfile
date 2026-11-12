# ===== Tahap 1: Build aplikasi React =====
FROM node:22-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

ARG VITE_API_URL=http://localhost:2020/api
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

# ===== Tahap 2: Serve hasil build dengan Nginx =====
FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
