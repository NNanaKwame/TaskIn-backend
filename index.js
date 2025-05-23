// index.js
require('dotenv').config();
const express = require('express');
const path = require('path');
const initializeDatabase = require('./db/Onlinedb');
// const initializeDatabase = require('./db/database');
const taskRoutes = require('./routes/taskRoutes');
const highlightRoutes = require('./routes/highlightRoutes');

const app = express();
const cors = require('cors');
const PORT = process.env.PORT || 5000;

app.use(express.json()); // Parse JSON request bodies
app.use(cors());

// Serve static files from the uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

(async () => {
    const db = await initializeDatabase();
    app.set('db', db); // Attach db to the app instance for easy access

    // Define Routes
    app.use('/tasks', taskRoutes);
    app.use('/highlights', highlightRoutes);

    // Start server
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
})();
