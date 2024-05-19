# Use the official Node.js 20 image as the base image
FROM node:20

# Set the working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy backend and frontend source code to the working directory
COPY backend ./backend
COPY frontend ./frontend

# Serve frontend static files with backend
RUN mkdir -p backend/public && cp -R frontend/* backend/public/

# Expose the port the app runs on
EXPOSE 3000

# Start the backend server
CMD ["node", "backend/server.js"]
