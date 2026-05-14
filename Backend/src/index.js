import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import speakerRoutes from './routes/speakerRoutes.js';

const app = express();

// Middlewares
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json()); 

// Routes
app.use('/api/speakers', speakerRoutes);

export default app;