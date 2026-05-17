"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.upload = void 0;
const multer_1 = __importDefault(require("multer"));
// Use memory storage because files are uploaded directly to Cloudinary
const storage = multer_1.default.memoryStorage();
exports.upload = (0, multer_1.default)({
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
    },
    fileFilter: (req, file, cb) => {
        // Allow PDF (with variants) and common image types
        const allowed = ['application/pdf', 'application/x-pdf', 'application/x-bzpdf', 'image/png', 'image/jpeg', 'image/jpg'];
        if (allowed.includes(file.mimetype)) {
            cb(null, true);
        }
        else {
            cb(new Error(`File type ${file.mimetype} not allowed. Only PDF and image files are permitted.`));
        }
    },
});
