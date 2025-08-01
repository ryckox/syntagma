# Syntagma - Regelwerk-Verwaltungsplattform

Syntagma ist eine moderne, webbasierte Plattform zur Zusammenführung, schnellen Dokumentation und transparenten Darstellung von Regelwerken. Sie wurde speziell für die Verwaltung von Datenschutz-, IT-Sicherheits- und Dienstvereinbarungsrichtlinien entwickelt.

## 🚀 Features

### Für Administratoren
- **Vollständige Regelwerkverwaltung**: Erstellen, bearbeiten, veröffentlichen und archivieren von Regelwerken
- **Typen- und Themenverwaltung**: Flexible Kategorisierung und Organisation
- **Versionskontrolle**: Vollständige Änderungshistorie mit Versionsvergleich
- **Benutzerverwaltung**: Rollen- und Rechteverwaltung
- **Dashboard**: Übersichtliche Statistiken und Schnellzugriffe

### Für die Öffentlichkeit
- **Professionelle Welcome Page**: Ansprechende Landingpage mit Funktionsübersicht
- **Moderne Suchfunktion**: Volltext-Suche mit Filteroptionen
- **Responsive Design**: Optimiert für Desktop und mobile Geräte
- **Automatisches Inhaltsverzeichnis**: Strukturierte Navigation innerhalb von Regelwerken
- **Transparente Darstellung**: Klare und benutzerfreundliche Präsentation

### Technische Features
- **Sichere Authentifizierung**: JWT-basierte Anmeldung mit bcrypt-Passwort-Hashing
- **SQLite-Datenbank**: Leichtgewichtige, eingebettete Datenbank
- **Full-Text-Search**: Performante Suchfunktionalität
- **API-basierte Architektur**: RESTful API für maximale Flexibilität

## 🛠 Technologie-Stack

### Backend
- **Node.js** mit Express.js
- **SQLite** mit FTS5 (Full-Text Search)
- **JWT** für Authentifizierung
- **bcryptjs** für Passwort-Hashing
- **express-validator** für Eingabevalidierung

### Frontend
- **Vue.js 3** mit Composition API
- **TypeScript** für Typsicherheit
- **Pinia** für State Management
- **Vue Router** für Navigation
- **Tailwind CSS** für modernes Styling
- **Heroicons** für Icons
- **Axios** für HTTP-Requests

## 📋 Voraussetzungen

- Node.js 18+ 
- npm oder yarn
- Git

## 🚀 Installation und Setup

### 1. Repository klonen
```bash
git clone <repository-url>
cd syntagma
```

### 2. Abhängigkeiten installieren
```bash
# Frontend-Abhängigkeiten installieren
npm install

# Backend-Abhängigkeiten installieren
cd backend
npm install
cd ..
```

Oder nutzen Sie den Convenience-Befehl:
```bash
npm run setup
```

**Hinweis**: Die Datenbank wird automatisch beim ersten Start des Backend-Servers initialisiert. Das Setup-Skript führt zusätzlich das Seeding mit Beispieldaten aus.

### 3. Umgebungsvariablen konfigurieren

**Backend (.env in backend/ Verzeichnis):**
```env
NODE_ENV=development
PORT=3001
FRONTEND_URL=http://localhost:5173
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d
DB_PATH=./database/syntagma.db
```

**Frontend (.env im Hauptverzeichnis):**
```env
VITE_API_URL=http://localhost:3001
```

### 4. Datenbank initialisieren
Die Datenbank wird automatisch beim ersten Start des Backend-Servers initialisiert. Optional können Beispieldaten eingefügt werden:

```bash
# Beispieldaten einfügen (optional)
npm run backend:seed
```

## 🏃‍♂️ Entwicklung starten

### Backend starten
```bash
npm run backend:dev
```
Der Backend-Server läuft auf `http://localhost:3001`

### Frontend starten
```bash
npm run dev
```
Das Frontend läuft auf `http://localhost:5173`

## 👥 Demo-Zugangsdaten

Nach dem Seeding stehen folgende Benutzer zur Verfügung:

**Administrator:**
- Benutzername: `admin`
- Passwort: `admin123`
- Zugriff auf: Vollständiges Cockpit und alle Funktionen

**Standard-Benutzer:**
- Benutzername: `testuser`
- Passwort: `user123`
- Zugriff auf: Öffentliche Bereiche (Suche, Anzeige)

## 🎯 Nutzung

### Öffentliche Bereiche
1. **Welcome Page** (`/`): Hauptlandingpage mit Funktionsübersicht und Navigation
2. **Regelwerk-Browser** (`/search`): Durchsuchen und Filtern aller veröffentlichten Regelwerke
3. **Suche** (`/search`): Erweiterte Suchfunktion mit Volltext-Suche und Filtern
4. **Regelwerk-Details** (`/ruleset/:id`): Detailansicht einzelner Regelwerke

