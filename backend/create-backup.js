// Simple backup script for PowerShell integration
import { createBackup } from './database/migrator.js';

try {
  const backupPath = await createBackup();
  if (backupPath) {
    console.log('Backup created:', backupPath);
    process.exit(0);
  } else {
    console.error('Backup failed');
    process.exit(1);
  }
} catch (error) {
  console.error('Backup error:', error.message);
  process.exit(1);
}
