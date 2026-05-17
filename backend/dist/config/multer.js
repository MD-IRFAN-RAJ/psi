"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.upload = void 0;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
// Use memory storage because files are uploaded directly to Cloudinary
const storage = multer_1.default.memoryStorage();
const isAllowedFile = (mimetype, originalname) => {
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
    const ext = path_1.default.extname(originalname).toLowerCase();
    const allowedExtensions = ['.pdf', '.png', '.jpg', '.jpeg'];
    return allowedExtensions.includes(ext);
};
exports.upload = (0, multer_1.default)({
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
    },
    fileFilter: (req, file, cb) => {
        if (isAllowedFile(file.mimetype, file.originalname)) {
            cb(null, true);
        }
        else {
            cb(new Error(`File type ${file.mimetype} with extension ${path_1.default.extname(file.originalname)} not allowed. Only PDF and image files (PNG, JPEG) are permitted.`));
        }
    },
});
