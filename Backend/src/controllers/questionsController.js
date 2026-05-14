import prisma from '../config/prisma.js';
import { AppError } from '../middleware/errorHandler.js';

// POST /questions
export const createQuestion = async (req, res, next) => {
  const { content, authorName, sessionId } = req.body;

  if (!content || !sessionId) {
    return next(new AppError('content and sessionId are required.', 400));
  }

  try {
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      select: { startsAt: true, endsAt: true },
    });
    if (!session) return next(new AppError('Session not found.', 404));

    const now = new Date();
    if (now < session.startsAt || now > session.endsAt) {
      return next(new AppError('Session is not live.', 400));
    }

    const question = await prisma.question.create({
      data: {
        content,
        authorName: authorName || null,
        sessionId,
      },
    });

    res.status(201).json({ success: true, data: question });
  } catch (err) {
    next(err);
  }
};

// POST /questions/:id/upvote
export const upvoteQuestion = async (req, res, next) => {
  const { id } = req.params;

  try {
    const question = await prisma.question.update({
      where: { id },
      data: { upvotes: { increment: 1 } },
    });

    res.json({ success: true, data: question });
  } catch (err) {
    if (err.code === 'P2025') return next(new AppError('Question not found.', 404));
    next(err);
  }
};