import express from 'express'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import { promisify } from 'util'
import { getDatabase } from '../database/database.js'
import { authenticateToken as auth } from '../middleware/auth.js'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const router = express.Router()

// Uploads-Verzeichnis erstellen falls es nicht existiert
const uploadsDir = path.join(__dirname, '../uploads')
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true })
}

// Multer-Konfiguration für Datei-Upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir)
  },
  filename: (req, file, cb) => {
    // Eindeutigen Dateinamen generieren
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, uniqueSuffix + path.extname(file.originalname))
  }
})

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  },
  fileFilter: (req, file, cb) => {
    // Erlaubte Dateitypen
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'text/plain',
      'image/jpeg',
      'image/png',
      'image/gif'
    ]
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error('Dateityp nicht erlaubt'), false)
    }
  }
})

// Anhang zu Regelwerk hinzufügen
router.post('/rulesets/:id/attachments', auth, upload.single('file'), async (req, res) => {
  try {
    const { id } = req.params
    const { description } = req.body
    const file = req.file

    if (!file) {
      return res.status(400).json({ error: 'Keine Datei hochgeladen' })
    }

    const db = await getDatabase()
    
    // Überprüfen, ob Regelwerk existiert
    const ruleset = await db.get('SELECT id FROM rulesets WHERE id = ?', [id])
    if (!ruleset) {
      // Hochgeladene Datei löschen
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path)
      }
      return res.status(404).json({ error: 'Regelwerk nicht gefunden' })
    }

    // Anhang in Datenbank speichern
    const result = await db.run(
      `INSERT INTO attachments (
        ruleset_id, filename, original_filename, mime_type, 
        file_size, file_path, description, uploaded_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        file.filename,
        file.originalname,
        file.mimetype,
        file.size,
        file.path,
        description || null,
        req.user.id
      ]
    )

    res.status(201).json({
      id: result.lastID,
      filename: file.filename,
      original_filename: file.originalname,
      mime_type: file.mimetype,
      file_size: file.size,
      description
    })
  } catch (error) {
    console.error('Fehler beim Speichern des Anhangs:', error)
    
    // Bei Fehler: Hochgeladene Datei löschen
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path)
    }
    
    res.status(500).json({ error: 'Fehler beim Speichern des Anhangs' })
  }
})

// Anhänge für Regelwerk abrufen
router.get('/rulesets/:id/attachments', async (req, res) => {
  try {
    const { id } = req.params
    const db = await getDatabase()

    const attachments = await db.all(
      `SELECT a.*, u.username as uploaded_by_name 
       FROM attachments a 
       LEFT JOIN users u ON a.uploaded_by = u.id 
       WHERE a.ruleset_id = ? 
       ORDER BY a.created_at DESC`,
      [id]
    )

    res.json(attachments)
  } catch (error) {
    console.error('Fehler beim Laden der Anhänge:', error)
    res.status(500).json({ error: 'Fehler beim Laden der Anhänge' })
  }
})

// Anhang herunterladen
router.get('/attachments/:id/download', async (req, res) => {
  try {
    const { id } = req.params
    const db = await getDatabase()

    const attachment = await db.get('SELECT * FROM attachments WHERE id = ?', [id])
    if (!attachment) {
      return res.status(404).json({ error: 'Anhang nicht gefunden' })
    }

    if (!fs.existsSync(attachment.file_path)) {
      return res.status(404).json({ error: 'Datei nicht gefunden' })
    }

    res.download(attachment.file_path, attachment.original_filename)
  } catch (error) {
    console.error('Fehler beim Download:', error)
    res.status(500).json({ error: 'Fehler beim Download' })
  }
})

// Anhang löschen
router.delete('/attachments/:id', auth, async (req, res) => {
  try {
    const { id } = req.params
    const db = await getDatabase()

    const attachment = await db.get('SELECT * FROM attachments WHERE id = ?', [id])
    if (!attachment) {
      return res.status(404).json({ error: 'Anhang nicht gefunden' })
    }

    // Datei löschen
    if (fs.existsSync(attachment.file_path)) {
      fs.unlinkSync(attachment.file_path)
    }

    // Aus Datenbank löschen
    await db.run('DELETE FROM attachments WHERE id = ?', [id])

    res.json({ success: true })
  } catch (error) {
    console.error('Fehler beim Löschen des Anhangs:', error)
    res.status(500).json({ error: 'Fehler beim Löschen des Anhangs' })
  }
})

// === EXTERNE LINKS ===

// Link zu Regelwerk hinzufügen
router.post('/rulesets/:id/links', auth, async (req, res) => {
  try {
    const { id } = req.params
    const { title, url, description, link_type } = req.body

    if (!title || !url) {
      return res.status(400).json({ error: 'Titel und URL sind erforderlich' })
    }

    const db = await getDatabase()
    
    // Überprüfen, ob Regelwerk existiert
    const ruleset = await db.get('SELECT id FROM rulesets WHERE id = ?', [id])
    if (!ruleset) {
      return res.status(404).json({ error: 'Regelwerk nicht gefunden' })
    }

    // Link in Datenbank speichern
    const result = await db.run(
      `INSERT INTO external_links (
        ruleset_id, title, url, description, link_type, created_by
      ) VALUES (?, ?, ?, ?, ?, ?)`,
      [
        id,
        title,
        url,
        description || null,
        link_type || 'external',
        req.user.id
      ]
    )

    res.status(201).json({
      id: result.lastID,
      title,
      url,
      description,
      link_type: link_type || 'external'
    })
  } catch (error) {
    console.error('Fehler beim Speichern des Links:', error)
    res.status(500).json({ error: 'Fehler beim Speichern des Links' })
  }
})

// Links für Regelwerk abrufen
router.get('/rulesets/:id/links', async (req, res) => {
  try {
    const { id } = req.params
    const db = await getDatabase()

    const links = await db.all(
      `SELECT l.*, u.username as created_by_name 
       FROM external_links l 
       LEFT JOIN users u ON l.created_by = u.id 
       WHERE l.ruleset_id = ? 
       ORDER BY l.created_at DESC`,
      [id]
    )

    res.json(links)
  } catch (error) {
    console.error('Fehler beim Laden der Links:', error)
    res.status(500).json({ error: 'Fehler beim Laden der Links' })
  }
})

// Link bearbeiten
router.put('/links/:id', auth, async (req, res) => {
  try {
    const { id } = req.params
    const { title, url, description, link_type } = req.body

    if (!title || !url) {
      return res.status(400).json({ error: 'Titel und URL sind erforderlich' })
    }

    const db = await getDatabase()

    const result = await db.run(
      `UPDATE external_links 
       SET title = ?, url = ?, description = ?, link_type = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [title, url, description || null, link_type || 'external', id]
    )

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Link nicht gefunden' })
    }

    res.json({
      id: parseInt(id),
      title,
      url,
      description,
      link_type: link_type || 'external'
    })
  } catch (error) {
    console.error('Fehler beim Bearbeiten des Links:', error)
    res.status(500).json({ error: 'Fehler beim Bearbeiten des Links' })
  }
})

// Link löschen
router.delete('/links/:id', auth, async (req, res) => {
  try {
    const { id } = req.params
    const db = await getDatabase()

    const result = await db.run('DELETE FROM external_links WHERE id = ?', [id])
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Link nicht gefunden' })
    }

    res.json({ success: true })
  } catch (error) {
    console.error('Fehler beim Löschen des Links:', error)
    res.status(500).json({ error: 'Fehler beim Löschen des Links' })
  }
})

export default router
