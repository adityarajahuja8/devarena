import express from 'express';
import {
  getAccessRequests, approveUser, rejectUser, blockUser, unblockUser,
  getAllUsers, deleteUser, getPlatformAnalytics, adminDeleteHackathon, getAuditLogs,
} from '../controllers/adminController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();
// All admin routes require authentication and admin role
router.use(protect, authorize('admin'));

router.get('/requests', getAccessRequests);
router.get('/users', getAllUsers);
router.get('/analytics', getPlatformAnalytics);
router.get('/audit-logs', getAuditLogs);
router.patch('/users/:id/approve', approveUser);
router.patch('/users/:id/reject', rejectUser);
router.patch('/users/:id/block', blockUser);
router.patch('/users/:id/unblock', unblockUser);
router.delete('/users/:id', deleteUser);
router.delete('/hackathons/:id', adminDeleteHackathon);

export default router;
