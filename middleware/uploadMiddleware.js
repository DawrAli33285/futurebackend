const multer = require('multer');
const path = require('path');
const fs = require('fs');


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = '/tmp/public/files/charts'
    
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'chart-' + uniqueSuffix + path.extname(file.originalname));
  }
});


const csvFileFilter = (req, file, cb) => {
  const allowedMimeTypes = ['text/csv', 'application/vnd.ms-excel'];
  const fileExtension = path.extname(file.originalname).toLowerCase();
  
  if (allowedMimeTypes.includes(file.mimetype) || fileExtension === '.csv') {
    cb(null, true);
  } else {
    cb(new Error('Only CSV files are allowed'), false);
  }
};


const uploadCSV = multer({
  storage: storage,
  fileFilter: csvFileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, 
    files: 10 
  }
});


const uploadSingleCSV = uploadCSV.single('file');


const uploadMultipleCSV = uploadCSV.array('files', 10);


const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        error: 'File size too large. Maximum size is 10MB'
      });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        error: 'Too many files. Maximum 10 files allowed'
      });
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        error: 'Unexpected field in file upload'
      });
    }
    return res.status(400).json({
      error: `File upload error: ${err.message}`
    });
  } else if (err) {
    return res.status(400).json({
      error: err.message || 'Error uploading file'
    });
  }
  next();
};

module.exports = {
  uploadSingleCSV,
  uploadMultipleCSV,
  handleMulterError,
  uploadCSV 
};