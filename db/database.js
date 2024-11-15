// db/database.js
const sqlite3 = require('sqlite3').verbose();
const sqlite = require('sqlite');

async function initializeDatabase() {
    const db = await sqlite.open({
        filename: './db.sqlite',
        driver: sqlite3.Database
    });

    await db.exec(`
        CREATE TABLE IF NOT EXISTS tasks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            description TEXT,
            completed BOOLEAN DEFAULT 0,
            due_date DATETIME,
            notification_id TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
    `);

    await db.exec(`
        CREATE TABLE IF NOT EXISTS highlights (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            image_path TEXT NOT NULL,
            task_description TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
    `);

    return db;
}

module.exports = initializeDatabase;
