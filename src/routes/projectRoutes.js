const express = require('express');
const router = express.Router();

const {
	getAllProjects,
	getProjectById,
	createProject,
	updateProject,
	deleteProject
} = require('../controllers/projectController');

// Rutas para proyectos
router.get('/projects', getAllProjects);
router.get('/projects/:id', getProjectById);
router.post('/projects', createProject);
router.put('/projects/:id', updateProject);
router.delete('/projects/:id', deleteProject);

module.exports = router;