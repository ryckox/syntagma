# Many-to-Many Themen-Zuordnung für Syntagma

## Übersicht
Diese Erweiterung ermöglicht es, dass Regelwerke mehreren Themen gleichzeitig zugeordnet werden können, anstatt nur einem einzelnen Thema. Dies bietet mehr Flexibilität bei der Kategorisierung und verbessert die Auffindbarkeit von Regelwerken.

## Wichtige Änderungen

### Backend-Änderungen

#### 1. Datenbankstruktur
- **Neue Tabelle**: `ruleset_topics` (Junction-Tabelle für Many-to-Many Beziehung)
- **Entfernt**: `topic_id` Spalte aus der `rulesets` Tabelle
- **Hinzugefügt**: Indizes für bessere Performance

#### 2. API-Änderungen
**POST /api/rulesets** (Regelwerk erstellen):
```json
{
  "title": "Titel des Regelwerks",
  "type_id": 1,
  "topic_ids": [1, 2, 3],  // Array statt einzelner topic_id
  "content": "Inhalt...",
  "status": "draft"
}
```

**PUT /api/rulesets/:id** (Regelwerk aktualisieren):
```json
{
  "title": "Neuer Titel",
  "topic_ids": [2, 4],  // Array statt einzelner topic_id
  "content": "Neuer Inhalt..."
}
```

**Response-Format** (GET /api/rulesets):
```json
{
  "id": 1,
  "title": "Regelwerk Titel",
  "topics": [  // Array von Themen-Objekten
    {
      "id": 1,
      "name": "Thema 1",
      "description": "Beschreibung..."
    },
    {
      "id": 2,
      "name": "Thema 2", 
      "description": "Beschreibung..."
    }
  ],
  // ... andere Felder
}
```

### Frontend-Änderungen

#### 1. Store Updates
- **Ruleset Interface**: `topic_name` → `topics: Topic[]`
- **createRuleset Function**: `topic_id` → `topic_ids: number[]`
- **updateRuleset Function**: `topic_id` → `topic_ids: number[]`

#### 2. UI-Komponenten
- Mehrfachauswahl für Themen (Checkboxes statt Dropdown)
- Anzeige mehrerer Themen als Tags/Chips
- Validierung für mindestens ein ausgewähltes Thema

## Migration

### 1. Datenbank-Migration ausführen
```bash
cd backend
npm run migrate:many-to-many
```

Das Migrationsskript:
- Erstellt die neue `ruleset_topics` Tabelle
- Migriert bestehende Daten von `rulesets.topic_id` zu `ruleset_topics`
- Entfernt die `topic_id` Spalte aus der `rulesets` Tabelle
- Aktualisiert die FTS-Indizes

### 2. Backend starten
```bash
cd backend
npm run dev
```

### 3. Frontend starten
```bash
npm run dev
```

## Demo der neuen Funktionalität

Besuchen Sie `/demo/many-to-many` um die neue Funktionalität zu testen:

1. **Regelwerk erstellen** mit mehreren Themen
2. **Visualisierung** der Themen-Zuordnungen
3. **Validierung** der neuen API

## Technische Details

### Datenbankschema
```sql
-- Neue Junction-Tabelle
CREATE TABLE ruleset_topics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ruleset_id INTEGER NOT NULL,
    topic_id INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ruleset_id) REFERENCES rulesets(id) ON DELETE CASCADE,
    FOREIGN KEY (topic_id) REFERENCES topics(id) ON DELETE CASCADE,
    UNIQUE(ruleset_id, topic_id)
);

-- Aktualisierte rulesets Tabelle (ohne topic_id)
CREATE TABLE rulesets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    type_id INTEGER NOT NULL,
    content TEXT NOT NULL,
    version INTEGER DEFAULT 1,
    status TEXT DEFAULT 'draft',
    effective_date DATE,
    created_by INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (type_id) REFERENCES ruleset_types(id),
    FOREIGN KEY (created_by) REFERENCES users(id)
);
```

### Performance-Optimierungen
- Indizes auf `ruleset_topics(ruleset_id)` und `ruleset_topics(topic_id)`
- Optimierte Abfragen mit JOINs
- Effiziente Laden der Themen pro Regelwerk

### Validierung
- Frontend: Mindestens ein Thema muss ausgewählt werden
- Backend: Alle topic_ids müssen zum gewählten Typ gehören
- Datenbank: UNIQUE Constraint verhindert doppelte Zuordnungen

## Auswirkungen auf bestehende Funktionen

### ✅ Kompatibel
- Suche funktioniert weiterhin korrekt
- Filterung nach Themen funktioniert
- Alle bestehenden Regelwerke bleiben erhalten

### ⚠️ Anpassungen erforderlich
- Frontend-Komponenten müssen auf Array-Format umgestellt werden
- API-Aufrufe müssen `topic_ids` statt `topic_id` verwenden

## Nächste Schritte

1. **Frontend-Komponenten aktualisieren**:
   - RulesetEditor.vue
   - RulesetManagement.vue
   - Search.vue (falls nicht automatisch kompatibel)

2. **Testing**:
   - Unit Tests für neue API-Endpunkte
   - Integration Tests für Frontend-Komponenten
   - E2E Tests für gesamten Workflow

3. **Dokumentation**:
   - API-Dokumentation aktualisieren
   - Benutzerhandbuch erweitern

## Troubleshooting

### Migration schlägt fehl
```bash
# Backup der Datenbank erstellen
cp backend/database/syntagma.db backend/database/syntagma.db.backup

# Migration erneut ausführen
cd backend
node database/migrate_many_to_many_topics.js
```

### Frontend-Fehler
- Sicherstellen, dass alle Komponenten die neuen Interfaces verwenden
- Browser-Cache leeren
- TypeScript-Compilation prüfen

### API-Fehler
- Prüfen, ob `topic_ids` als Array gesendet wird
- Validierung der Themen-IDs überprüfen
- Datenbankverbindung testen
