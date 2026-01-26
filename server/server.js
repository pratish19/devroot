const express = require('express'); // 1. Import Express
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express(); // 2. Initialize the App

// 3. Database Connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("📡 MongoDB Connected...");
  } catch (err) {
    console.error("❌ Connection failed:", err.message);
    process.exit(1);
  }
};
connectDB();

// 4. Middleware
app.use(cors());
app.use(express.json()); // Essential for Postman to send JSON

// 5. Routes (We will add these in Task A/B)
app.use('/api/auth', require('./src/routes/auth.routes'));
app.use('/api/departments', require('./src/routes/department.routes'));
app.use('/api/projects', require('./src/routes/project.routes'));
app.use('/api/uploads', require('./src/routes/upload.routes'));

// 6. Server Start
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});