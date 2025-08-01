// Simple migration script for PowerShell integration
import { runMigrations } from './database/migrator.js';

try {
  const success = await runMigrations();
  if (success) {
    console.log('Migrations completed successfully');
    process.exit(0);
  } else {
    console.error('Migration failed');
    process.exit(1);
  }
} catch (error) {
  console.error('Migration error:', error.message);
  process.exit(1);
}
