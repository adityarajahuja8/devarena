import express from 'express';
import {
  createSubmission, getSubmission, updateSubmission,
  getHackathonSubmissions, assignJudgesToSubmission, getMySubmission,
} from '../controllers/submissionController.js';
import { protect, authorize } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();
router.use(protect);

router.get('/my/:hackathonId', authorize('participant'), getMySubmission);
router.get('/hackathon/:hackathonId', authorize('organizer', 'admin', 'judge'), getHackathonSubmissions);
router.post(
  '/',
  authorize('participant'),
  upload.fields([{ name: 'screenshots', maxCount: 5 }, { name: 'presentationPDF', maxCount: 1 }]),
  createSubmission
);
router.get('/:id', getSubmission);
router.put('/:id', authorize('participant'), updateSubmission);
router.post('/:id/assign-judges', authorize('organizer', 'admin'), assignJudgesToSubmission);

export default router;
