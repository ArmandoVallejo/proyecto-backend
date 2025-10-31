const {
  getAllProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject
} = require('../../src/controllers/projectController');
const Project = require('../../src/models/Project');
const { mockProjects, validProjectData, updateProjectData } = require('../utils/mockData');

// Mock the Project model
jest.mock('../../src/models/Project');

describe('Project Controller Unit Tests', () => {
  let mockRequest;
  let mockResponse;
  let mockNext;

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();

    // Create mock request, response, and next objects
    mockRequest = {
      params: {},
      body: {},
      query: {}
    };

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis()
    };

    mockNext = jest.fn();
  });

  describe('getAllProjects', () => {
    test('should return all projects successfully', async () => {
      // Mock Project.find to return mock projects
      Project.find.mockResolvedValue(mockProjects);

      await getAllProjects(mockRequest, mockResponse);

      expect(Project.find).toHaveBeenCalledWith();
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockProjects);
    });

    test('should handle database error', async () => {
      const errorMessage = 'Database connection error';
      Project.find.mockRejectedValue(new Error(errorMessage));

      await getAllProjects(mockRequest, mockResponse);

      expect(Project.find).toHaveBeenCalledWith();
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Error al obtener los proyectos',
        error: errorMessage
      });
    });
  });

  describe('getProjectById', () => {
    test('should return project when found', async () => {
      const projectId = '507f1f77bcf86cd799439011';
      const mockProject = mockProjects[0];
      mockRequest.params.id = projectId;

      Project.findById.mockResolvedValue(mockProject);

      await getProjectById(mockRequest, mockResponse);

      expect(Project.findById).toHaveBeenCalledWith(projectId);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockProject);
    });

    test('should return 404 when project not found', async () => {
      const projectId = '507f1f77bcf86cd799439099';
      mockRequest.params.id = projectId;

      Project.findById.mockResolvedValue(null);

      await getProjectById(mockRequest, mockResponse);

      expect(Project.findById).toHaveBeenCalledWith(projectId);
      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Proyecto no encontrado'
      });
    });

    test('should handle database error in getProjectById', async () => {
      const projectId = '507f1f77bcf86cd799439011';
      const errorMessage = 'Invalid ObjectId';
      mockRequest.params.id = projectId;

      Project.findById.mockRejectedValue(new Error(errorMessage));

      await getProjectById(mockRequest, mockResponse);

      expect(Project.findById).toHaveBeenCalledWith(projectId);
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Error al obtener el proyecto',
        error: errorMessage
      });
    });
  });

  describe('createProject', () => {
    test('should create project successfully', async () => {
      mockRequest.body = validProjectData;
      
      const mockSavedProject = {
        _id: '507f1f77bcf86cd799439014',
        ...validProjectData,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Mock the Project constructor and save method
      const mockProjectInstance = {
        save: jest.fn().mockResolvedValue(mockSavedProject)
      };
      Project.mockImplementation(() => mockProjectInstance);

      await createProject(mockRequest, mockResponse);

      expect(Project).toHaveBeenCalledWith(validProjectData);
      expect(mockProjectInstance.save).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith(mockSavedProject);
    });

    test('should handle validation error in createProject', async () => {
      mockRequest.body = { description: 'Project without title' };
      const errorMessage = 'Title is required';

      const mockProjectInstance = {
        save: jest.fn().mockRejectedValue(new Error(errorMessage))
      };
      Project.mockImplementation(() => mockProjectInstance);

      await createProject(mockRequest, mockResponse);

      expect(Project).toHaveBeenCalledWith(mockRequest.body);
      expect(mockProjectInstance.save).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Error al crear el proyecto',
        error: errorMessage
      });
    });
  });

  describe('updateProject', () => {
    test('should update project successfully', async () => {
      const projectId = '507f1f77bcf86cd799439011';
      mockRequest.params.id = projectId;
      mockRequest.body = updateProjectData;

      const mockUpdatedProject = {
        _id: projectId,
        ...updateProjectData,
        updatedAt: new Date()
      };

      Project.findByIdAndUpdate.mockResolvedValue(mockUpdatedProject);

      await updateProject(mockRequest, mockResponse);

      expect(Project.findByIdAndUpdate).toHaveBeenCalledWith(
        projectId,
        updateProjectData,
        { new: true, runValidators: true }
      );
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockUpdatedProject);
    });

    test('should return 404 when updating non-existent project', async () => {
      const projectId = '507f1f77bcf86cd799439099';
      mockRequest.params.id = projectId;
      mockRequest.body = updateProjectData;

      Project.findByIdAndUpdate.mockResolvedValue(null);

      await updateProject(mockRequest, mockResponse);

      expect(Project.findByIdAndUpdate).toHaveBeenCalledWith(
        projectId,
        updateProjectData,
        { new: true, runValidators: true }
      );
      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Proyecto no encontrado'
      });
    });

    test('should handle validation error in updateProject', async () => {
      const projectId = '507f1f77bcf86cd799439011';
      const errorMessage = 'Invalid status value';
      mockRequest.params.id = projectId;
      mockRequest.body = { status: 'invalid-status' };

      Project.findByIdAndUpdate.mockRejectedValue(new Error(errorMessage));

      await updateProject(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Error al actualizar el proyecto',
        error: errorMessage
      });
    });
  });

  describe('deleteProject', () => {
    test('should delete project successfully', async () => {
      const projectId = '507f1f77bcf86cd799439011';
      mockRequest.params.id = projectId;

      const mockDeletedProject = mockProjects[0];
      Project.findByIdAndDelete.mockResolvedValue(mockDeletedProject);

      await deleteProject(mockRequest, mockResponse);

      expect(Project.findByIdAndDelete).toHaveBeenCalledWith(projectId);
      expect(mockResponse.status).toHaveBeenCalledWith(204);
      expect(mockResponse.send).toHaveBeenCalled();
    });

    test('should return 404 when deleting non-existent project', async () => {
      const projectId = '507f1f77bcf86cd799439099';
      mockRequest.params.id = projectId;

      Project.findByIdAndDelete.mockResolvedValue(null);

      await deleteProject(mockRequest, mockResponse);

      expect(Project.findByIdAndDelete).toHaveBeenCalledWith(projectId);
      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Proyecto no encontrado'
      });
    });

    test('should handle database error in deleteProject', async () => {
      const projectId = '507f1f77bcf86cd799439011';
      const errorMessage = 'Database deletion error';
      mockRequest.params.id = projectId;

      Project.findByIdAndDelete.mockRejectedValue(new Error(errorMessage));

      await deleteProject(mockRequest, mockResponse);

      expect(Project.findByIdAndDelete).toHaveBeenCalledWith(projectId);
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Error al eliminar el proyecto',
        error: errorMessage
      });
    });
  });

  describe('Controller Input Validation', () => {
    test('should handle missing request parameters gracefully', async () => {
      // Test with missing id parameter
      mockRequest.params = {};
      
      Project.findById.mockResolvedValue(null);
      
      await getProjectById(mockRequest, mockResponse);
      
      expect(Project.findById).toHaveBeenCalledWith(undefined);
    });

    test('should handle empty request body', async () => {
      mockRequest.body = {};
      
      const mockProjectInstance = {
        save: jest.fn().mockRejectedValue(new Error('Title is required'))
      };
      Project.mockImplementation(() => mockProjectInstance);

      await createProject(mockRequest, mockResponse);

      expect(Project).toHaveBeenCalledWith({});
      expect(mockResponse.status).toHaveBeenCalledWith(500);
    });
  });
});