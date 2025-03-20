import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    await mongoose.connect(
      "mongodb+srv://DriveDive:A123@auto-parts.4r2nt.mongodb.net/DriveDive?retryWrites=true&w=majority"
    
     
    );
    console.log("Connected_dbjs");
  } catch (err) {
    console.error("Database connection failed:", err.message);
    process.exit(1);
  }
};
