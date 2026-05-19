import { Router } from 'express';
import { authMiddleware, requireAdmin } from '../middleware/authMiddleware.js';
import {
  getEvents,
  getEventBySlug,
  createEvent,
  updateEvent,
  deleteEvent,
} from '../controllers/eventController.js';
 
import { getEventSessions } from '../controllers/sessionsController.js';
const router = Router();

router.get('/:eventId/sessions', getEventSessions);
router.get('/',      getEvents);
router.get('/:slug', getEventBySlug);
 
router.post('/', authMiddleware, requireAdmin, createEvent);
 
router.put('/:slug',    authMiddleware, updateEvent);
router.delete('/:slug', authMiddleware, deleteEvent);
 
export default router;
