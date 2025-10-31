const request = require('supertest');
const app = require('../../src/index');
const DatabaseTestUtil = require('../utils/databaseTestUtil');
const { mockProjects, validProjectData } = require('../utils/mockData');

describe('Project API Integration Tests', () => {
  let databaseTestUtil;

  beforeAll(async () => {
    databaseTestUtil = new DatabaseTestUtil();
    await databaseTestUtil.connect();
  });

  afterAll(async () => {
    await databaseTestUtil.closeDatabase();
  });

  beforeEach(async () => {
    await databaseTestUtil.clearDatabase();
  });

  describe('GET /api/projects', () => {
    test('should return empty array when no projects exist', async () => {
      const response = await request(app)
        .get('/api/projects')
        .expect(200);

      expect(response.body).toEqual([]);
    });

    test('should return all projects', async () => {
      // Seed database with test projects
      await databaseTestUtil.seedDatabase({ projects: mockProjects });

      const response = await request(app)
        .get('/api/projects')
        .expect(200);

      expect(response.body).toHaveLength(3);
      expect(response.body[0]).toHaveProperty('title');
      expect(response.body[0]).toHaveProperty('status');
      expect(response.body[0]).toHaveProperty('tasks');
    });

    test('should handle database errors gracefully', async () => {
      // Close database connection to simulate error
      await databaseTestUtil.closeDatabase();

      const response = await request(app)
        .get('/api/projects')
        .expect(500);

      expect(response.body).toHaveProperty('message', 'Error al obtener los proyectos');
      expect(response.body).toHaveProperty('error');

      // Reconnect for other tests
      await databaseTestUtil.connect();
    });
  });

  describe('GET /api/projects/:id', () => {
    let projectId;

    beforeEach(async () => {
      // Create a project and get its ID
      const Project = require('../../src/models/Project');
      const project = await Project.create(mockProjects[0]);
      projectId = project._id.toString();
    });

    test('should return project by valid ID', async () => {
      const response = await request(app)
        .get(`/api/projects/${projectId}`)
        .expect(200);

      expect(response.body).toHaveProperty('_id', projectId);
      expect(response.body).toHaveProperty('title', 'Project Alpha');
      expect(response.body).toHaveProperty('status', 'in progress');
      expect(response.body.tasks).toHaveLength(2);
    });

    test('should return 404 for non-existent project ID', async () => {
      const nonExistentId = '507f1f77bcf86cd799439999';
      
      const response = await request(app)
        .get(`/api/projects/${nonExistentId}`)
        .expect(404);

      expect(response.body).toHaveProperty('message', 'Proyecto no encontrado');
    });

    test('should return 500 for invalid ObjectId format', async () => {
      const invalidId = 'invalid-id-format';
      
      const response = await request(app)
        .get(`/api/projects/${invalidId}`)
        .expect(500);

      expect(response.body).toHaveProperty('message', 'Error al obtener el proyecto');
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /api/projects', () => {
    test('should create a new project with valid data', async () => {
      const response = await request(app)
        .post('/api/projects')
        .send(validProjectData)
        .expect(201);

      expect(response.body).toHaveProperty('_id');
      expect(response.body).toHaveProperty('title', validProjectData.title);
      expect(response.body).toHaveProperty('description', validProjectData.description);
      expect(response.body).toHaveProperty('status', validProjectData.status);
      expect(response.body).toHaveProperty('tasks');
      expect(response.body.tasks).toHaveLength(1);
      expect(response.body).toHaveProperty('createdAt');
      expect(response.body).toHaveProperty('updatedAt');
    });

    test('should create project with minimal required data', async () => {
      const minimalProject = { title: 'Minimal Test Project' };

      const response = await request(app)
        .post('/api/projects')
        .send(minimalProject)
        .expect(201);

      expect(response.body).toHaveProperty('_id');
      expect(response.body).toHaveProperty('title', 'Minimal Test Project');
      expect(response.body).toHaveProperty('description', '');
      expect(response.body).toHaveProperty('status', 'not started');
      expect(response.body.tasks).toEqual([]);
    });

    test('should return 500 for missing required title', async () => {
      const invalidProject = { description: 'Project without title' };

      const response = await request(app)
        .post('/api/projects')
        .send(invalidProject)
        .expect(500);

      expect(response.body).toHaveProperty('message', 'Error al crear el proyecto');
      expect(response.body).toHaveProperty('error');
    });

    test('should return 500 for invalid status value', async () => {
      const projectWithInvalidStatus = {
        title: 'Test Project',
        status: 'invalid-status'
      };

      const response = await request(app)
        .post('/api/projects')
        .send(projectWithInvalidStatus)
        .expect(500);

      expect(response.body).toHaveProperty('message', 'Error al crear el proyecto');
      expect(response.body).toHaveProperty('error');
    });

    test('should handle malformed JSON data', async () => {
      const response = await request(app)
        .post('/api/projects')
        .set('Content-Type', 'application/json')
        .send('{ invalid json }')
        .expect(400);
    });
  });

  describe('PUT /api/projects/:id', () => {
    let projectId;

    beforeEach(async () => {
      // Create a project to update
      const Project = require('../../src/models/Project');
      const project = await Project.create(mockProjects[0]);
      projectId = project._id.toString();
    });

    test('should update project with valid data', async () => {
      const updateData = {
        title: 'Updated Project Title',
        description: 'Updated description',
        status: 'completed'
      };

      const response = await request(app)
        .put(`/api/projects/${projectId}`)
        .send(updateData)
        .expect(200);

      expect(response.body).toHaveProperty('_id', projectId);
      expect(response.body).toHaveProperty('title', updateData.title);
      expect(response.body).toHaveProperty('description', updateData.description);
      expect(response.body).toHaveProperty('status', updateData.status);
    });

    test('should update only provided fields', async () => {
      const partialUpdateData = { status: 'completed' };

      const response = await request(app)
        .put(`/api/projects/${projectId}`)
        .send(partialUpdateData)
        .expect(200);

      expect(response.body).toHaveProperty('_id', projectId);
      expect(response.body).toHaveProperty('title', 'Project Alpha'); // Original title
      expect(response.body).toHaveProperty('status', 'completed'); // Updated status
    });

    test('should return 404 for non-existent project ID', async () => {
      const nonExistentId = '507f1f77bcf86cd799439999';
      const updateData = { title: 'Updated Title' };

      const response = await request(app)
        .put(`/api/projects/${nonExistentId}`)
        .send(updateData)
        .expect(404);

      expect(response.body).toHaveProperty('message', 'Proyecto no encontrado');
    });

    test('should return 500 for invalid update data', async () => {
      const invalidUpdateData = { status: 'invalid-status' };

      const response = await request(app)
        .put(`/api/projects/${projectId}`)
        .send(invalidUpdateData)
        .expect(500);

      expect(response.body).toHaveProperty('message', 'Error al actualizar el proyecto');
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('DELETE /api/projects/:id', () => {
    let projectId;

    beforeEach(async () => {
      // Create a project to delete
      const Project = require('../../src/models/Project');
      const project = await Project.create(mockProjects[0]);
      projectId = project._id.toString();
    });

    test('should delete project successfully', async () => {
      const response = await request(app)
        .delete(`/api/projects/${projectId}`)
        .expect(204);

      expect(response.body).toEqual({});

      // Verify project was deleted
      const getResponse = await request(app)
        .get(`/api/projects/${projectId}`)
        .expect(404);
    });

    test('should return 404 for non-existent project ID', async () => {
      const nonExistentId = '507f1f77bcf86cd799439999';

      const response = await request(app)
        .delete(`/api/projects/${nonExistentId}`)
        .expect(404);

      expect(response.body).toHaveProperty('message', 'Proyecto no encontrado');
    });

    test('should return 500 for invalid ObjectId format', async () => {
      const invalidId = 'invalid-id-format';

      const response = await request(app)
        .delete(`/api/projects/${invalidId}`)
        .expect(500);

      expect(response.body).toHaveProperty('message', 'Error al eliminar el proyecto');
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('API Middleware Integration', () => {
    test('should handle CORS headers', async () => {
      const response = await request(app)
        .get('/api/projects')
        .expect(200);

      expect(response.headers).toHaveProperty('access-control-allow-origin');
    });

    test('should handle JSON parsing', async () => {
      const response = await request(app)
        .post('/api/projects')
        .set('Content-Type', 'application/json')
        .send(JSON.stringify(validProjectData))
        .expect(201);

      expect(response.body).toHaveProperty('title', validProjectData.title);
    });

    test('should respond to health check endpoint', async () => {
      const response = await request(app)
        .get('/')
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Servidor funcionando correctamente');
    });
  });

  describe('Error Handling Integration', () => {
    test('should handle 404 for non-existent endpoints', async () => {
      const response = await request(app)
        .get('/api/non-existent-endpoint')
        .expect(404);
    });

    test('should handle unsupported HTTP methods', async () => {
      const response = await request(app)
        .patch('/api/projects')
        .expect(404);
    });
  });
});