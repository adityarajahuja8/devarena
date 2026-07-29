import User from '../models/User.js';
import Hackathon from '../models/Hackathon.js';
import Team from '../models/Team.js';
import Submission from '../models/Submission.js';
import Registration from '../models/Registration.js';
import AuditLog from '../models/AuditLog.js';
import { logActivity } from '../utils/auditLogger.js';
import { sendEmail, emailTemplates } from '../utils/sendEmail.js';

// @desc    Get all pending organizer/judge access requests
// @route   GET /api/v1/admin/requests
// @access  Admin
export const getAccessRequests = async (req, res) => {
  const requests = await User.find({
    role: { $in: ['organizer', 'judge'] },
    status: 'pending',
  }).select('-password').sort({ createdAt: -1 });

  res.status(200).json({ success: true, data: { requests, count: requests.length } });
};

// @desc    Approve organizer or judge
// @route   PATCH /api/v1/admin/users/:id/approve
// @access  Admin
export const approveUser = async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

  if (!['organizer', 'judge'].includes(user.role)) {
    return res.status(400).json({ success: false, message: 'Only organizers and judges require approval.' });
  }

  user.status = 'approved';
  user.rejectionReason = '';
  await user.save();

  // Audit log
  logActivity({
    action: 'USER_APPROVED',
    performedBy: req.user._id,
    targetUser: user._id,
    details: `Approved ${user.role} request for ${user.email}`,
    ipAddress: req.ip,
  });

  // Send email notification
  const template = user.role === 'organizer'
    ? emailTemplates.organizerApproved(user.name)
    : emailTemplates.judgeApproved(user.name);
  await sendEmail({ to: user.email, ...template });

  res.status(200).json({ success: true, message: `${user.role} approved successfully.`, data: { user } });
};

// @desc    Reject organizer or judge
// @route   PATCH /api/v1/admin/users/:id/reject
// @access  Admin
export const rejectUser = async (req, res) => {
  const { reason } = req.body;
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

  user.status = 'blocked';
  user.rejectionReason = reason || '';
  await user.save();

  // Audit log
  logActivity({
    action: 'USER_REJECTED',
    performedBy: req.user._id,
    targetUser: user._id,
    details: `Rejected ${user.role} application for ${user.email}. Reason: ${reason || 'None provided'}`,
    ipAddress: req.ip,
  });

  await sendEmail({
    to: user.email,
    ...emailTemplates.accountRejected(user.name, reason),
  });

  res.status(200).json({ success: true, message: 'User request rejected.', data: { user } });
};

// @desc    Block any user
// @route   PATCH /api/v1/admin/users/:id/block
// @access  Admin
export const blockUser = async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
  if (user.role === 'admin') {
    return res.status(400).json({ success: false, message: 'Cannot block another admin.' });
  }

  user.status = 'blocked';
  await user.save();

  // Audit log
  logActivity({
    action: 'USER_BLOCKED',
    performedBy: req.user._id,
    targetUser: user._id,
    details: `Blocked account ${user.email}`,
    ipAddress: req.ip,
  });

  res.status(200).json({ success: true, message: 'User blocked.', data: { user } });
};

// @desc    Unblock a user
// @route   PATCH /api/v1/admin/users/:id/unblock
// @access  Admin
export const unblockUser = async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

  user.status = 'approved';
  await user.save();

  // Audit log
  logActivity({
    action: 'USER_UNBLOCKED',
    performedBy: req.user._id,
    targetUser: user._id,
    details: `Unblocked account ${user.email}`,
    ipAddress: req.ip,
  });

  res.status(200).json({ success: true, message: 'User unblocked.', data: { user } });
};

