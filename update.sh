#!/bin/bash

# Syntagma Update Script
# This script safely updates the application while preserving data

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP_DIR="$SCRIPT_DIR"
BACKUP_DIR="$APP_DIR/backups"
DATA_DIR="$APP_DIR/data"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

success() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} ✅ $1"
}

warning() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} ⚠️ $1"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} ❌ $1"
}

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -d "backend" ]; then
    error "This doesn't appear to be the Syntagma root directory"
    error "Please run this script from the Syntagma project root"
    exit 1
fi

log "🚀 Starting Syntagma Update Process"

# Create necessary directories
log "📁 Ensuring directories exist..."
mkdir -p "$BACKUP_DIR"
mkdir -p "$DATA_DIR"
mkdir -p "backend/database/migrations"

# Stop running processes (if using PM2 or systemd)
if command -v pm2 &> /dev/null; then
    log "🛑 Stopping PM2 processes..."
    pm2 stop syntagma || true
fi

# Backend dependencies
log "📦 Installing backend dependencies..."
cd backend
npm install --production

# Create backup before any changes
log "📦 Creating backup before update..."
node -e "
import('./database/migrator.js').then(m => 
  m.createBackup().then(() => console.log('Backup completed'))
).catch(err => {
  console.error('Backup failed:', err);
  process.exit(1);
})"

# Run database migrations
log "🔄 Running database migrations..."
node -e "
import('./database/migrator.js').then(m => 
  m.runMigrations().then(success => {
    if (success) {
      console.log('Migrations completed successfully');
    } else {
      console.error('Migration failed');
      process.exit(1);
    }
  })
).catch(err => {
  console.error('Migration error:', err);
  process.exit(1);
})"

# Frontend build
log "🏗️ Building frontend..."
cd ../
npm install
npm run build

# Set proper permissions
log "🔐 Setting file permissions..."
chmod +x backend/start-with-migrations.js
find data -type d -exec chmod 755 {} \; 2>/dev/null || true
find data -type f -exec chmod 644 {} \; 2>/dev/null || true
find backups -type d -exec chmod 755 {} \; 2>/dev/null || true
find backups -type f -exec chmod 644 {} \; 2>/dev/null || true

# Health check
log "🔍 Running health check..."
cd backend
if node health-check.js; then
    success "Health check passed"
else
    error "Health check failed"
    exit 1
fi

# Restart services
if command -v pm2 &> /dev/null; then
    log "🔄 Restarting PM2 processes..."
    pm2 start syntagma || pm2 restart syntagma
    pm2 save
elif command -v systemctl &> /dev/null; then
    log "🔄 Restarting systemd service..."
    sudo systemctl restart syntagma || true
fi

success "🎉 Update completed successfully!"
log "📊 Application should now be running with the latest changes"
log "📦 Backups are stored in: $BACKUP_DIR"
log "🗄️ Database location: $DATA_DIR/syntagma.db"

# Show recent backups
log "📋 Recent backups:"
ls -la "$BACKUP_DIR" | tail -5 || true

exit 0
