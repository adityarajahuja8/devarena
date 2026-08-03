import React, { useState, useEffect } from 'react';
import Card, { StatCard } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import Input, { Textarea } from '../components/ui/Input';
import Skeleton, { SkeletonTable } from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';
import { RegistrationsChart, UserBreakdownChart, SubmissionsByStatusChart } from '../components/ui/AnalyticsCharts';
import { adminService } from '../services';
import { useAuth } from '../context/AuthContext';
import { FiUsers, FiCheckCircle, FiXCircle, FiSlash, FiShield, FiBarChart2, FiCalendar, FiLock, FiTrendingUp, FiClock, FiActivity } from 'react-icons/fi';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('requests'); // requests | users | analytics | auditLogs
  const [requests, setRequests] = useState([]);
  const [users, setUsers] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Rejection modal
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const fetchRequests = async () => {
    try {
      const res = await adminService.getRequests();
      setRequests(res?.data?.data?.requests || []);
    } catch (err) {
      if (err.response?.status !== 403) {
        console.error('Error fetching requests:', err);
      }
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await adminService.getAllUsers({});
      setUsers(res?.data?.data?.users || []);
    } catch (err) {
      if (err.response?.status !== 403) {
        console.error('Error fetching users:', err);
      }
    }
  };

  const fetchAnalytics = async () => {
    try {
      const res = await adminService.getAnalytics();
      setAnalytics(res?.data?.data || null);
    } catch (err) {
      if (err.response?.status !== 403) {
        console.error('Error fetching analytics:', err);
      }
    }
  };

  const fetchAuditLogs = async () => {
    try {
      const res = await adminService.getAuditLogs();
      setAuditLogs(res?.data?.data?.logs || []);
    } catch (err) {
      if (err.response?.status !== 403) {
        console.error('Error fetching audit logs:', err);
      }
    }
  };

  const loadData = async () => {
    if (user?.role !== 'admin') {
      setLoading(false);
      return;
    }
    setLoading(true);
    await Promise.all([fetchRequests(), fetchUsers(), fetchAnalytics(), fetchAuditLogs()]);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [user]);


  const handleApprove = async (userId) => {
    try {
      const res = await adminService.approveUser(userId);
      toast.success(res.data.message || 'User approved!');
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Approval failed.');
    }
  };

  const handleOpenRejectModal = (user) => {
    setSelectedUser(user);
    setRejectionReason('');
    setRejectModalOpen(true);
  };

  const handleConfirmReject = async () => {
    if (!selectedUser) return;
    try {
      await adminService.rejectUser(selectedUser._id, rejectionReason);
      toast.success('Access request rejected.');
      setRejectModalOpen(false);
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Rejection failed.');
    }
  };

  const handleBlockToggle = async (user) => {
    try {
      if (user.status === 'blocked') {
        await adminService.unblockUser(user._id);
        toast.success('User unblocked.');
      } else {
        await adminService.blockUser(user._id);
        toast.success('User blocked.');
      }
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed.');
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-8 space-y-6">
        <SkeletonTable rows={6} />
      </div>
    );
  }

  if (user?.role !== 'admin') {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <EmptyState
          title="Admin Access Required (403 Forbidden)"
          description="Your current account does not have administrator privileges to view or manage governance endpoints."
          icon="🔒"
        />
      </div>
    );
  }


  const stats = analytics?.stats || {};

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      <div>
        <span className="text-xs font-bold uppercase tracking-widest text-cyan-400">Governance Portal</span>
        <h1 className="text-3xl sm:text-4xl font-extrabold font-display text-white mt-1">Administrator Command Center</h1>
        <p className="text-sm text-gray-400 mt-1">
          Review organizer/judge pending applications, govern ecosystem users, and inspect analytics.
        </p>
      </div>

      {/* Analytics Counter Row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <StatCard label="Pending Requests" value={requests.length} gradient />
        <StatCard label="Total Users" value={stats.totalUsers || 0} />
        <StatCard label="Hackathons" value={stats.totalHackathons || 0} />
        <StatCard label="Teams Created" value={stats.totalTeams || 0} />
        <StatCard label="Submissions" value={stats.totalSubmissions || 0} />
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-white/10 gap-8">
        <button
          onClick={() => setActiveTab('requests')}
          className={`pb-4 font-display font-bold text-sm transition relative ${
            activeTab === 'requests' ? 'text-cyan-400' : 'text-gray-400 hover:text-white'
          }`}
        >
          Access Requests Queue ({requests.length})
          {activeTab === 'requests' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-500" />}
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`pb-4 font-display font-bold text-sm transition relative ${
            activeTab === 'users' ? 'text-cyan-400' : 'text-gray-400 hover:text-white'
          }`}
        >
          User Management ({users.length})
          {activeTab === 'users' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-500" />}
        </button>

        <button
          onClick={() => setActiveTab('analytics')}
          className={`pb-4 font-display font-bold text-sm transition relative flex items-center gap-2 ${
            activeTab === 'analytics' ? 'text-cyan-400' : 'text-gray-400 hover:text-white'
          }`}
        >
          <FiTrendingUp size={14} />
          Platform Analytics
          {activeTab === 'analytics' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-500" />}
        </button>

        <button
          onClick={() => setActiveTab('auditLogs')}
          className={`pb-4 font-display font-bold text-sm transition relative flex items-center gap-2 ${
            activeTab === 'auditLogs' ? 'text-cyan-400' : 'text-gray-400 hover:text-white'
          }`}
        >
          <FiActivity size={14} />
          Activity Log ({auditLogs.length})
          {activeTab === 'auditLogs' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-500" />}
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'requests' && (
        <div>
          {requests.length > 0 ? (
            <Card hover={false} className="p-0 overflow-hidden">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Applicant</th>
                    <th>Requested Role</th>
                    <th>Email</th>
                    <th>Applied Date</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map((r) => (
                    <tr key={r._id}>
                      <td className="font-bold text-white flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-cyan-600/30 flex items-center justify-center text-xs text-cyan-300">
                          {r.name[0]}
                        </div>
                        {r.name}
                      </td>
                      <td>
                        <span className="uppercase text-xs font-bold text-amber-400 px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20">
                          {r.role}
                        </span>
                      </td>
                      <td className="text-gray-300">{r.email}</td>
                      <td className="text-gray-400 text-xs">{new Date(r.createdAt).toLocaleDateString()}</td>
                      <td className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleApprove(r._id)}
                            icon={<FiCheckCircle />}
                          >
                            Approve
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleOpenRejectModal(r)}
                            icon={<FiXCircle />}
                          >
                            Reject
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          ) : (
            <EmptyState
              title="Access Requests Queue Clear"
              description="There are no pending organizer or judge registration requests right now."
              icon="✅"
            />
          )}
        </div>
      )}

      {activeTab === 'users' && (
        <Card hover={false} className="p-0 overflow-hidden">
          <table className="data-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Role</th>
                <th>Status</th>
                <th>Joined</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id}>
                  <td className="font-bold text-white">
                    {u.name}
                    <div className="text-xs text-gray-400 font-normal">{u.email}</div>
                  </td>
                  <td>
                    <span className="uppercase text-xs font-semibold text-cyan-300">{u.role}</span>
                  </td>
                  <td><Badge status={u.status}>{u.status}</Badge></td>
                  <td className="text-xs text-gray-400">{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td className="text-right">
                    {u.role !== 'admin' && (
                      <Button
                        variant={u.status === 'blocked' ? 'outline' : 'ghost'}
                        size="sm"
                        onClick={() => handleBlockToggle(u)}
                      >
                        {u.status === 'blocked' ? 'Unblock User' : 'Block User'}
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          {/* Summary cards row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="glass-card rounded-2xl p-5 border border-white/10 space-y-1">
              <p className="text-[10px] font-mono-code uppercase tracking-widest text-gray-400">Total Users</p>
              <p className="text-3xl font-black font-display text-white">{analytics?.stats?.totalUsers ?? '—'}</p>
              <p className="text-[10px] font-mono-code text-[#67e8f9]">All roles combined</p>
            </div>
            <div className="glass-card rounded-2xl p-5 border border-white/10 space-y-1">
              <p className="text-[10px] font-mono-code uppercase tracking-widest text-gray-400">Hackathons</p>
              <p className="text-3xl font-black font-display text-white">{analytics?.stats?.totalHackathons ?? '—'}</p>
              <p className="text-[10px] font-mono-code text-[#89ceff]">Platform-wide</p>
            </div>
            <div className="glass-card rounded-2xl p-5 border border-white/10 space-y-1">
              <p className="text-[10px] font-mono-code uppercase tracking-widest text-gray-400">Teams</p>
              <p className="text-3xl font-black font-display text-white">{analytics?.stats?.totalTeams ?? '—'}</p>
              <p className="text-[10px] font-mono-code text-[#ffafd3]">Formed across events</p>
            </div>
            <div className="glass-card rounded-2xl p-5 border border-white/10 space-y-1">
              <p className="text-[10px] font-mono-code uppercase tracking-widest text-gray-400">Submissions</p>
              <p className="text-3xl font-black font-display text-white">{analytics?.stats?.totalSubmissions ?? '—'}</p>
              <p className="text-[10px] font-mono-code text-emerald-400">Projects received</p>
            </div>
          </div>

          {/* Charts grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <RegistrationsChart data={analytics?.registrationsOverTime || []} />
            <UserBreakdownChart data={analytics?.userBreakdown || {}} />
          </div>
          <SubmissionsByStatusChart data={analytics?.submissionsByStatus || []} />

          {/* Recent Hackathons table */}
          {analytics?.recentHackathons?.length > 0 && (
            <div className="glass-card rounded-2xl p-6 border border-white/10 space-y-4">
              <h3 className="text-sm font-bold font-display text-white flex items-center gap-2">
                <FiCalendar className="text-[#67e8f9]" /> Recent Hackathons
              </h3>
              <div className="overflow-x-auto">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Organizer</th>
                      <th>Status</th>
                      <th>Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analytics.recentHackathons.map((h) => (
                      <tr key={h._id}>
                        <td className="font-bold text-white">{h.title}</td>
                        <td className="text-gray-300 text-sm">{h.organizer?.name || '—'}</td>
                        <td><Badge status={h.status}>{h.status}</Badge></td>
                        <td className="text-xs text-gray-400">{new Date(h.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Activity Log Tab Content */}
      {activeTab === 'auditLogs' && (
        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-display font-bold text-white mb-4 flex items-center gap-2">
              <FiActivity className="text-cyan-400" /> Platform System Activity Log
            </h3>
            {auditLogs.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Timestamp</th>
                      <th>Action</th>
                      <th>Performed By</th>
                      <th>Details</th>
                      <th>IP Address</th>
                    </tr>
                  </thead>
                  <tbody>
                    {auditLogs.map((log) => (
                      <tr key={log._id}>
                        <td className="text-xs font-mono-code text-gray-400 whitespace-nowrap">
                          {new Date(log.createdAt).toLocaleString()}
                        </td>
                        <td>
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-mono-code uppercase tracking-wider ${
                              log.action.includes('APPROVED') || log.action.includes('CREATED')
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : log.action.includes('REJECTED') || log.action.includes('DELETED')
                                ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                                : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            }`}
                          >
                            {log.action.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="text-sm font-medium text-white">
                          {log.performedBy?.name || 'Admin'}{' '}
                          <span className="text-xs text-gray-500">({log.performedBy?.email})</span>
                        </td>
                        <td className="text-sm text-gray-300 max-w-md break-words">{log.details || '—'}</td>
                        <td className="text-xs font-mono-code text-gray-500">{log.ipAddress || 'Internal'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <EmptyState
                icon={<FiActivity />}
                title="No Audit Logs Recorded"
                description="System activities (approvals, blocks, deletions) will log automatically here."
              />
            )}
          </Card>
        </div>
      )}

      {/* Reject Modal */}
      <Modal isOpen={rejectModalOpen} onClose={() => setRejectModalOpen(false)} title="Reject Access Request">
        <div className="space-y-4">
          <p className="text-sm text-gray-300">
            Rejecting request for <strong className="text-white">{selectedUser?.name}</strong> ({selectedUser?.role}).
          </p>
          <Textarea
            label="Rejection Reason (sent in email notification)"
            placeholder="e.g. Incomplete credentials provided..."
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
          />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => setRejectModalOpen(false)}>Cancel</Button>
            <Button variant="danger" onClick={handleConfirmReject}>Confirm Rejection</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AdminDashboard;
