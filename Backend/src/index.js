import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import speakerRoutes from './routes/speakerRoutes.js';
import express from 'express';
import cors from 'cors';
import { errorHandler } from './middleware/errorHandler.js';
import eventsRouter from './routes/events.js';
import sessionsRouter from './routes/sessions.js';
import questionsRouter from './routes/questions.js';
import roomsRouter from './routes/rooms.js';


const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/events', eventsRouter);
app.use('/api/sessions', sessionsRouter);
app.use('/api/questions', questionsRouter);
app.use('/api/rooms', roomsRouter);

// Health check
app.get('/', (req, res) => {
  res.send('EventSync API is running');
});

// Error handling middleware (must be after routes)
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
const app = express();

// Middlewares
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json()); 

// Routes
app.use('/api/speakers', speakerRoutes);

export default app;