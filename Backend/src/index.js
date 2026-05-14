import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import prisma from "./config/prisma.js";

const app = express();

// Middlewares
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());

// Routes
import speakerRoutes from "./routes/speakerRoutes.js";
app.use("/api/speakers", speakerRoutes);

// Exporter seulement l'app, pas prisma depuis export default
export default app;

// Si tu veux pouvoir utiliser prisma dans les contrôleurs, tu peux aussi l’exporter
export { prisma };