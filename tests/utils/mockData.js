// Mock data for testing (without hard-coded IDs)
const mockProjects = [
  {
    title: 'Project Alpha',
    description: 'First test project',
    startDate: new Date('2025-01-01'),
    endDate: new Date('2025-06-30'),
    status: 'in progress',
    tasks: [
      { taskName: 'Setup environment', completed: true },
      { taskName: 'Implement features', completed: false }
    ]
  },
  {
    title: 'Project Beta',
    description: 'Second test project',
    startDate: new Date('2025-02-01'),
    endDate: new Date('2025-08-31'),
    status: 'not started',
    tasks: [
      { taskName: 'Research phase', completed: false },
      { taskName: 'Planning phase', completed: false }
    ]
  },
  {
    title: 'Project Gamma',
    description: 'Third test project',
    startDate: new Date('2025-03-01'),
    endDate: new Date('2025-09-30'),
    status: 'completed',
    tasks: [
      { taskName: 'Development', completed: true },
      { taskName: 'Testing', completed: true },
      { taskName: 'Deployment', completed: true }
    ]
  }
];

// Valid project data for creation tests
const validProjectData = {
  title: 'New Test Project',
  description: 'A newly created project for testing',
  startDate: new Date('2025-11-01'),
  endDate: new Date('2025-12-31'),
  status: 'not started',
  tasks: [
    { taskName: 'Initial setup', completed: false }
  ]
};

// Invalid project data for validation tests
const invalidProjectData = {
  noTitle: {
    description: 'Project without title',
    status: 'in progress'
  },
  invalidStatus: {
    title: 'Project with invalid status',
    description: 'Testing invalid status',
    status: 'invalid-status'
  },
  invalidTaskStructure: {
    title: 'Project with invalid tasks',
    description: 'Testing invalid task structure',
    tasks: [
      { completed: false } // Missing taskName
    ]
  }
};

// Update data for testing updates
const updateProjectData = {
  title: 'Updated Project Title',
  description: 'Updated project description',
  status: 'completed'
};

module.exports = {
  mockProjects,
  validProjectData,
  invalidProjectData,
  updateProjectData
};