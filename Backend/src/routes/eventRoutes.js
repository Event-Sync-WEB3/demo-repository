import { Router } from 'express';
import { authMiddleware, requireAdmin } from '../middleware/authMiddleware.js';
import {
  getEvents,
  getEventBySlug,
  getEventById,
  createEvent,
  createFullEvent,
  updateEvent,
  updateEventById,
  deleteEvent,
  deleteEventById,
} from '../controllers/eventController.js';

const router = Router();

router.get('/',            getEvents);
router.post('/full',       authMiddleware, requireAdmin, createFullEvent);
router.get('/id/:id',      getEventById);
router.get('/:slug',       getEventBySlug);
router.post('/',           authMiddleware, requireAdmin, createEvent);
router.put('/id/:id',      authMiddleware, requireAdmin, updateEventById);
router.put('/:slug',       authMiddleware, requireAdmin, updateEvent);
router.delete('/id/:id',   authMiddleware, requireAdmin, deleteEventById);
router.delete('/:slug',    authMiddleware, requireAdmin, deleteEvent);

export default router;
