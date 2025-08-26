FROM node:20 as build

# Set the working directory
WORKDIR /app

# Copy all
COPY . .

# Install dependencies
RUN npm ci

# Build for production
RUN npm run build

# Use the official Nginx base image
FROM nginx:latest as production

# Set the working directory to the Nginx document root
WORKDIR /usr/share/nginx/html

# Remove the default Nginx welcome page
RUN rm -rf ./*

# Copy the Next.js build output to the container
COPY --from=build /app/out .

# Expose port 80 for web traffic
EXPOSE 80

# Start Nginx when the container starts
CMD ["nginx", "-g", "daemon off;"]