### Admin-Bereiche (nach Anmeldung)
1. **Dashboard** (`/cockpit`): Übersicht über Statistiken und Schnellzugriffe
2. **Regelwerk-Management** (`/cockpit/rulesets`): Vollständige CRUD-Operationen
3. **Typ-Verwaltung** (`/cockpit/types`): Verwaltung von Regelwerk-Kategorien
4. **Themen-Verwaltung** (`/cockpit/topics`): Verwaltung von Themenbereichen
5. **Benutzer-Verwaltung** (`/cockpit/users`): Verwaltung von Benutzern und Rollen
6. **Regelwerk-Editor** (`/cockpit/rulesets/new` oder `/cockpit/rulesets/:id/edit`): Markdown-Editor für Inhalte

## 📁 Projektstruktur

```
syntagma/
├── backend/                    # Backend (Node.js/Express)
│   ├── database/              # Datenbanklogik und Seeds
│   │   ├── database.js        # Datenbankverbindung und Schema
│   │   ├── seed.js            # Beispieldaten
│   │   └── syntagma.db        # SQLite-Datenbankdatei
│   ├── middleware/            # Express-Middleware
│   │   └── auth.js           # Authentifizierung
│   ├── routes/               # API-Routen
│   │   ├── attachments.js    # Dateianhänge
│   │   ├── auth.js           # Authentifizierung
│   │   ├── dashboard.js      # Dashboard-Daten
│   │   ├── rulesets.js       # Regelwerke
│   │   ├── search.js         # Suche
│   │   ├── topics.js         # Themen
│   │   ├── types.js          # Typen
│   │   └── users.js          # Benutzer
│   ├── uploads/              # Datei-Uploads
│   ├── server.js             # Express-Server
│   └── package.json          # Backend-Abhängigkeiten
├── src/                      # Frontend (Vue.js)
│   ├── components/           # Vue-Komponenten
│   ├── stores/              # Pinia-Stores
│   │   ├── auth.ts          # Authentifizierung
│   │   ├── ruleset.ts       # Regelwerke
│   │   └── search.ts        # Suche
│   ├── router/              # Vue-Router-Konfiguration
│   ├── views/               # Seitenkomponenten
│   │   ├── cockpit/         # Admin-Bereich
│   │   ├── Home.vue         # Startseite
│   │   ├── Login.vue        # Anmeldung
│   │   ├── Search.vue       # Suchseite
│   │   └── RulesetDetail.vue # Regelwerk-Detail
│   ├── App.vue              # Hauptkomponente
│   └── main.ts              # App-Einstiegspunkt
├── Cockpit.vue              # Zentrale Admin-Komponente
├── public/                  # Statische Assets
├── package.json             # Frontend-Abhängigkeiten
└── README.md               # Diese Datei
```

## 🔍 Hauptfunktionen im Detail

### Suchfunktion
- **Volltext-Suche**: Durchsucht Titel und Inhalte aller Regelwerke
- **Filter**: Nach Typ, Thema und Status filterbar
- **Autocomplete**: Suchvorschläge basierend auf bestehenden Titeln
- **Relevanz-Ranking**: Ergebnisse nach Relevanz sortiert

### Regelwerk-Verwaltung
- **WYSIWYG-Editor**: Intuitive Bearbeitung von Inhalten
- **Inhaltsverzeichnis**: Automatische Generierung mit hierarchischer Struktur
- **Versionierung**: Vollständige Änderungshistorie
- **Status-Management**: Entwurf → Veröffentlicht → Archiviert

### Cockpit (Admin-Bereich)
- **Dashboard**: Übersicht über Statistiken und letzte Aktivitäten
- **Regelwerk-Management**: Vollständige CRUD-Operationen
- **Typen-Management**: Verwaltung von Kategorien mit Farben und Icons
- **Themen-Management**: Organisation von Unterkategorien
- **Benutzer-Management**: Verwaltung von Benutzern und Rollen

## 🔒 Sicherheit

- **Passwort-Hashing**: bcrypt mit 12 Rounds
- **JWT-Token**: Sichere Authentifizierung mit konfigurierbarer Laufzeit
- **Input-Validierung**: Server- und clientseitige Validierung
- **XSS-Schutz**: Helmet.js für Security Headers
- **Rate Limiting**: Schutz vor Brute-Force-Angriffen
- **CORS-Konfiguration**: Sichere Cross-Origin-Requests

## 🔧 Konfiguration

### Automatische Datenbankinitialisierung
Das System initialisiert die SQLite-Datenbank automatisch beim ersten Start des Backend-Servers. Es werden folgende Tabellen erstellt:

- **Core-Tabellen**: users, ruleset_types, topics, rulesets, table_of_contents, change_history
- **Zusatztabellen**: attachments, external_links
- **Suchindustrien**: rulesets_fts (Full-Text Search)

