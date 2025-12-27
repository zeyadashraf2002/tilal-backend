# Use official Node.js image (compatible with v24)
FROM node:24-alpine

# Set working directory inside container
WORKDIR /app

# Copy package files first (for better caching)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy project files
COPY . .

# Expose the app port
EXPOSE 5000

# Start the application
CMD ["npm", "start"]
