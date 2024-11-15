// controllers/highlightController.js

// Get all highlights (without task dependency)
const getAllHighlights = async (req, res) => {
    const db = req.app.get('db');
    try {
        const highlights = await db.all('SELECT * FROM highlights');
        res.json(highlights);
    } catch (error) {
        res.status(500).json({ error: "Failed to retrieve highlights" });
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
            res.status(404).json({ error: "Highlight not found" });
        }
    } catch (error) {
        res.status(500).json({ error: "Failed to retrieve highlight" });
    }
};

// Add a new highlight (without task dependency)
const addHighlight = async (req, res) => {
    const db = req.app.get('db');
    const { image_path, task_description } = req.body;
    try {
        const result = await db.run(
            `INSERT INTO highlights (image_path, task_description) VALUES (?, ?)`,
            [image_path, task_description]
        );
        res.status(201).json({ id: result.lastID });
    } catch (error) {
        res.status(500).json({ error: "Failed to add highlight" });
    }
};

// Delete a highlight by ID
const deleteHighlight = async (req, res) => {
    const db = req.app.get('db');
    const { id } = req.params;
    try {
        await db.run('DELETE FROM highlights WHERE id = ?', id);
        res.send("Highlight deleted successfully");
    } catch (error) {
        res.status(500).json({ error: "Failed to delete highlight" });
    }
};

module.exports = { getAllHighlights, getHighlightById, addHighlight, deleteHighlight };
