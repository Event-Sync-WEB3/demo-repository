const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

// Events 
export async function getEvents() {
  const res = await fetch(`${API_URL}/api/events`);
  if (!res.ok) throw new Error('Erreur lors de la récupération des événements');
  return res.json();
}

export async function getEventBySlug(slug) {
  const res = await fetch(`${API_URL}/api/events/${slug}`);
  if (!res.ok) throw new Error('Événement introuvable');
  return res.json();
}

// Speakers 
export async function getSpeakers(eventId) {
  const url = eventId
    ? `${API_URL}/api/speakers?eventId=${eventId}`
    : `${API_URL}/api/speakers`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Erreur lors de la récupération des speakers');
  return res.json();
}

export async function getSpeakerBySlug(slug) {
  const res = await fetch(`${API_URL}/api/speakers/slug/${slug}`);
  if (!res.ok) throw new Error('Speaker introuvable');
  return res.json();
}

export async function getSpeakerSessions(id) {
  const res = await fetch(`${API_URL}/api/speakers/${id}/sessions`);
  if (!res.ok) throw new Error('Erreur lors de la récupération des sessions');
  return res.json();
}

// Sessions 
export async function getSessions(eventId) {
  const url = eventId
    ? `${API_URL}/api/sessions?eventId=${eventId}`
    : `${API_URL}/api/sessions`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Erreur lors de la récupération des sessions');
  return res.json();
}

// Questions
export async function getQuestions(sessionId) {
  const res = await fetch(`${API_URL}/api/sessions/${sessionId}/questions`);
  if (!res.ok) throw new Error('Erreur lors de la récupération des questions');
  return res.json();
}

export async function createQuestion(sessionId, { content, authorName }) {
  const res = await fetch(`${API_URL}/api/sessions/${sessionId}/questions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content, authorName }),
  });
  if (!res.ok) throw new Error('Erreur lors de la création de la question');
  return res.json();
}

export async function upvoteQuestion(sessionId, questionId) {
  const res = await fetch(
    `${API_URL}/api/sessions/${sessionId}/questions/${questionId}/upvote`,
    { method: 'POST' }
  );
  if (!res.ok) throw new Error('Erreur lors du upvote');
  return res.json();
}