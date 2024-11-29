
const cloudinary = require('cloudinary').v2;

// Create a new highlight with image upload to Cloudinary
const addHighlight = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        // Cloudinary returns the URL of the uploaded image
        const imageUrl = req.file.path; // Cloudinary URL for the uploaded image
        const taskDescription = req.body.task_description || ''; // Optional task description

        // Save highlight to database (assuming SQLite or MySQL)
        const result = await db.run(
            'INSERT INTO highlights (image_url, task_description) VALUES (?, ?)',
            [imageUrl, taskDescription]
        );

        res.status(201).json({
            id: result.lastID,
            image_url: imageUrl,
            task_description: taskDescription,
        });
    } catch (error) {
        console.error('Error creating highlight:', error);
        res.status(500).json({ error: 'Failed to create highlight' });
    }
};

// Get all highlights
const getAllHighlights = async (req, res) => {
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

// Delete a highlight
const deleteHighlight = async (req, res) => {
    const { id } = req.params;
    try {
        const highlight = await db.get('SELECT * FROM highlights WHERE id = ?', id);
        if (!highlight) {
            return res.status(404).json({ error: 'Highlight not found' });
        }

        // Destroy image from Cloudinary
        cloudinary.uploader.destroy(highlight.image_url.split('/').pop(), (result) => {
            if (result.result !== 'ok') {
                console.error('Error deleting image from Cloudinary:', result);
            }

            // Delete highlight record from the database
            db.run('DELETE FROM highlights WHERE id = ?', id);
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