// @desc    Get all users
// @route   GET /api/v1/admin/users
// @access  Admin
export const getAllUsers = async (req, res) => {
  const { role, status, search, page = 1, limit = 20 } = req.query;
  const query = {};
  if (role) query.role = role;
  if (status) query.status = status;
  if (search) query.$or = [
    { name: { $regex: search, $options: 'i' } },
    { email: { $regex: search, $options: 'i' } },
  ];

  const skip = (page - 1) * limit;
  const [users, total] = await Promise.all([
    User.find(query).select('-password').sort({ createdAt: -1 }).skip(skip).limit(+limit),
    User.countDocuments(query),
  ]);

  res.status(200).json({ success: true, data: { users, total, page: +page, limit: +limit } });
};

// @desc    Delete user
// @route   DELETE /api/v1/admin/users/:id
// @access  Admin
export const deleteUser = async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
  if (user.role === 'admin') {
    return res.status(400).json({ success: false, message: 'Cannot delete another admin.' });
  }

  // Audit log before deletion
  logActivity({
    action: 'USER_DELETED',
    performedBy: req.user._id,
    details: `Deleted user account ${user.name} (${user.email})`,
    ipAddress: req.ip,
  });

  await user.deleteOne();
  res.status(200).json({ success: true, message: 'User deleted.' });
};

// @desc    Get platform analytics
// @route   GET /api/v1/admin/analytics
// @access  Admin
export const getPlatformAnalytics = async (req, res) => {
  const [
    totalUsers, totalHackathons, totalTeams, totalSubmissions,
    pendingRequests, participantCount, organizerCount, judgeCount,
    recentHackathons,
  ] = await Promise.all([
    User.countDocuments(),
    Hackathon.countDocuments(),
    Team.countDocuments(),
    Submission.countDocuments(),
    User.countDocuments({ status: 'pending', role: { $in: ['organizer', 'judge'] } }),
    User.countDocuments({ role: 'participant' }),
    User.countDocuments({ role: 'organizer' }),
    User.countDocuments({ role: 'judge' }),
    Hackathon.find().sort({ createdAt: -1 }).limit(5).populate('organizer', 'name'),
  ]);

  // Registrations per month (last 6 months)
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  const registrationsOverTime = await Registration.aggregate([
    { $match: { createdAt: { $gte: sixMonthsAgo } } },
    {
      $group: {
        _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
        count: { $sum: 1 },
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
  ]);

  // Submissions by status breakdown (for pie/bar chart)
  const submissionsByStatus = await Submission.aggregate([
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ]);

  // Hackathons by status breakdown
  const hackathonsByStatus = await Hackathon.aggregate([
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ]);

  res.status(200).json({
    success: true,
    data: {
      stats: { totalUsers, totalHackathons, totalTeams, totalSubmissions, pendingRequests },
      userBreakdown: { participants: participantCount, organizers: organizerCount, judges: judgeCount },
      recentHackathons,
      registrationsOverTime,
      submissionsByStatus,
      hackathonsByStatus,
    },
  });
};

// @desc    Admin delete any hackathon
// @route   DELETE /api/v1/admin/hackathons/:id
// @access  Admin
export const adminDeleteHackathon = async (req, res) => {
  const hackathon = await Hackathon.findByIdAndDelete(req.params.id);
  if (!hackathon) return res.status(404).json({ success: false, message: 'Hackathon not found.' });

  logActivity({
    action: 'HACKATHON_DELETED',
    performedBy: req.user._id,
    targetHackathon: hackathon._id,
    details: `Deleted hackathon "${hackathon.title}"`,
    ipAddress: req.ip,
  });

  res.status(200).json({ success: true, message: 'Hackathon deleted by admin.' });
};

// @desc    Get system audit logs
// @route   GET /api/v1/admin/audit-logs
// @access  Admin
export const getAuditLogs = async (req, res) => {
  const { page = 1, limit = 30 } = req.query;
  const skip = (page - 1) * limit;

  const [logs, total] = await Promise.all([
    AuditLog.find()
      .populate('performedBy', 'name email avatar role')
      .populate('targetUser', 'name email role')
      .populate('targetHackathon', 'title')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(+limit),
    AuditLog.countDocuments(),
  ]);

  res.status(200).json({ success: true, data: { logs, total, page: +page, limit: +limit } });
};

