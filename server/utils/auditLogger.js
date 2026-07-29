import AuditLog from '../models/AuditLog.js';

export const logActivity = async ({ action, performedBy, targetUser, targetHackathon, details, ipAddress }) => {
  try {
    await AuditLog.create({
      action,
      performedBy,
      targetUser,
      targetHackathon,
      details,
      ipAddress: ipAddress || '',
    });
  } catch (error) {
    console.error('Failed to log audit activity:', error.message);
  }
};
