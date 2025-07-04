import sqlite3 from 'sqlite3';
import { promisify } from 'util';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbPath = join(__dirname, 'syntagma.db');

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
      // Create database connection and wait for it to be ready
      await new Promise((resolve, reject) => {
        this.db = new sqlite3.Database(dbPath, (err) => {
          if (err) {
            console.error('Fehler beim Öffnen der Datenbank:', err);
            reject(err);
          } else {
            console.log('Datenbank erfolgreich geöffnet');
            resolve();
          }
        });
      });
      
      // Promisify common methods
      this.get = promisify(this.db.get.bind(this.db));
      this.all = promisify(this.db.all.bind(this.db));
      this.run = promisify(this.db.run.bind(this.db));
      
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

  // Custom run method that returns the result
  async run(sql, params = []) {
    await this.ensureInitialized();
    
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database is not available'));
        return;
      }
      
      const stmt = this.db.prepare(sql);
      stmt.run(params, function(err) {
        if (err) reject(err);
        else resolve({ lastID: this.lastID, changes: this.changes });
        stmt.finalize();
      });
    });
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
