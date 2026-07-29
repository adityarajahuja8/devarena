import express from 'express';
import {
  getHackathons, getFeaturedHackathons, getHackathon, createHackathon,

  updateHackathon, deleteHackathon, getMyHackathons, registerForHackathon,
  assignJudge, getHackathonTeams, toggleBookmark, getJudgesPool,
} from '../controllers/hackathonController.js';
import { protect, authorize, requireApproved } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/', getHackathons);
router.get('/featured', getFeaturedHackathons);
router.get('/judges/pool', protect, authorize('organizer', 'admin'), getJudgesPool);
router.get('/:id', getHackathon);

// Organizer routes
router.get('/my/all', protect, authorize('organizer', 'admin'), getMyHackathons);
router.post('/', protect, authorize('organizer', 'admin'), createHackathon);
router.put('/:id', protect, authorize('organizer', 'admin'), updateHackathon);
router.delete('/:id', protect, authorize('organizer', 'admin'), deleteHackathon);
router.get('/:id/teams', protect, authorize('organizer', 'admin'), getHackathonTeams);
router.post('/:id/judges', protect, authorize('organizer', 'admin'), assignJudge);



// Participant / any logged-in user routes
router.post('/:id/register', protect, registerForHackathon);
router.post('/:id/bookmark', protect, toggleBookmark);


export default router;
