"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
// Load environment variables before importing anything else
dotenv_1.default.config();
const app_1 = __importDefault(require("./app"));
const PORT = process.env.PORT || 3000;
const startServer = async () => {
    try {
        // In future stages, connect to DB here via Prisma
        // await prisma.$connect();
        // console.log('Database connected successfully');
        app_1.default.listen(PORT, () => {
            console.log(`[Server]: TaskSuite backend is running at http://localhost:${PORT}`);
            console.log(`[Server]: Health check available at http://localhost:${PORT}/api/v1/health`);
        });
    }
    catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};
startServer();
