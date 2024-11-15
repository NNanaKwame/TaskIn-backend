const express = require('express');
const router = express.Router();
const highlightController = require('../controllers/highlightController');

// Route to get all highlights
router.get('/', highlightController.getAllHighlights);

// Route to get a specific highlight by ID
router.get('/:id', highlightController.getHighlightById);

// Route to add a new highlight
router.post('/', highlightController.addHighlight);

// Route to delete a specific highlight by ID
router.delete('/:id', highlightController.deleteHighlight);

module.exports = router;
