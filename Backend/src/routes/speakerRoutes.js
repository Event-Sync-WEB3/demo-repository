import { Router } from "express";
import {
  getAllSpeakers,
  getSpeakerBySlug,
  getSpeakerById,
  createSpeaker,
  updateSpeaker,
  deleteSpeaker,
} from "../controllers/speakerController.js";

const router = Router();

// Lister tous les speakers 
router.get("/", getAllSpeakers);

// Lire un speaker par slug 
router.get("/slug/:slug", getSpeakerBySlug);

// Lire un speaker par id 
router.get("/:id", getSpeakerById);

// Créer un speaker
router.post("/", createSpeaker);

// Mettre à jour un speaker
router.put("/:id", updateSpeaker);

// Supprimer un speaker
router.delete("/:id", deleteSpeaker);

export default router;