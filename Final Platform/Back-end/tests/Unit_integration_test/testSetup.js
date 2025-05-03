import mongoose from "mongoose";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

export const connectTestDB = async () => {
  try {
    // Close any existing connections
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
      console.log("Closed existing MongoDB connections.");
    }

    const uri = process.env.MONGO_URI;
    if (!uri) {
      throw new Error("MONGO_URI is not defined in the .env file");
    }

    // Log the URI and environment for debugging
    console.log(`NODE_ENV: ${process.env.NODE_ENV}`);
    console.log(`Connecting to test database with URI: ${uri}`);

    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected to the test database successfully.");
  } catch (error) {
    console.error("Error connecting to the test database:", error.message);
  }
};

export const disconnectTestDB = async () => {
  try {
    await mongoose.disconnect();
    console.log("Disconnected from the test database.");
  } catch (error) {
    console.error("Error disconnecting from the test database:", error.message);
  }
};

export const clearTestDB = async () => {
  try {
    if (mongoose.connection.readyState === 0) {
      console.log("No database connection to clear.");
      return;
    }

    // Clear all collections
    const collections = await mongoose.connection.db.collections();
    for (const collection of collections) {
      await collection.deleteMany({});
    }
    console.log("Cleared all test data from the database.");
  } catch (error) {
    console.error("Error clearing test database:", error.message);
  }
};