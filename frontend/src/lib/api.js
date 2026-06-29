const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

// ─── Events ───────────────────────────────────────────────────────────────────

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

const FAVORITES_KEY = 'eventsync_favorites';

export function getFavorites() {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(FAVORITES_KEY) || '[]');
  } catch {
    return [];
  }
}

export function addFavorite(slug) {
  const favorites = getFavorites();
  if (favorites.includes(slug)) return favorites;
  const updated = [...favorites, slug];
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(updated));
  return updated;
}

export function removeFavorite(slug) {
  const updated = getFavorites().filter((s) => s !== slug);
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(updated));
  return updated;
}

export function toggleFavorite(slug) {
  const isFavorite = getFavorites().includes(slug);
  const favorites = isFavorite ? removeFavorite(slug) : addFavorite(slug);
  return { favorites, isFavorite: !isFavorite };
}

export function isFavorite(slug) {
  return getFavorites().includes(slug);
}

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

export async function getSessions(eventId) {
  const url = eventId
    ? `${API_URL}/api/sessions?eventId=${eventId}`
    : `${API_URL}/api/sessions`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Erreur lors de la récupération des sessions');
  return res.json();
}

export async function getQuestions(sessionId) {
  const res = await fetch(`${API_URL}/api/sessions/${sessionId}/questions`);
  if (!res.ok) throw new Error('Erreur lors de la récupération des questions');
  const data = await res.json();
  return data.data || data;
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

export async function getSessionById(id) {
  const res = await fetch(`${API_URL}/api/sessions/${id}`);
  if (!res.ok) throw new Error('Session introuvable');
  return res.json();
}