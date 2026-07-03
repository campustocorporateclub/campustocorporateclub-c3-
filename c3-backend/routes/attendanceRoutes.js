import express from 'express';
import { protect, adminOnly } from '../middleware/authMiddleware.js';
import { getMemberAttendance, getAllAttendance } from '../controllers/attendanceController.js';

const router = express.Router();

router.get('/all', protect, adminOnly, getAllAttendance);
router.get('/:memberId', protect, getMemberAttendance);

export default router;