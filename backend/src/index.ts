import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import chatRoutes from './routes/chatRoutes.js';
import troubleshootRoutes from './routes/troubleshootRoutes.js';
import sensorRoutes from './routes/sensorRoutes.js';
import protocolRoutes from './routes/protocolRoutes.js';
import codeRoutes from './routes/codeRoutes.js';
import projectRoutes from './routes/projectRoutes.js';
import componentRoutes from './routes/componentRoutes.js';
import faultRoutes from './routes/faultRoutes.js';
import learningRoutes from './routes/learningRoutes.js';
import promptRoutes from './routes/promptRoutes.js';
import searchRoutes from './routes/searchRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import { runSeed } from './seed/runSeed.js';

dotenv.config();
console.log("⚡ Groq API Key Loaded:", !!(process.env.GROQ_API_KEY && process.env.GROQ_API_KEY.trim() !== ''));

const app = express();
const PORT = process.env.PORT || 5000;

app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors());
app.use(express.json({ limit: '10mb' }));

const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// API Routes
app.use('/api', chatRoutes);
app.use('/api', troubleshootRoutes);
app.use('/api', sensorRoutes);
app.use('/api', protocolRoutes);
app.use('/api', codeRoutes);
app.use('/api', projectRoutes);
app.use('/api', componentRoutes);
app.use('/api', faultRoutes);
app.use('/api', learningRoutes);
app.use('/api', promptRoutes);
app.use('/api', searchRoutes);
app.use('/api', dashboardRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), app: 'SenseAI Backend' });
});

async function startServer() {
  try {
    console.log('Verifying SenseAI database & seed data...');
    await runSeed();
  } catch (err) {
    console.warn('Auto-seed check warning:', err);
  }

  app.listen(PORT, () => {
    console.log(`🚀 SenseAI Backend Server running on http://localhost:${PORT}`);
  });
}

startServer();
