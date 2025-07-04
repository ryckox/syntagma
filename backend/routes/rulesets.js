import express from 'express';
import { body, validationResult } from 'express-validator';
import { getDatabase } from '../database/database.js';
import { authenticateToken, requireAdmin, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// Hilfsfunktion für Audit-Log-Einträge
async function logAuditEntry(db, rulesetId, action, fieldChanges, oldValues, newValues, versionBefore, versionAfter, user, req) {
  try {
    await db.run(`
      INSERT INTO ruleset_audit_log (
        ruleset_id, action, field_changes, old_values, new_values, 
        version_before, version_after, user_id, user_name, 
        ip_address, user_agent
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      rulesetId,
      action,
      JSON.stringify(fieldChanges),
      JSON.stringify(oldValues),
      JSON.stringify(newValues),
      versionBefore,
      versionAfter,
      user.id,
      user.username,
      req.ip || req.connection?.remoteAddress || 'unknown',
      req.get('User-Agent') || 'unknown'
    ]);
  } catch (error) {
    console.error('Fehler beim Schreiben des Audit-Logs:', error);
    // Audit-Log-Fehler sollten die Hauptoperation nicht blockieren
  }
}

// Funktion zum Vergleichen von Objekten für Audit-Log
function getChangedFields(oldObj, newObj, fieldsToCheck) {
  const changes = {};
  const oldValues = {};
  const newValues = {};

  fieldsToCheck.forEach(field => {
    if (oldObj[field] !== newObj[field]) {
      changes[field] = { from: oldObj[field], to: newObj[field] };
      oldValues[field] = oldObj[field];
      newValues[field] = newObj[field];
    }
  });

  return { changes, oldValues, newValues };
}

// Alle Regelwerke abrufen mit verbesserter Pagination
router.get('/', optionalAuth, async (req, res) => {
  const { 
    type, 
    topic, 
    status, 
    page = 1, 
    pageSize = 10,
    search = '',
    sortBy = 'updated_at',
    sortOrder = 'DESC'
  } = req.query;

  try {
    const db = await getDatabase();
    
    // Validierung der Pagination-Parameter
    const currentPage = Math.max(1, parseInt(page));
    const itemsPerPage = Math.min(Math.max(1, parseInt(pageSize)), 100); // Max 100 Items
    const offset = (currentPage - 1) * itemsPerPage;
    
    // Validierung der Sortierung
    const allowedSortFields = ['title', 'created_at', 'updated_at', 'version', 'type_name'];
    const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'updated_at';
    const order = ['ASC', 'DESC'].includes(sortOrder.toUpperCase()) ? sortOrder.toUpperCase() : 'DESC';
    
    let baseQuery = `
      FROM rulesets r
      JOIN ruleset_types rt ON r.type_id = rt.id
      JOIN users u ON r.created_by = u.id
    `;

    const conditions = [];
    const params = [];

    // Nur veröffentlichte Regelwerke für normale Benutzer
    if (!req.user || req.user.role !== 'admin') {
      conditions.push("r.status = 'published'");
    } else if (status) {
      conditions.push("r.status = ?");
      params.push(status);
    }

    if (type) {
      conditions.push("r.type_id = ?");
      params.push(type);
    }

    if (topic) {
      baseQuery += ` JOIN ruleset_topics rt_junction ON r.id = rt_junction.ruleset_id`;
      conditions.push("rt_junction.topic_id = ?");
      params.push(topic);
    }

    // Suchfunktion
    if (search) {
      conditions.push("(r.title LIKE ? OR r.content LIKE ?)");
      params.push(`%${search}%`, `%${search}%`);
    }

    const whereClause = conditions.length > 0 ? ` WHERE ${conditions.join(' AND ')}` : '';
    
    // Count Query für Pagination
    const countQuery = `SELECT COUNT(DISTINCT r.id) as total ${baseQuery} ${whereClause}`;
    const totalResult = await db.get(countQuery, params);
    const totalItems = totalResult.total;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    
    // Main Query für Daten
    const dataQuery = `
      SELECT DISTINCT r.id, r.title, r.content, r.status, r.version, r.created_at, r.updated_at, r.effective_date,
             rt.name as type_name, rt.color as type_color, rt.icon as type_icon,
             u.username as created_by_name
      ${baseQuery} ${whereClause}
      ORDER BY ${sortField === 'type_name' ? 'rt.name' : 'r.' + sortField} ${order} 
      LIMIT ? OFFSET ?
    `;
    
    const rulesets = await db.all(dataQuery, [...params, itemsPerPage, offset]);

    // Themen für jedes Regelwerk laden
    for (const ruleset of rulesets) {
      const topics = await db.all(`
        SELECT t.id, t.name, t.description
        FROM topics t
        JOIN ruleset_topics rt ON t.id = rt.topic_id
        WHERE rt.ruleset_id = ?
      `, [ruleset.id]);
      ruleset.topics = topics;
    }

    

    res.json({
      rulesets,
      pagination: {
        currentPage,
        pageSize: itemsPerPage,
        totalItems,
        totalPages,
        hasNextPage: currentPage < totalPages,
        hasPreviousPage: currentPage > 1,
        startItem: offset + 1,
        endItem: Math.min(offset + itemsPerPage, totalItems)
      },
      filters: {
        type,
        topic,
        status,
        search,
        sortBy: sortField,
        sortOrder: order
      }
    });
  } catch (error) {
    console.error('Fehler beim Abrufen der Regelwerke:', error);
    res.status(500).json({ error: 'Interner Serverfehler' });
  }
});

// Admin-Endpunkt: Audit-Log für alle Regelwerke abrufen
router.get('/audit-log', authenticateToken, requireAdmin, async (req, res) => {
  const { 
    rulesetId, 
    rulesetSearch,
    action, 
    userId, 
    page = 1, 
    pageSize = 50,
    startDate,
    endDate
  } = req.query;

  try {
    const db = await getDatabase();
    
    // Validierung der Pagination-Parameter
    const currentPage = Math.max(1, parseInt(page));
    const itemsPerPage = Math.min(Math.max(1, parseInt(pageSize)), 100);
    const offset = (currentPage - 1) * itemsPerPage;
    
    let baseQuery = `
      FROM ruleset_audit_log al
      LEFT JOIN rulesets r ON al.ruleset_id = r.id
      LEFT JOIN users u ON al.user_id = u.id
    `;

    const conditions = [];
    const params = [];

    // Filter anwenden
    if (rulesetId) {
      conditions.push("al.ruleset_id = ?");
      params.push(rulesetId);
    }

    if (rulesetSearch) {
      conditions.push("r.title LIKE ?");
      params.push(`%${rulesetSearch}%`);
    }

    if (action) {
      conditions.push("al.action = ?");
      params.push(action);
    }

    if (userId) {
      conditions.push("al.user_id = ?");
      params.push(userId);
    }

    if (startDate) {
      conditions.push("al.timestamp >= ?");
      params.push(startDate);
    }

    if (endDate) {
      conditions.push("al.timestamp <= ?");
      params.push(endDate);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Gesamtanzahl der Einträge
    const countQuery = `SELECT COUNT(*) as total ${baseQuery} ${whereClause}`;
    const countResult = await db.get(countQuery, params);
    const total = countResult.total;

    // Audit-Log-Einträge abrufen
    const auditQuery = `
      SELECT 
        al.id, al.ruleset_id, al.action, al.field_changes, al.old_values, al.new_values,
        al.version_before, al.version_after, al.timestamp, al.user_name,
        al.ip_address, al.user_agent,
        r.title as ruleset_title,
        u.username as user_username, u.email as user_email
      ${baseQuery} 
      ${whereClause}
      ORDER BY al.timestamp DESC
      LIMIT ? OFFSET ?
    `;

    const auditLogs = await db.all(auditQuery, [...params, itemsPerPage, offset]);

    // Parse JSON strings zurück zu Objekten
    const processedLogs = auditLogs.map(entry => ({
      ...entry,
      field_changes: entry.field_changes ? JSON.parse(entry.field_changes) : {},
      old_values: entry.old_values ? JSON.parse(entry.old_values) : {},
      new_values: entry.new_values ? JSON.parse(entry.new_values) : {}
    }));

    res.json({
      auditLogs: processedLogs,
      pagination: {
        currentPage,
        pageSize: itemsPerPage,
        total,
        totalPages: Math.ceil(total / itemsPerPage)
      }
    });
  } catch (error) {
    console.error('Fehler beim Abrufen des Audit-Logs:', error);
    res.status(500).json({ error: 'Interner Serverfehler' });
  }
});

// Regelwerk nach ID abrufen
router.get('/:id', optionalAuth, async (req, res) => {
  const { id } = req.params;

  try {
    const db = await getDatabase();
    
    const ruleset = await db.get(`
      SELECT r.id, r.title, r.content, r.status, r.version, r.created_at, r.updated_at,
             r.type_id,
             rt.name as type_name, rt.color as type_color, rt.icon as type_icon,
             u.username as created_by_name
      FROM rulesets r
      JOIN ruleset_types rt ON r.type_id = rt.id
      JOIN users u ON r.created_by = u.id
      WHERE r.id = ?
    `, [id]);

    if (!ruleset) {
      
      return res.status(404).json({ error: 'Regelwerk nicht gefunden' });
    }

    // Nur veröffentlichte Regelwerke für normale Benutzer
    if (ruleset.status !== 'published' && (!req.user || req.user.role !== 'admin')) {
      
      return res.status(403).json({ error: 'Zugriff verweigert' });
    }

    // Themen laden
    const topics = await db.all(`
      SELECT t.id, t.name, t.description
      FROM topics t
      JOIN ruleset_topics rt ON t.id = rt.topic_id
      WHERE rt.ruleset_id = ?
    `, [id]);
    ruleset.topics = topics;

    // Inhaltsverzeichnis laden
    const tableOfContents = await db.all(`
      SELECT id, level, title, content, order_index
      FROM table_of_contents
      WHERE ruleset_id = ?
      ORDER BY order_index
    `, [id]);

    // Audit-Log für Admins laden
    let auditLog = [];
    if (req.user && req.user.role === 'admin') {
      auditLog = await db.all(`
        SELECT al.id, al.action, al.field_changes, al.old_values, al.new_values,
               al.version_before, al.version_after, al.timestamp, al.user_name,
               al.ip_address, al.user_agent
        FROM ruleset_audit_log al
        WHERE al.ruleset_id = ?
        ORDER BY al.timestamp DESC
      `, [id]);
      
      // Parse JSON strings zurück zu Objekten
      auditLog = auditLog.map(entry => ({
        ...entry,
        field_changes: entry.field_changes ? JSON.parse(entry.field_changes) : {},
        old_values: entry.old_values ? JSON.parse(entry.old_values) : {},
        new_values: entry.new_values ? JSON.parse(entry.new_values) : {}
      }));
    }

    

    res.json({
      ...ruleset,
      tableOfContents,
      auditLog
    });
  } catch (error) {
    console.error('Fehler beim Abrufen des Regelwerks:', error);
    res.status(500).json({ error: 'Interner Serverfehler' });
  }
});

// Neues Regelwerk erstellen (nur authentifizierte Benutzer)
router.post('/', [
  authenticateToken,
  body('title').isLength({ min: 3 }).trim().escape(),
  body('type_id').isInt({ min: 1 }),
  body('topic_ids').isArray({ min: 1 }).custom((value) => {
    if (!value.every(id => Number.isInteger(id) && id > 0)) {
      throw new Error('Alle Themen-IDs müssen positive Ganzzahlen sein');
    }
    return true;
  }),
  body('content').isLength({ min: 10 }),
  body('status').optional().isIn(['draft', 'published']),
  body('tableOfContents').optional().isArray()
], async (req, res) => {
  console.log('POST /api/rulesets - Creating new ruleset');
  
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { title, type_id, topic_ids, content, status = 'draft', tableOfContents = [] } = req.body;

  try {
    const db = await getDatabase();
    
    // Prüfen ob Typ existiert
    const typeExists = await db.get('SELECT id FROM ruleset_types WHERE id = ?', [type_id]);
    if (!typeExists) {
      
      return res.status(400).json({ error: 'Angegebener Typ existiert nicht' });
    }

    // Prüfen ob alle Themen existieren und zum Typ gehören
    const topicChecks = await Promise.all(
      topic_ids.map(topicId => 
        db.get('SELECT id FROM topics WHERE id = ? AND type_id = ?', [topicId, type_id])
      )
    );

    if (topicChecks.some(topic => !topic)) {
      
      return res.status(400).json({ error: 'Ein oder mehrere Themen existieren nicht oder gehören nicht zum angegebenen Typ' });
    }

    // Version basierend auf Status setzen
    const initialVersion = status === 'published' ? 1 : 0;

    // Regelwerk erstellen
    const result = await db.run(`
      INSERT INTO rulesets (title, type_id, content, status, version, created_by) 
      VALUES (?, ?, ?, ?, ?, ?)
    `, [title, type_id, content, status, initialVersion, req.user.id]);

    const rulesetId = result.lastID;

    // Themen-Verknüpfungen erstellen
    for (const topicId of topic_ids) {
      await db.run(`
        INSERT INTO ruleset_topics (ruleset_id, topic_id) 
        VALUES (?, ?)
      `, [rulesetId, topicId]);
    }

    // Inhaltsverzeichnis erstellen
    for (let i = 0; i < tableOfContents.length; i++) {
      const toc = tableOfContents[i];
      await db.run(`
        INSERT INTO table_of_contents (ruleset_id, level, title, content, order_index) 
        VALUES (?, ?, ?, ?, ?)
      `, [rulesetId, toc.level, toc.title, toc.content || '', i + 1]);
    }

    // Audit-Log-Eintrag für Erstellung
    await logAuditEntry(
      db, rulesetId, 'created', 
      { title, type_id, topic_ids, status }, 
      {}, 
      { title, type_id, topic_ids, content, status },
      null, 
      initialVersion.toString(), 
      req.user, 
      req
    );

    // Erstelltes Regelwerk zurückgeben
    const newRuleset = await db.get(`
      SELECT r.id, r.title, r.content, r.status, r.version, r.created_at, r.updated_at,
             rt.name as type_name, rt.color as type_color, rt.icon as type_icon,
             u.username as created_by_name
      FROM rulesets r
      JOIN ruleset_types rt ON r.type_id = rt.id
      JOIN users u ON r.created_by = u.id
      WHERE r.id = ?
    `, [rulesetId]);

    // Themen für das neue Regelwerk laden
    const topics = await db.all(`
      SELECT t.id, t.name, t.description
      FROM topics t
      JOIN ruleset_topics rt ON t.id = rt.topic_id
      WHERE rt.ruleset_id = ?
    `, [rulesetId]);
    newRuleset.topics = topics;

    

    res.status(201).json(newRuleset);
  } catch (error) {
    console.error('Fehler beim Erstellen des Regelwerks:', error);
    res.status(500).json({ error: 'Interner Serverfehler' });
  }
});

// Regelwerk aktualisieren
router.put('/:id', [
  authenticateToken,
  body('title').optional().isLength({ min: 3 }).trim().escape(),
  body('type_id').optional().isInt({ min: 1 }),
  body('topic_ids').optional().isArray().custom((value) => {
    if (value && !value.every(id => Number.isInteger(id) && id > 0)) {
      throw new Error('Alle Themen-IDs müssen positive Ganzzahlen sein');
    }
    return true;
  }),
  body('content').optional().isLength({ min: 10 }),
  body('status').optional().isIn(['draft', 'published', 'archived']),
  body('tableOfContents').optional().isArray(),
  body('changeSummary').optional().trim().escape()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { id } = req.params;
  const { title, type_id, topic_ids, content, status, tableOfContents, changeSummary } = req.body;

  try {
    const db = await getDatabase();
    
    // Prüfen ob Regelwerk existiert und Berechtigung
    const existingRuleset = await db.get(
      'SELECT id, created_by, content, version FROM rulesets WHERE id = ?',
      [id]
    );

    if (!existingRuleset) {
      
      return res.status(404).json({ error: 'Regelwerk nicht gefunden' });
    }

    // Nur Ersteller oder Admins dürfen bearbeiten
    console.log(`User ${req.user.id} (${req.user.username}, role: ${req.user.role}) editing ruleset ${id} created by ${existingRuleset.created_by}`);
    
    if (existingRuleset.created_by !== req.user.id && req.user.role !== 'admin') {
      console.log(`Access denied: User ${req.user.id} (${req.user.role}) trying to edit ruleset created by ${existingRuleset.created_by}`);
      return res.status(403).json({ error: 'Keine Berechtigung zum Bearbeiten' });
    }

    // Update-Felder dynamisch aufbauen
    const updates = [];
    const values = [];

    if (title !== undefined) {
      updates.push('title = ?');
      values.push(title);
    }
    if (type_id !== undefined) {
      updates.push('type_id = ?');
      values.push(type_id);
    }
    if (content !== undefined) {
      updates.push('content = ?');
      values.push(content);
    }
    if (status !== undefined) {
      updates.push('status = ?');
      values.push(status);
    }

    if (updates.length === 0 && !tableOfContents && !topic_ids) {
      
      return res.status(400).json({ error: 'Keine Aktualisierungsdaten bereitgestellt' });
    }

    // Validierung für topic_ids falls bereitgestellt
    if (topic_ids !== undefined) {
      const finalTypeId = type_id !== undefined ? type_id : (await db.get('SELECT type_id FROM rulesets WHERE id = ?', [id])).type_id;
      
      const topicChecks = await Promise.all(
        topic_ids.map(topicId => 
          db.get('SELECT id FROM topics WHERE id = ? AND type_id = ?', [topicId, finalTypeId])
        )
      );

      if (topicChecks.some(topic => !topic)) {
        
        return res.status(400).json({ error: 'Ein oder mehrere Themen existieren nicht oder gehören nicht zum angegebenen Typ' });
      }
    }

    // Version erhöhen nur wenn als "published" gespeichert wird
    let newVersion = existingRuleset.version;
    if (status === 'published' && existingRuleset.status !== 'published') {
      // Erste Veröffentlichung oder Wiederveröffentlichung
      newVersion = existingRuleset.version + 1;
      updates.push('version = ?');
      values.push(newVersion);
    } else if (status === 'published' && (content !== undefined || tableOfContents)) {
      // Update an bereits veröffentlichtem Regelwerk
      newVersion = existingRuleset.version + 1;
      updates.push('version = ?');
      values.push(newVersion);
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);

    // Regelwerk aktualisieren
    if (updates.length > 1) { // mehr als nur updated_at
      await db.run(
        `UPDATE rulesets SET ${updates.join(', ')} WHERE id = ?`,
        values
      );
    }

    // Themen-Zuordnungen aktualisieren
    if (topic_ids !== undefined) {
      // Alte Zuordnungen löschen
      await db.run('DELETE FROM ruleset_topics WHERE ruleset_id = ?', [id]);
      
      // Neue Zuordnungen erstellen
      for (const topicId of topic_ids) {
        await db.run(`
          INSERT INTO ruleset_topics (ruleset_id, topic_id) 
          VALUES (?, ?)
        `, [id, topicId]);
      }
    }

    // Inhaltsverzeichnis aktualisieren
    if (tableOfContents) {
      await db.run('DELETE FROM table_of_contents WHERE ruleset_id = ?', [id]);
      
      for (let i = 0; i < tableOfContents.length; i++) {
        const toc = tableOfContents[i];
        await db.run(`
          INSERT INTO table_of_contents (ruleset_id, level, title, content, order_index) 
          VALUES (?, ?, ?, ?, ?)
        `, [id, toc.level, toc.title, toc.content || '', i + 1]);
      }
    }

    // Audit-Log-Eintrag für Update
    if (content !== undefined || tableOfContents || topic_ids !== undefined || title !== undefined || type_id !== undefined || status !== undefined) {
      const fieldsToCheck = ['title', 'content', 'status', 'type_id'];
      const oldObj = {
        title: existingRuleset.title,
        content: existingRuleset.content,
        status: existingRuleset.status,
        type_id: existingRuleset.type_id
      };
      const newObj = {
        title: title !== undefined ? title : existingRuleset.title,
        content: content !== undefined ? content : existingRuleset.content,
        status: status !== undefined ? status : existingRuleset.status,
        type_id: type_id !== undefined ? type_id : existingRuleset.type_id
      };

      const { changes, oldValues, newValues } = getChangedFields(oldObj, newObj, fieldsToCheck);
      
      if (topic_ids !== undefined) {
        changes.topic_ids = { from: 'previous_topics', to: topic_ids };
        oldValues.topic_ids = 'previous_topics';
        newValues.topic_ids = topic_ids;
      }

      if (tableOfContents) {
        changes.tableOfContents = { from: 'previous_toc', to: 'updated_toc' };
        oldValues.tableOfContents = 'previous_toc';
        newValues.tableOfContents = 'updated_toc';
      }

      await logAuditEntry(
        db, id, 'updated',
        changes,
        oldValues,
        newValues,
        existingRuleset.version.toString(),
        newVersion.toString(),
        req.user,
        req
      );
    }

    // Aktualisiertes Regelwerk zurückgeben
    const updatedRuleset = await db.get(`
      SELECT r.id, r.title, r.content, r.status, r.version, r.created_at, r.updated_at,
             rt.name as type_name, rt.color as type_color, rt.icon as type_icon,
             u.username as created_by_name
      FROM rulesets r
      JOIN ruleset_types rt ON r.type_id = rt.id
      JOIN users u ON r.created_by = u.id
      WHERE r.id = ?
    `, [id]);

    // Themen für das aktualisierte Regelwerk laden
    const topics = await db.all(`
      SELECT t.id, t.name, t.description
      FROM topics t
      JOIN ruleset_topics rt ON t.id = rt.topic_id
      WHERE rt.ruleset_id = ?
    `, [id]);
    updatedRuleset.topics = topics;

    

    res.json(updatedRuleset);
  } catch (error) {
    console.error('Fehler beim Aktualisieren des Regelwerks:', error);
    res.status(500).json({ error: 'Interner Serverfehler' });
  }
});

// Regelwerk löschen
router.delete('/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;

  try {
    const db = await getDatabase();
    
    const existingRuleset = await db.get(
      'SELECT id, created_by, title FROM rulesets WHERE id = ?',
      [id]
    );

    if (!existingRuleset) {
      
      return res.status(404).json({ error: 'Regelwerk nicht gefunden' });
    }

    // Nur Ersteller oder Admins dürfen löschen
    if (existingRuleset.created_by !== req.user.id && req.user.role !== 'admin') {
      
      return res.status(403).json({ error: 'Keine Berechtigung zum Löschen' });
    }

    // Audit-Log-Eintrag vor dem Löschen
    await logAuditEntry(
      db, id, 'deleted',
      { action: 'delete' },
      { title: existingRuleset.title, status: 'existing' },
      { title: existingRuleset.title, status: 'deleted' },
      'final',
      'deleted',
      req.user,
      req
    );

    // Regelwerk und alle abhängigen Datensätze löschen (CASCADE)
    await db.run('DELETE FROM rulesets WHERE id = ?', [id]);
    
    

    res.json({ message: 'Regelwerk erfolgreich gelöscht' });
  } catch (error) {
    console.error('Fehler beim Löschen des Regelwerks:', error);
    res.status(500).json({ error: 'Interner Serverfehler' });
  }
});

// Admin-Endpunkt: Audit-Log für ein spezifisches Regelwerk
router.get('/:id/audit-log', authenticateToken, requireAdmin, async (req, res) => {
  const { id } = req.params;

  try {
    const db = await getDatabase();
    
    // Prüfen ob Regelwerk existiert
    const ruleset = await db.get('SELECT id, title FROM rulesets WHERE id = ?', [id]);
    if (!ruleset) {
      return res.status(404).json({ error: 'Regelwerk nicht gefunden' });
    }

    // Audit-Log für das spezifische Regelwerk abrufen
    const auditLogs = await db.all(`
      SELECT 
        al.id, al.action, al.field_changes, al.old_values, al.new_values,
        al.version_before, al.version_after, al.timestamp, al.user_name,
        al.ip_address, al.user_agent,
        u.username as user_username, u.email as user_email
      FROM ruleset_audit_log al
      LEFT JOIN users u ON al.user_id = u.id
      WHERE al.ruleset_id = ?
      ORDER BY al.timestamp DESC
    `, [id]);

    // Parse JSON strings zurück zu Objekten
    const processedLogs = auditLogs.map(entry => ({
      ...entry,
      field_changes: entry.field_changes ? JSON.parse(entry.field_changes) : {},
      old_values: entry.old_values ? JSON.parse(entry.old_values) : {},
      new_values: entry.new_values ? JSON.parse(entry.new_values) : {}
    }));

    res.json({
      ruleset: {
        id: ruleset.id,
        title: ruleset.title
      },
      auditLogs: processedLogs
    });
  } catch (error) {
    console.error('Fehler beim Abrufen des Audit-Logs für Regelwerk:', error);
    res.status(500).json({ error: 'Interner Serverfehler' });
  }
});

export default router;