### Backend-Konfiguration
Die Backend-Konfiguration erfolgt über Umgebungsvariablen in der `.env`-Datei:

- `JWT_SECRET`: Geheimer Schlüssel für JWT-Token (IN PRODUKTION ÄNDERN!)
- `JWT_EXPIRES_IN`: Token-Laufzeit (Standard: 7d)
- `PORT`: Server-Port (Standard: 3001)
- `FRONTEND_URL`: URL des Frontends für CORS

### Frontend-Konfiguration
- `VITE_API_URL`: Backend-URL (Standard: http://localhost:3001)

## 📊 Datenbank-Schema

Das System verwendet SQLite mit folgenden Haupttabellen:

- **users**: Benutzer und Authentifizierung
- **ruleset_types**: Kategorien (Datenschutz, IT-Sicherheit, etc.)
- **topics**: Unterkategorien je Typ
- **rulesets**: Hauptinhalte der Regelwerke
- **table_of_contents**: Strukturierte Inhaltsverzeichnisse
- **change_history**: Vollständige Änderungshistorie
- **rulesets_fts**: Full-Text-Search-Index

## 🚀 Produktion

### Build erstellen
```bash
# Frontend bauen
npm run build

# Backend für Produktion vorbereiten
cd backend
npm install --production
```

### Deployment-Hinweise
1. JWT_SECRET in Produktion durch sicheren Wert ersetzen
2. CORS-Einstellungen für Produktions-Domain anpassen
3. HTTPS verwenden
4. Regelmäßige Backups der SQLite-Datenbank
5. Rate Limiting entsprechend anpassen

## 🤝 Beitragen

1. Fork des Repositories erstellen
2. Feature-Branch erstellen (`git checkout -b feature/AmazingFeature`)
3. Änderungen committen (`git commit -m 'Add some AmazingFeature'`)
4. Branch pushen (`git push origin feature/AmazingFeature`)
5. Pull Request erstellen

## 📜 Lizenz

Dieses Projekt steht unter der MIT-Lizenz. Siehe LICENSE-Datei für Details.

## 🆘 Support

Bei Fragen oder Problemen:

1. Prüfen Sie die [Dokumentation](#)
2. Durchsuchen Sie die [Issues](../../issues)
3. Erstellen Sie ein neues Issue mit detaillierter Beschreibung

## 🗺 Roadmap

### Version 1.1
- [ ] Markdown-Editor für Regelwerk-Inhalte
- [ ] Export-Funktionen (PDF, Word)
- [ ] E-Mail-Benachrichtigungen bei Änderungen
- [ ] Erweiterte Benutzerrollen

### Version 1.2
- [ ] Multi-Mandanten-Fähigkeit
- [ ] REST API-Dokumentation (OpenAPI)
- [ ] Internationalisierung (i18n)
- [ ] Audit-Log für alle Systemänderungen

### Version 2.0
- [ ] Docker-Container
- [ ] PostgreSQL-Unterstützung
- [ ] GraphQL API
- [ ] Real-Time-Updates mit WebSockets

---

**Syntagma** - Transparente Regelwerk-Verwaltung für das digitale Zeitalter.

---

## 🧹 Projekt-Status (Juli 2025)

Das Projekt wurde vollständig aufgeräumt und auf Produktionsbereitschaft optimiert:

✅ **Entfernte obsolete Dateien**: Alle Test-, Debug-, und Legacy-Migrations-Skripte wurden entfernt  
✅ **Datenbankoptimierung**: Singleton-Pattern für robuste Datenbankverbindungen implementiert  
✅ **Automatische Initialisierung**: Datenbank wird beim ersten Start automatisch eingerichtet  
✅ **Aufgeräumte Struktur**: Nur produktionsrelevante Dateien verbleiben im Repository  
✅ **Getestete Stabilität**: Backend und Frontend funktionieren fehlerfrei nach dem Cleanup

## 🔒 Datenbankpersistenz & Updates

**Syntagma bietet robuste Datensicherheit:**
- ✅ **Automatische Backups** vor jedem Update und jeder Migration
- ✅ **Versionierte Migrationen** mit Rollback-Funktionalität
- ✅ **Persistente Docker Volumes** bleiben bei Container-Updates erhalten
- ✅ **Sichere Update-Prozesse** mit Backup und Verifizierung

### Update-Befehle

```bash
# Docker Update
docker-compose pull && docker-compose up -d

# Traditionelles Update
npm run update           # Linux/macOS
npm run update:win       # Windows PowerShell

# Manuelle Backups
npm run backup           # Linux/macOS  
npm run backup:win       # Windows PowerShell
npm run backup:list      # Backups auflisten
npm run backup:restore   # Backup wiederherstellen
```

📖 **Ausführliche Dokumentation:** [DATABASE_PERSISTENCE.md](./DATABASE_PERSISTENCE.md)
