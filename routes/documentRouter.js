// routes/documentRouter.js
const express = require('express');
const { getDocument } = require('../controllers/documentController');

const router = express.Router();

router.get('/:type/:employeeId', getDocument);

module.exports = router;