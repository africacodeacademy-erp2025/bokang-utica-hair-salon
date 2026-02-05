# =============================
# 1️⃣ Build stage (Vite + React)
# =============================
FROM node:18-alpine AS build

WORKDIR /app

# Install dependencies first (better caching)
COPY package.json package-lock.json ./
RUN npm install

# Copy the rest of the app
COPY . .

# Build the Vite app
RUN npm run build


# =============================
# 2️⃣ Production stage (nginx)
# =============================
FROM nginx:alpine

# Remove default nginx static assets
RUN rm -rf /usr/share/nginx/html/*

# Copy built files from build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Expose nginx port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
