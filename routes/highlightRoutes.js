// routes/highlightRoutes.js
const express = require('express');
const router = express.Router();
const upload = require('../config/multerConfig');
const {
    getAllHighlights,
    getHighlightById,
    addHighlight,
    deleteHighlight
} = require('../controllers/highlightController');

// Routes
router.get('/', getAllHighlights);
router.get('/:id', getHighlightById);
router.post('/', upload.single('image'), addHighlight);
router.delete('/:id', deleteHighlight);

module.exports = router;