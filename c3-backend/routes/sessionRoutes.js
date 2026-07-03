import express from 'express';
import { protect, adminOnly } from '../middleware/authMiddleware.js';
import upload from '../middleware/upload.js';
import {
  createSession,
  getSessions,
  getSessionById,
  markAbsentees,
  updateSession,
} from '../controllers/sessionController.js';

const router = express.Router();

const sessionUpload = upload.fields([
  { name: 'coverImage', maxCount: 1 },
  { name: 'images', maxCount: 4 },
]);

router.post('/', protect, adminOnly, sessionUpload, createSession);
router.get('/', protect, getSessions);
router.get('/:id', protect, getSessionById);
router.put('/:id/absentees', protect, adminOnly, markAbsentees);
router.put('/:id', protect, adminOnly, sessionUpload, updateSession);

export default router;