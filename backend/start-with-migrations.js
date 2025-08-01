#!/usr/bin/env node

/**
 * Start script that ensures database migrations are run before starting the server
 * This script should be used in production deployments
 */

import { runMigrations, createBackup } from './database/migrator.js';
import { spawn } from 'child_process';
import fs from 'fs';

async function startWithMigrations() {
  console.log('🚀 Starting Syntagma with automatic migrations...');
  
  try {
    // Check if database exists for backup decision
    const dbPath = process.env.DB_PATH || '/app/data/syntagma.db';
    const dbExists = fs.existsSync(dbPath);
    
    if (dbExists) {
      console.log('📦 Creating safety backup before migrations...');
      await createBackup();
    }
    
    // Run migrations
    console.log('🔄 Running database migrations...');
    const success = await runMigrations();
    
    if (!success) {
      console.error('❌ Migration failed. Aborting startup.');
      process.exit(1);
    }
    
    console.log('✅ Migrations completed successfully');
    console.log('🎯 Starting server...');
    
    // Start the main server
    const server = spawn('node', ['server.js'], {
      stdio: 'inherit',
      env: { ...process.env }
    });
    
    // Handle server process events
    server.on('error', (error) => {
      console.error('❌ Server failed to start:', error);
      process.exit(1);
    });
    
    server.on('exit', (code) => {
      console.log(`🔚 Server exited with code ${code}`);
      process.exit(code);
    });
    
    // Handle graceful shutdown
    process.on('SIGTERM', () => {
      console.log('📡 SIGTERM received, shutting down gracefully...');
      server.kill('SIGTERM');
    });
    
    process.on('SIGINT', () => {
      console.log('📡 SIGINT received, shutting down gracefully...');
      server.kill('SIGINT');
    });
    
  } catch (error) {
    console.error('❌ Failed to start with migrations:', error);
    process.exit(1);
  }
}

startWithMigrations();
