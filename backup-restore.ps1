# PowerShell Script für Syntagma Backup und Restore unter Windows

param(
    [Parameter(Mandatory = $true, Position = 0)]
    [ValidateSet("backup", "restore", "list", "cleanup", "verify")]
    [string]$Action,
    
    [Parameter(Position = 1)]
    [string]$Parameter,
    
    [switch]$Help = $false
)

if ($Help) {
    Write-Host "Syntagma Backup and Restore Utility für Windows" -ForegroundColor Green
    Write-Host ""
    Write-Host "Usage: .\backup-restore.ps1 [Action] [Parameter]"
    Write-Host ""
    Write-Host "Actions:"
    Write-Host "  backup              Create a new backup"
    Write-Host "  restore [file]      Restore from backup file"
    Write-Host "  list               List available backups"
    Write-Host "  cleanup [days]     Remove backups older than specified days (default: 30)"
    Write-Host "  verify [file]      Verify backup integrity"
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
    Write-Log "SUCCESS: $Message" "Green"
}

function Write-Warning {
    param($Message)
    Write-Log "WARNING: $Message" "Yellow"
}

function Write-Error {
    param($Message)
    Write-Log "ERROR: $Message" "Red"
}

$BackupDir = Join-Path $PWD "backups"
$DataDir = Join-Path $PWD "data"
$BackendDataDir = Join-Path $PWD "backend\database"

# Check for database in multiple possible locations
$DatabasePath = $null
$possiblePaths = @(
    (Join-Path $DataDir "syntagma.db"),
    (Join-Path $BackendDataDir "syntagma.db"),
    (Join-Path $PWD "backend\syntagma.db")
)

foreach ($path in $possiblePaths) {
    if (Test-Path $path) {
        $DatabasePath = $path
        break
    }
}

# Ensure directories exist
New-Item -ItemType Directory -Force -Path $BackupDir | Out-Null
New-Item -ItemType Directory -Force -Path $DataDir | Out-Null

switch ($Action) {
    "backup" {
        Write-Log "Creating backup..."
        
        if (-not $DatabasePath) {
            Write-Error "Database file not found in any expected location"
            Write-Log "Searched locations:"
            foreach ($path in $possiblePaths) {
                Write-Log "  $path"
            }
            exit 1
        }
        
        Write-Log "Found database at: $DatabasePath"
        
        Set-Location backend
        node create-backup.js
        
        if ($LASTEXITCODE -eq 0) {
            Write-Success "Backup completed successfully"
        } else {
            Write-Error "Backup failed"
            exit 1
        }
    }
    
    "list" {
        Write-Log "Available backups:"
        
        $backups = Get-ChildItem -Path $BackupDir -Filter "backup_*.db" -File | Sort-Object LastWriteTime -Descending
        
        if ($backups.Count -eq 0) {
            Write-Warning "No backups found"
            return
        }
        
        Write-Host ""
        Write-Host ("{0,-30} {1,-20} {2,-10}" -f "Backup File", "Date", "Size") -ForegroundColor Cyan
        Write-Host ("{0,-30} {1,-20} {2,-10}" -f "----------", "----", "----") -ForegroundColor Cyan
        
        foreach ($backup in $backups) {
            $filename = $backup.Name
            $dateStr = $backup.LastWriteTime.ToString("yyyy-MM-dd HH:mm")
            $size = "{0:N2} MB" -f ($backup.Length / 1MB)
            Write-Host ("{0,-30} {1,-20} {2,-10}" -f $filename, $dateStr, $size)
        }
        Write-Host ""
    }
    
    "restore" {
        if (-not $Parameter) {
            Write-Error "Please specify a backup file to restore"
            & $MyInvocation.MyCommand.Path list
            exit 1
        }
        
        $backupPath = Join-Path $BackupDir $Parameter
        if (-not (Test-Path $backupPath)) {
            if (Test-Path $Parameter) {
                $backupPath = $Parameter
            } else {
                Write-Error "Backup file not found: $Parameter"
                & $MyInvocation.MyCommand.Path list
                exit 1
            }
        }
        
        Write-Warning "This will overwrite the current database!"
        $confirm = Read-Host "Are you sure you want to restore from $Parameter? (y/N)"
        
        if ($confirm -notin @("y", "Y")) {
            Write-Log "Restore cancelled"
            exit 0
        }
        
        # Create a backup of current state before restore
        Write-Log "Creating backup of current state before restore..."
        & $MyInvocation.MyCommand.Path backup
        
        # Restore the backup
        Write-Log "Restoring from backup..."
        Copy-Item $backupPath (Join-Path $DataDir "syntagma.db") -Force
        
        # Verify restore
        if (Test-Path (Join-Path $DataDir "syntagma.db")) {
            Write-Success "Database restored successfully"
            
            Write-Log "Running health check..."
            Set-Location backend
            node health-check.js
            if ($LASTEXITCODE -eq 0) {
                Write-Success "Health check passed - restore completed successfully"
            } else {
                Write-Error "Health check failed after restore"
                exit 1
            }
        } else {
            Write-Error "Restore failed"
            exit 1
        }
    }
    
    "cleanup" {
        $days = if ($Parameter) { [int]$Parameter } else { 30 }
        
        Write-Log "Cleaning up backups older than $days days..."
        
        $cutoffDate = (Get-Date).AddDays(-$days)
        $oldBackups = Get-ChildItem -Path $BackupDir -Filter "backup_*.db" -File | Where-Object { $_.LastWriteTime -lt $cutoffDate }
        
        $deleted = 0
        foreach ($backup in $oldBackups) {
            Remove-Item $backup.FullName -Force
            Write-Log "Deleted: $($backup.Name)"
            $deleted++
        }
        
        Write-Success "Cleanup completed. Deleted $deleted old backups"
    }
    
    "verify" {
        if (-not $Parameter) {
            Write-Error "Please specify a backup file to verify"
            & $MyInvocation.MyCommand.Path list
            exit 1
        }
        
        $backupPath = Join-Path $BackupDir $Parameter
        if (-not (Test-Path $backupPath)) {
            if (Test-Path $Parameter) {
                $backupPath = $Parameter
            } else {
                Write-Error "Backup file not found: $Parameter"
                exit 1
            }
        }
        
        Write-Log "Verifying backup: $Parameter"
        
        # Check if file is a valid SQLite database
        try {
            # Simple check - try to read the file header
            $bytes = [System.IO.File]::ReadAllBytes($backupPath)
            $header = [System.Text.Encoding]::ASCII.GetString($bytes[0..15])
            
            if ($header.StartsWith("SQLite format 3")) {
                Write-Success "Backup file is valid SQLite database"
                
                # Get file size
                $fileSize = (Get-Item $backupPath).Length
                Write-Log "File size: $([math]::Round($fileSize / 1MB, 2)) MB"
                
                Write-Success "Backup verification completed"
            } else {
                Write-Error "Backup file appears to be corrupted or invalid"
                exit 1
            }
        } catch {
            Write-Error "Could not verify backup file: $($_.Exception.Message)"
            exit 1
        }
    }
}
