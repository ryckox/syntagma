# PowerShell Script für Syntagma Update unter Windows
# Dieses Skript aktualisiert die Anwendung sicher mit automatischen Migrationen

param(
    [switch]$SkipBackup = $false,
    [switch]$Help = $false
)

if ($Help) {
    Write-Host "Syntagma Update Script für Windows" -ForegroundColor Green
    Write-Host ""
    Write-Host "Usage: .\update.ps1 [Parameters]"
    Write-Host ""
    Write-Host "Parameters:"
    Write-Host "  -SkipBackup    Überspringt das automatische Backup"
    Write-Host "  -Help          Zeigt diese Hilfe"
    Write-Host ""
    exit 0
}

$ErrorActionPreference = "Stop"

function Write-Log {
    param($Message, $Color = "Blue")
    Write-Host "[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] $Message" -ForegroundColor $Color
}

function Write-Success {
    param($Message)
    Write-Log "✅ $Message" "Green"
}

function Write-Warning {
    param($Message)
    Write-Log "⚠️ $Message" "Yellow"
}

function Write-Error {
    param($Message)
    Write-Log "❌ $Message" "Red"
}

Write-Log "🚀 Starting Syntagma Update Process"

# Check if we're in the right directory
if (-not (Test-Path "package.json") -or -not (Test-Path "backend")) {
    Write-Error "This doesn't appear to be the Syntagma root directory"
    Write-Error "Please run this script from the Syntagma project root"
    exit 1
}

# Create necessary directories
Write-Log "📁 Ensuring directories exist..."
New-Item -ItemType Directory -Force -Path "backups" | Out-Null
New-Item -ItemType Directory -Force -Path "data" | Out-Null
New-Item -ItemType Directory -Force -Path "backend\database\migrations" | Out-Null

# Stop running Node.js processes on port 3001 (optional)
try {
    $process = Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object {
        $_.Path -like "*syntagma*" -or $_.MainWindowTitle -like "*syntagma*"
    }
    if ($process) {
        Write-Log "🛑 Stopping existing Syntagma processes..."
        $process | Stop-Process -Force
        Start-Sleep -Seconds 2
    }
} catch {
    Write-Warning "Could not stop existing processes (this is usually fine)"
}

# Backend dependencies
Write-Log "📦 Installing backend dependencies..."
Set-Location backend
npm install --production
if ($LASTEXITCODE -ne 0) {
    Write-Error "Failed to install backend dependencies"
    exit 1
}

# Create backup before any changes
if (-not $SkipBackup) {
    Write-Log "📦 Creating backup before update..."
    node create-backup.js
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Backup failed"
        exit 1
    }
}

# Run database migrations
Write-Log "🔄 Running database migrations..."
node run-migrations.js
if ($LASTEXITCODE -ne 0) {
    Write-Error "Database migration failed"
    exit 1
}

# Frontend build
Write-Log "🏗️ Building frontend..."
Set-Location ..
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Error "Failed to install frontend dependencies"
    exit 1
}

npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Error "Failed to build frontend"
    exit 1
}

# Health check
Write-Log "🔍 Running health check..."
Set-Location backend
node health-check.js
if ($LASTEXITCODE -ne 0) {
    Write-Error "Health check failed"
    exit 1
}

Write-Success "🎉 Update completed successfully!"
Write-Log "📊 Application should now be running with the latest changes"
Write-Log "📦 Backups are stored in: $(Resolve-Path '../backups')"
Write-Log "🗄️ Database location: $(Resolve-Path '../data/syntagma.db')"

# Show recent backups
Write-Log "📋 Recent backups:"
Get-ChildItem -Path "../backups" -Filter "backup_*.db" | Sort-Object LastWriteTime -Descending | Select-Object -First 5 | ForEach-Object {
    Write-Host "  $($_.Name) - $($_.LastWriteTime)" -ForegroundColor Cyan
}

Write-Log "🚀 You can now start the server with: npm run backend:dev"

exit 0
