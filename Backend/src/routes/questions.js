import { Router } from 'express';
import { createQuestion, upvoteQuestion } from '../controllers/questionsController.js';

const router = Router();

router.post('/', createQuestion);
router.post('/:id/upvote', upvoteQuestion);

export default router;