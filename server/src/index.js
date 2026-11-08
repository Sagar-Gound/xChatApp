import dotenv from "dotenv";
import connectDB from "./db/connectDB.js";
import app from "./app.js";

dotenv.config();

const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Start Express server immediately
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
