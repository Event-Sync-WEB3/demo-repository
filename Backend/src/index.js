import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import prisma from "./config/prisma.js";
import speakerRoutes from "./routes/speakerRoutes.js";
import eventsRoutes from "./routes/eventRoutes.js";
import questionsRouter from "./routes/questions.js";
import sessionsRouter from './routes/sessions.js';
const app = express();

// Middlewares
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());

// Routes
app.use("/api/speakers", speakerRoutes);
app.use("/api/events", eventsRoutes);
app.use("/api/sessions/:sessionId/questions", questionsRouter);
app.use('/api/sessions', sessionsRouter);
app.use('/api/rooms', roomsRouter);
export default app;
export { prisma };