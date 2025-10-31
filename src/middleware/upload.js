const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadDir = 'uploads/projects';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Generate unique filename with timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const fileExtension = path.extname(file.originalname);
    const fileName = file.fieldname + '-' + uniqueSuffix + fileExtension;
    cb(null, fileName);
  }
});

// File filter function to validate file types
const fileFilter = (req, file, cb) => {
  // Allowed file types
  const allowedTypes = {
    // Images
    'image/jpeg': true,
    'image/jpg': true,
    'image/png': true,
    'image/gif': true,
    'image/webp': true,
    // Documents
    'application/pdf': true,
    'application/msword': true,
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': true,
    'application/vnd.ms-excel': true,
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': true,
    'application/vnd.ms-powerpoint': true,
    'application/vnd.openxmlformats-officedocument.presentationml.presentation': true,
    'text/plain': true,
    'text/csv': true
  };

  if (allowedTypes[file.mimetype]) {
    cb(null, true);
  } else {
    cb(new Error('Tipo de archivo no permitido. Solo se permiten imágenes (JPEG, PNG, GIF, WebP) y documentos (PDF, Word, Excel, PowerPoint, TXT, CSV).'), false);
  }
};

// Multer configuration
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB file size limit
    files: 5 // Maximum 5 files per upload
  }
});

// Error handling middleware for multer
const handleMulterError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    switch (error.code) {
      case 'LIMIT_FILE_SIZE':
        return res.status(400).json({
          message: 'El archivo es demasiado grande. El tamaño máximo permitido es 10MB.',
          error: error.code
        });
      case 'LIMIT_FILE_COUNT':
        return res.status(400).json({
          message: 'Demasiados archivos. El máximo permitido es 5 archivos por vez.',
          error: error.code
        });
      case 'LIMIT_UNEXPECTED_FILE':
        return res.status(400).json({
          message: 'Campo de archivo inesperado.',
          error: error.code
        });
      default:
        return res.status(400).json({
          message: 'Error al subir archivo.',
          error: error.code
        });
    }
  } else if (error) {
    return res.status(400).json({
      message: error.message || 'Error al subir archivo.',
      error: 'FILE_UPLOAD_ERROR'
    });
  }
  next();
};

// Helper function to get file type category
const getFileCategory = (mimetype) => {
  if (mimetype.startsWith('image/')) {
    return 'image';
  } else if (mimetype === 'application/pdf') {
    return 'pdf';
  } else if (
    mimetype.includes('excel') || 
    mimetype.includes('spreadsheet') ||
    mimetype === 'text/csv'
  ) {
    return 'spreadsheet';
  } else if (mimetype.includes('powerpoint') || mimetype.includes('presentation')) {
    return 'presentation';
  } else if (
    mimetype.includes('word') || 
    mimetype.includes('document') ||
    mimetype === 'text/plain'
  ) {
    return 'document';
  }
  return 'other';
};

// Helper function to format file size
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

module.exports = {
  upload,
  handleMulterError,
  getFileCategory,
  formatFileSize,
  uploadDir
};