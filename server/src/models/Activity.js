const mongoose = require('mongoose');

const ActivitySchema = new mongoose.Schema({
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  action: { 
    type: String, 
    enum: ['UPLOAD', 'STATUS_CHANGE', 'PROJECT_CREATED'], 
    required: true 
  },
  details: { type: String, required: true }, // e.g., "Uploaded logo.png to designs"
  meta: {
    fileName: String,
    folderPath: String,
    phase: String
  }
}, { timestamps: true });

module.exports = mongoose.model('Activity', ActivitySchema);