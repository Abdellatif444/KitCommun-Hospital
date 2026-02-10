FROM node:18-alpine

# Install Netcat for healthchecks (using Alpine package manager)
RUN apk add --no-cache netcat-openbsd

# Install Truffle
RUN npm install -g truffle

# Set working directory
WORKDIR /app

# Copy project files into container
COPY . .

# Clean verification artifacts
RUN rm -rf build

# Wait for Ganache to be ready, then migrate
CMD ["sh", "-c", "echo 'Waiting for Ganache...'; while ! nc -z ganache 8545; do sleep 1; done; echo 'Ganache is UP!'; truffle migrate --reset --network hospital"]
