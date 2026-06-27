import { Router } from 'express';
import { authMiddleware, requireAdmin } from '../middleware/authMiddleware.js';
import {
  getAllSpeakers,
  getSpeakerBySlug,
  getSpeakerById,
  createSpeaker,
  updateSpeaker,
  deleteSpeaker,
  getSpeakerSessions,
  linkSpeakerToSession,
} from '../controllers/speakerController.js';

const router = Router();

router.get('/',           getAllSpeakers);
router.get('/slug/:slug', getSpeakerBySlug);
router.get('/:id',        getSpeakerById);
router.get('/:id/sessions', getSpeakerSessions);
router.post('/',             authMiddleware, requireAdmin, createSpeaker);
router.post('/:id/sessions', authMiddleware, requireAdmin, linkSpeakerToSession);
router.put('/:id',           authMiddleware, requireAdmin, updateSpeaker);
router.delete('/:id',        authMiddleware, requireAdmin, deleteSpeaker);

export default router;