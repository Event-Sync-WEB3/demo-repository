import { Router } from 'express';
import {
  listEvents,
  getEvent,
  getEventBySlug,
  createEvent,
  updateEvent,
  patchEvent,
  deleteEvent,
  getLiveSessions,
} from '../controllers/eventsController.js';
import { getEventSessions } from '../controllers/sessionsController.js'; // ta partie

const router = Router();

router.get('/', listEvents);
router.get('/:id', getEvent);
router.get('/slug/:slug', getEventBySlug);
router.get('/:id/live', getLiveSessions);
router.get('/:eventId/sessions', getEventSessions); // <-- sessions d'un événement

router.post('/', createEvent);
router.put('/:id', updateEvent);
router.patch('/:id', patchEvent);
router.delete('/:id', deleteEvent);

export default router;