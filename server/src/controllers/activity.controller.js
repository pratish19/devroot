const Activity = require('../models/Activity');

exports.getProjectActivity = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Fetch all activity for this project
    // ⚠️ IMPORTANT: We do NOT use .select() here so we get the 'meta' field
    const activities = await Activity.find({ project: id })
      .populate('user', 'name email role')
      .sort({ createdAt: -1 }); // Newest first

    res.json(activities);
  } catch (err) {
    console.error("Activity Fetch Error:", err);
    res.status(500).json({ error: err.message });
  }
};