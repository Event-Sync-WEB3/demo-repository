import { Router } from "express";
import {
  getAllSpeakers,
  getSpeakerBySlug,
  getSpeakerById,
  createSpeaker,
  updateSpeaker,
  deleteSpeaker,
  getSpeakerSessions,
  linkSpeakerToSession,
} from "../controllers/speakerController.js";

const router = Router();

router.get("/", getAllSpeakers);

router.get("/slug/:slug", getSpeakerBySlug);

router.get("/:id", getSpeakerById);

router.get("/:id/sessions", getSpeakerSessions);

router.post("/", createSpeaker);

router.post("/:id/sessions", linkSpeakerToSession);

router.put("/:id", updateSpeaker);

router.delete("/:id", deleteSpeaker);

export default router;