// db/database.js
require('dotenv').config();
const mysql = require('mysql2/promise');

async function initializeDatabase() {
    // Create a connection pool using environment variables
    const pool = mysql.createPool({
        host: process.env.DB_HOST,               // Host from .env
        port: process.env.DB_PORT,               // Port from .env
        user: process.env.DB_USER,               // User from .env
        password: process.env.DB_PASSWORD,       // Password from .env
        database: process.env.DB_NAME,           // Database from .env
        waitForConnections: true,
        connectionLimit: process.env.DB_CONNECTION_LIMIT || 10, // Default to 10 if not specified
        queueLimit: process.env.DB_QUEUE_LIMIT || 0, // Default to 0 if not specified
        connectTimeout: process.env.DB_CONNECT_TIMEOUT || 10000 // Default to 10 seconds if not specified
    });

    const connection = await pool.getConnection();

    // Ensure tables exist
    await connection.query(`
        CREATE TABLE IF NOT EXISTS tasks (
            id INT AUTO_INCREMENT PRIMARY KEY,
            title VARCHAR(255) NOT NULL,
            description TEXT,
            completed BOOLEAN DEFAULT FALSE,
            due_date DATETIME,
            notification_id VARCHAR(255),
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
    `);

    await connection.query(`
        CREATE TABLE IF NOT EXISTS highlights (
            id INT AUTO_INCREMENT PRIMARY KEY,
            image_path VARCHAR(255) NOT NULL,
            task_description TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
    `);

    // Release the connection back to the pool
    connection.release();

    return pool; // Return the connection pool for future queries
}

module.exports = initializeDatabase;
