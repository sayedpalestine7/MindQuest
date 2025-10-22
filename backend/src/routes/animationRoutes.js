// routes/animationRoutes.js
import express from 'express';
import {
  saveAnimation,
  downloadAnimation,
  getAnimationById,
  getTeacherAnimations
} from '../controllers/animationController.js';

const router = express.Router();

// Save/Update Animation (temporary open route)
router.post('/', saveAnimation);

// Get Animation by ID
router.get('/:id', getAnimationById);

// List all animations for the current teacher
router.get('/', getTeacherAnimations);

// Download the self-contained HTML file
router.post('/download', downloadAnimation);

export default router;
