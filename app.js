import "dotenv/config";
import express from "express";
import httpRequestLogger from "morgan";
import swaggerUi from "swagger-ui-express";
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { jsonParseErrorHandler } from "./middleware/error-handlers.js";
import setNoCacheHeaders from "./middleware/setNoCacheHeaders.js";
import cors from "cors";

// Import routes here
import usersRouter from "./routes/api/v1/users/index.js";
import charityRouter from "./routes/api/v1/charity/index.js";
import donationRouter from "./routes/api/v1/donation/donation.js";
import paymentRouter from "./routes/api/v1/stripe/payment.js";
import webHookRouter from "./routes/api/v1/stripe/webhook.js";
import businessRouter from "./routes/api/v1/business/index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const swaggerFilePath = path.join(__dirname, 'swagger-output.json');

const swaggerFileContent = fs.readFileSync(swaggerFilePath, 'utf-8');
const swaggerFile = JSON.parse(swaggerFileContent);

const app = express();

if (process.env.NODE_ENV === 'development') {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}

app.use(httpRequestLogger("dev"));
app.use(express.urlencoded({ extended: false }));
app.use(express.static("public"));
app.use(setNoCacheHeaders);
app.use(cors());

// Register routes here
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerFile));
app.use("/api/v1/users", usersRouter /* #swagger.tags = ['Users'] */);
app.use("/api/v1/charity", charityRouter /* #swagger.tags = ['Charity'] */);
app.use("/api/v1/donation", donationRouter /* #swagger.tags = ['Donation'] */);
app.use("/api/v1/payment", paymentRouter /* #swagger.tags = ['Payment'] */);
app.use("/api/v1/webhook", webHookRouter /* #swagger.tags = ['Webhook'] */);
app.use("/api/v1/business", businessRouter /* #swagger.tags = ['Business'] */);

// Error handlers
app.use(jsonParseErrorHandler);

export default app;
