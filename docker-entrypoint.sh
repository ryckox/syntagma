#!/bin/sh
set -e

echo "🚀 Starting Syntagma Deployment Setup..."

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Create necessary directories with proper permissions
create_directories() {
    echo "📁 Creating necessary directories..."
    
    mkdir -p /app/data
    mkdir -p /app/uploads
    mkdir -p /app/logs
    mkdir -p /app/backups
    mkdir -p /app/backend/database/migrations
    
    # Set permissions
    chown -R node:node /app/data
    chown -R node:node /app/uploads
    chown -R node:node /app/logs
    chown -R node:node /app/backups
    chown -R node:node /app/backend
    
    echo "✅ Directories created and permissions set"
}

# Database setup and migration
setup_database() {
    echo "🗄️ Setting up database..."
    cd /app/backend
    
    # Check if this is a first-time setup
    if [ ! -f "/app/data/syntagma.db" ]; then
        echo "🆕 First-time setup detected - no existing database found"
        
        # Run migrations (this will create the database)
        echo "🔄 Running initial database migrations..."
        node -e "import('./database/migrator.js').then(m => m.runMigrations().then(success => { if (!success) process.exit(1); }))"
        
        # Check if we should seed with demo data
        if [ "$SEED_DEMO_DATA" = "true" ]; then
            echo "🌱 Seeding demo data..."
            node database/seed.js
        fi
        
        echo "✅ Database initialized successfully"
    else
        echo "📊 Existing database found - checking for updates..."
        
        # Always create backup before any potential migrations
        echo "📦 Creating safety backup before checking migrations..."
        node -e "import('./database/migrator.js').then(m => m.createBackup())"
        
        # Run any pending migrations
        echo "🔄 Checking and running pending migrations..."
        node -e "import('./database/migrator.js').then(m => m.runMigrations().then(success => { if (!success) process.exit(1); }))"
        
        echo "✅ Database updated successfully"
    fi
}

# Health check before starting
health_check() {
    echo "🔍 Running pre-startup health check..."
    
    # Check if database file exists and is accessible
    if [ -f "/app/data/syntagma.db" ]; then
        echo "✅ Database file accessible"
    else
        echo "❌ Database file not found after setup"
        exit 1
    fi
    
    # Check if node modules are installed
    if [ -d "/app/backend/node_modules" ]; then
        echo "✅ Node modules available"
    else
        echo "❌ Node modules not found"
        exit 1
    fi
}

# Main setup process
main() {
    create_directories
    setup_database
    health_check
    
    echo "🎉 Setup complete! Starting application..."
    echo "📝 Database location: /app/data/syntagma.db"
    echo "📦 Backups location: /app/backups/"
    echo "📋 Logs location: /app/logs/"
    
    # Start the application
    exec "$@"
}

# Run main function
main
