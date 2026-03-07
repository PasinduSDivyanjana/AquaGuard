/**
 * AquaGuard Backend - Rural Water Well Monitoring System
 * Entry point: loads env, sets up Express, connects MongoDB, starts server
 */

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import mongoose from 'mongoose';

import routes from './routes/index.js';
import { errorHandler, notFound } from './middlewares/error.js';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load Swagger document
const swaggerDocument = YAML.load(path.join(__dirname, '../swagger_docs/wellRoute_swagger.yaml'));

// Ensure uploads folder exists (for local file storage when Cloudinary not configured)
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Swagger UI at /api-docs
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Static files (report/well images when not using Cloudinary)
app.use('/uploads', express.static(uploadsDir));
// API routes under /api
app.use('/api', routes);

// Health check routes
app.get('/', (req, res) => {
  res.send('AquaGuard Backend is running...');
});

app.get('/health', (req, res) => {
  res.status(200).json({ success: true, message: 'AquaGuard API is running' });
});

// Error handling (404 and generic)
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5001;

// Connect to MongoDB and start server
const dbConnect = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/aquaguard');
    console.log('MongoDB Successfully Connected');
    app.listen(PORT, () => {
      console.log(`Server Running on PORT ${PORT}`);
    });
  } catch (err) {
    console.error('Error while connecting to MongoDB');
    console.error('Error was:', err);
  }
};

// Skip server start when running tests (allows supertest to use app)
if (process.env.NODE_ENV !== 'test') {
  dbConnect();
}

export default app;
