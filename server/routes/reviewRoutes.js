import express from 'express';
import {
  submitReview, getMyReview, getAllReviewsForSubmission,
  getHackathonLeaderboard, getJudgeDashboard,
} from '../controllers/reviewController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();
router.use(protect);

router.get('/leaderboard/:hackathonId', getHackathonLeaderboard);
router.get('/judge-dashboard', authorize('judge'), getJudgeDashboard);
router.post('/', authorize('judge'), submitReview);
router.get('/submission/:submissionId', authorize('judge'), getMyReview);
router.get('/submission/:submissionId/all', authorize('organizer', 'admin'), getAllReviewsForSubmission);

export default router;
