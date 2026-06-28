import { Router } from 'express';
import { authMiddleware, requireAdmin } from '../middleware/authMiddleware.js';
import {
  getSessions,
  getEventSessions,
  getSessionById,
  getSessionQuestions,
  createSession,
  updateSession,
  deleteSession,
} from '../controllers/sessionController.js';

const router = Router();

router.get('/',                         getSessions);
router.get('/events/:eventId/sessions', getEventSessions);
router.get('/:id',                      getSessionById);
router.get('/:sessionId/questions',     getSessionQuestions);
router.post('/',      authMiddleware, requireAdmin, createSession);
router.put('/:id',    authMiddleware, requireAdmin, updateSession);
router.delete('/:id', authMiddleware, requireAdmin, deleteSession);

export default router;