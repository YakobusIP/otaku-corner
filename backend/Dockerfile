# Use the official lightweight Node.js 23 image.
FROM node:23-slim

# Install prisma dependencies
RUN apt-get update -y && apt-get install -y openssl

# Create and change to the app directory.
WORKDIR /usr/src/app

# Copy application dependency manifests to the container image.
# A wildcard is used to ensure both package.json AND yarn.lock are copied.
# Copying this separately prevents re-running yarn install on every code change.
COPY package.json yarn.lock tsconfig.json ./

# Run corepack for newest Yarn version and initialize yarn
RUN corepack enable
RUN yarn set version berry

# Install dependencies.
RUN yarn install

# Copy local code to the container image.
COPY src .

# Transpile TypeScript to JavaScript.
RUN yarn build

# Generate prisma client
RUN npx prisma generate

# Expose port
EXPOSE 5000

# Set the environment to production
ENV NODE_ENV production

# Run the web service on container startup.
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/src/server.js"]