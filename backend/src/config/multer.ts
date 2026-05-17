import multer from 'multer';
import path from 'path';

// Use memory storage because files are uploaded directly to Cloudinary
const storage = multer.memoryStorage();

const isAllowedFile = (mimetype: string, originalname: string): boolean => {
  // List of explicitly allowed MIME types
  const allowedMimes = [
    'application/pdf',
    'application/x-pdf',
    'application/x-bzpdf',
    'application/octet-stream', // Fallback for PDFs on some systems
    'image/png',
    'image/jpeg',
    'image/jpg',
  ];

  // Check MIME type first
  if (allowedMimes.includes(mimetype)) {
    return true;
  }

  // Fallback: check file extension
  const ext = path.extname(originalname).toLowerCase();
  const allowedExtensions = ['.pdf', '.png', '.jpg', '.jpeg'];
  return allowedExtensions.includes(ext);
};

export const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (isAllowedFile(file.mimetype, file.originalname)) {
      cb(null, true);
    } else {
      cb(new Error(`File type ${file.mimetype} with extension ${path.extname(file.originalname)} not allowed. Only PDF and image files (PNG, JPEG) are permitted.`));
    }
  },
});
