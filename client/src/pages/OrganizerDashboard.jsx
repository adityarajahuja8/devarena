import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Card, { StatCard } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import Input, { Textarea } from '../components/ui/Input';
import Skeleton, { SkeletonTable } from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';
import { HackathonStatsChart } from '../components/ui/AnalyticsCharts';
import { hackathonService, adminService } from '../services';
import { FiPlus, FiUsers, FiAward, FiTrash2, FiEdit3, FiCalendar, FiCheck, FiFolder, FiUserCheck, FiLayers, FiTrendingUp } from 'react-icons/fi';
import toast from 'react-hot-toast';

const OrganizerDashboard = () => {
  const location = useLocation();
  const [hackathons, setHackathons] = useState([]);
  const [approvedJudges, setApprovedJudges] = useState([]);
  const [stats, setStats] = useState({ totalHackathons: 0, totalRegistrations: 0, totalSubmissions: 0 });
  const [loading, setLoading] = useState(true);

  // Create Hackathon Modal
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Edit Hackathon Modal
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingHackathon, setEditingHackathon] = useState(null);
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editFormData, setEditFormData] = useState({});

  // Judge Assignment Modal
  const [assignJudgeModalOpen, setAssignJudgeModalOpen] = useState(false);
  const [selectedHackathon, setSelectedHackathon] = useState(null);
  const [selectedJudgeId, setSelectedJudgeId] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    theme: '',
    mode: 'Online',
    startDate: '',
    endDate: '',
    registrationDeadline: '',
    prizePool: '',
    maxTeamSize: 4,
    rules: '',
    judgingCriteria: [
      { name: 'Innovation', maxMarks: 40, description: 'Novelty and creativity of the concept' },
      { name: 'Technical Complexity', maxMarks: 35, description: 'Code quality, architecture, and difficulty' },
      { name: 'UI & Usability', maxMarks: 25, description: 'Design quality and user experience' },
    ],
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await hackathonService.getMy();
      const list = res.data.data.hackathons || [];
      setHackathons(list);
      if (res.data.data.stats) {
        setStats(res.data.data.stats);
      }

      // Fetch judges pool available for assignment
      const judgesRes = await hackathonService.getJudgesPool();
      setApprovedJudges(judgesRes.data.data.judges || []);

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    const handleCustomOpen = () => setCreateModalOpen(true);
    window.addEventListener('open-create-hackathon', handleCustomOpen);

    return () => {
      window.removeEventListener('open-create-hackathon', handleCustomOpen);
    };
  }, []);


  const handleCreateHackathon = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await hackathonService.create({
        ...formData,
        status: 'upcoming',
      });
      toast.success('Hackathon created successfully!');
      setCreateModalOpen(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create hackathon.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenAssignModal = (h) => {
    setSelectedHackathon(h);
    setSelectedJudgeId('');
    setAssignJudgeModalOpen(true);
  };

  // Helpers to format Date → yyyy-MM-dd for <input type="date">
  const toDateInput = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toISOString().split('T')[0];
  };

  const handleOpenEditModal = (h) => {
    setEditingHackathon(h);
    setEditFormData({
      title: h.title || '',
      description: h.description || '',
      theme: h.theme || '',
      mode: h.mode || 'Online',
      startDate: toDateInput(h.startDate),
      endDate: toDateInput(h.endDate),
      registrationDeadline: toDateInput(h.registrationDeadline),
      prizePool: h.prizePool || '',
      maxTeamSize: h.maxTeamSize || 4,
      rules: h.rules || '',
      status: h.status || 'upcoming',
    });
    setEditModalOpen(true);
  };

  const handleUpdateHackathon = async (e) => {
    e.preventDefault();
    if (!editingHackathon) return;
    setEditSubmitting(true);
    try {
      await hackathonService.update(editingHackathon._id, editFormData);
      toast.success('Hackathon updated successfully!');
      setEditModalOpen(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update hackathon.');
    } finally {
      setEditSubmitting(false);
    }
  };

  const handleAssignJudge = async () => {
    if (!selectedJudgeId || !selectedHackathon) return;
    try {
      await hackathonService.assignJudge(selectedHackathon._id, selectedJudgeId);
      toast.success('Judge assigned to hackathon!');
      setAssignJudgeModalOpen(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to assign judge.');
    }
  };

  const handleDeleteHackathon = async (id) => {
    if (!window.confirm('Are you sure you want to delete this hackathon deployment?')) return;
    try {
      await hackathonService.delete(id);
      toast.success('Hackathon deleted.');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete hackathon.');
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-10 space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-32 rounded-2xl" />
          <Skeleton className="h-32 rounded-2xl" />
          <Skeleton className="h-32 rounded-2xl" />
        </div>
        <SkeletonTable rows={4} />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Glow */}
      <div className="fixed top-[15%] left-[20%] w-[500px] h-[500px] bg-[#06b6d4]/10 rounded-full blur-[140px] pointer-events-none -z-10 animate-pulse"></div>

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="text-xs font-mono-code uppercase tracking-widest text-[#67e8f9]">Organizer Portal</span>
          <h1 className="text-3xl sm:text-4xl font-extrabold font-display text-white mt-1">Organizer Dashboard</h1>
        </div>
        <button
          onClick={() => setCreateModalOpen(true)}
          className="btn-primary py-3 px-6 font-bold text-xs font-mono-code uppercase tracking-wider flex items-center gap-2"
        >
          <FiPlus /> Create Hackathon
        </button>
      </div>

      {/* Overview Stat Cards with REAL Database Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="glass-card p-6 rounded-2xl relative overflow-hidden">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-mono-code uppercase tracking-widest text-gray-400">My Hackathons</span>
            <FiCalendar className="text-[#67e8f9] text-xl" />
          </div>
          <div className="text-4xl font-black font-display text-white">{stats.totalHackathons || hackathons.length}</div>
          <p className="text-[10px] font-mono-code text-emerald-400 mt-2">Active Events Hosted</p>
        </div>

        <div className="glass-card p-6 rounded-2xl relative overflow-hidden">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-mono-code uppercase tracking-widest text-gray-400">Total Registrations</span>
            <FiUsers className="text-[#89ceff] text-xl" />
          </div>
          <div className="text-4xl font-black font-display text-white">{stats.totalRegistrations}</div>
          <p className="text-[10px] font-mono-code text-[#89ceff] mt-2">Live Registered Participants</p>
        </div>

        <div className="glass-card p-6 rounded-2xl relative overflow-hidden">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-mono-code uppercase tracking-widest text-gray-400">Submissions Received</span>
            <FiFolder className="text-[#ffafd3] text-xl" />
          </div>
          <div className="text-4xl font-black font-display text-white">{stats.totalSubmissions}</div>
          <p className="text-[10px] font-mono-code text-[#ffafd3] mt-2">Projects Submitted</p>
        </div>
      </div>

      {/* Analytics Chart — Registrations vs Submissions per hackathon */}
      {hackathons.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <FiTrendingUp className="text-[#67e8f9]" />
            <h3 className="text-base font-bold font-display text-white">Event Performance Overview</h3>
            <span className="ml-auto text-xs font-mono-code text-gray-500">Registrations vs Submissions</span>
          </div>
          <HackathonStatsChart hackathons={hackathons} />
        </div>
      )}

      {/* Active Deployments Section */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-bold font-display text-white flex items-center gap-2">
            <FiLayers className="text-[#67e8f9]" /> Active Deployments
          </h3>
          <span className="text-xs font-mono-code text-[#67e8f9]">Live Event Operations</span>
        </div>

        {hackathons.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {hackathons.map((h) => (
              <div key={h._id} className="glass-card p-6 rounded-2xl flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="badge badge-live">{h.status || 'LIVE'}</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpenEditModal(h)}
                        className="text-gray-500 hover:text-[#67e8f9] transition"
                        title="Edit Hackathon"
                      >
                        <FiEdit3 size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteHackathon(h._id)}
                        className="text-gray-500 hover:text-red-400 transition"
                        title="Delete Hackathon"
                      >
                        <FiTrash2 size={16} />
                      </button>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-xl font-bold font-display text-white">{h.title}</h4>
                    <p className="text-xs text-gray-400 font-mono-code mt-1">{h.theme || 'Web3 & AI'}</p>
                  </div>

                  <div className="space-y-2 text-xs font-mono-code pt-2 border-t border-white/5">
                    <div className="flex justify-between text-gray-400">
                      <span>Registrations</span>
                      <span className="text-white font-bold">{h.registrationCount || 0}</span>
                    </div>
                    <div className="flex justify-between text-gray-400">
                      <span>Submissions</span>
                      <span className="text-emerald-400 font-bold">{h.submissionCount || 0}</span>
                    </div>
                    <div className="flex justify-between text-gray-400">
                      <span>Judges Assigned</span>
                      <span className="text-[#67e8f9] font-bold">{h.judges?.length || 0}</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => handleOpenAssignModal(h)}
                    className="btn-outline py-2.5 text-xs w-full font-mono-code"
                  >
                    Assign Judge
                  </button>
                  <Link to={`/hackathons/${h._id}`} className="w-full">
                    <button className="btn-primary py-2.5 text-xs w-full font-mono-code">
                      Manage
                    </button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            title="No Deployments Found"
            description="Create your first hackathon deployment to start managing registrations and judges."
            actionText="Create Hackathon"
            onAction={() => setCreateModalOpen(true)}
          />
        )}
      </div>

      {/* Judge Allocation Table matching Stitch design */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 space-y-6 border border-white/10">
        <h3 className="text-xl font-bold font-display text-white flex items-center gap-2">
          <FiUserCheck className="text-[#67e8f9]" /> Judge Pool Allocation
        </h3>

        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Judge Name</th>
                <th>Email</th>
                <th>Role Status</th>
                <th className="text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {approvedJudges.map((j) => (
                <tr key={j._id}>
                  <td className="font-bold text-white flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#06b6d4]/20 text-[#67e8f9] flex items-center justify-center font-bold text-xs">
                      {j.name?.[0] || 'J'}
                    </div>
                    <span>{j.name}</span>
                  </td>
                  <td className="text-xs font-mono-code text-gray-300">{j.email}</td>
                  <td>
                    <span className="badge badge-approved">Approved Judge</span>
                  </td>
                  <td className="text-right">
                    {hackathons.length > 0 && (
                      <button
                        onClick={() => handleOpenAssignModal(hackathons[0])}
                        className="btn-outline py-1.5 px-4 text-xs font-mono-code"
                      >
                        Assign
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Hackathon Modal */}
      <Modal isOpen={createModalOpen} onClose={() => setCreateModalOpen(false)} title="Create New Hackathon" maxWidth="max-w-3xl">
        <form onSubmit={handleCreateHackathon} className="space-y-4">
          <Input
            label="Hackathon Title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Theme"
              placeholder="e.g. Generative AI, Web3, ClimateTech"
              value={formData.theme}
              onChange={(e) => setFormData({ ...formData, theme: e.target.value })}
              required
            />
            <div>
              <label className="block text-xs font-mono-code uppercase tracking-wider mb-2 text-gray-400">Mode</label>
              <select
                value={formData.mode}
                onChange={(e) => setFormData({ ...formData, mode: e.target.value })}
                className="input-field cursor-pointer"
              >
                <option value="Online">Online</option>
                <option value="Offline">Offline</option>
                <option value="Hybrid">Hybrid</option>
              </select>
            </div>
          </div>

          <Textarea
            label="Description"
            rows={3}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            required
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="Registration Deadline"
              type="date"
              value={formData.registrationDeadline}
              onChange={(e) => setFormData({ ...formData, registrationDeadline: e.target.value })}
              required
            />
            <Input
              label="Start Date"
              type="date"
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              required
            />
            <Input
              label="End Date"
              type="date"
              value={formData.endDate}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Prize Pool ($)"
              type="number"
              min={1}
              placeholder="50000"
              value={formData.prizePool}
              onKeyDown={(e) => ['e','E','+','-'].includes(e.key) && e.preventDefault()}
              onChange={(e) => setFormData({ ...formData, prizePool: e.target.value === '' ? '' : +e.target.value })}
            />
            <Input
              label="Max Team Size"
              type="number"
              min={1}
              max={10}
              value={formData.maxTeamSize}
              onChange={(e) => setFormData({ ...formData, maxTeamSize: +e.target.value })}
              required
            />
          </div>

          <Button type="submit" variant="primary" loading={submitting} className="w-full mt-4 font-bold">
            Publish Hackathon Deployment
          </Button>
        </form>
      </Modal>

      {/* Assign Judge Modal */}
      <Modal isOpen={assignJudgeModalOpen} onClose={() => setAssignJudgeModalOpen(false)} title="Assign Judge from Pool">
        <div className="space-y-4">
          <p className="text-sm text-gray-300">
            Select an approved judge to evaluate submissions for <strong className="text-white">{selectedHackathon?.title}</strong>.
          </p>
          <select
            value={selectedJudgeId}
            onChange={(e) => setSelectedJudgeId(e.target.value)}
            className="input-field cursor-pointer"
          >
            <option value="">-- Select Approved Judge --</option>
            {approvedJudges.map((j) => (
              <option key={j._id} value={j._id}>{j.name} ({j.email})</option>
            ))}
          </select>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => setAssignJudgeModalOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleAssignJudge}>Assign Judge</Button>
          </div>
        </div>
      </Modal>

      {/* Edit Hackathon Modal */}
      <Modal isOpen={editModalOpen} onClose={() => setEditModalOpen(false)} title={`Edit: ${editingHackathon?.title}`} maxWidth="max-w-3xl">
        <form onSubmit={handleUpdateHackathon} className="space-y-4">
          <Input
            label="Hackathon Title"
            value={editFormData.title || ''}
            onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
            required
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Theme"
              placeholder="e.g. Generative AI, Web3, ClimateTech"
              value={editFormData.theme || ''}
              onChange={(e) => setEditFormData({ ...editFormData, theme: e.target.value })}
              required
            />
            <div>
              <label className="block text-xs font-mono-code uppercase tracking-wider mb-2 text-gray-400">Mode</label>
              <select
                value={editFormData.mode || 'Online'}
                onChange={(e) => setEditFormData({ ...editFormData, mode: e.target.value })}
                className="input-field cursor-pointer"
              >
                <option value="Online">Online</option>
                <option value="Offline">Offline</option>
                <option value="Hybrid">Hybrid</option>
              </select>
            </div>
          </div>

          <Textarea
            label="Description"
            rows={3}
            value={editFormData.description || ''}
            onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
            required
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="Registration Deadline"
              type="date"
              value={editFormData.registrationDeadline || ''}
              onChange={(e) => setEditFormData({ ...editFormData, registrationDeadline: e.target.value })}
              required
            />
            <Input
              label="Start Date"
              type="date"
              value={editFormData.startDate || ''}
              onChange={(e) => setEditFormData({ ...editFormData, startDate: e.target.value })}
              required
            />
            <Input
              label="End Date"
              type="date"
              value={editFormData.endDate || ''}
              onChange={(e) => setEditFormData({ ...editFormData, endDate: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="Prize Pool ($)"
              type="number"
              min={1}
              placeholder="50000"
              value={editFormData.prizePool || ''}
              onKeyDown={(e) => ['e','E','+','-'].includes(e.key) && e.preventDefault()}
              onChange={(e) => setEditFormData({ ...editFormData, prizePool: e.target.value === '' ? '' : +e.target.value })}
            />
            <Input
              label="Max Team Size"
              type="number"
              min={1}
              max={10}
              value={editFormData.maxTeamSize || 4}
              onChange={(e) => setEditFormData({ ...editFormData, maxTeamSize: +e.target.value })}
              required
            />
            <div>
              <label className="block text-xs font-mono-code uppercase tracking-wider mb-2 text-gray-400">Status</label>
              <select
                value={editFormData.status || 'upcoming'}
                onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                className="input-field cursor-pointer"
              >
                <option value="draft">Draft</option>
                <option value="upcoming">Upcoming</option>
                <option value="ongoing">Ongoing</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          <Textarea
            label="Rules (optional)"
            rows={2}
            placeholder="Enter hackathon rules..."
            value={editFormData.rules || ''}
            onChange={(e) => setEditFormData({ ...editFormData, rules: e.target.value })}
          />

          <div className="flex gap-3 pt-2">
            <Button variant="ghost" type="button" onClick={() => setEditModalOpen(false)} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={editSubmitting} className="flex-1 font-bold">
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default OrganizerDashboard;

