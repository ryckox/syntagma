import express from 'express';
import { body, validationResult } from 'express-validator';
import { getDatabase } from '../database/database.js';
import { authenticateToken, requireAdmin, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

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

    // Änderungshistorie für Admins laden
    let changeHistory = [];
    if (req.user && req.user.role === 'admin') {
      changeHistory = await db.all(`
        SELECT ch.id, ch.change_type, ch.change_summary, ch.version, ch.created_at,
               u.username as changed_by_name
        FROM change_history ch
        JOIN users u ON ch.changed_by = u.id
        WHERE ch.ruleset_id = ?
        ORDER BY ch.created_at DESC
      `, [id]);
    }

    

    res.json({
      ...ruleset,
      tableOfContents,
      changeHistory
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

    // Regelwerk erstellen
    const result = await db.run(`
      INSERT INTO rulesets (title, type_id, content, status, created_by) 
    `, [title, type_id, content, status, req.user.id]);

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

    // Änderungshistorie erstellen
    await db.run(`
      INSERT INTO change_history (ruleset_id, changed_by, change_type, new_content, version, change_summary) 
      VALUES (?, ?, 'created', ?, 1, 'Initiale Erstellung')
    `, [rulesetId, req.user.id, content]);

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
    if (existingRuleset.created_by !== req.user.id && req.user.role !== 'admin') {
      
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

    // Version erhöhen wenn Inhalt geändert wird
    let newVersion = existingRuleset.version;
    if (content !== undefined || tableOfContents) {
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

    // Änderungshistorie hinzufügen
    if (content !== undefined || tableOfContents) {
      await db.run(`
        INSERT INTO change_history (ruleset_id, changed_by, change_type, old_content, new_content, version, change_summary) 
        VALUES (?, ?, 'updated', ?, ?, ?, ?)
      `, [id, req.user.id, existingRuleset.content, content || existingRuleset.content, newVersion, changeSummary || 'Regelwerk aktualisiert']);
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

    // Änderungshistorie hinzufügen vor dem Löschen
    await db.run(`
      INSERT INTO change_history (ruleset_id, changed_by, change_type, change_summary, version) 
      VALUES (?, ?, 'deleted', 'Regelwerk gelöscht', 0)
    `, [id, req.user.id]);

    // Regelwerk und alle abhängigen Datensätze löschen (CASCADE)
    await db.run('DELETE FROM rulesets WHERE id = ?', [id]);
    
    

    res.json({ message: 'Regelwerk erfolgreich gelöscht' });
  } catch (error) {
    console.error('Fehler beim Löschen des Regelwerks:', error);
    res.status(500).json({ error: 'Interner Serverfehler' });
  }
});

export default router;
