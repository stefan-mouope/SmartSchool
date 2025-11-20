FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

ARG VITE_API_BASE_URL=http://localhost:8000
ARG VITE_REGISTRATION_SERVICE_URL=http://localhost:3000/api
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_REGISTRATION_SERVICE_URL=$VITE_REGISTRATION_SERVICE_URL

COPY . .
RUN npm run build


# --- Serveur frontend sans Nginx ---
FROM node:20-alpine

WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY package*.json ./
RUN npm install --omit=dev

EXPOSE 4173

CMD ["npm", "run", "preview"]
