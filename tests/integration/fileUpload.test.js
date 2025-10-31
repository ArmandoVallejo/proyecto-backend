const request = require('supertest');
const fs = require('fs');
const path = require('path');
const app = require('../../src/index');
const Project = require('../../src/models/Project');
const DatabaseTestUtil = require('../utils/databaseTestUtil');

describe('File Upload Integration Tests', () => {
  let databaseTestUtil;
  let testProject;
  let testFilePath;

  beforeAll(async () => {
    databaseTestUtil = new DatabaseTestUtil();
    await databaseTestUtil.connect();
    
    // Create a test file for upload testing
    testFilePath = path.join(__dirname, '../utils/test-file.txt');
    fs.writeFileSync(testFilePath, 'This is a test file for upload testing.');
  });

  afterAll(async () => {
    // Clean up test file
    if (fs.existsSync(testFilePath)) {
      fs.unlinkSync(testFilePath);
    }
    
    await databaseTestUtil.closeDatabase();
  });

  beforeEach(async () => {
    await databaseTestUtil.clearDatabase();
    
    // Create a test project
    testProject = await Project.create({
      title: 'Test Project for File Upload',
      description: 'Project for testing file uploads'
    });
  });

  afterEach(async () => {
    // Clean up uploaded files after each test
    const uploadsDir = path.join(__dirname, '../../uploads/projects');
    if (fs.existsSync(uploadsDir)) {
      const files = fs.readdirSync(uploadsDir);
      files.forEach(file => {
        const filePath = path.join(uploadsDir, file);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      });
    }
  });

  describe('POST /api/projects/:projectId/files', () => {
    test('should upload a single file successfully', async () => {
      const response = await request(app)
        .post(`/api/projects/${testProject._id}/files`)
        .attach('files', testFilePath);

      expect(response.status).toBe(201);
      expect(response.body.message).toContain('1 archivo(s) subido(s) exitosamente');
      expect(response.body.files).toHaveLength(1);
      expect(response.body.files[0]).toHaveProperty('filename');
      expect(response.body.files[0]).toHaveProperty('originalName', 'test-file.txt');
      expect(response.body.files[0]).toHaveProperty('mimetype', 'text/plain');
      expect(response.body.files[0]).toHaveProperty('category', 'document');

      // Verify file is stored in database
      const updatedProject = await Project.findById(testProject._id);
      expect(updatedProject.files).toHaveLength(1);
      expect(updatedProject.files[0].originalName).toBe('test-file.txt');
    });

    test('should upload multiple files successfully', async () => {
      // Create another test file
      const testFilePath2 = path.join(__dirname, '../utils/test-file2.txt');
      fs.writeFileSync(testFilePath2, 'This is a second test file.');

      try {
        const response = await request(app)
          .post(`/api/projects/${testProject._id}/files`)
          .attach('files', testFilePath)
          .attach('files', testFilePath2);

        expect(response.status).toBe(201);
        expect(response.body.message).toContain('2 archivo(s) subido(s) exitosamente');
        expect(response.body.files).toHaveLength(2);

        // Verify files are stored in database
        const updatedProject = await Project.findById(testProject._id);
        expect(updatedProject.files).toHaveLength(2);
      } finally {
        // Clean up second test file
        if (fs.existsSync(testFilePath2)) {
          fs.unlinkSync(testFilePath2);
        }
      }
    });

    test('should return 404 for non-existent project', async () => {
      const nonExistentId = '507f1f77bcf86cd799439011';
      
      const response = await request(app)
        .post(`/api/projects/${nonExistentId}/files`)
        .attach('files', testFilePath);

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Proyecto no encontrado');
    });

    test('should return 400 when no files are uploaded', async () => {
      const response = await request(app)
        .post(`/api/projects/${testProject._id}/files`);

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('No se subieron archivos');
    });

    test('should reject unsupported file types', async () => {
      // Create a test file with unsupported extension
      const unsupportedFilePath = path.join(__dirname, '../utils/test-file.xyz');
      fs.writeFileSync(unsupportedFilePath, 'This is an unsupported file type.');

      try {
        const response = await request(app)
          .post(`/api/projects/${testProject._id}/files`)
          .attach('files', unsupportedFilePath);

        expect(response.status).toBe(400);
        expect(response.body.message).toContain('Tipo de archivo no permitido');
      } finally {
        // Clean up unsupported test file
        if (fs.existsSync(unsupportedFilePath)) {
          fs.unlinkSync(unsupportedFilePath);
        }
      }
    });
  });

  describe('GET /api/projects/:projectId/files', () => {
    beforeEach(async () => {
      // Upload a test file for GET tests
      await request(app)
        .post(`/api/projects/${testProject._id}/files`)
        .attach('files', testFilePath);
    });

    test('should get all files for a project', async () => {
      const response = await request(app)
        .get(`/api/projects/${testProject._id}/files`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('projectId', testProject._id.toString());
      expect(response.body).toHaveProperty('projectTitle', testProject.title);
      expect(response.body).toHaveProperty('filesCount', 1);
      expect(response.body.files).toHaveLength(1);
      expect(response.body.files[0]).toHaveProperty('originalName', 'test-file.txt');
      expect(response.body.files[0]).toHaveProperty('formattedSize');
      expect(response.body.files[0]).toHaveProperty('url');
    });

    test('should return 404 for non-existent project', async () => {
      const nonExistentId = '507f1f77bcf86cd799439011';
      
      const response = await request(app)
        .get(`/api/projects/${nonExistentId}/files`);

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Proyecto no encontrado');
    });
  });

  describe('GET /api/projects/:projectId/files/stats', () => {
    beforeEach(async () => {
      // Upload a test file for stats tests
      await request(app)
        .post(`/api/projects/${testProject._id}/files`)
        .attach('files', testFilePath);
    });

    test('should get file statistics for a project', async () => {
      const response = await request(app)
        .get(`/api/projects/${testProject._id}/files/stats`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('projectId', testProject._id.toString());
      expect(response.body).toHaveProperty('stats');
      expect(response.body.stats).toHaveProperty('totalFiles', 1);
      expect(response.body.stats).toHaveProperty('totalSize');
      expect(response.body.stats).toHaveProperty('formattedTotalSize');
      expect(response.body.stats).toHaveProperty('categories');
      expect(response.body.stats).toHaveProperty('recentFiles');
    });
  });

  describe('DELETE /api/projects/:projectId/files/:fileId', () => {
    let uploadedFileId;

    beforeEach(async () => {
      // Upload a test file and get its ID
      await request(app)
        .post(`/api/projects/${testProject._id}/files`)
        .attach('files', testFilePath);
      
      const updatedProject = await Project.findById(testProject._id);
      uploadedFileId = updatedProject.files[0]._id;
    });

    test('should delete a file successfully', async () => {
      const response = await request(app)
        .delete(`/api/projects/${testProject._id}/files/${uploadedFileId}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Archivo eliminado exitosamente');
      expect(response.body).toHaveProperty('deletedFile');

      // Verify file is removed from database
      const updatedProject = await Project.findById(testProject._id);
      expect(updatedProject.files).toHaveLength(0);
    });

    test('should return 404 for non-existent file', async () => {
      const nonExistentFileId = '507f1f77bcf86cd799439011';
      
      const response = await request(app)
        .delete(`/api/projects/${testProject._id}/files/${nonExistentFileId}`);

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Archivo no encontrado en el proyecto');
    });
  });

  describe('GET /api/files/:filename', () => {
    let uploadedFilename;

    beforeEach(async () => {
      // Upload a test file and get its filename
      const uploadResponse = await request(app)
        .post(`/api/projects/${testProject._id}/files`)
        .attach('files', testFilePath);
      
      uploadedFilename = uploadResponse.body.files[0].filename;
    });

    test('should serve/download a file successfully', async () => {
      const response = await request(app)
        .get(`/api/files/${uploadedFilename}`);

      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toBe('text/plain; charset=utf-8');
      expect(response.text).toContain('This is a test file for upload testing.');
    });

    test('should return 404 for non-existent file', async () => {
      const response = await request(app)
        .get('/api/files/non-existent-file.txt');

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Archivo no encontrado');
    });
  });

  describe('File Upload Error Handling', () => {
    test('should handle multer errors gracefully', async () => {
      // Test with empty field name (should trigger multer error)
      const response = await request(app)
        .post(`/api/projects/${testProject._id}/files`)
        .attach('wrongFieldName', testFilePath);

      expect(response.status).toBe(400);
    });
  });
});