"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.roleMiddleware = void 0;
const http_status_codes_1 = require("http-status-codes");
const roleMiddleware = (roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(http_status_codes_1.StatusCodes.UNAUTHORIZED).json({ error: 'Unauthorized' });
        }
        if (!roles.includes(req.user.role)) {
            return res.status(http_status_codes_1.StatusCodes.FORBIDDEN).json({ error: 'Insufficient permissions' });
        }
        next();
    };
};
exports.roleMiddleware = roleMiddleware;
