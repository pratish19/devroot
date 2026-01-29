const Department = require('../models/Department');
const User = require('../models/User');

// @desc    Create a new department
// @route   POST /api/departments
// @access  Private (Manager Only)
exports.createDepartment = async (req, res) => {
  try {
    console.log("📨 Body Received:", req.body);
    
    // ⭐ DEBUG: Check if user exists in request
    console.log("👤 User in Request:", req.user);

    const { name, key } = req.body;

    // 1. Validation Logic
    if (!name || !key) {
      return res.status(400).json({ message: "Both Name and Key are required" });
    }

    // 2. Normalize Key (Uppercase)
    const normalizedKey = key.toUpperCase();

    // 3. Check Duplicate
    const existing = await Department.findOne({ key: normalizedKey });
    if (existing) {
      return res.status(400).json({ message: `Key '${normalizedKey}' already exists` });
    }

    // ⭐ ROBUST ID CHECK: Try both _id and id
    const userId = req.user._id || req.user.id;

    if (!userId) {
      console.error("❌ Fatal: User ID missing from request object");
      return res.status(401).json({ message: "User authentication failed. No ID found." });
    }

    // 4. Create
    const dept = await Department.create({ 
      name, 
      key: normalizedKey,
      createdBy: userId // 👈 Using the safely extracted ID
    });

    console.log("✅ Created:", dept);
    res.status(201).json(dept);

  } catch (err) {
    console.error("🔥 Create Dept Error:", err.message);
    res.status(500).json({ error: err.message });
  }
};

// @desc    Get all departments (with User Counts)
// @route   GET /api/departments
// @access  Private
exports.getAllDepartments = async (req, res) => {
  try {
    const departments = await Department.find();
    
    // Calculate user counts for each department
    const data = await Promise.all(departments.map(async (dept) => {
      const userCount = await User.countDocuments({ department: dept._id });
      return {
        ...dept.toObject(),
        userCount 
      };
    }));

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// @desc    Update department
// @route   PUT /api/departments/:id
// @access  Private (Manager Only)
exports.updateDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    
    // If updating key, ensure it is uppercase
    if (req.body.key) {
        req.body.key = req.body.key.toUpperCase();
    }

    const updated = await Department.findByIdAndUpdate(id, req.body, { 
      new: true,
      runValidators: true 
    });
    
    if (!updated) return res.status(404).json({ message: "Department not found" });
    
    res.json(updated);
  } catch (err) {
    console.error("Update Error:", err);
    res.status(500).json({ error: err.message });
  }
};

// ... existing code ...

// @desc    Delete department
// @route   DELETE /api/departments/:id
// @access  Private (Manager Only)
exports.deleteDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    
    // 1. Find the department
    const dept = await Department.findById(id);

    if (!dept) {
      return res.status(404).json({ message: "Department not found" });
    }

    // 2. Delete it
    await dept.deleteOne(); // or Department.findByIdAndDelete(id);

    console.log(`🗑️ Department ${id} deleted by ${req.user.name}`);
    res.json({ message: "Department removed" });

  } catch (err) {
    console.error("Delete Error:", err);
    res.status(500).json({ error: err.message });
  }
}; 

// ... existing code ...

// @desc    Get Single Department with its Users
// @route   GET /api/departments/:id
// @access  Private
exports.getDepartmentById = async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Find the Department
    const department = await Department.findById(id).populate('createdBy', 'name');

    if (!department) {
      return res.status(404).json({ message: "Department not found" });
    }

    // 2. Find all Users who belong to this department
    // We assume your User model has a field 'department' linking back here
    const users = await User.find({ department: id }).select('-password'); 

    // 3. Send both back
    res.json({ department, users });

  } catch (err) {
    console.error("Get Dept Details Error:", err);
    res.status(500).json({ error: err.message });
  }
};

// ... existing code ...

// @desc    Remove user from department (Unassign)
// @route   PUT /api/departments/remove-user
// @access  Private (Manager)
exports.removeUserFromDepartment = async (req, res) => {
  try {
    const { userId } = req.body;

    // Find user and remove the department link ($unset)
    const user = await User.findByIdAndUpdate(
      userId, 
      { $unset: { department: "" } }, // 👈 Removes the field entirely
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    console.log(`👤 User ${user.name} removed from department`);
    res.json({ message: "User unassigned", user });

  } catch (err) {
    console.error("Unassign Error:", err);
    res.status(500).json({ error: err.message });
  }
};