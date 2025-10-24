// routes/animationRoutes.js
import express from 'express';
import {
  saveAnimation,
  downloadAnimation,
  getAnimationById,
  getTeacherAnimations,
  patchAnimation,
  deleteAnimation
} from '../controllers/animationController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// router.post('/', protect, saveAnimation);
router.post('/' , saveAnimation);
router.get('/', protect, getTeacherAnimations);
router.get('/:id', protect, getAnimationById);
router.put('/:id', protect, saveAnimation); // full update
router.patch('/:id', protect, patchAnimation);
router.delete('/:id', protect, deleteAnimation);
// router.post('/download', protect, downloadAnimation);
router.post('/download', downloadAnimation);

export default router;
