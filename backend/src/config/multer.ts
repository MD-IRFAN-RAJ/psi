import multer from 'multer';

// Use memory storage because files are uploaded directly to Cloudinary
const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow PDF (with variants) and common image types
    const allowed = ['application/pdf', 'application/x-pdf', 'application/x-bzpdf', 'image/png', 'image/jpeg', 'image/jpg'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`File type ${file.mimetype} not allowed. Only PDF and image files are permitted.`));
    }
  },
});
