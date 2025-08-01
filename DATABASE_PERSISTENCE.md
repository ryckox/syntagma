# Datenbank-Persistenz und Updates

Diese Dokumentation erklärt, wie Syntagma sicherstellt, dass Ihre Datenbank bei Updates immer erhalten bleibt und automatisch migriert wird.

## 🔒 Datenschutz-Garantien

### 1. Automatische Backups
- **Vor jeder Migration** wird automatisch ein Backup erstellt
- **Vor Updates** wird ein Sicherheitsbackup angelegt
- Backups werden mit Zeitstempel versehen und dauerhaft gespeichert

### 2. Sichere Migrationen
- Migrationen laufen in Transaktionen (bei Fehlern wird zurückgerollt)
- Versionierung verhindert doppelte Ausführung
- Jede Migration wird protokolliert

### 3. Persistente Datenvolumes
- Docker Volumes bleiben bei Container-Updates erhalten
- Datenbank-Dateien werden außerhalb des Containers gespeichert

## 🚀 Deployment-Strategien

### Docker Deployment

```bash
# Erstmaliges Setup
docker-compose up -d

# Updates mit automatischen Migrationen
docker-compose pull
docker-compose up -d

# Das System führt automatisch aus:
# 1. Backup der aktuellen Datenbank
# 2. Anwendung aller neuen Migrationen
# 3. Start der aktualisierten Anwendung
```

#### Docker Volumes
```yaml
volumes:
  syntagma_data:      # Datenbank-Dateien
  syntagma_backups:   # Backup-Dateien
  syntagma_uploads:   # Benutzer-Uploads
  syntagma_logs:      # Anwendungs-Logs
```

### Traditionelles Deployment

```bash
# Update-Prozess
./update.sh

# Das Skript führt automatisch aus:
# 1. Anhalten der Anwendung
# 2. Backup der Datenbank
# 3. Installation der Dependencies
# 4. Ausführung der Migrationen
# 5. Build der Frontend-Anwendung
# 6. Neustart der Anwendung
```

## 🛠️ Migration System

### Migrationstypen

1. **Schema-Migrationen**: Änderungen an Tabellenstrukturen
2. **Daten-Migrationen**: Transformation vorhandener Daten
3. **Index-Migrationen**: Performance-Optimierungen

### Migration erstellen

```javascript
// backend/database/migrations/003_add_new_feature.js
export async function up(db) {
  await db.run(`
    CREATE TABLE IF NOT EXISTS new_table (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

export async function down(db) {
  await db.run('DROP TABLE IF EXISTS new_table');
}
```

### Manuelle Migration

```bash
# Backend-Verzeichnis
cd backend

# Migrationen ausführen
npm run migrate

# Letzte Migration zurückrollen
npm run migrate:rollback

# Backup erstellen
npm run backup
```

## 📦 Backup & Restore

### Automatische Backups

- **Bei Migrationen**: Vor jeder Migration
- **Bei Updates**: Vor Anwendungsupdates
- **Täglich**: Automatisch (bei Cron-Setup)

### Manuelle Backup-Verwaltung

```bash
# Backup erstellen
./backup-restore.sh backup

# Backups auflisten
./backup-restore.sh list

# Backup wiederherstellen
./backup-restore.sh restore backup_2024-01-15T10-30-00-000Z.db

# Alte Backups löschen (älter als 30 Tage)
./backup-restore.sh cleanup 30

# Backup-Integrität prüfen
./backup-restore.sh verify backup_2024-01-15T10-30-00-000Z.db
```

## 🏗️ Deployment-Szenarien

### 1. Erste Installation

```bash
# Docker
docker-compose up -d

# Traditionell
./deploy.sh
```

**Was passiert:**
- Datenbank wird erstellt
- Alle Migrationen werden angewendet
- Optional: Demo-Daten werden eingefügt
- Anwendung startet

### 2. Update einer bestehenden Installation

```bash
# Docker
docker-compose pull
docker-compose up -d

# Traditionell
./update.sh
```

**Was passiert:**
- **Backup der aktuellen Datenbank**
- Neue Dependencies werden installiert
- **Neue Migrationen werden angewendet**
- Frontend wird neu gebaut
- Anwendung startet neu

### 3. Rollback nach fehlgeschlagenem Update

```bash
# Letztes Backup wiederherstellen
./backup-restore.sh restore [backup-file]

# Oder letzte Migration zurückrollen
cd backend
npm run migrate:rollback
```

## 🔍 Monitoring & Health Checks

### Health Check Endpoint
```bash
curl http://localhost:3001/api/health
```

### Database Health Check
```bash
cd backend
node health-check.js
```

### Migration Status prüfen
```bash
cd backend
node -e "import('./database/migrator.js').then(m => m.runMigrations())"
```

## ⚙️ Konfiguration

### Umgebungsvariablen

```bash
# .env Datei
DB_PATH=/app/data/syntagma.db
BACKUP_RETENTION_DAYS=30
AUTO_BACKUP=true
SEED_DEMO_DATA=false
```

### Docker Environment

```yaml
environment:
  - DB_PATH=/app/data/syntagma.db
  - SEED_DEMO_DATA=false
  - BACKUP_RETENTION_DAYS=30
```

## 🚨 Notfall-Wiederherstellung

### Wenn die Datenbank beschädigt ist:

1. **Stoppen Sie die Anwendung**
2. **Letztes bekanntes gutes Backup finden:**
   ```bash
   ./backup-restore.sh list
   ```
3. **Backup wiederherstellen:**
   ```bash
   ./backup-restore.sh restore [backup-file]
   ```
4. **Anwendung neu starten**

### Wenn Migrationen fehlschlagen:

1. **Migration zurückrollen:**
   ```bash
   cd backend
   npm run migrate:rollback
   ```
2. **Problem in der Migration beheben**
3. **Migration erneut ausführen:**
   ```bash
   npm run migrate
   ```

## 📈 Best Practices

### 1. Regelmäßige Backups
- Tägliche automatische Backups einrichten
- Backups vor größeren Änderungen
- Backup-Integrität regelmäßig testen

### 2. Testing
- Migrationen in Entwicklungsumgebung testen
- Backup/Restore-Prozess regelmäßig testen
- Health Checks überwachen

### 3. Monitoring
- Backup-Status überwachen
- Migration-Logs prüfen
- Datenbank-Performance beobachten

### 4. Sichere Updates
- Updates außerhalb der Hauptgeschäftszeiten
- Backup vor jedem Update
- Rollback-Plan bereithalten

## 📞 Troubleshooting

### Häufige Probleme

1. **Migration schlägt fehl:**
   - Logs prüfen: `docker-compose logs syntagma`
   - Migration manuell zurückrollen
   - Backup wiederherstellen wenn nötig

2. **Datenbank nicht erreichbar:**
   - Docker Volume prüfen: `docker volume ls`
   - Permissions prüfen
   - Health Check ausführen

3. **Backup-Fehler:**
   - Speicherplatz prüfen
   - Permissions prüfen
   - Backup-Verzeichnis erstellen

### Support-Informationen sammeln

```bash
# System-Info sammeln
docker-compose logs syntagma > syntagma.log
./backup-restore.sh list > backup-info.txt
cd backend && node health-check.js > health-status.txt
```

Diese Dateien können zur Problemdiagnose verwendet werden.
