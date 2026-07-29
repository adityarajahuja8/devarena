import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema(
  {
    action: {
      type: String,
      required: true,
      enum: [
        'USER_APPROVED',
        'USER_REJECTED',
        'USER_BLOCKED',
        'USER_UNBLOCKED',
        'USER_DELETED',
        'HACKATHON_CREATED',
        'HACKATHON_UPDATED',
        'HACKATHON_DELETED',
      ],
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    targetUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    targetHackathon: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hackathon',
    },
    details: {
      type: String,
      default: '',
    },
    ipAddress: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

auditLogSchema.index({ createdAt: -1 });

const AuditLog = mongoose.model('AuditLog', auditLogSchema);
export default AuditLog;
