import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Modal from '../components/ui/Modal';
import JoinCodePill from '../components/ui/JoinCodePill';
import Skeleton from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';
import { teamService, hackathonService } from '../services';
import { FiUsers, FiPlus, FiUserPlus, FiTrash2, FiLogOut, FiShield, FiUserCheck, FiCopy, FiRefreshCw, FiArrowRight } from 'react-icons/fi';
import { FaCrown } from 'react-icons/fa';
import toast from 'react-hot-toast';

const TeamPage = () => {
  const { hackathonId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [team, setTeam] = useState(null);
  const [hackathon, setHackathon] = useState(null);
  const [loading, setLoading] = useState(true);

  // Modals
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [joinModalOpen, setJoinModalOpen] = useState(false);

  // Forms
  const [teamName, setTeamName] = useState('');
  const [joinCodeInput, setJoinCodeInput] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchTeamAndHackathon = async () => {
    setLoading(true);
    try {
      if (hackathonId) {
        const hackRes = await hackathonService.getOne(hackathonId);
        setHackathon(hackRes.data.data.hackathon);

        const teamRes = await teamService.getMy(hackathonId);
        setTeam(teamRes.data.data.team);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeamAndHackathon();
  }, [hackathonId]);

  const handleCreateTeam = async (e) => {
    e.preventDefault();
    if (!teamName.trim()) {
      toast.error('Enter a team name');
      return;
    }
    setSubmitting(true);
    try {
      const res = await teamService.create({ name: teamName, hackathonId });
      toast.success(res.data.message || 'Team created successfully!');
      setTeam(res.data.data.team);
      setCreateModalOpen(false);
      setTeamName('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create team.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleJoinTeam = async (e) => {
    e.preventDefault();
    if (!joinCodeInput.trim()) {
      toast.error('Enter a 6-character join code');
      return;
    }
    setSubmitting(true);
    try {
      const res = await teamService.join({ code: joinCodeInput, hackathonId });
      toast.success(res.data.message || 'Joined team!');
      setTeam(res.data.data.team);
      setJoinModalOpen(false);
      setJoinCodeInput('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid join code.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRegenerateCode = async () => {
    if (!team) return;
    try {
      const res = await teamService.regenerateCode(team._id);
      setTeam({ ...team, joinCode: res.data.data.joinCode });
      toast.success('Join code regenerated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to regenerate code.');
    }
  };

  const handleRemoveMember = async (memberId) => {
    if (!team) return;
    try {
      const res = await teamService.removeMember(team._id, memberId);
      setTeam(res.data.data.team);
      toast.success('Member removed.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to remove member.');
    }
  };

  const handleLeaveTeam = async () => {
    if (!team) return;
    if (window.confirm('Are you sure you want to leave this team?')) {
      try {
        await teamService.leave(team._id);
        toast.success('Left team.');
        setTeam(null);
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to leave team.');
      }
    }
  };

  const handleDeleteTeam = async () => {
    if (!team) return;
    if (window.confirm('Are you sure you want to delete this team? All members will be unassigned.')) {
      try {
        await teamService.delete(team._id);
        toast.success('Team deleted.');
        setTeam(null);
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to delete team.');
      }
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-8 space-y-6">
        <Skeleton height="200px" className="w-full rounded-2xl" />
      </div>
    );
  }

  const isLeader = team && team.leader?._id === user?._id;
  const maxTeamSize = hackathon?.maxTeamSize || 4;
  const currentMembers = team?.members || [];
  const emptySlotsCount = Math.max(0, maxTeamSize - currentMembers.length);

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-10">
      {/* Ambient Glow */}
      <div className="fixed top-[15%] right-[15%] w-[450px] h-[450px] bg-[#a078ff]/10 rounded-full blur-[120px] pointer-events-none -z-10 animate-pulse"></div>

      {/* Header */}
      <div>
        <span className="text-xs font-mono-code uppercase tracking-widest text-[#d0bcff]">Roster Management</span>
        <h1 className="text-3xl sm:text-4xl font-extrabold font-display text-white mt-1">
          {team ? team.name : hackathon?.title ? `Teaming for ${hackathon.title}` : 'Team Dashboard'}
        </h1>
        <p className="text-sm text-gray-400 mt-1">
          Create a team to receive a unique join code, or enter a code to join an existing team.
        </p>
      </div>

      {!team ? (
        /* Empty State */
        <div className="glass-card p-10 md:p-14 text-center rounded-3xl border border-white/10 space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-[#a078ff]/10 border border-[#a078ff]/30 flex items-center justify-center text-[#d0bcff] text-3xl mx-auto">
            <FiUsers />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold font-display text-white">You're Not in a Team Yet</h2>
            <p className="text-sm text-gray-400 max-w-md mx-auto">
              Build something amazing together! Choose whether to create your own squad or enter a join code from a peer.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4 max-w-sm mx-auto">
            <button
              onClick={() => setCreateModalOpen(true)}
              className="btn-primary py-3.5 px-6 font-bold text-xs font-mono-code uppercase tracking-wider flex-1"
            >
              + Create New Team
            </button>
            <button
              onClick={() => setJoinModalOpen(true)}
              className="btn-outline py-3.5 px-6 font-bold text-xs font-mono-code uppercase tracking-wider flex-1"
            >
              Join with Code
            </button>
          </div>
        </div>
      ) : (
        /* Active Team View matching Stitch design */
        <div className="space-y-8">
          {/* Header Card with Join Code */}
          <div className="glass-card p-8 rounded-3xl border border-white/10 space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-white/10">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <h2 className="text-2xl sm:text-3xl font-bold font-display text-white">{team.name}</h2>
                  {isLeader && (
                    <span className="px-3 py-1 rounded-full bg-[#a078ff]/20 text-[#d0bcff] text-[10px] font-mono-code uppercase tracking-wider border border-[#a078ff]/30 flex items-center gap-1.5">
                      <FaCrown className="text-amber-400" /> LEADER
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <JoinCodePill code={team.joinCode} onRegenerate={handleRegenerateCode} isLeader={isLeader} />
                </div>
              </div>

              <div className="flex items-center gap-3">
                {!isLeader && (
                  <button onClick={handleLeaveTeam} className="btn-ghost text-xs">
                    <FiLogOut className="mr-1" /> Leave Team
                  </button>
                )}
                {isLeader && (
                  <button onClick={handleDeleteTeam} className="btn-danger text-xs">
                    <FiTrash2 className="mr-1" /> Delete Team
                  </button>
                )}
              </div>
            </div>

            {/* Active Roster List */}
            <div className="space-y-4">
              <div className="flex justify-between items-center text-xs font-mono-code uppercase tracking-wider">
                <span className="text-gray-400">Active Roster ({currentMembers.length}/{maxTeamSize} Max)</span>
                <span className="text-[#89ceff]">HACKATHON_MODE: ACTIVE</span>
              </div>

              <div className="divide-y divide-white/5 bg-[#0e0e0e]/80 rounded-2xl border border-white/10 overflow-hidden">
                {currentMembers.map((m) => {
                  const mIsLeader = m._id === team.leader?._id;
                  const isYou = m._id === user?._id;
                  return (
                    <div key={m._id} className="p-5 flex items-center justify-between hover:bg-white/[0.02] transition">
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <div className="w-11 h-11 rounded-xl bg-[#a078ff]/20 border border-[#a078ff]/40 flex items-center justify-center font-bold text-sm text-[#d0bcff] uppercase">
                            {m.name?.[0] || 'M'}
                          </div>
                          {mIsLeader && (
                            <div className="absolute -top-1.5 -right-1.5 bg-[#0e0e0e] border border-amber-500/50 rounded-full p-0.5">
                              <FaCrown className="text-amber-400 text-[10px]" />
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="text-sm font-bold text-white flex items-center gap-2">
                            {m.name}
                            {isYou && <span className="text-[9px] font-mono-code px-1.5 py-0.5 rounded bg-white/10 text-gray-300">YOU</span>}
                          </div>
                          <div className="text-xs text-gray-500 font-mono-code">{m.email}</div>
                        </div>
                      </div>

                      {isLeader && !isYou && (
                        <button
                          onClick={() => handleRemoveMember(m._id)}
                          className="p-2 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition"
                          title="Remove member"
                        >
                          <FiTrash2 size={16} />
                        </button>
                      )}
                    </div>
                  );
                })}

                {/* Empty Slots */}
                {Array.from({ length: emptySlotsCount }).map((_, idx) => (
                  <div key={`empty-${idx}`} className="p-5 flex items-center justify-between border-dashed border border-white/10 m-3 rounded-xl bg-white/[0.01]">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl border border-dashed border-white/20 flex items-center justify-center text-gray-600">
                        <FiUserPlus size={18} />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-gray-500 italic">Empty Slot</div>
                        <div className="text-[10px] font-mono-code text-gray-600 uppercase">Waiting for creator...</div>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(team.joinCode);
                        toast.success('Join code copied to share!');
                      }}
                      className="btn-outline py-2 px-4 text-xs font-mono-code"
                    >
                      Copy Invite Code
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Team Modal */}
      <Modal isOpen={createModalOpen} onClose={() => setCreateModalOpen(false)} title="Create New Team">
        <form onSubmit={handleCreateTeam} className="space-y-4">
          <Input
            label="Team Name"
            placeholder="e.g. CyberPunks, Team Alpha"
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            required
          />
          <p className="text-xs text-gray-400 font-mono-code">
            A unique 6-character join code will be generated automatically upon creation.
          </p>
          <Button type="submit" variant="primary" loading={submitting} className="w-full font-bold">
            Create Team & Generate Join Code
          </Button>
        </form>
      </Modal>

      {/* Join Team Modal */}
      <Modal isOpen={joinModalOpen} onClose={() => setJoinModalOpen(false)} title="Join Existing Team">
        <form onSubmit={handleJoinTeam} className="space-y-4">
          <Input
            label="Enter 6-Character Join Code"
            placeholder="e.g. HX-8921"
            value={joinCodeInput}
            onChange={(e) => setJoinCodeInput(e.target.value.toUpperCase())}
            maxLength={10}
            required
          />
          <p className="text-xs text-gray-400 font-mono-code">
            Ask your team leader for their unique code.
          </p>
          <Button type="submit" variant="primary" loading={submitting} className="w-full font-bold">
            Validate & Join Team
          </Button>
        </form>
      </Modal>
    </div>
  );
};

export default TeamPage;

