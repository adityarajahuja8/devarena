import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import CountdownTimer from '../components/ui/CountdownTimer';
import Skeleton from '../components/ui/Skeleton';
import { hackathonService, teamService } from '../services';
import {
  FiCalendar, FiUsers, FiAward, FiGlobe, FiCheckCircle,
  FiPlus, FiUserCheck, FiBarChart2, FiSend, FiUser, FiArrowRight, FiLogIn, FiBookmark
} from 'react-icons/fi';
import toast from 'react-hot-toast';

const HackathonDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, updateUser } = useAuth();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [myTeam, setMyTeam] = useState(null);
  const [isRegistered, setIsRegistered] = useState(false);

  // Registration mode modal
  const [regModalOpen, setRegModalOpen] = useState(false);
  const [registering, setRegistering] = useState(false);

  const fetchDetail = async () => {
    try {
      const res = await hackathonService.getOne(id);
      setData(res.data.data);

      if (user) {
        try {
          const teamRes = await teamService.getMy(id);
          if (teamRes.data.data.team) {
            setMyTeam(teamRes.data.data.team);
            setIsRegistered(true);
          }
        } catch (_) {
          // No team yet — check if registered via registration
        }
      }
    } catch (err) {
      toast.error('Failed to load hackathon details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [id, user]);

  // Step 1: Register for the hackathon
  const handleRegister = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    setRegistering(true);
    try {
      await hackathonService.register(id);
      setIsRegistered(true);
      toast.success('Registered! Now choose how you want to participate.');
      setRegModalOpen(false);
      // Navigate to team page where they can create/join team or go solo
      navigate(`/teams/${id}`);
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed.';
      // If already registered, still let them go to team page
      if (msg.includes('already registered')) {
        setIsRegistered(true);
        setRegModalOpen(false);
        navigate(`/teams/${id}`);
      } else {
        toast.error(msg);
      }
    } finally {
      setRegistering(false);
    }
  };

  // Solo: register and skip team creation
  const handleSoloRegister = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    setRegistering(true);
    try {
      await hackathonService.register(id);
      toast.success('Registered as individual participant!');
      setIsRegistered(true);
      setRegModalOpen(false);
      fetchDetail();
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed.';
      if (msg.includes('already registered')) {
        setIsRegistered(true);
        setRegModalOpen(false);
      } else {
        toast.error(msg);
      }
    } finally {
      setRegistering(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-8 space-y-6">
        <Skeleton height="300px" className="w-full rounded-2xl" />
        <Skeleton height="40px" width="60%" />
        <Skeleton height="100px" width="100%" />
      </div>
    );
  }

  if (!data || !data.hackathon) {
    return (
      <div className="max-w-7xl mx-auto p-12 text-center text-gray-400">
        Hackathon not found.
      </div>
    );
  }

  const { hackathon, registrationCount, teamCount } = data;

  // Compute everything from actual dates — DB status can lag
  const now = new Date();
  const regDL  = hackathon.registrationDeadline ? new Date(hackathon.registrationDeadline) : null;
  const start  = hackathon.startDate            ? new Date(hackathon.startDate)            : null;
  const end    = hackathon.endDate              ? new Date(hackathon.endDate)              : null;

  const isEventOver   = end  && end  < now;
  const isOngoing     = start && start < now && !isEventOver;
  // Treat deadline as end-of-day so "today" stays open all day
  const regDeadlineEndOfDay = regDL ? new Date(new Date(regDL).setHours(23, 59, 59, 999)) : null;
  const isRegOpen     = regDeadlineEndOfDay && regDeadlineEndOfDay > now;
  const canRegister   = !isEventOver && isRegOpen;

  // Human-readable status derived from dates
  const realStatusLabel = isEventOver   ? 'completed'
    : isOngoing                         ? 'ongoing'
    : isRegOpen                         ? 'upcoming'
    : 'upcoming';

  const isBookmarked = (user?.bookmarks || []).some((b) => (b._id || b) === id);

  const handleToggleBookmark = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to bookmark hackathons.');
      return;
    }
    try {
      const res = await hackathonService.toggleBookmark(id);
      const isSaved = res.data.data.bookmarked;
      toast.success(isSaved ? 'Hackathon saved to bookmarks!' : 'Bookmark removed');

      const updatedBookmarks = isSaved
        ? [...(user.bookmarks || []), { _id: id }]
        : (user.bookmarks || []).filter((b) => (b._id || b) !== id);
      updateUser({ ...user, bookmarks: updatedBookmarks });
    } catch (err) {
      toast.error('Failed to update bookmark.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      {/* Banner & Header */}
      <div className="relative rounded-3xl overflow-hidden glass-card p-8 md:p-12 border border-white/10 glow-purple">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              {/* Real status badge from dates */}
              <Badge status={realStatusLabel}>
                {isEventOver ? 'Completed' : isOngoing ? 'Ongoing' : isRegOpen ? 'Upcoming' : 'Reg. Closed'}
              </Badge>
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-800/40 text-cyan-300">
                {hackathon.mode}
              </span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold font-display text-white">{hackathon.title}</h1>
            <p className="text-sm text-cyan-300 font-medium">Theme: {hackathon.theme}</p>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap gap-3">
            {!isAuthenticated ? (
              <Button variant="primary" icon={<FiLogIn />} onClick={() => navigate('/login')}>
                Login to Register
              </Button>
            ) : isEventOver ? (
              <span className="px-4 py-2 rounded-xl bg-gray-500/10 text-gray-400 text-xs font-mono-code border border-gray-500/20">
                ✅ Event Ended
              </span>
            ) : myTeam ? (
              <>
                <Link to={`/teams/${hackathon._id}`}>
                  <Button variant="primary" icon={<FiUsers />}>
                    Manage Team ({myTeam.name})
                  </Button>
                </Link>
                {/* Only show Submit when event is ongoing (started, not over) */}
                {isOngoing && (
                  <Link to={`/hackathons/${hackathon._id}/submit`}>
                    <Button variant="outline" icon={<FiSend />}>
                      Submit Project
                    </Button>
                  </Link>
                )}
              </>
            ) : isRegistered ? (
              <Link to={`/teams/${hackathon._id}`}>
                <Button variant="primary" icon={<FiUsers />}>
                  Set Up Your Team
                </Button>
              </Link>
            ) : canRegister ? (
              <Button variant="primary" icon={<FiPlus />} onClick={() => setRegModalOpen(true)}>
                Register Now
              </Button>
            ) : (
              <span className="px-4 py-2 rounded-xl bg-amber-500/10 text-amber-400 text-xs font-mono-code border border-amber-500/20">
                🔒 Registration Closed
              </span>
            )}

            <Link to={`/hackathons/${hackathon._id}/leaderboard`}>
              <Button variant="ghost" icon={<FiBarChart2 />}>
                Leaderboard
              </Button>
            </Link>

            {isAuthenticated && (
              <Button
                variant="outline"
                icon={<FiBookmark className={isBookmarked ? 'text-cyan-400 fill-cyan-400' : ''} />}
                onClick={handleToggleBookmark}
              >
                {isBookmarked ? 'Saved' : 'Save'}
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t border-white/10 text-xs">
          <div>
            <span className="text-gray-400 block">Prize Pool</span>
            <strong className="text-emerald-400 text-lg">{hackathon.prizePool ? `$${hackathon.prizePool}` : 'TBA'}</strong>
          </div>
          <div>
            <span className="text-gray-400 block">Team Size</span>
            <strong className="text-white text-lg">{hackathon.minTeamSize || 1} – {hackathon.maxTeamSize || 4} Members</strong>
          </div>
          <div>
            <span className="text-gray-400 block">Registered Teams</span>
            <strong className="text-cyan-300 text-lg">{teamCount || 0} Teams</strong>
          </div>
          <div>
            <span className="text-gray-400 block">{isEventOver ? 'Event' : 'Starts In'}</span>
            {isEventOver ? (
              <span className="text-red-400 text-xs font-mono-code font-bold">⏹️ Ended
              </span>
            ) : (
              (() => {
                const regDeadline = hackathon.registrationDeadline ? new Date(hackathon.registrationDeadline) : null;
                const startDate   = hackathon.startDate            ? new Date(hackathon.startDate)            : null;
                const endDate     = hackathon.endDate              ? new Date(hackathon.endDate)              : null;
                if (regDeadline && regDeadline > now) return <CountdownTimer targetDate={hackathon.registrationDeadline} label="Reg closes" />;
                if (startDate   && startDate   > now) return <CountdownTimer targetDate={hackathon.startDate}            label="Starts in" />;
                if (endDate     && endDate     > now) return <CountdownTimer targetDate={hackathon.endDate}              label="Ends in"  />;
                return <span className="text-gray-500 text-xs font-mono-code">Ended</span>;
              })()
            )}
          </div>
        </div>
      </div>

      {/* Main Grid Content */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-8">
          <Card className="p-8 space-y-4">
            <h3 className="text-xl font-bold font-display text-white">About the Event</h3>
            <p className="text-sm text-gray-300 whitespace-pre-line leading-relaxed">{hackathon.description}</p>
          </Card>

          {/* Rules */}
          {hackathon.rules && (
            <Card className="p-8 space-y-4">
              <h3 className="text-xl font-bold font-display text-white">Rules & Guidelines</h3>
              <p className="text-sm text-gray-300 whitespace-pre-line leading-relaxed">{hackathon.rules}</p>
            </Card>
          )}

          {/* Judging Criteria */}
          {hackathon.judgingCriteria?.length > 0 && (
            <Card className="p-8 space-y-4">
              <h3 className="text-xl font-bold font-display text-white">Judging Rubric Criteria</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {hackathon.judgingCriteria.map((c, i) => (
                  <div key={i} className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-1">
                    <div className="flex justify-between items-center text-sm font-bold text-white">
                      <span>{c.name}</span>
                      <span className="text-cyan-400 font-mono">{c.maxMarks} Marks</span>
                    </div>
                    {c.description && <p className="text-xs text-gray-400">{c.description}</p>}
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <Card className="p-6 space-y-4">
            <h3 className="text-lg font-bold font-display text-white">Key Dates</h3>
            <div className="space-y-3 text-xs text-gray-300">
              <div className="flex justify-between">
                <span className="text-gray-400">Reg. Deadline:</span>
                <span>{new Date(hackathon.registrationDeadline).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Start Date:</span>
                <span>{new Date(hackathon.startDate).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">End Date:</span>
                <span>{new Date(hackathon.endDate).toLocaleDateString()}</span>
              </div>
            </div>
          </Card>

          <Card className="p-6 space-y-4">
            <h3 className="text-lg font-bold font-display text-white">Organizer</h3>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-cyan-600/30 flex items-center justify-center font-bold text-cyan-300">
                {hackathon.organizer?.name?.[0] || 'O'}
              </div>
              <div>
                <div className="text-sm font-bold text-white">{hackathon.organizer?.name}</div>
                <div className="text-xs text-gray-400">{hackathon.organizer?.email}</div>
              </div>
            </div>
          </Card>

          {/* Quick register CTA in sidebar */}
          {canRegister && !isRegistered && isAuthenticated && !myTeam && (
            <div className="glass-card p-6 rounded-2xl border border-[#06b6d4]/30 space-y-3 text-center">
              <p className="text-xs font-mono-code text-[#67e8f9] uppercase tracking-wider">Ready to compete?</p>
              <Button variant="primary" className="w-full" onClick={() => setRegModalOpen(true)}>
                Register Now
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Registration Mode Modal */}
      <Modal isOpen={regModalOpen} onClose={() => setRegModalOpen(false)} title="How do you want to participate?" maxWidth="max-w-lg">
        <div className="space-y-4 pt-2">
          <p className="text-sm text-gray-400 text-center">
            Choose your participation mode for <strong className="text-white">{hackathon.title}</strong>
          </p>

          {/* Team Option */}
          <button
            onClick={handleRegister}
            disabled={registering}
            className="w-full text-left p-5 rounded-2xl border border-[#06b6d4]/30 bg-[#06b6d4]/5 hover:bg-[#06b6d4]/10 hover:border-[#06b6d4]/60 transition-all group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#06b6d4]/20 border border-[#06b6d4]/40 flex items-center justify-center text-[#67e8f9]">
                  <FiUsers size={22} />
                </div>
                <div>
                  <div className="text-white font-bold text-base">Join / Create a Team</div>
                  <div className="text-xs text-gray-400 mt-0.5">
                    Up to {hackathon.maxTeamSize || 4} members · Get a unique join code
                  </div>
                </div>
              </div>
              <FiArrowRight className="text-[#67e8f9] group-hover:translate-x-1 transition-transform" />
            </div>
          </button>

          {/* Individual Option */}
          <button
            onClick={handleSoloRegister}
            disabled={registering}
            className="w-full text-left p-5 rounded-2xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/20 transition-all group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-gray-300">
                  <FiUser size={22} />
                </div>
                <div>
                  <div className="text-white font-bold text-base">Participate Individually</div>
                  <div className="text-xs text-gray-400 mt-0.5">
                    Solo participant · Submit project on your own
                  </div>
                </div>
              </div>
              <FiArrowRight className="text-gray-400 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>

          {registering && (
            <p className="text-center text-xs font-mono-code text-[#67e8f9] animate-pulse">Registering...</p>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default HackathonDetail;
