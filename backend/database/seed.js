import { getDatabase } from './database.js';
import bcrypt from 'bcryptjs';

const seedData = async () => {
  const db = await getDatabase();
  
  try {
    // Admin-Benutzer erstellen
    const adminPasswordHash = await bcrypt.hash('admin123', 12);
    const userPasswordHash = await bcrypt.hash('user123', 12);

    await db.run(`
      INSERT OR IGNORE INTO users (username, email, password_hash, role) 
      VALUES (?, ?, ?, ?)
    `, ['admin', 'admin@syntagma.local', adminPasswordHash, 'admin']);

    await db.run(`
      INSERT OR IGNORE INTO users (username, email, password_hash, role) 
      VALUES (?, ?, ?, ?)
    `, ['testuser', 'user@syntagma.local', userPasswordHash, 'user']);

    // Regelwerk-Typen erstellen
    const types = [
      {
        name: 'Datenschutz',
        description: 'Richtlinien und Verfahren zum Schutz personenbezogener Daten',
        color: '#28a745',
        icon: 'shield-check'
      },
      {
        name: 'IT-Sicherheitsrichtlinien',
        description: 'Sicherheitsrichtlinien für IT-Systeme und -Verfahren',
        color: '#dc3545',
        icon: 'security'
      },
      {
        name: 'Dienstvereinbarungen',
        description: 'Vereinbarungen bezüglich Arbeitsbedingungen und -verfahren',
        color: '#007bff',
        icon: 'handshake'
      }
    ];

    for (const type of types) {
      await db.run(`
        INSERT OR IGNORE INTO ruleset_types (name, description, color, icon) 
        VALUES (?, ?, ?, ?)
      `, [type.name, type.description, type.color, type.icon]);
    }

    // Themen erstellen
    const topics = [
      // Datenschutz-Themen
      { type: 'Datenschutz', name: 'Datenschutzrichtlinie', description: 'Allgemeine Datenschutzbestimmungen' },
      { type: 'Datenschutz', name: 'Auftragsverarbeitung', description: 'Verträge zur Auftragsverarbeitung' },
      { type: 'Datenschutz', name: 'Betroffenenrechte', description: 'Rechte der betroffenen Personen' },
      
      // IT-Sicherheits-Themen
      { type: 'IT-Sicherheitsrichtlinien', name: 'Laptop-Sicherheit', description: 'Sicherheitsrichtlinien für Laptops' },
      { type: 'IT-Sicherheitsrichtlinien', name: 'Mobiltelefon-Sicherheit', description: 'Sicherheitsrichtlinien für mobile Geräte' },
      { type: 'IT-Sicherheitsrichtlinien', name: 'Benutzeraccount-Verwaltung', description: 'Richtlinien für Benutzerkonten' },
      
      // Dienstvereinbarungs-Themen
      { type: 'Dienstvereinbarungen', name: 'Arbeitszeiten', description: 'Regelungen zu Arbeitszeiten' },
      { type: 'Dienstvereinbarungen', name: 'Homeoffice', description: 'Regelungen für Heimarbeit' },
      { type: 'Dienstvereinbarungen', name: 'Urlaubsregelung', description: 'Urlaubsbestimmungen' }
    ];

    for (const topic of topics) {
      const typeResult = await db.get(`SELECT id FROM ruleset_types WHERE name = ?`, [topic.type]);
      if (typeResult) {
        await db.run(`
          INSERT OR IGNORE INTO topics (type_id, name, description) 
          VALUES (?, ?, ?)
        `, [typeResult.id, topic.name, topic.description]);
      }
    }

    // Beispiel-Regelwerke erstellen
    const adminUser = await db.get(`SELECT id FROM users WHERE username = 'admin'`);
    
    const rulesets = [
      {
        title: 'Allgemeine Datenschutzrichtlinie',
        type: 'Datenschutz',
        topic: 'Datenschutzrichtlinie',
        content: 'Diese Richtlinie definiert den Umgang mit personenbezogenen Daten in unserem Unternehmen.',
        toc: [
          { level: 1, title: 'Einleitung', content: 'Grundlagen des Datenschutzes in unserem Unternehmen.' },
          { level: 1, title: 'Geltungsbereich', content: 'Diese Richtlinie gilt für alle Mitarbeiter und externe Dienstleister.' },
          { level: 2, title: 'Interne Mitarbeiter', content: 'Alle festangestellten und befristet beschäftigten Mitarbeiter.' },
          { level: 2, title: 'Externe Dienstleister', content: 'Auftragnehmer und Berater mit Zugang zu personenbezogenen Daten.' },
          { level: 1, title: 'Datenkategorien', content: 'Klassifizierung der verschiedenen Datenarten.' }
        ]
      },
      {
        title: 'Laptop-Sicherheitsrichtlinie',
        type: 'IT-Sicherheitsrichtlinien',
        topic: 'Laptop-Sicherheit',
        content: 'Sicherheitsbestimmungen für die Nutzung von Firmen-Laptops.',
        toc: [
          { level: 1, title: 'Grundregeln', content: 'Allgemeine Sicherheitsregeln für Laptop-Nutzer.' },
          { level: 2, title: 'Physische Sicherheit', content: 'Schutz vor Diebstahl und unbefugtem Zugriff.' },
          { level: 2, title: 'Software-Sicherheit', content: 'Antiviren-Software und Updates.' },
          { level: 1, title: 'Passwort-Richtlinien', content: 'Anforderungen an sichere Passwörter.' },
          { level: 1, title: 'Netzwerk-Sicherheit', content: 'Sichere Verbindungen und VPN-Nutzung.' }
        ]
      },
      {
        title: 'Homeoffice-Vereinbarung',
        type: 'Dienstvereinbarungen',
        topic: 'Homeoffice',
        content: 'Regelungen für die Arbeit im Homeoffice.',
        toc: [
          { level: 1, title: 'Voraussetzungen', content: 'Technische und räumliche Anforderungen für Homeoffice.' },
          { level: 1, title: 'Arbeitszeiten', content: 'Regelungen zu Kernarbeitszeiten und Flexibilität.' },
          { level: 2, title: 'Kernarbeitszeiten', content: 'Montag bis Freitag von 9:00 bis 15:00 Uhr.' },
          { level: 2, title: 'Flexible Zeiten', content: 'Anpassung nach Absprache mit dem Vorgesetzten.' },
          { level: 1, title: 'Datenschutz im Homeoffice', content: 'Schutz von Firmendaten in der häuslichen Umgebung.' }
        ]
      }
    ];

    for (const ruleset of rulesets) {
      const typeResult = await db.get(`SELECT id FROM ruleset_types WHERE name = ?`, [ruleset.type]);
      const topicResult = await db.get(`SELECT id FROM topics WHERE name = ?`, [ruleset.topic]);
      
      if (typeResult && topicResult && adminUser) {
        const result = await db.run(`
          INSERT OR IGNORE INTO rulesets (title, type_id, content, status, created_by) 
          VALUES (?, ?, ?, 'published', ?)
        `, [ruleset.title, typeResult.id, ruleset.content, adminUser.id]);

        // Themen-Verknüpfung erstellen
        if (result.lastID) {
          await db.run(`
            INSERT OR IGNORE INTO ruleset_topics (ruleset_id, topic_id) 
            VALUES (?, ?)
          `, [result.lastID, topicResult.id]);

          // Inhaltsverzeichnis hinzufügen
          for (let i = 0; i < ruleset.toc.length; i++) {
            const tocItem = ruleset.toc[i];
            await db.run(`
              INSERT INTO table_of_contents (ruleset_id, level, title, content, order_index) 
              VALUES (?, ?, ?, ?, ?)
            `, [result.lastID, tocItem.level, tocItem.title, tocItem.content, i + 1]);
          }

          // Änderungshistorie hinzufügen
          await db.run(`
            INSERT INTO change_history (ruleset_id, changed_by, change_type, new_content, version, change_summary) 
            VALUES (?, ?, 'created', ?, 1, 'Initiale Erstellung')
          `, [result.lastID, adminUser.id, ruleset.content]);
        }
      }
    }

    console.log('Beispieldaten erfolgreich eingefügt');
  } catch (error) {
    console.error('Fehler beim Einfügen der Beispieldaten:', error);
    throw error;
  }
};

// Seeding ausführen wenn direkt aufgerufen
if (import.meta.url === `file://${process.argv[1]}`) {
  seedData()
    .then(() => {
      console.log('Seeding abgeschlossen');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Seeding fehlgeschlagen:', error);
      process.exit(1);
    });
}

export { seedData };
