const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');

class DatabaseTestUtil {
  constructor() {
    this.mongoServer = null;
  }

  async connect() {
    // Create an in-memory MongoDB instance
    this.mongoServer = await MongoMemoryServer.create();
    const mongoUri = this.mongoServer.getUri();

    // Connect to the in-memory database
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  }

  async clearDatabase() {
    if (!mongoose.connection.db) return;
    
    // Get all collection names
    const collections = await mongoose.connection.db.listCollections().toArray();
    
    // Drop all collections
    for (const collection of collections) {
      await mongoose.connection.db.collection(collection.name).deleteMany({});
    }
  }

  async closeDatabase() {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    if (this.mongoServer) {
      await this.mongoServer.stop();
    }
  }

  async seedDatabase(seedData = {}) {
    // Clear existing data
    await this.clearDatabase();
    
    // Seed with provided data
    if (seedData.projects) {
      const Project = require('../../src/models/Project');
      await Project.insertMany(seedData.projects);
    }
  }
}

module.exports = DatabaseTestUtil;