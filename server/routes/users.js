import { Router } from 'express';
import { getPool } from '../db.js';
import { authMiddleware, adminMiddleware } from '../middleware.js';

const router = Router();

// GET /api/users — admin only
router.get('/', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const db = getPool();
        const [users] = await db.query(
            'SELECT id, username, email, role, created_at FROM users ORDER BY created_at DESC'
        );
        res.json(users);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error del servidor' });
    }
});

export default router;
