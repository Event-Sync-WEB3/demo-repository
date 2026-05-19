import { Router } from 'express';
import { getRoomSessions } from '../controllers/roomsController.js';

const router = Router();

router.get('/:roomId/sessions', getRoomSessions);

export default router;