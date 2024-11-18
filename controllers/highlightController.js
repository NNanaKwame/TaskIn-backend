// controllers/highlightController.js
const path = require('path');
const fs = require('fs');

// Get all highlights
const getAllHighlights = async (req, res) => {
    const db = req.app.get('db');
    try {
        const highlights = await db.all('SELECT * FROM highlights');
        res.json(highlights);
    } catch (error) {
        console.error('Error fetching highlights:', error);
        res.status(500).json({ error: 'Failed to retrieve highlights' });
    }
};

// Get a specific highlight by ID
const getHighlightById = async (req, res) => {
    const db = req.app.get('db');
    const { id } = req.params;
    try {
        const highlight = await db.get('SELECT * FROM highlights WHERE id = ?', id);
        if (highlight) {
            res.json(highlight);
        } else {
            res.status(404).json({ error: 'Highlight not found' });
        }
    } catch (error) {
        console.error('Error fetching highlight:', error);
        res.status(500).json({ error: 'Failed to retrieve highlight' });
    }
};

// Create new highlight with image
const addHighlight = async (req, res) => {
    const db = req.app.get('db');
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No image file provided' });
        }

        // Create relative path for database storage
        const relativePath = '/uploads/' + path.basename(req.file.path);
        const taskDescription = req.body.task_description || '';

        // Save to database
        const result = await db.run(
            'INSERT INTO highlights (image_path, task_description) VALUES (?, ?)',
            [relativePath, taskDescription]
        );

        res.status(201).json({ 
            id: result.lastID,
            image_path: relativePath,
            task_description: taskDescription
        });
    } catch (error) {
        // Clean up uploaded file if database operation fails
        if (req.file) {
            fs.unlink(req.file.path, (err) => {
                if (err) console.error('Error deleting file:', err);
            });
        }
        console.error('Error creating highlight:', error);
        res.status(500).json({ error: 'Failed to create highlight' });
    }
};

// Delete highlight and associated image
const deleteHighlight = async (req, res) => {
    const db = req.app.get('db');
    const { id } = req.params;
    try {
        // Get highlight details first
        const highlight = await db.get('SELECT * FROM highlights WHERE id = ?', id);
        if (!highlight) {
            return res.status(404).json({ error: 'Highlight not found' });
        }

        // Delete image file
        const imagePath = path.join(__dirname, '..', highlight.image_path);
        fs.unlink(imagePath, async (err) => {
            if (err) {
                console.error('Error deleting image file:', err);
            }

            // Delete database record
            await db.run('DELETE FROM highlights WHERE id = ?', id);
            res.json({ message: 'Highlight deleted successfully' });
        });
    } catch (error) {
        console.error('Error deleting highlight:', error);
        res.status(500).json({ error: 'Failed to delete highlight' });
    }
};

module.exports = {
    getAllHighlights,
    getHighlightById,
    addHighlight,
    deleteHighlight
};