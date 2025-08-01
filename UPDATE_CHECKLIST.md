# Update Checkliste für Syntagma

## 📋 Vor dem Update

- [ ] **Backup erstellen**
  - Docker: Automatisch durch System
  - Traditionell: `npm run backup` oder `npm run backup:win`
  
- [ ] **Systemstatus prüfen**
  - [ ] Anwendung läuft stabil
  - [ ] Keine laufenden kritischen Prozesse
  - [ ] Ausreichend Speicherplatz für Backup
  
- [ ] **Maintenance-Modus aktivieren** (optional)
  - Benutzer über geplante Wartung informieren

## 🔄 Update-Prozess

### Docker Deployment
```bash
# 1. Images aktualisieren
docker-compose pull

# 2. Container neu starten (inkl. automatischer Migration)
docker-compose up -d

# 3. Logs prüfen
docker-compose logs -f syntagma
```

### Traditionelles Deployment
```bash
# Linux/macOS
npm run update

# Windows
npm run update:win
```

## ✅ Nach dem Update

- [ ] **Health Check ausführen**
  ```bash
  npm run health:check
  ```

- [ ] **Funktionalität testen**
  - [ ] Login funktioniert
  - [ ] Rulesets können geöffnet werden
  - [ ] Such-Funktion arbeitet korrekt
  - [ ] Neue Features sind verfügbar

- [ ] **Performance überwachen**
  - Antwortzeiten prüfen
  - Logs auf Fehler überwachen

- [ ] **Backup validieren**
  ```bash
  # Linux/macOS
  npm run backup:list
  npm run backup:verify [backup-file]
  
  # Windows
  npm run backup:list:win
  powershell -ExecutionPolicy Bypass -File backup-restore.ps1 verify [backup-file]
  ```

## 🚨 Rollback-Prozess (falls nötig)

### 1. Service stoppen
```bash
# Docker
docker-compose down

# Traditionell
# Node.js Prozess stoppen
```

### 2. Backup wiederherstellen
```bash
# Linux/macOS
npm run backup:restore [backup-file]

# Windows
npm run backup:restore:win [backup-file]
```

### 3. Service neu starten
```bash
# Docker
docker-compose up -d

# Traditionell
npm run backend:dev
```

### 4. Funktionalität testen
- Login testen
- Datenintegrität prüfen
- Alle Features testen

## 📊 Monitoring nach Updates

### Health Checks (erste 24h)
- [ ] Stündlich: `npm run health:check`
- [ ] Logs überwachen: `docker-compose logs -f syntagma`
- [ ] Speicherverbrauch prüfen
- [ ] Datenbank-Performance überwachen

### Benutzerfeedback
- [ ] Support-Kanäle überwachen
- [ ] Fehlermeldungen sammeln
- [ ] Performance-Beschwerden dokumentieren

## 🛠️ Troubleshooting

### Migration fehlgeschlagen
1. **Rollback zur letzten funktionierenden Version**
2. **Migration-Logs analysieren**
3. **Datenbank-Schema prüfen**
4. **Korrigierte Migration anwenden**

### Backup/Restore Probleme
1. **Backup-Integrität prüfen**: `npm run backup:verify`
2. **Speicherplatz prüfen**
3. **Permissions validieren**
4. **Manueller Restore wenn nötig**

### Performance-Probleme
1. **Datenbank-Indizes prüfen**
2. **Log-Dateien rotieren**
3. **Temporäre Dateien löschen**
4. **Cache leeren**

## 📞 Support-Informationen sammeln

Bei Problemen folgende Informationen sammeln:

```bash
# System-Info
docker-compose logs syntagma > update-logs.txt
npm run backup:list > backup-status.txt
npm run health:check > health-status.txt

# Fehler-Logs
# Docker: docker-compose logs syntagma --tail=100
# Traditionell: cat backend/logs/error.log
```

## 📅 Wartungsplan

### Regelmäßige Aufgaben
- **Täglich**: Backup-Status prüfen
- **Wöchentlich**: Health Check
- **Monatlich**: Alte Backups bereinigen
- **Quartalsweise**: Performance-Review

### Backup-Retention
```bash
# Alte Backups löschen (älter als 30 Tage)
npm run backup:cleanup 30

# Windows
npm run backup:cleanup:win 30
```
