import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config({ path: new URL('../.env', import.meta.url) });

let pool;

export function getPool() {
  if (!pool) {
    pool = mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '3306'),
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'timeline_app',
      waitForConnections: true,
      connectionLimit: 10,
    });
  }
  return pool;
}

export async function initDatabase() {
  const db = getPool();

  await db.query(`
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      username VARCHAR(100) NOT NULL UNIQUE,
      email VARCHAR(255) NOT NULL UNIQUE,
      password_hash VARCHAR(255) NOT NULL,
      role ENUM('admin', 'user') DEFAULT 'user',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS tags (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) NOT NULL UNIQUE,
      color VARCHAR(7) NOT NULL DEFAULT '#6366f1'
    )
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS events (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      start_year INT NOT NULL,
      start_month INT DEFAULT NULL,
      start_day INT DEFAULT NULL,
      start_era ENUM('AC','DC') DEFAULT 'DC',
      end_year INT DEFAULT NULL,
      end_month INT DEFAULT NULL,
      end_day INT DEFAULT NULL,
      end_era ENUM('AC','DC') DEFAULT 'DC',
      image_url TEXT DEFAULT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Migrate old schema: if start_date column exists, migrate data then drop old columns
  try {
    const [cols] = await db.query(
      `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
             WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'events' AND COLUMN_NAME = 'start_date'`,
      [process.env.DB_NAME || 'timeline_app']
    );
    if (cols.length > 0) {
      // Add new columns if they don't exist yet
      const addCol = async (name, def) => {
        try { await db.query(`ALTER TABLE events ADD COLUMN ${name} ${def}`); } catch { /* already exists */ }
      };
      await addCol('start_year', "INT DEFAULT NULL");
      await addCol('start_month', "INT DEFAULT NULL");
      await addCol('start_day', "INT DEFAULT NULL");
      await addCol('start_era', "ENUM('AC','DC') DEFAULT 'DC'");
      await addCol('end_year', "INT DEFAULT NULL");
      await addCol('end_month', "INT DEFAULT NULL");
      await addCol('end_day', "INT DEFAULT NULL");
      await addCol('end_era', "ENUM('AC','DC') DEFAULT 'DC'");

      // Migrate existing data
      await db.query(`
                UPDATE events SET 
                    start_year = YEAR(start_date),
                    start_month = MONTH(start_date),
                    start_day = DAY(start_date),
                    start_era = 'DC'
                WHERE start_date IS NOT NULL AND start_year IS NULL
            `);
      await db.query(`
                UPDATE events SET
                    end_year = YEAR(end_date),
                    end_month = MONTH(end_date),
                    end_day = DAY(end_date),
                    end_era = 'DC'
                WHERE end_date IS NOT NULL AND end_year IS NULL
            `);

      // Drop old columns
      try { await db.query('ALTER TABLE events DROP COLUMN start_date'); } catch { }
      try { await db.query('ALTER TABLE events DROP COLUMN end_date'); } catch { }
      console.log('✅ Migrated events table from DATE to year/month/day/era');
    }
  } catch (err) {
    console.warn('⚠️ Migration check skipped:', err.message);
  }

  await db.query(`
    CREATE TABLE IF NOT EXISTS event_tags (
      event_id INT NOT NULL,
      tag_id INT NOT NULL,
      PRIMARY KEY (event_id, tag_id),
      FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
      FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
    )
  `);

  // Seed admin user if not exists
  const [admins] = await db.query('SELECT id FROM users WHERE role = ?', ['admin']);
  if (admins.length === 0) {
    const hash = await bcrypt.hash('admin123', 10);
    await db.query(
      'INSERT INTO users (username, email, password_hash, role) VALUES (?, ?, ?, ?)',
      ['admin', 'admin@timeline.app', hash, 'admin']
    );
    console.log('✅ Admin user created (admin / admin123)');
  }

  // Seed some default tags
  const [existingTags] = await db.query('SELECT id FROM tags LIMIT 1');
  if (existingTags.length === 0) {
    const defaultTags = [
      ['Personal', '#6366f1'],
      ['Trabajo', '#f43f5e'],
      ['Educación', '#10b981'],
      ['Viaje', '#f59e0b'],
      ['Proyecto', '#3b82f6'],
      ['Hito', '#8b5cf6'],
      ['Social', '#ec4899'],
      ['Salud', '#14b8a6'],
    ];
    for (const [name, color] of defaultTags) {
      await db.query('INSERT INTO tags (name, color) VALUES (?, ?)', [name, color]);
    }
    console.log('✅ Default tags created');
  }

  console.log('✅ Database initialized');
}
