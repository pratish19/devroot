const Activity = require('../models/Activity');

exports.getProjectActivity = async (req, res) => {
  try {
    const { projectId } = req.params;
    
    const activities = await Activity.find({ project: projectId })
      .populate('user', 'name role') // Show who did it
      .sort({ createdAt: -1 }); // Newest first

    res.json(activities);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};