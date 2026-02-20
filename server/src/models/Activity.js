const mongoose = require('mongoose');

const ActivitySchema = new mongoose.Schema({
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  action: {
    type: String,
    required: true,
    // ✅ FIX: Added 'UPLOAD_FILE' so uploads don't crash
    enum: ['CREATE', 'UPDATE', 'DELETE', 'UPLOAD_FILE', 'COMMENT'] 
  },
  details: {
    type: String,
    required: true
  },
  // ✅ FIX: Mixed type allows saving 'folder', 'fileName', etc. without validation errors
  meta: {
    type: mongoose.Schema.Types.Mixed, 
    default: {}
  }
}, { timestamps: true });

module.exports = mongoose.model('Activity', ActivitySchema);