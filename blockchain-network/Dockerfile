FROM node:18-alpine

# Install Truffle
RUN npm install -g truffle

# Set working directory
WORKDIR /app

# The command to run by default
CMD ["truffle", "migrate", "--reset", "--network", "hospital"]
