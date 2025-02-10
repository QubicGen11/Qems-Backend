const express = require('express');
const cmsController = require('../controllers/cmsController');
const { verifyToken } = require('../middlewares/authMiddleware'); // Assuming you have a middleware to verify token

const router = express.Router();

// CMS Entry Routes

// Step 1: Validate Upload (Does not insert into DB)

router.post('/entries', verifyToken, cmsController.createCMSEntry);
router.post('/entries/validateAndImport', verifyToken, cmsController.validateAndImportCMSEntry);

// Step 2: Import Confirmed Data

router.get('/entries', verifyToken, cmsController.getAllCMSEntries);

router.get('/entries/:entryId/comments', verifyToken, cmsController.getCommentsByEntryId);

// Edit CMS Entry
router.put('/entries/:id', verifyToken, cmsController.editCMSEntry);

// Delete CMS Entry
router.delete('/entries/:id', verifyToken, cmsController.deleteCMSEntry);

// CMS Comment Routes
router.post('/entries/:id/comments', verifyToken, cmsController.addComment);

// Update Call Status or Follow-Up Status
router.patch('/entries/:id/status', verifyToken, cmsController.updateStatus);

// Log Action
router.post('/logs', verifyToken, cmsController.logAction);

// Fetch All Logs
router.get('/logs', verifyToken, cmsController.getCMSLogs);

router.get('/users/lead-gen-executives', verifyToken, cmsController.getLeadGenAndExecutives);

module.exports = router;
