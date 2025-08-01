#!/bin/bash

# Syntagma Backup and Restore Utility
# Provides safe backup and restore functionality

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

show_usage() {
    echo "Syntagma Backup and Restore Utility"
    echo ""
    echo "Usage: $0 [command] [options]"
    echo ""
    echo "Commands:"
    echo "  backup              Create a new backup"
    echo "  restore [file]      Restore from backup file"
    echo "  list               List available backups"
    echo "  cleanup [days]     Remove backups older than specified days (default: 30)"
    echo "  verify [file]      Verify backup integrity"
    echo ""
    echo "Examples:"
    echo "  $0 backup"
    echo "  $0 restore backup_2024-01-15T10-30-00-000Z.db"
    echo "  $0 list"
    echo "  $0 cleanup 14"
    echo ""
}

create_backup() {
    log "📦 Creating backup..."
    
    mkdir -p "$BACKUP_DIR"
    
    if [ ! -f "$DATA_DIR/syntagma.db" ]; then
        error "Database file not found at $DATA_DIR/syntagma.db"
        exit 1
    fi
    
    cd backend
    node -e "
    import('./database/migrator.js').then(m => 
      m.createBackup().then(backupPath => {
        if (backupPath) {
          console.log('Backup created:', backupPath);
        } else {
          console.error('Backup failed');
          process.exit(1);
        }
      })
    ).catch(err => {
      console.error('Backup error:', err);
      process.exit(1);
    })"
    
    success "Backup completed successfully"
}

list_backups() {
    log "📋 Available backups:"
    
    if [ ! -d "$BACKUP_DIR" ]; then
        warning "No backup directory found"
        return
    fi
    
    backups=$(find "$BACKUP_DIR" -name "backup_*.db" -type f | sort -r)
    
    if [ -z "$backups" ]; then
        warning "No backups found"
        return
    fi
    
    echo ""
    printf "%-30s %-15s %-10s\n" "Backup File" "Date" "Size"
    printf "%-30s %-15s %-10s\n" "----------" "----" "----"
    
    while IFS= read -r backup; do
        if [ -f "$backup" ]; then
            filename=$(basename "$backup")
            # Extract date from filename (backup_2024-01-15T10-30-00-000Z.db)
            date_part=$(echo "$filename" | sed 's/backup_\(.*\)\.db/\1/' | sed 's/T/ /' | sed 's/-/:/g' | cut -d'.' -f1)
            size=$(du -h "$backup" | cut -f1)
            printf "%-30s %-15s %-10s\n" "$filename" "$date_part" "$size"
        fi
    done <<< "$backups"
    echo ""
}

restore_backup() {
    local backup_file="$1"
    
    if [ -z "$backup_file" ]; then
        error "Please specify a backup file to restore"
        list_backups
        exit 1
    fi
    
    # Check if backup file exists
    if [ ! -f "$BACKUP_DIR/$backup_file" ]; then
        # Try with full path
        if [ ! -f "$backup_file" ]; then
            error "Backup file not found: $backup_file"
            list_backups
            exit 1
        fi
        backup_path="$backup_file"
    else
        backup_path="$BACKUP_DIR/$backup_file"
    fi
    
    warning "This will overwrite the current database!"
    read -p "Are you sure you want to restore from $backup_file? (y/N): " confirm
    
    if [ "$confirm" != "y" ] && [ "$confirm" != "Y" ]; then
        log "Restore cancelled"
        exit 0
    fi
    
    # Create a backup of current state before restore
    log "📦 Creating backup of current state before restore..."
    create_backup
    
    # Stop services if running
    if command -v pm2 &> /dev/null; then
        log "🛑 Stopping PM2 processes..."
        pm2 stop syntagma || true
    fi
    
    # Restore the backup
    log "🔄 Restoring from backup..."
    cp "$backup_path" "$DATA_DIR/syntagma.db"
    
    # Verify restore
    if [ -f "$DATA_DIR/syntagma.db" ]; then
        success "Database restored successfully"
        
        # Restart services
        if command -v pm2 &> /dev/null; then
            log "🔄 Restarting PM2 processes..."
            pm2 start syntagma || true
        fi
        
        log "🔍 Running health check..."
        cd backend
        if node health-check.js; then
            success "Health check passed - restore completed successfully"
        else
            error "Health check failed after restore"
            exit 1
        fi
    else
        error "Restore failed"
        exit 1
    fi
}

cleanup_backups() {
    local days="${1:-30}"
    
    log "🧹 Cleaning up backups older than $days days..."
    
    if [ ! -d "$BACKUP_DIR" ]; then
        warning "No backup directory found"
        return
    fi
    
    deleted=0
    while IFS= read -r backup; do
        if [ -f "$backup" ]; then
            if find "$backup" -type f -mtime +$days | grep -q .; then
                rm "$backup"
                log "Deleted: $(basename "$backup")"
                ((deleted++))
            fi
        fi
    done <<< "$(find "$BACKUP_DIR" -name "backup_*.db" -type f)"
    
    success "Cleanup completed. Deleted $deleted old backups"
}

verify_backup() {
    local backup_file="$1"
    
    if [ -z "$backup_file" ]; then
        error "Please specify a backup file to verify"
        list_backups
        exit 1
    fi
    
    # Check if backup file exists
    if [ ! -f "$BACKUP_DIR/$backup_file" ]; then
        if [ ! -f "$backup_file" ]; then
            error "Backup file not found: $backup_file"
            exit 1
        fi
        backup_path="$backup_file"
    else
        backup_path="$BACKUP_DIR/$backup_file"
    fi
    
    log "🔍 Verifying backup: $backup_file"
    
    # Check if file is a valid SQLite database
    if sqlite3 "$backup_path" "SELECT count(*) FROM sqlite_master;" > /dev/null 2>&1; then
        success "Backup file is valid SQLite database"
        
        # Show some basic info
        tables=$(sqlite3 "$backup_path" "SELECT count(*) FROM sqlite_master WHERE type='table';")
        log "Tables found: $tables"
        
        # Check for key tables
        if sqlite3 "$backup_path" "SELECT name FROM sqlite_master WHERE type='table' AND name='rulesets';" | grep -q "rulesets"; then
            rulesets=$(sqlite3 "$backup_path" "SELECT count(*) FROM rulesets;")
            log "Rulesets in backup: $rulesets"
        fi
        
        success "Backup verification completed"
    else
        error "Backup file appears to be corrupted or invalid"
        exit 1
    fi
}

# Main command processing
case "$1" in
    backup)
        create_backup
        ;;
    restore)
        restore_backup "$2"
        ;;
    list)
        list_backups
        ;;
    cleanup)
        cleanup_backups "$2"
        ;;
    verify)
        verify_backup "$2"
        ;;
    *)
        show_usage
        exit 1
        ;;
esac
