const mongoose = require('mongoose');

let mongoMemoryInstance = null;
let isInMemory = false;

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  // If uri is explicitly 'memory' or undefined
  if (uri && uri !== 'memory') {
    try {
      console.log(`[DB] Attempting connection to configured MongoDB: ${uri.replace(/\/\/.*@/, '//***:***@')}`);
      const conn = await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 3000 // Quick timeout to fallback if local mongod is not running
      });
      console.log(`[DB] MongoDB Connected Successfully: ${conn.connection.host}`);
      isInMemory = false;
      return conn;
    } catch (err) {
      console.warn(`[DB] Connection to ${uri} failed: ${err.message}`);
      console.log('[DB] Switching to embedded in-memory MongoDB fallback for instant evaluation...');
    }
  }

  // Fallback or explicit in-memory MongoDB
  try {
    const { MongoMemoryServer } = require('mongodb-memory-server');
    mongoMemoryInstance = await MongoMemoryServer.create();
    const memoryUri = mongoMemoryInstance.getUri();
    const conn = await mongoose.connect(memoryUri);
    isInMemory = true;
    console.log(`[DB] In-Memory MongoDB Started & Connected: ${memoryUri}`);
    return conn;
  } catch (memErr) {
    console.error(`[DB] Fatal error initializing database: ${memErr.message}`);
    throw memErr;
  }
};

const disconnectDB = async () => {
  await mongoose.disconnect();
  if (mongoMemoryInstance) {
    await mongoMemoryInstance.stop();
  }
};

const isMemoryDB = () => isInMemory;

module.exports = {
  connectDB,
  disconnectDB,
  isMemoryDB
};

