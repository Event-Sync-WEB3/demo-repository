import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import prisma from "./config/prisma.js";
import speakerRoutes from "./routes/speakerRoutes.js";
import eventsRoutes from "./routes/eventRoutes.js";
import sessionRoutes from "./routes/sessionRoutes.js";
import questionsRouter from "./routes/questions.js";
import roomRoutes from "./routes/roomRoutes.js";
import authRoutes from "./routes/authRoutes.js";

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
app.use("/api/rooms", roomRoutes);

export default app;
export { prisma };