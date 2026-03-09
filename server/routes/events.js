import { Router } from 'express';
import { getPool } from '../db.js';
import { authMiddleware, adminMiddleware } from '../middleware.js';

const router = Router();

// Helper: build ORDER BY for chronological sorting (AC before DC, then by year, month, day)
const ORDER_BY = `
  CASE WHEN e.start_era = 'AC' THEN 0 ELSE 1 END ASC,
  CASE WHEN e.start_era = 'AC' THEN -e.start_year ELSE e.start_year END ASC,
  COALESCE(e.start_month, 1) ASC,
  COALESCE(e.start_day, 1) ASC
`;

// GET /api/events
router.get('/', authMiddleware, async (req, res) => {
    try {
        const db = getPool();
        let userId = req.user.id;

        if (req.user.role === 'admin' && req.query.user_id) {
            userId = parseInt(req.query.user_id);
        }

        const [events] = await db.query(
            `SELECT e.*, GROUP_CONCAT(DISTINCT t.id) as tag_ids, GROUP_CONCAT(DISTINCT t.name) as tag_names, GROUP_CONCAT(DISTINCT t.color) as tag_colors
       FROM events e
       LEFT JOIN event_tags et ON e.id = et.event_id
       LEFT JOIN tags t ON et.tag_id = t.id
       WHERE e.user_id = ?
       GROUP BY e.id
       ORDER BY ${ORDER_BY}`,
            [userId]
        );

        const formatted = events.map(e => ({
            ...e,
            tags: e.tag_ids
                ? e.tag_ids.split(',').map((id, i) => ({
                    id: parseInt(id),
                    name: e.tag_names.split(',')[i],
                    color: e.tag_colors.split(',')[i],
                }))
                : [],
            tag_ids: undefined,
            tag_names: undefined,
            tag_colors: undefined,
        }));

        res.json(formatted);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error del servidor' });
    }
});

// POST /api/events
router.post('/', authMiddleware, async (req, res) => {
    try {
        const { title, description, start_year, start_month, start_day, start_era, end_year, end_month, end_day, end_era, image_url, tag_ids } = req.body;
        if (!title || start_year == null) {
            return res.status(400).json({ error: 'Título y año de inicio requeridos' });
        }
        const db = getPool();
        const userId = req.user.id;

        const [result] = await db.query(
            `INSERT INTO events (user_id, title, description, start_year, start_month, start_day, start_era, end_year, end_month, end_day, end_era, image_url) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [userId, title, description || null,
                parseInt(start_year), start_month ? parseInt(start_month) : null, start_day ? parseInt(start_day) : null, start_era || 'DC',
                end_year ? parseInt(end_year) : null, end_month ? parseInt(end_month) : null, end_day ? parseInt(end_day) : null, end_era || 'DC',
                image_url || null]
        );

        // Associate tags
        if (tag_ids && tag_ids.length > 0) {
            const values = tag_ids.map(tid => [result.insertId, tid]);
            await db.query('INSERT INTO event_tags (event_id, tag_id) VALUES ?', [values]);
        }

        // Return the created event with tags
        const [events] = await db.query(
            `SELECT e.*, GROUP_CONCAT(DISTINCT t.id) as tag_ids, GROUP_CONCAT(DISTINCT t.name) as tag_names, GROUP_CONCAT(DISTINCT t.color) as tag_colors
       FROM events e
       LEFT JOIN event_tags et ON e.id = et.event_id
       LEFT JOIN tags t ON et.tag_id = t.id
       WHERE e.id = ?
       GROUP BY e.id`,
            [result.insertId]
        );

        const event = events[0];
        event.tags = event.tag_ids
            ? event.tag_ids.split(',').map((id, i) => ({
                id: parseInt(id),
                name: event.tag_names.split(',')[i],
                color: event.tag_colors.split(',')[i],
            }))
            : [];
        delete event.tag_ids;
        delete event.tag_names;
        delete event.tag_colors;

        res.status(201).json(event);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error del servidor' });
    }
});

// PUT /api/events/:id
router.put('/:id', authMiddleware, async (req, res) => {
    try {
        const db = getPool();
        const eventId = parseInt(req.params.id);

        const [existing] = await db.query('SELECT * FROM events WHERE id = ?', [eventId]);
        if (existing.length === 0) return res.status(404).json({ error: 'Evento no encontrado' });
        if (existing[0].user_id !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ error: 'No tenés permiso para editar este evento' });
        }

        const { title, description, start_year, start_month, start_day, start_era, end_year, end_month, end_day, end_era, image_url, tag_ids } = req.body;
        await db.query(
            `UPDATE events SET title = ?, description = ?, start_year = ?, start_month = ?, start_day = ?, start_era = ?, end_year = ?, end_month = ?, end_day = ?, end_era = ?, image_url = ? WHERE id = ?`,
            [title, description || null,
                parseInt(start_year), start_month ? parseInt(start_month) : null, start_day ? parseInt(start_day) : null, start_era || 'DC',
                end_year ? parseInt(end_year) : null, end_month ? parseInt(end_month) : null, end_day ? parseInt(end_day) : null, end_era || 'DC',
                image_url || null, eventId]
        );

        // Update tags
        await db.query('DELETE FROM event_tags WHERE event_id = ?', [eventId]);
        if (tag_ids && tag_ids.length > 0) {
            const values = tag_ids.map(tid => [eventId, tid]);
            await db.query('INSERT INTO event_tags (event_id, tag_id) VALUES ?', [values]);
        }

        // Return updated event
        const [events] = await db.query(
            `SELECT e.*, GROUP_CONCAT(DISTINCT t.id) as tag_ids, GROUP_CONCAT(DISTINCT t.name) as tag_names, GROUP_CONCAT(DISTINCT t.color) as tag_colors
       FROM events e
       LEFT JOIN event_tags et ON e.id = et.event_id
       LEFT JOIN tags t ON et.tag_id = t.id
       WHERE e.id = ?
       GROUP BY e.id`,
            [eventId]
        );

        const event = events[0];
        event.tags = event.tag_ids
            ? event.tag_ids.split(',').map((id, i) => ({
                id: parseInt(id),
                name: event.tag_names.split(',')[i],
                color: event.tag_colors.split(',')[i],
            }))
            : [];
        delete event.tag_ids;
        delete event.tag_names;
        delete event.tag_colors;

        res.json(event);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error del servidor' });
    }
});

// DELETE /api/events/:id
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const db = getPool();
        const eventId = parseInt(req.params.id);

        const [existing] = await db.query('SELECT * FROM events WHERE id = ?', [eventId]);
        if (existing.length === 0) return res.status(404).json({ error: 'Evento no encontrado' });
        if (existing[0].user_id !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ error: 'No tenés permiso para eliminar este evento' });
        }

        await db.query('DELETE FROM events WHERE id = ?', [eventId]);
        res.json({ message: 'Evento eliminado' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error del servidor' });
    }
});

export default router;
