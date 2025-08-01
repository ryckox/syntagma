#!/bin/sh
set -e

echo "🚀 Starting Syntagma Deployment Setup..."

# Create necessary directories
mkdir -p /app/data
mkdir -p /app/uploads
mkdir -p /app/logs

# Set permissions
chown -R node:node /app/data
chown -R node:node /app/uploads
chown -R node:node /app/logs

echo "📁 Directories created and permissions set"

# Check if database exists, if not run initialization
if [ ! -f "/app/data/syntagma.db" ]; then
    echo "🗄️ Database not found. Running first-time setup..."
    cd /app/backend
    node database/migrate.js
    
    # Check if we should seed with demo data
    if [ "$SEED_DEMO_DATA" = "true" ]; then
        echo "🌱 Seeding demo data..."
        node database/seed.js
    fi
    
    echo "✅ Database initialized successfully"
else
    echo "✅ Database found, skipping initialization"
fi

# Run any pending migrations
echo "🔄 Checking for database updates..."
cd /app/backend
node database/migrate.js

echo "🎉 Setup complete! Starting application..."

# Start the application
exec "$@"
