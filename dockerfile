# Stage 1: Build the application
FROM node:14-alpine as builder

WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the application
RUN npm run build --force

# Stage 2: Serve the application from Nginx
FROM nginx

# Remove default Nginx website
RUN rm -rf /usr/share/nginx/html/*

# Copy built app to Nginx serving directory
COPY --from=builder /app/build /usr/share/nginx/html


# Expose port 80
EXPOSE 80

# Start Nginx in foreground
CMD ["nginx", "-g", "daemon off;"]
