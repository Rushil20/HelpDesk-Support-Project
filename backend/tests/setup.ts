import { beforeAll, afterAll, afterEach } from "vitest";
import { MongoMemoryReplSet } from "mongodb-memory-server";
import mongoose from "mongoose";

let mongoServer: MongoMemoryReplSet;

beforeAll(async () => {
  process.env.NODE_ENV = "test";
  process.env.JWT_ACCESS_SECRET = "supersecretjwtkeyfortestingpurposes123";
  process.env.JWT_ACCESS_EXPIRES_IN = "15m";
  process.env.SEED_ADMIN_PASSWORD = "AdminPassword@123";
  process.env.SEED_AGENT_PASSWORD = "AgentPassword@123";
  process.env.SEED_EMPLOYEE_PASSWORD = "EmployeePassword@123";

  mongoServer = await MongoMemoryReplSet.create({ replSet: { count: 1 } });
  const uri = mongoServer.getUri();

  await mongoose.connect(uri);
});

afterEach(async () => {
  if (mongoose.connection.db) {
    const collections = await mongoose.connection.db.collections();
    for (const collection of collections) {
      await collection.deleteMany({});
    }
  }
});

afterAll(async () => {
  await mongoose.disconnect();
  if (mongoServer) {
    await mongoServer.stop();
  }
});
