const multer = require('multer');

// ✅ CRITICAL: Use memoryStorage
// This keeps the file in RAM so the Project Controller can send it to Supabase.
const storage = multer.memoryStorage();

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 100 * 1024 * 1024 } // 100MB Limit
  // No strict file filters here (prevents silent failures)
});

exports.uploadMiddleware = upload.single('file');