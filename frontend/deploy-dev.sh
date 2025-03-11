#!/bin/bash

# Frontend Deployment Script for Development Environment
# This script builds and deploys the Next.js frontend to a development environment

# Exit on error
set -e

echo "🚀 Starting frontend deployment to development environment..."

# Set environment variables for development
export NEXT_PUBLIC_API_URL="https://dev-api.bluapt.com/api/v1"
export NEXT_PUBLIC_API_BASE_URL="https://dev-api.bluapt.com"
export NODE_ENV="development"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build the application
echo "🔨 Building the application..."
npm run build

# Create a .env.local file with the environment variables
echo "🔧 Creating environment configuration..."
cat > .env.local << EOL
NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
NEXT_PUBLIC_API_BASE_URL=${NEXT_PUBLIC_API_BASE_URL}
NODE_ENV=${NODE_ENV}
EOL

echo "✅ Environment configuration created successfully."

# Start the application in development mode
echo "🌐 Starting the application..."
npm run start

echo "✅ Frontend deployment to development environment completed successfully!" 