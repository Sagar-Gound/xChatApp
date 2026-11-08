import dotenv from "dotenv";
import connectDB from "./db/connectDB.js";
import app from "./app.js";

dotenv.config();

const PORT = process.env.PORT || 5000;

// db connection and server start 
connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection failed:", err);
  });