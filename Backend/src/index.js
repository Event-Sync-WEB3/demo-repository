
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import speakerRoutes from './routes/speakerRoutes.js';
import eventsRoutes from './routes/eventRoutes.js';
import questionsRouter from './src/routes/questions.js';
 
const app = express();
 
// ─── Middlewares globaux ──────────────────────────────────────────────────────
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());
 
// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/speakers', speakerRoutes);
app.use('/api/events',   eventRoutes);
app.use('/api/sessions/:sessionId/questions', questionsRouter);
 
export default app;
