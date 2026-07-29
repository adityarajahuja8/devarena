import express from 'express';
import {
  createTeam, joinTeam, getTeam, updateTeam, deleteTeam,
  regenerateJoinCode, removeMember, leaveTeam, transferLeadership, getMyTeam,
} from '../controllers/teamController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();
router.use(protect);

router.get('/my/:hackathonId', authorize('participant'), getMyTeam);
router.post('/', authorize('participant'), createTeam);
router.post('/join', authorize('participant'), joinTeam);
router.get('/:id', getTeam);
router.put('/:id', authorize('participant'), updateTeam);
router.delete('/:id', authorize('participant'), deleteTeam);
router.post('/:id/regenerate-code', authorize('participant'), regenerateJoinCode);
router.delete('/:id/members/:userId', authorize('participant'), removeMember);
router.post('/:id/leave', authorize('participant'), leaveTeam);
router.patch('/:id/transfer', authorize('participant'), transferLeadership);

export default router;
