const express = require('express');
const router = express.Router();
const { upload, handleMulterError } = require('../middleware/upload');
const {
	uploadFiles,
	getProjectFiles,
	deleteFile,
	serveFile,
	getFileStats
} = require('../controllers/fileController');

// Upload files to a project
// POST /api/projects/:projectId/files
router.post('/projects/:projectId/files', 
	upload.array('files', 5), // Accept up to 5 files with field name 'files'
	handleMulterError,
	uploadFiles
);

// Get all files for a project
// GET /api/projects/:projectId/files
router.get('/projects/:projectId/files', getProjectFiles);

// Get file statistics for a project
// GET /api/projects/:projectId/files/stats
router.get('/projects/:projectId/files/stats', getFileStats);

// Delete a specific file from a project
// DELETE /api/projects/:projectId/files/:fileId
router.delete('/projects/:projectId/files/:fileId', deleteFile);

// Serve/download a file
// GET /api/files/:filename
router.get('/files/:filename', serveFile);

module.exports = router;