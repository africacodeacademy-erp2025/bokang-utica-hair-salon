# =============================
# 1️⃣ Build stage (Vite + React)
# =============================
FROM node:18-alpine AS build

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./
RUN npm install

# Copy environment variables
COPY .env .env

# Copy the rest of the project
COPY . .

# Build the Vite app
RUN npm run build


# =============================
# 2️⃣ Production stage (nginx)
# =============================
FROM nginx:alpine

# Remove default nginx content
RUN rm -rf /usr/share/nginx/html/*

# Copy built files
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
