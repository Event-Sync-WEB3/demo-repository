import { Router } from 'express';
import { authMiddleware, requireAdmin } from '../middleware/authMiddleware.js';
import {
  getRooms,
  getRoomById,
  createRoom,
  updateRoom,
  deleteRoom,
} from '../controllers/roomController.js';

const router = Router();

router.get('/',    getRooms);
router.get('/:id', getRoomById);
router.post('/',      authMiddleware, requireAdmin, createRoom);
router.put('/:id',    authMiddleware, requireAdmin, updateRoom);
router.delete('/:id', authMiddleware, requireAdmin, deleteRoom);

export default router;