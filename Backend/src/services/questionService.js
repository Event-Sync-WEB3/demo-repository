import prisma from '../config/prisma.js';

export async function getQuestionsBySession(sessionId) {
  return prisma.question.findMany({
    where: { sessionId },
    orderBy: { upvotes: 'desc' }
  });
}

export async function createQuestion({ sessionId, content, authorName }) {
  return prisma.question.create({
    data: { sessionId, content, authorName: authorName || null }
  });
}

export async function upvoteQuestion(questionId) {
  return prisma.question.update({
    where: { id: questionId },
    data: { upvotes: { increment: 1 } }
  });
}