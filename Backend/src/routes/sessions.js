import { Router } from 'express';
import { getSessionById, getSessionQuestions } from '../controllers/sessionsController.js';

const router = Router();

router.get('/:id', getSessionById);
router.get('/:sessionId/questions', getSessionQuestions);

export default router;