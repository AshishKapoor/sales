FROM node:lts

WORKDIR /app

# Copy package.json and package-lock.json/pnpm-lock.yaml files
COPY package.json pnpm-lock.yaml* ./

# Install pnpm
RUN npm install -g pnpm

# Install dependencies
RUN pnpm install

# Copy the rest of the application (ignore node_modules)
COPY --chown=node:node . .
# Remove any existing node_modules that may have been copied
RUN rm -rf node_modules
# Re-create node_modules with existing packages
RUN pnpm install

# Build the Next.js application
RUN pnpm build

# Expose the port Next.js runs on
EXPOSE 3000

# Start the application
CMD ["pnpm", "dev"]
