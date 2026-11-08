import mongoose from "mongoose";

// Connection error listener
mongoose.connection.on("error", (err) => {
  console.error(`MongoDB runtime error: ${err.message}`);
});

// Connect to DB
const connectDB = async () => {
  const uri =
    process.env.MONGODB_URI ||
    process.env.MONGO_URI ||
    "mongodb://127.0.0.1:27017/chatapp";

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    try {
      const fallbackUri = "mongodb://localhost:27017/chatapp";
      const conn = await mongoose.connect(fallbackUri, {
        serverSelectionTimeoutMS: 5000,
      });
      console.log(`MongoDB Connected (fallback): ${conn.connection.host}`);
    } catch (err) {
      console.error(`Fallback MongoDB connection error: ${err.message}`);
    }
  }
};

export default connectDB;
