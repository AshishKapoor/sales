#!/bin/bash

set -e

# Function to display error messages
error_exit() {
    echo "ERROR: $1" >&2
    exit 1
}

echo "===== Starting Sales Cookbook application ====="
echo "Stopping any existing containers..."
docker compose down || error_exit "Failed to stop existing containers"

echo "Building containers..."
docker compose build --no-cache || error_exit "Failed to build containers"

# Run migrations first
echo "Running database migrations..."
docker compose run --rm migrate || error_exit "Failed to run migrations"

# Start all services
echo "Starting all services..."
docker compose up -d || error_exit "Failed to start services"

echo "Checking container status..."
docker compose ps

echo "===== Application is running! ====="
echo "Access the application at http://localhost"
echo "Backend API available at http://localhost/api/"
echo "Frontend available at http://localhost/"
echo "Run 'docker compose logs -f' to see all container logs"
