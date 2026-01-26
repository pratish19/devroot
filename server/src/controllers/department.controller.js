const Department = require('../models/Department');

// POST /api/departments (Manager Only)
exports.createDepartment = async (req, res) => {
  try {
    const { name } = req.body;

    // Check uniqueness
    const existing = await Department.findOne({ name });
    if (existing) return res.status(400).json({ message: 'Department already exists' });

    const department = new Department({
      name,
      createdBy: req.user.id // From the JWT
    });

    await department.save();
    res.status(201).json(department);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/departments (Manager Only)
exports.getAllDepartments = async (req, res) => {
  try {
    const departments = await Department.find()
      .populate('createdBy', 'name email'); // Show who created it
    res.json(departments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};