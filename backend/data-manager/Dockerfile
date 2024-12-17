# Use an official Node.js image as the base
FROM node:20

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json first for dependency installation
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Copy the rest of your application code
COPY . .

# Expose the port your app runs on (if applicable)
EXPOSE 3000

# Command to run your app
CMD ["node","server.js"]
