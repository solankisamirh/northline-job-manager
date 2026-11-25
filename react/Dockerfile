# ---------- Stage 1: build the static files ----------
FROM node:24-alpine AS build
WORKDIR /app

# Install packages first (cached until package.json or package-lock.json changes)
COPY package.json package-lock.json ./
RUN npm ci

# Copy the code and build. The API address is baked in at build time.
COPY . .
ARG VITE_API_URL=http://localhost:5280
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

# ---------- Stage 2: serve them with nginx ----------
FROM nginx:alpine AS final
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80