import { Router } from 'express';
import {
  getEventSessions,
  getSessionById,
  getSessionQuestions,
} from '../controllers/sessionController.js';

const router = Router();

router.get('/events/:eventId/sessions', getEventSessions);

router.get('/:id', getSessionById);

router.get('/:sessionId/questions', getSessionQuestions);

export default router;