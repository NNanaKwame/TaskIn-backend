const cloudinary = require('cloudinary').v2;

// Create a new highlight with image upload to Cloudinary
const addHighlight = async (req, res) => {
    const db = req.app.get('db'); // Use MySQL connection pool
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        // Cloudinary returns the URL of the uploaded image
        const imageUrl = req.file.path; // Cloudinary URL for the uploaded image
        const taskDescription = req.body.task_description || ''; // Optional task description

        // Save highlight to database
        const [result] = await db.execute(
            'INSERT INTO highlights (image_path, task_description) VALUES (?, ?)',
            [imageUrl, taskDescription]
        );

        res.status(201).json({
            id: result.insertId,
            image_path: imageUrl,
            task_description: taskDescription,
        });
    } catch (error) {
        console.error('Error creating highlight:', error);
        res.status(500).json({ error: 'Failed to create highlight' });
    }
};

// Get all highlights
const getAllHighlights = async (req, res) => {
    const db = req.app.get('db'); // Use MySQL connection pool
    try {
        const [highlights] = await db.execute('SELECT * FROM highlights');
        res.json(highlights);
    } catch (error) {
        console.error('Error fetching highlights:', error);
        res.status(500).json({ error: 'Failed to retrieve highlights' });
    }
};

// Get a specific highlight by ID
const getHighlightById = async (req, res) => {
    const db = req.app.get('db'); // Use MySQL connection pool
    const { id } = req.params;
    try {
        const [rows] = await db.execute('SELECT * FROM highlights WHERE id = ?', [id]);
        const highlight = rows[0];
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
    const db = req.app.get('db');
    const { id } = req.params;
    try {
        const [rows] = await db.execute('SELECT * FROM highlights WHERE id = ?', [id]);
        const highlight = rows[0];
        if (!highlight) {
            return res.status(404).json({ error: 'Highlight not found' });
        }

        if (!highlight.image_path) {
            return res.status(400).json({ error: 'Image path not found for this highlight' });
        }

        // Extract public ID starting from 'highlights'
        const public_id = highlight.image_path.split('/').slice(-2).join('/').split('.')[0];
        console.log('Public ID:', public_id);

        try {
            const result = await cloudinary.uploader.destroy(public_id);
            
            if (result.result !== 'ok') {
                console.error('Cloudinary deletion result:', result);
                return res.status(500).json({ error: 'Failed to delete image from Cloudinary' });
            }

            await db.execute('DELETE FROM highlights WHERE id = ?', [id]);
            res.json({ message: 'Highlight deleted successfully' });
        } catch (cloudinaryError) {
            console.error('Cloudinary deletion error:', cloudinaryError);
            return res.status(500).json({ error: 'Failed to delete image from Cloudinary' });
        }
    } catch (error) {
        console.error('Error deleting highlight:', error);
        res.status(500).json({ error: 'Failed to delete highlight' });
    }
};

module.exports = {
    getAllHighlights,
    getHighlightById,
    addHighlight,
    deleteHighlight,
};
