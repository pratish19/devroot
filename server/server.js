const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

// Route Imports
const authRoutes = require('./src/routes/auth.routes');
const departmentRoutes = require('./src/routes/department.routes');
const projectRoutes = require('./src/routes/project.routes');
//const uploadRoutes = require('./src/routes/upload.routes');
const userRoutes = require('./src/routes/user.routes'); // 👈 Import Users

// 1. Initialize the App
const app = express();

// 2. Database Connection
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

// 3. Middleware
app.use(cors());
app.use(express.json()); // Essential for sending JSON

// 4. Routes
app.use('/api/auth', authRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/projects', projectRoutes);
//app.use('/api/uploads', uploadRoutes);
app.use('/api/users', userRoutes); // 👈 Add Users Route Here

// 5. Server Start
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});