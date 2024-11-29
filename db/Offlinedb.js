const sqlite3 = require('sqlite3').verbose();
const sqlite = require('sqlite');
const path = require('path');
const FileSystem = require('expo-file-system');

class DatabaseService {
    constructor() {
        this.db = null;
    }

    async initializeDatabase() {
        try {
            // Use Expo's FileSystem to ensure correct path
            const dbPath = path.join(FileSystem.documentDirectory, 'tasks.db');

            // Open the database
            this.db = await sqlite.open({
                filename: dbPath,
                driver: sqlite3.Database
            });

            // Create tasks table with additional sync metadata
            await this.db.exec(`
                CREATE TABLE IF NOT EXISTS tasks (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    title TEXT NOT NULL,
                    description TEXT,
                    completed BOOLEAN DEFAULT 0,
                    due_date DATETIME,
                    notification_id TEXT,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    server_id TEXT,
                    sync_status TEXT DEFAULT 'pending',
                    last_modified DATETIME DEFAULT CURRENT_TIMESTAMP
                );
            `);

            // Create highlights table with additional sync metadata
            await this.db.exec(`
                CREATE TABLE IF NOT EXISTS highlights (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    image_path TEXT NOT NULL,
                    task_description TEXT,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    server_id TEXT,
                    sync_status TEXT DEFAULT 'pending',
                    last_modified DATETIME DEFAULT CURRENT_TIMESTAMP
                );
            `);

            console.log('Database initialized successfully');
            return this.db;
        } catch (error) {
            console.error('Database initialization error:', error);
            throw error;
        }
    }

    // Tasks methods
    async getAllTasks() {
        return await this.db.all('SELECT * FROM tasks WHERE sync_status != "deleted"');
    }

    async getTaskById(id) {
        return await this.db.get('SELECT * FROM tasks WHERE id = ?', id);
    }

    async createTask(taskData) {
        const { title, description, due_date } = taskData;
        const result = await this.db.run(
            `INSERT INTO tasks (title, description, due_date, sync_status, last_modified) 
             VALUES (?, ?, ?, 'pending', CURRENT_TIMESTAMP)`,
            [title, description, due_date]
        );
        return {
            id: result.lastID,
            syncStatus: 'pending'
        };
    }

    async updateTask(id, updateData) {
        const existingTask = await this.getTaskById(id);
        if (!existingTask) {
            throw new Error('Task not found');
        }

        const updateFields = [];
        const updateValues = [];

        // Dynamically build update query
        Object.entries(updateData).forEach(([key, value]) => {
            if (value !== undefined) {
                updateFields.push(`${key} = ?`);
                updateValues.push(value);
            }
        });

        // Always update sync status and last modified
        updateFields.push('sync_status = ?');
        updateValues.push('pending');
        updateFields.push('last_modified = CURRENT_TIMESTAMP');

        // Add ID to update values
        updateValues.push(id);

        const query = `
            UPDATE tasks 
            SET ${updateFields.join(', ')} 
            WHERE id = ?
        `;

        await this.db.run(query, updateValues);
        return { syncStatus: 'pending' };
    }

    async deleteTask(id) {
        await this.db.run('UPDATE tasks SET sync_status = "deleted" WHERE id = ?', id);
        return { syncStatus: 'deleted' };
    }

    // Highlights methods
    async getAllHighlights() {
        return await this.db.all('SELECT * FROM highlights WHERE sync_status != "deleted"');
    }

    async getHighlightById(id) {
        return await this.db.get('SELECT * FROM highlights WHERE id = ?', id);
    }

    async createHighlight(highlightData) {
        const { image_path, task_description } = highlightData;
        const result = await this.db.run(
            `INSERT INTO highlights (image_path, task_description, sync_status, last_modified) 
             VALUES (?, ?, 'pending', CURRENT_TIMESTAMP)`,
            [image_path, task_description]
        );
        return {
            id: result.lastID,
            syncStatus: 'pending'
        };
    }

    async deleteHighlight(id) {
        await this.db.run('UPDATE highlights SET sync_status = "deleted" WHERE id = ?', id);
        return { syncStatus: 'deleted' };
    }

    // Sync-related methods
    async getPendingSyncItems(table) {
        return await this.db.all(`
            SELECT * FROM ${table} 
            WHERE sync_status IN ('pending', 'deleted')
        `);
    }

    async updateSyncStatus(table, localId, serverId, status = 'synced') {
        await this.db.run(`
            UPDATE ${table} 
            SET sync_status = ?, server_id = ? 
            WHERE id = ?
        `, [status, serverId, localId]);
    }

    // Close database connection
    async close() {
        if (this.db) {
            await this.db.close();
        }
    }
}

module.exports = new DatabaseService();