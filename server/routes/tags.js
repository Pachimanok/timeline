import { Router } from 'express';
import { getPool } from '../db.js';
import { authMiddleware } from '../middleware.js';

const router = Router();

// GET /api/tags
router.get('/', authMiddleware, async (req, res) => {
    try {
        const db = getPool();
        const [tags] = await db.query('SELECT * FROM tags ORDER BY name ASC');
        res.json(tags);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error del servidor' });
    }
});

// POST /api/tags
router.post('/', authMiddleware, async (req, res) => {
    try {
        const { name, color } = req.body;
        if (!name) return res.status(400).json({ error: 'Nombre requerido' });
        const db = getPool();
        const [result] = await db.query(
            'INSERT INTO tags (name, color) VALUES (?, ?)',
            [name, color || '#6366f1']
        );
        res.status(201).json({ id: result.insertId, name, color: color || '#6366f1' });
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ error: 'La etiqueta ya existe' });
        }
        console.error(err);
        res.status(500).json({ error: 'Error del servidor' });
    }
});

// PUT /api/tags/:id
router.put('/:id', authMiddleware, async (req, res) => {
    try {
        const { name, color } = req.body;
        if (!name) return res.status(400).json({ error: 'Nombre requerido' });
        const db = getPool();
        const tagId = parseInt(req.params.id);
        await db.query('UPDATE tags SET name = ?, color = ? WHERE id = ?', [name, color || '#6366f1', tagId]);
        res.json({ id: tagId, name, color: color || '#6366f1' });
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ error: 'Ya existe una etiqueta con ese nombre' });
        }
        console.error(err);
        res.status(500).json({ error: 'Error del servidor' });
    }
});

// DELETE /api/tags/:id
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const db = getPool();
        const tagId = parseInt(req.params.id);
        // Remove tag associations from events first
        await db.query('DELETE FROM event_tags WHERE tag_id = ?', [tagId]);
        // Then delete the tag itself
        await db.query('DELETE FROM tags WHERE id = ?', [tagId]);
        res.json({ message: 'Etiqueta eliminada' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error del servidor' });
    }
});

export default router;
