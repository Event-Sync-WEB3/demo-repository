import { Router } from 'express';
import * as questionService from '../services/questionService.js';
import { sessionLive } from '../middleware/sessionLive.js';

const router = Router({ mergeParams: true });

router.get('/', async (req, res) => {
  try {
    const questions = await questionService.getQuestionsBySession(req.params.sessionId);
    res.json(questions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', sessionLive, async (req, res) => {
  try {
    const { content, authorName } = req.body;
    if (!content || content.trim().length === 0) {
      return res.status(400).json({ error: 'Le contenu est obligatoire' });
    }
    const question = await questionService.createQuestion({
      sessionId: req.params.sessionId,
      content: content.trim(),
      authorName: authorName?.trim() || null
    });
    res.status(201).json(question);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/:questionId/upvote', async (req, res) => {
  try {
    const updated = await questionService.upvoteQuestion(req.params.questionId);
    res.json(updated);
  } catch (err) {
    if (err.code === 'P2025') {
      res.status(404).json({ error: 'Question non trouvée' });
    } else {
      res.status(500).json({ error: err.message });
    }
  }
});

export default router;