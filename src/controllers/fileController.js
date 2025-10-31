const Project = require('../models/Project');
const fs = require('fs');
const path = require('path');
const { getFileCategory, formatFileSize } = require('../middleware/upload');

// Upload files to a project
const uploadFiles = async (req, res) => {
	const { projectId } = req.params;
	
	try {
		// Check if project exists
		const project = await Project.findById(projectId);
		if (!project) {
			// Clean up uploaded files if project doesn't exist
			if (req.files) {
				req.files.forEach(file => {
					fs.unlink(file.path, (err) => {
						if (err) console.error('Error deleting file:', err);
					});
				});
			}
			return res.status(404).json({ message: 'Proyecto no encontrado' });
		}

		// Check if files were uploaded
		if (!req.files || req.files.length === 0) {
			return res.status(400).json({ message: 'No se subieron archivos' });
		}

		// Process uploaded files
		const uploadedFiles = req.files.map(file => ({
			filename: file.filename,
			originalName: file.originalname,
			mimetype: file.mimetype,
			size: file.size,
			category: getFileCategory(file.mimetype),
			path: file.path,
			uploadedAt: new Date()
		}));

		// Add files to project
		project.files.push(...uploadedFiles);
		await project.save();

		// Format response
		const responseFiles = uploadedFiles.map(file => ({
			...file,
			formattedSize: formatFileSize(file.size),
			url: `/api/files/${path.basename(file.path)}`
		}));

		res.status(201).json({
			message: `${uploadedFiles.length} archivo(s) subido(s) exitosamente`,
			files: responseFiles,
			projectId: projectId
		});

	} catch (error) {
		// Clean up uploaded files in case of error
		if (req.files) {
			req.files.forEach(file => {
				fs.unlink(file.path, (err) => {
					if (err) console.error('Error deleting file:', err);
				});
			});
		}

		res.status(500).json({ 
			message: 'Error al subir archivos', 
			error: error.message 
		});
	}
};

// Get all files for a project
const getProjectFiles = async (req, res) => {
	const { projectId } = req.params;
	
	try {
		const project = await Project.findById(projectId).select('files title');
		if (!project) {
			return res.status(404).json({ message: 'Proyecto no encontrado' });
		}

		// Format file response with additional metadata
		const formattedFiles = project.files.map(file => ({
			_id: file._id,
			filename: file.filename,
			originalName: file.originalName,
			mimetype: file.mimetype,
			size: file.size,
			formattedSize: formatFileSize(file.size),
			category: file.category,
			uploadedAt: file.uploadedAt,
			url: `/api/files/${file.filename}`
		}));

		res.status(200).json({
			projectId: projectId,
			projectTitle: project.title,
			filesCount: formattedFiles.length,
			files: formattedFiles
		});

	} catch (error) {
		res.status(500).json({ 
			message: 'Error al obtener archivos del proyecto', 
			error: error.message 
		});
	}
};

// Delete a specific file from a project
const deleteFile = async (req, res) => {
	const { projectId, fileId } = req.params;
	
	try {
		const project = await Project.findById(projectId);
		if (!project) {
			return res.status(404).json({ message: 'Proyecto no encontrado' });
		}

		// Find the file in the project
		const fileIndex = project.files.findIndex(file => file._id.toString() === fileId);
		if (fileIndex === -1) {
			return res.status(404).json({ message: 'Archivo no encontrado en el proyecto' });
		}

		const fileToDelete = project.files[fileIndex];
		
		// Delete physical file
		fs.unlink(fileToDelete.path, (err) => {
			if (err) {
				console.error('Error deleting physical file:', err);
			}
		});

		// Remove file from project
		project.files.splice(fileIndex, 1);
		await project.save();

		res.status(200).json({ 
			message: 'Archivo eliminado exitosamente',
			deletedFile: {
				filename: fileToDelete.filename,
				originalName: fileToDelete.originalName
			}
		});

	} catch (error) {
		res.status(500).json({ 
			message: 'Error al eliminar archivo', 
			error: error.message 
		});
	}
};

// Serve/download a file
const serveFile = async (req, res) => {
	const { filename } = req.params;
	
	try {
		const filePath = path.join(__dirname, '../../uploads/projects', filename);
		
		// Check if file exists
		if (!fs.existsSync(filePath)) {
			return res.status(404).json({ message: 'Archivo no encontrado' });
		}

		// Find project and file metadata
		const project = await Project.findOne({ 'files.filename': filename });
		if (!project) {
			return res.status(404).json({ message: 'Archivo no encontrado en la base de datos' });
		}

		const fileMetadata = project.files.find(file => file.filename === filename);
		
		// Set appropriate headers
		res.set({
			'Content-Type': fileMetadata.mimetype,
			'Content-Disposition': `inline; filename="${fileMetadata.originalName}"`
		});

		// Send file
		res.sendFile(path.resolve(filePath));

	} catch (error) {
		res.status(500).json({ 
			message: 'Error al servir archivo', 
			error: error.message 
		});
	}
};

// Get file statistics for a project
const getFileStats = async (req, res) => {
	const { projectId } = req.params;
	
	try {
		const project = await Project.findById(projectId).select('files title');
		if (!project) {
			return res.status(404).json({ message: 'Proyecto no encontrado' });
		}

		// Calculate statistics
		const stats = {
			totalFiles: project.files.length,
			totalSize: project.files.reduce((sum, file) => sum + file.size, 0),
			categories: {},
			recentFiles: project.files
				.sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt))
				.slice(0, 5)
				.map(file => ({
					filename: file.filename,
					originalName: file.originalName,
					category: file.category,
					uploadedAt: file.uploadedAt,
					formattedSize: formatFileSize(file.size)
				}))
		};

		// Group by category
		project.files.forEach(file => {
			if (!stats.categories[file.category]) {
				stats.categories[file.category] = {
					count: 0,
					totalSize: 0
				};
			}
			stats.categories[file.category].count++;
			stats.categories[file.category].totalSize += file.size;
		});

		// Format category sizes
		Object.keys(stats.categories).forEach(category => {
			stats.categories[category].formattedSize = formatFileSize(stats.categories[category].totalSize);
		});

		stats.formattedTotalSize = formatFileSize(stats.totalSize);

		res.status(200).json({
			projectId: projectId,
			projectTitle: project.title,
			stats: stats
		});

	} catch (error) {
		res.status(500).json({ 
			message: 'Error al obtener estadísticas de archivos', 
			error: error.message 
		});
	}
};

module.exports = {
	uploadFiles,
	getProjectFiles,
	deleteFile,
	serveFile,
	getFileStats
};