import mongoose from "mongoose";

// Connect to MongoDB
const connectDB = async () => {
  try {
    const mongoUri =
      process.env.MONGODB_URI ||
      process.env.MONGO_URI ||
      "mongodb://127.0.0.1:27017/chatapp";
    const conn = await mongoose.connect(mongoUri);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    try {
      const fallbackUri = "mongodb://localhost:27017/chatapp";
      const conn = await mongoose.connect(fallbackUri);
      console.log(`MongoDB Connected (fallback): ${conn.connection.host}`);
    } catch (err) {
      console.error(`Fallback MongoDB connection error: ${err.message}`);
    }
  }
};

export default connectDB;
