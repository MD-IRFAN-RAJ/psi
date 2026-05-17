"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = void 0;
const http_status_codes_1 = require("http-status-codes");
const jwt_1 = require("../utils/jwt");
const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(http_status_codes_1.StatusCodes.UNAUTHORIZED).json({ error: 'No token provided' });
    }
    const token = authHeader.split(' ')[1];
    try {
        const payload = (0, jwt_1.verifyToken)(token);
        req.user = payload;
        next();
    }
    catch (error) {
        return res.status(http_status_codes_1.StatusCodes.UNAUTHORIZED).json({ error: 'Invalid or expired token' });
    }
};
exports.authMiddleware = authMiddleware;
