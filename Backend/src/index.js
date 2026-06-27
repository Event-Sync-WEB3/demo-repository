import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import prisma from "./config/prisma.js";
import speakerRoutes from "./routes/speakerRoutes.js";
import eventsRoutes from "./routes/eventRoutes.js";
import sessionRoutes from "./routes/sessionRoutes.js";
import questionsRouter from "./routes/questions.js";
import roomRouter from "./routes/roomRouter.js";

const app = express();

// Middlewares
app.use(cors({
  exposedHeaders: ['X-Total-Count'],
}));
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());

// Routes
app.use("/api/speakers", speakerRoutes);
app.use("/api/events", eventsRoutes);
app.use("/api/sessions", sessionRoutes);
app.use("/api/sessions/:sessionId/questions", questionsRouter);
app.use("/api/rooms", roomRoutes);

export default app;
export { prisma };