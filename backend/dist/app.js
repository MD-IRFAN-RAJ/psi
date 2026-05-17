"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const http_status_codes_1 = require("http-status-codes");
require("express-async-errors"); // Handles async errors in express routes
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const taskRoutes_1 = __importDefault(require("./routes/taskRoutes"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const projectRoutes_1 = __importDefault(require("./routes/projectRoutes"));
const sprintRoutes_1 = __importDefault(require("./routes/sprintRoutes"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const swagger_1 = require("./config/swagger");
// Initialize Express app
const app = (0, express_1.default)();
// Middlewares
app.use((0, helmet_1.default)()); // Security headers
app.use((0, cors_1.default)()); // CORS
app.use(express_1.default.json()); // Parse JSON bodies
app.use(express_1.default.urlencoded({ extended: true })); // Parse URL-encoded bodies
app.use((0, morgan_1.default)('dev')); // HTTP request logger
// Routes
// Health Check Endpoint
app.get('/api/v1/health', (req, res) => {
    res.status(http_status_codes_1.StatusCodes.OK).json({ status: 'UP', message: 'TaskSuite API is running smoothly.' });
});
// Authentication Routes
app.use('/api/v1/auth', authRoutes_1.default);
// Task Routes
app.use('/api/v1/tasks', taskRoutes_1.default);
// User Routes
app.use('/api/v1/users', userRoutes_1.default);
// Project Routes
app.use('/api/v1/projects', projectRoutes_1.default);
// Sprint Routes
app.use('/api/v1/sprints', sprintRoutes_1.default);
// Swagger Documentation
app.use('/api-docs', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swagger_1.swaggerSpec));
// Future routes will be mounted here
// 404 Handler
app.use((req, res, next) => {
    res.status(http_status_codes_1.StatusCodes.NOT_FOUND).json({ error: 'Route not found' });
});
// Global Error Handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    const statusCode = err.statusCode || http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR;
    res.status(statusCode).json({
        error: statusCode === http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR ? 'Internal Server Error' : 'Request failed',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong',
    });
});
exports.default = app;
