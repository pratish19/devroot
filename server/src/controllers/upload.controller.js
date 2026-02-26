const multer = require('multer');

// ✅ CRITICAL: memoryStorage keeps the file in RAM for Supabase
const storage = multer.memoryStorage();

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 100 * 1024 * 1024 } // 100MB Limit
});

exports.uploadMiddleware = upload.single('file');