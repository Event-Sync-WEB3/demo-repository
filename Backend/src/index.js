import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import prisma from "./config/prisma.js";
import speakerRoutes from "./routes/speakerRoutes.js";
import eventsRoutes from "./routes/eventRoutes.js";

const app = express();

// Middlewares
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());

// Routes
app.use("/api/speakers", speakerRoutes);
app.use("/api/events", eventsRoutes);

export default app;
export { prisma };