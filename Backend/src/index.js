import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import prisma from "./config/prisma.js";
import authRoutes from "./routes/authRoutes.js";
import speakerRoutes from "./routes/speakerRoutes.js";
import eventsRoutes from "./routes/eventRoutes.js";
import sessionRoutes from "./routes/sessionRoutes.js";
import questionsRouter from "./routes/questions.js";
import questionsAdminRouter from "./routes/questionsAdminRoutes.js";
import roomRoutes from "./routes/roomRoutes.js";
import { errorHandler } from "./middleware/errorHandler.js";

const app = express();

app.use(cors({
  exposedHeaders: ['X-Total-Count'],
}));
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/speakers", speakerRoutes);
app.use("/api/events", eventsRoutes);
app.use("/api/sessions", sessionRoutes);
app.use("/api/sessions/:sessionId/questions", questionsRouter);
app.use("/api/questions", questionsAdminRouter);
app.use("/api/rooms", roomRoutes);

app.use(errorHandler);

export default app;
export { prisma };