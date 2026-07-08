import express from 'express';
import { protect, adminOnly } from '../middleware/authMiddleware.js';
import upload from '../middleware/upload.js';
import {
  createEvent,
  getEvents,
  getEventById,
  updateEvent,
} from '../controllers/eventController.js';

const router = express.Router();

const eventUpload = upload.fields([
  { name: 'coverImage', maxCount: 1 },
]);

router.post('/', protect, adminOnly, eventUpload, createEvent);
router.get('/', protect, getEvents);
router.get('/:id', protect, getEventById);
router.put('/:id', protect, adminOnly, eventUpload, updateEvent);

export default router;