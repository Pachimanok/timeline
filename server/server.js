import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '..', '.env') });

import { initDatabase } from './db.js';
import authRoutes from './routes/auth.js';
import eventRoutes from './routes/events.js';
import tagRoutes from './routes/tags.js';
import userRoutes from './routes/users.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/tags', tagRoutes);
app.use('/api/users', userRoutes);

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Initialize DB and start
initDatabase()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`🚀 Timeline API running on http://localhost:${PORT}`);
        });
    })
    .catch(err => {
        console.error('❌ Failed to initialize database:', err);
        process.exit(1);
    });
