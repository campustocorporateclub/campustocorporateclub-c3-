import express from 'express';
import { protect, adminOnly } from '../middleware/authMiddleware.js';
import { getPendingUsers, getApprovedUsers, approveUser } from '../controllers/userController.js';

const router = express.Router();

router.get('/pending', protect, adminOnly, getPendingUsers);
router.get('/approved', protect, adminOnly, getApprovedUsers);
router.put('/:id/approve', protect, adminOnly, approveUser);

export default router;