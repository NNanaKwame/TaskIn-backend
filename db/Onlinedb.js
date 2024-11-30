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
        connectTimeout: process.env.DB_CONNECT_TIMEOUT || 10000, // Default to 10 seconds if not specified
        ssl: {
            ca: `-MIIEQTCCAqmgAwIBAgIUYoK2elEYporwKvuFOX8+1EzfEowwDQYJKoZIhvcNAQEM
BQAwOjE4MDYGA1UEAwwvNmE0OThlNjctYTYwOS00MGI1LWJjNDEtNTkzMDE2YTNi
ZjAyIFByb2plY3QgQ0EwHhcNMjQxMTI5MTUzMjQ3WhcNMzQxMTI3MTUzMjQ3WjA6
MTgwNgYDVQQDDC82YTQ5OGU2Ny1hNjA5LTQwYjUtYmM0MS01OTMwMTZhM2JmMDIg
UHJvamVjdCBDQTCCAaIwDQYJKoZIhvcNAQEBBQADggGPADCCAYoCggGBAMdPPH6g
OaAEbZE7lwhARMJEYhgUXuoLSzNQrEwY6tVYiN+mISDwqFgJzV/dknzQbgVgFIwR
Pb5krfXnWLnUm6WzkeUiMjV3yXl/945+N5PcalA9CV09/ZNF0AxZ7ndmYkC8ooHd
4HbU1JdmSxa2YbJFyU65TnuPQHRIw+VXD5MxK37XqAMgjAdL8JOlMFNKzpPv2i3F
CE2YevlkjC/3FNjiScWyXuy2ix0deKBS9QrVJDRHwBo0vtkDg8kczw2xgyrAXO9X
WGmGxbWOABsX871PUXS896uU3tczh5s2MHTvHUO0VOYehEcZ8Pwj1+seQDgmwIKG
0R4kdqKZswB/y/oaKa4u4ff4l94nMfsvt5Z86H2bXkBRN8mFWa9mnO6YKF2S7B3A
/soKDvCI4N4734aeyhM5mfoer+7M45R/jd3p5wVDM8/EnRQ+HD22ViSJJGjt08uX
HGAkcHO2ijRkuF6oenlwBEpvlznjJV5SHQYkfWKIe3HJHBUezzy97D34gQIDAQAB
oz8wPTAdBgNVHQ4EFgQU4vU9HFlZJ/jkUPc2292hKpKnOIQwDwYDVR0TBAgwBgEB
/wIBADALBgNVHQ8EBAMCAQYwDQYJKoZIhvcNAQEMBQADggGBAH6uUnURSS9obk9A
WmZYxaHPlgMOA+G3O4yGnxxWSomSn3eDH7rcK7fz7b4rc7PH4RYCYGi1J3wu/FUg
HRTxNMEmeN12HGTxFP/huDwYhS5/wicb7rJQCRS8EX81SGbYr9BCwNNh7NZCK6iP
x5/UE13EuIx73yL1dQLyK5iqZ86LRlDca1cOKjph91BxVnX8w3xweh6pFJ99suqn
TYrGPJddQzuLkXIfPIYu3AOvRsfTzPokRqjjbJLjkdi3rTVV4rHwIK/5Jskz/aYf
NjlrIunpY3KQDiNz/oVA7w7Ns6sUWVov0zSPVzkKYw6ENN0T8QDEQvU163brDVJe
cZYFArAzBI+vVkpyrsXst08xBO2NtT2XywqJtcmBZY2LfFqeitZ1G7LjBRlNXIH2
D84Y7uixI3r6ugJmHpnPFQ/gGaixwoUyM9kyrZXOd79qh+t5kdZxm+2cUImTb78q
5B1KgRwsq8TJHHdpKG1P6rKAWFqJnAXEwRmyuq4E7fYzuInBEw==`
          },
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
