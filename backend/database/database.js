import sqlite3 from 'sqlite3';
import { promisify } from 'util';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Support for environment-based database configuration
function getDatabasePath() {
  if (process.env.DB_PATH) {
    return process.env.DB_PATH;
  }
  
  // Default path - check if we're in production/deployment
  const prodPath = '/app/data/syntagma.db';
  const devPath = join(__dirname, 'syntagma.db');
  
  // If production directory exists, use it
  if (fs.existsSync('/app/data')) {
    return prodPath;
  }
  
  return devPath;
}

const dbPath = getDatabasePath();

class Database {
  constructor() {
    this.db = null;
    this.isInitializing = false;
    this.initialized = false;
    this.initPromise = this.initialize();
  }

  async initialize() {
    if (this.isInitializing) {
      return this.initPromise;
    }
    
    this.isInitializing = true;
    
    try {
      // Ensure directory exists
      const dbDir = dirname(dbPath);
      if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true });
        console.log(`📁 Created database directory: ${dbDir}`);
      }
      
      // Create database connection and wait for it to be ready
      await new Promise((resolve, reject) => {
        this.db = new sqlite3.Database(dbPath, (err) => {
          if (err) {
            console.error('❌ Error opening database:', err);
            reject(err);
          } else {
            console.log(`✅ Database opened successfully at: ${dbPath}`);
            resolve();
          }
        });
      });
      
      // Promisify common methods
      this.get = promisify(this.db.get.bind(this.db));
      this.all = promisify(this.db.all.bind(this.db));
      
      // Custom run method that returns lastID and changes
      this._run = promisify(this.db.run.bind(this.db));
      this.run = async (sql, params = []) => {
        await this.ensureInitialized();
        
        return new Promise((resolve, reject) => {
          const stmt = this.db.prepare(sql);
          stmt.run(params, function(err) {
            if (err) {
              stmt.finalize();
              reject(err);
            } else {
              const result = { lastID: this.lastID, changes: this.changes };
              stmt.finalize();
              resolve(result);
            }
          });
        });
      };
      
      // Create tables
      await this.createTables();
      
      this.initialized = true;
      console.log('Datenbank vollständig initialisiert');
      
    } catch (error) {
      console.error('Fehler bei der Datenbankinitialisierung:', error);
      throw error;
    } finally {
      this.isInitializing = false;
    }
  }

  async ensureInitialized() {
    if (!this.initialized) {
      await this.initPromise;
    }
  }

  async close() {
    return new Promise((resolve, reject) => {
      if (this.db) {
        this.db.close((err) => {
          if (err) reject(err);
          else resolve();
        });
      } else {
        resolve();
      }
    });
  }

  // Execute multiple SQL statements
  async executeSql(sql) {
    await this.ensureInitialized();
    
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database is not available'));
        return;
      }
      
      // Use serialize to ensure sequential execution
      this.db.serialize(() => {
        this.db.exec(sql, (err) => {
          if (err) {
            console.error('SQL execution error:', err);
            reject(err);
          } else {
            resolve();
          }
        });
      });
    });
  }

  // Erstelle Tabellen falls sie nicht existieren
  async createTables() {
    try {
      console.log('Starte Tabellenerstellung...');
      
      // Prüfe ob Datenbank verfügbar ist
      if (!this.db) {
        console.warn('Datenbank ist nicht verfügbar für Tabellenerstellung');
        return;
      }

      // Use simple run instead of executeSql for table creation
      const createAttachmentsTable = `
        CREATE TABLE IF NOT EXISTS attachments (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          ruleset_id INTEGER NOT NULL,
          filename TEXT NOT NULL,
          original_filename TEXT NOT NULL,
          mime_type TEXT NOT NULL,
          file_size INTEGER NOT NULL,
          file_path TEXT NOT NULL,
          description TEXT,
          uploaded_by INTEGER,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `;

      const createLinksTable = `
        CREATE TABLE IF NOT EXISTS external_links (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          ruleset_id INTEGER NOT NULL,
          title TEXT NOT NULL,
          url TEXT NOT NULL,
          description TEXT,
          link_type TEXT DEFAULT 'external',
          created_by INTEGER,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `;

      // Audit Log Tabelle für Regelwerk-Änderungen
      const createAuditLogTable = `
        CREATE TABLE IF NOT EXISTS ruleset_audit_log (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          ruleset_id INTEGER NOT NULL,
          action TEXT NOT NULL, -- 'created', 'updated', 'published', 'archived', 'deleted'
          field_changes TEXT, -- JSON string mit geänderten Feldern
          old_values TEXT, -- JSON string mit alten Werten
          new_values TEXT, -- JSON string mit neuen Werten
          version_before TEXT,
          version_after TEXT,
          user_id INTEGER NOT NULL,
          user_name TEXT,
          timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
          ip_address TEXT,
          user_agent TEXT,
          FOREIGN KEY (ruleset_id) REFERENCES rulesets(id) ON DELETE CASCADE,
          FOREIGN KEY (user_id) REFERENCES users(id)
        )
      `;

      // Tags-Tabelle für Schlagworte
      const createTagsTable = `
        CREATE TABLE IF NOT EXISTS tags (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL UNIQUE COLLATE NOCASE,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `;

      // Junction-Tabelle für Regelwerk-Tag-Zuordnung
      const createRulesetTagsTable = `
        CREATE TABLE IF NOT EXISTS ruleset_tags (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          ruleset_id INTEGER NOT NULL,
          tag_id INTEGER NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (ruleset_id) REFERENCES rulesets(id) ON DELETE CASCADE,
          FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE,
          UNIQUE(ruleset_id, tag_id)
        )
      `;

      // Execute table creation with basic run
      await new Promise((resolve, reject) => {
        this.db.run(createAttachmentsTable, (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
      console.log('Attachments-Tabelle erstellt/überprüft');

      await new Promise((resolve, reject) => {
        this.db.run(createLinksTable, (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
      console.log('External-Links-Tabelle erstellt/überprüft');

      await new Promise((resolve, reject) => {
        this.db.run(createAuditLogTable, (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
      console.log('Audit-Log-Tabelle erstellt/überprüft');

      await new Promise((resolve, reject) => {
        this.db.run(createTagsTable, (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
      console.log('Tags-Tabelle erstellt/überprüft');

      await new Promise((resolve, reject) => {
        this.db.run(createRulesetTagsTable, (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
      console.log('Ruleset-Tags-Junction-Tabelle erstellt/überprüft');

      // Indizes für bessere Performance erstellen
      const createIndexes = [
        'CREATE INDEX IF NOT EXISTS idx_ruleset_tags_ruleset_id ON ruleset_tags(ruleset_id)',
        'CREATE INDEX IF NOT EXISTS idx_ruleset_tags_tag_id ON ruleset_tags(tag_id)',
        'CREATE INDEX IF NOT EXISTS idx_tags_name ON tags(name)'
      ];

      for (const indexSql of createIndexes) {
        await new Promise((resolve, reject) => {
          this.db.run(indexSql, (err) => {
            if (err) reject(err);
            else resolve();
          });
        });
      }
      console.log('Tag-Indizes erstellt/überprüft');
      
      console.log('Tabellenerstellung abgeschlossen');
      
    } catch (error) {
      console.error('Fehler beim Erstellen der Tabellen:', error);
      // Don't throw the error, just log it so the server can continue
    }
  }
}

let dbInstance = null;
let initPromise = null;

export async function getDatabase() {
  if (!dbInstance) {
    if (!initPromise) {
      initPromise = initializeDatabase();
    }
    dbInstance = await initPromise;
  }
  return dbInstance;
}

async function initializeDatabase() {
  const db = new Database();
  await db.initPromise;
  return db;
}

export default Database;
