const mongoose = require('mongoose');
const Project = require('../../src/models/Project');
const DatabaseTestUtil = require('../utils/databaseTestUtil');
const { validProjectData, invalidProjectData } = require('../utils/mockData');

describe('Project Model Unit Tests', () => {
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

  describe('Project Creation', () => {
    test('should create a valid project successfully', async () => {
      const project = new Project(validProjectData);
      const savedProject = await project.save();

      expect(savedProject._id).toBeDefined();
      expect(savedProject.title).toBe(validProjectData.title);
      expect(savedProject.description).toBe(validProjectData.description);
      expect(savedProject.status).toBe(validProjectData.status);
      expect(savedProject.tasks).toHaveLength(1);
      expect(savedProject.tasks[0].taskName).toBe('Initial setup');
      expect(savedProject.tasks[0].completed).toBe(false);
      expect(savedProject.createdAt).toBeDefined();
      expect(savedProject.updatedAt).toBeDefined();
    });

    test('should create project with default values', async () => {
      const minimalProject = new Project({
        title: 'Minimal Project'
      });
      const savedProject = await minimalProject.save();

      expect(savedProject.title).toBe('Minimal Project');
      expect(savedProject.description).toBe('');
      expect(savedProject.status).toBe('not started');
      expect(savedProject.tasks).toEqual([]);
      expect(savedProject.startDate).toBeUndefined();
      expect(savedProject.endDate).toBeUndefined();
    });
  });

  describe('Project Validation', () => {
    test('should fail validation when title is missing', async () => {
      const project = new Project(invalidProjectData.noTitle);

      let error;
      try {
        await project.save();
      } catch (err) {
        error = err;
      }

      expect(error).toBeDefined();
      expect(error.errors.title).toBeDefined();
      expect(error.errors.title.kind).toBe('required');
    });

    test('should fail validation with invalid status', async () => {
      const project = new Project(invalidProjectData.invalidStatus);

      let error;
      try {
        await project.save();
      } catch (err) {
        error = err;
      }

      expect(error).toBeDefined();
      expect(error.errors.status).toBeDefined();
      expect(error.errors.status.kind).toBe('enum');
    });

    test('should fail validation when task is missing taskName', async () => {
      const project = new Project(invalidProjectData.invalidTaskStructure);

      let error;
      try {
        await project.save();
      } catch (err) {
        error = err;
      }

      expect(error).toBeDefined();
      expect(error.errors['tasks.0.taskName']).toBeDefined();
      expect(error.errors['tasks.0.taskName'].kind).toBe('required');
    });

    test('should validate enum values for status', async () => {
      const validStatuses = ['not started', 'in progress', 'completed'];
      
      for (const status of validStatuses) {
        const project = new Project({
          title: `Project ${status}`,
          status: status
        });
        const savedProject = await project.save();
        expect(savedProject.status).toBe(status);
      }
    });
  });

  describe('Project Schema Properties', () => {
    test('should have correct schema structure', () => {
      const schemaKeys = Object.keys(Project.schema.paths);
      
      expect(schemaKeys).toContain('title');
      expect(schemaKeys).toContain('description');
      expect(schemaKeys).toContain('startDate');
      expect(schemaKeys).toContain('endDate');
      expect(schemaKeys).toContain('status');
      expect(schemaKeys).toContain('tasks');
      expect(schemaKeys).toContain('createdAt');
      expect(schemaKeys).toContain('updatedAt');
    });

    test('should have timestamps enabled', () => {
      expect(Project.schema.options.timestamps).toBe(true);
    });

    test('should have correct task subdocument structure', () => {
      const taskSchema = Project.schema.paths.tasks.schema;
      const taskSchemaKeys = Object.keys(taskSchema.paths);
      
      expect(taskSchemaKeys).toContain('taskName');
      expect(taskSchemaKeys).toContain('completed');
      expect(taskSchema.paths.taskName.isRequired).toBe(true);
      expect(taskSchema.paths.completed.defaultValue).toBe(false);
    });
  });

  describe('Project Updates', () => {
    test('should update project successfully', async () => {
      const project = new Project(validProjectData);
      const savedProject = await project.save();
      const originalUpdatedAt = savedProject.updatedAt;

      // Wait a moment to ensure timestamp difference
      await new Promise(resolve => setTimeout(resolve, 10));

      savedProject.title = 'Updated Title';
      savedProject.status = 'in progress';
      const updatedProject = await savedProject.save();

      expect(updatedProject.title).toBe('Updated Title');
      expect(updatedProject.status).toBe('in progress');
      expect(updatedProject.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
    });

    test('should add tasks to existing project', async () => {
      const project = new Project({
        title: 'Project for Task Testing'
      });
      const savedProject = await project.save();

      savedProject.tasks.push({
        taskName: 'New Task',
        completed: false
      });
      const updatedProject = await savedProject.save();

      expect(updatedProject.tasks).toHaveLength(1);
      expect(updatedProject.tasks[0].taskName).toBe('New Task');
      expect(updatedProject.tasks[0].completed).toBe(false);
    });
  });

  describe('Project Queries', () => {
    beforeEach(async () => {
      // Seed some test data
      await Project.create([
        { title: 'Project 1', status: 'not started' },
        { title: 'Project 2', status: 'in progress' },
        { title: 'Project 3', status: 'completed' }
      ]);
    });

    test('should find all projects', async () => {
      const projects = await Project.find();
      expect(projects).toHaveLength(3);
    });

    test('should find projects by status', async () => {
      const inProgressProjects = await Project.find({ status: 'in progress' });
      expect(inProgressProjects).toHaveLength(1);
      expect(inProgressProjects[0].title).toBe('Project 2');
    });

    test('should find project by title', async () => {
      const project = await Project.findOne({ title: 'Project 1' });
      expect(project).toBeTruthy();
      expect(project.status).toBe('not started');
    });
  });
});