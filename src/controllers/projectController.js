const Project = require('../models/Project');

// Traer todos los proyectos
const getAllProjects = async (req, res) => {
	try{
		const projects =  await Project.find();
		res.status(200).json(projects);
	} catch (error) {
		res.status(500).json({ message: 'Error al obtener los proyectos', error: error.message });
	}
};

//Traer un proyecto por ID
const getProjectById = async (req, res) => {
	const { id } = req.params;
	try{
		const project = await Project.findById(id);
		if(!project){
			return res.status(404).json({ message: 'Proyecto no encontrado' });
		}
		res.status(200).json(project);
	} catch (error) {
		res.status(500).json({ message: 'Error al obtener el proyecto', error: error.message });
	}
};

//Crear un nuevo proyecto
const createProject = async (req, res) => {
	const { title, description, startDate, endDate, status, tasks } = req.body;
	try{
		const newProject = new Project(req.body);
		const savedProject = await newProject.save();
		res.status(201).json(savedProject);
	} catch (error) {
		res.status(500).json({ message: 'Error al crear el proyecto', error: error.message });
	}
};

//Actualizar un proyecto existente
const updateProject = async (req, res) => {
	const { id } = req.params;
	try{
		const updatedProject = await Project.findByIdAndUpdate(
			id,
			req.body,
			{ new: true, runValidators: true }
			
		);
		if(!updatedProject){
			return res.status(404).json({ message: 'Proyecto no encontrado' });
		}
		res.status(200).json(updatedProject);
	} catch (error) {
		res.status(500).json({ message: 'Error al actualizar el proyecto', error: error.message });
	}
};

//Eliminar un proyecto
const deleteProject = async (req, res) => {
	const { id } = req.params;
	try{
		const deletedProject = await Project.findByIdAndDelete(id);
		if(!deletedProject){
			return res.status(404).json({ message: 'Proyecto no encontrado' });
		}
		res.status(204).send();
	} catch (error) {
		res.status(500).json({ message: 'Error al eliminar el proyecto', error: error.message });
	}
};

module.exports = {
	getAllProjects,
	getProjectById,
	createProject,
	updateProject,
	deleteProject
};
