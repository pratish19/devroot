const mongoose = require('mongoose');

const ActivitySchema = new mongoose.Schema({
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  action: { 
    type: String, 
    //enum: ['UPLOAD', 'STATUS_CHANGE', 'PROJECT_CREATED']
    enum: ['UPLOAD', 'DELETE', 'CREATE', 'UPDATE', 'STATUS_CHANGE'], 
    required: true 
  },
  details: { type: String, required: true }, // e.g., "Uploaded logo.png to designs"
// ⭐ UPDATE THIS SECTION ⭐
  meta: {
    fileName: String,
    folderPath: String,
    phase: String,
    cloudPath: String, // 👈 Explicitly add this!
    // Or make it flexible for future changes:
    // anyOtherField: mongoose.Schema.Types.Mixed 
  }
}, { timestamps: true });

module.exports = mongoose.model('Activity', ActivitySchema);