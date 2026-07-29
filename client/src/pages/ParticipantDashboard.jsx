import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { hackathonService, teamService, submissionService } from '../services';
import CountdownTimer from '../components/ui/CountdownTimer';
import JoinCodePill from '../components/ui/JoinCodePill';
import {
  FiBookmark, FiUsers, FiSend, FiAward, FiArrowRight, FiCopy,
  FiExternalLink, FiCompass, FiTerminal, FiCheckCircle, FiPlus, FiGlobe, FiClock
} from 'react-icons/fi';
import toast from 'react-hot-toast';

import CertificateModal from '../components/ui/CertificateModal';

const ParticipantDashboard = () => {
  const { user } = useAuth();
  const [hackathons, setHackathons] = useState([]);
  const [myTeam, setMyTeam] = useState(null);
  const [submissions, setSubmissions] = useState({}); // { [hackathonId]: submission }
  const [loading, setLoading] = useState(true);

  // Certificate Modal State
  const [certModal, setCertModal] = useState({ isOpen: false, title: '' });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const hackRes = await hackathonService.getAll({ limit: 5 });
        const list = hackRes.data.data.hackathons || [];
        setHackathons(list);

        if (list[0]) {
          try {
            const teamRes = await teamService.getMy(list[0]._id);
            setMyTeam(teamRes.data.data.team);
          } catch (e) {
            // User not in team yet
          }
        }

        // Fetch submission status for each hackathon in parallel
        const submissionMap = {};
        await Promise.all(
          list.map(async (h) => {
            try {
              const subRes = await submissionService.getMy(h._id);
              const sub = subRes.data.data.submission;
              if (sub) submissionMap[h._id] = sub;
            } catch (e) {
              // No submission for this hackathon yet
            }
          })
        );
        setSubmissions(submissionMap);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?._id]);

  const activeHackathon = hackathons[0];

  // Compute real status from actual dates (DB status can lag)
  const getRealStatus = (h) => {
    const now = new Date();
    const end = h.endDate              ? new Date(h.endDate)              : null;
    const start = h.startDate          ? new Date(h.startDate)            : null;
    const regDL = h.registrationDeadline ? new Date(h.registrationDeadline) : null;
    if (end   && end   < now)  return 'finished';
    if (start && start < now)  return 'ongoing';
    if (regDL && regDL < now)  return 'starting_soon'; // reg closed, not started yet
    return 'upcoming';
  };

  const statusLabel = (s) => ({
    finished:      'Completed',
    ongoing:       'Live',
    starting_soon: 'Starting Soon',
    upcoming:      'Upcoming',
  }[s] || 'Upcoming');

  const statusColor = (s) => ({
    finished:      'text-gray-400',
    ongoing:       'text-green-400',
    starting_soon: 'text-amber-400',
    upcoming:      'text-[#89ceff]',
  }[s] || 'text-[#89ceff]');

  const phaseText = (s) => ({
    finished:      'Results Published',
    ongoing:       'Build Phase — Submit your project!',
    starting_soon: 'Reg. Closed — Event starting soon',
    upcoming:      'Registration Open',
  }[s] || 'Registration Open');

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    toast.success('Join code copied to clipboard!');
  };

  // --- EMPTY STATE CANVAS (When 0 Hackathons Joined) ---
  if (!loading && hackathons.length === 0) {
    return (
      <div className="relative min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center overflow-hidden py-16 px-4">
        {/* Orbital Background Glows */}
        <div className="fixed top-1/4 -right-1/4 w-[600px] h-[600px] rounded-full bg-[radial-gradient(circle,rgba(139,92,246,0.15)_0%,rgba(14,165,233,0)_70%)] blur-[80px] pointer-events-none -z-10"></div>
        <div className="fixed bottom-0 -left-1/4 w-[600px] h-[600px] rounded-full bg-[radial-gradient(circle,rgba(208,188,255,0.12)_0%,rgba(3,3,3,0)_70%)] blur-[80px] pointer-events-none -z-10"></div>

        <div className="relative z-10 w-full max-w-4xl flex flex-col items-center text-center space-y-10">
          {/* Animated 3D Floating Central Visual */}
          <div className="relative group cursor-pointer">
            <div className="absolute inset-0 bg-gradient-to-r from-[#8B5CF6] to-[#0EA5E9] rounded-full blur-[100px] opacity-20 group-hover:opacity-40 transition-opacity duration-1000"></div>
            <div className="relative w-64 h-64 animate-bounce duration-[6000ms]">
              <div className="absolute inset-0 bg-gradient-to-tr from-[#d0bcff] to-[#89ceff] rounded-full opacity-10 blur-2xl"></div>
              <div className="w-full h-full glass-card rounded-full flex items-center justify-center p-8 overflow-hidden shadow-2xl shadow-[#a078ff]/10">
                <div className="absolute inset-0 flex items-center justify-center opacity-20">
                  <div className="w-full h-full border-[0.5px] border-white/20 rounded-full scale-75 animate-ping"></div>
                </div>
                <div className="relative flex flex-col items-center justify-center space-y-3">
                  <FiCompass className="text-7xl text-transparent bg-clip-text bg-gradient-to-r from-[#d0bcff] to-[#89ceff]" />
                  <div className="px-3 py-1 bg-white/5 rounded-full border border-white/10">
                    <span className="text-[10px] font-mono-code text-[#d0bcff] uppercase tracking-[0.2em]">Idle Phase</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Textual Content */}
          <div className="space-y-4 max-w-2xl">
            <h2 className="text-4xl md:text-6xl font-display font-black tracking-tight text-white">
              The Void is <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#d0bcff] to-[#89ceff]">waiting.</span>
            </h2>
            <p className="text-sm md:text-base text-gray-400 max-w-lg mx-auto leading-relaxed font-sans">
              You haven't joined any hackathons yet. Start your journey by exploring active challenges and reshaping reality with code.
            </p>

            {/* CTA Cluster */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
              <Link
                to="/hackathons"
                className="group px-8 py-4 bg-gradient-to-r from-[#8B5CF6] to-[#0EA5E9] hover:shadow-[0_0_25px_rgba(139,92,246,0.5)] rounded-full font-bold text-white transition-all transform hover:scale-105 active:scale-95 flex items-center gap-3 text-sm"
              >
                <FiCompass />
                <span>Browse Hackathons</span>
                <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/hackathons"
                className="px-8 py-4 border border-white/10 rounded-full font-bold text-[#e5e2e1] hover:bg-white/5 transition-all text-sm"
              >
                View Event Schedule
              </Link>
            </div>

            {/* Quick Footnote Stats */}
            <div className="pt-12 grid grid-cols-3 gap-8 opacity-60 max-w-md mx-auto border-t border-white/5">
              <div className="flex flex-col items-center">
                <span className="text-2xl font-display font-bold text-white">12</span>
                <span className="text-[10px] font-mono-code uppercase tracking-widest text-gray-400">Active Events</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-2xl font-display font-bold text-white">$250k</span>
                <span className="text-[10px] font-mono-code uppercase tracking-widest text-gray-400">Total Prizes</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-2xl font-display font-bold text-white">4.2k</span>
                <span className="text-[10px] font-mono-code uppercase tracking-widest text-gray-400">Hackers Live</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- ACTIVE DASHBOARD STATE ---
  return (
    <div className="max-w-[1400px] mx-auto px-6 lg:px-12 py-10 space-y-10">
      {/* Background Orbital Glow */}
      <div className="fixed top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-[radial-gradient(circle,rgba(208,188,255,0.12)_0%,rgba(3,3,3,0)_70%)] blur-[80px] pointer-events-none -z-10"></div>
      <div className="fixed bottom-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-[radial-gradient(circle,rgba(137,206,255,0.1)_0%,rgba(3,3,3,0)_70%)] blur-[80px] pointer-events-none -z-10"></div>

      {/* Welcome Header */}
      <section className="space-y-1">
        <h2 className="text-3xl sm:text-5xl font-display font-bold tracking-tight text-white">
          Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#d0bcff] to-[#89ceff]">{user?.name || 'Alex'}</span>
        </h2>
        <p className="text-sm text-gray-400 font-sans">
          Your current deployment is active. 3 days remaining in {activeHackathon?.title || 'Quantum Code 2024'}.
        </p>
      </section>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Stat 1 */}
        <div className="glass-card p-6 rounded-2xl relative overflow-hidden group">
          <div className="flex justify-between items-start mb-4">
            <span className="text-gray-400 font-mono-code text-xs uppercase tracking-widest">Registered</span>
            <FiBookmark className="text-[#d0bcff] text-xl group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-4xl font-display font-black text-white">{hackathons.length}</div>
          <p className="text-[10px] font-mono-code text-[#d0bcff] uppercase mt-2 tracking-tighter">Hackathons Total</p>
          <div className="absolute -bottom-4 -right-4 w-16 h-16 bg-[#d0bcff]/5 rounded-full blur-2xl"></div>
        </div>

        {/* Stat 2 */}
        <div className="glass-card p-6 rounded-2xl relative overflow-hidden group">
          <div className="flex justify-between items-start mb-4">
            <span className="text-gray-400 font-mono-code text-xs uppercase tracking-widest">Active Teams</span>
            <FiUsers className="text-[#89ceff] text-xl group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-4xl font-display font-black text-white">
            {hackathons.length}
          </div>
          <p className="text-[10px] font-mono-code text-[#89ceff] uppercase mt-2 tracking-tighter">
            Per-Hackathon Teams
          </p>
          <div className="absolute -bottom-4 -right-4 w-16 h-16 bg-[#89ceff]/5 rounded-full blur-2xl"></div>
        </div>


        {/* Stat 3 */}
        <div className="glass-card p-6 rounded-2xl relative overflow-hidden group">
          <div className="flex justify-between items-start mb-4">
            <span className="text-gray-400 font-mono-code text-xs uppercase tracking-widest">Submissions</span>
            <FiTerminal className="text-[#ffafd3] text-xl group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-4xl font-display font-black text-white">
            1 <span className="text-lg font-medium text-[#ffafd3]/70">Pending</span>
          </div>
          <p className="text-[10px] font-mono-code text-[#ffafd3] uppercase mt-2 tracking-tighter">Next review in 4h</p>
          <div className="absolute -bottom-4 -right-4 w-16 h-16 bg-[#ffafd3]/5 rounded-full blur-2xl"></div>
        </div>

        {/* Stat 4 */}
        <div className="glass-card p-6 rounded-2xl relative overflow-hidden group">
          <div className="flex justify-between items-start mb-4">
            <span className="text-gray-400 font-mono-code text-xs uppercase tracking-widest">Results</span>
            <FiCheckCircle className="text-green-400 text-xl group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-4xl font-display font-black text-white">
            2 <span className="text-lg font-medium text-green-400/70">New</span>
          </div>
          <p className="text-[10px] font-mono-code text-gray-400 uppercase mt-2 tracking-tighter">Click to view rank</p>
          <div className="absolute -bottom-4 -right-4 w-16 h-16 bg-green-400/5 rounded-full blur-2xl"></div>
        </div>
      </div>

      {/* Main Grid: My Hackathons Left (8 cols) & Right Sidebar Cards (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: My Hackathons */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex justify-between items-end mb-2">
            <h3 className="text-2xl font-display font-bold text-white">My Hackathons</h3>
            <Link
              to="/hackathons"
              className="text-xs font-mono-code text-[#d0bcff] hover:text-white transition-all uppercase tracking-widest underline decoration-[#d0bcff]/20 underline-offset-4"
            >
              Browse Archive
            </Link>
          </div>

          <div className="space-y-6">
            {hackathons.map((h, idx) => (
              <div
                key={h._id || idx}
                className="glass-card p-8 rounded-2xl flex flex-col md:flex-row gap-8 items-start md:items-center hover:bg-white/[0.05] transition-all group border border-white/10"
              >
                <div className="w-16 h-16 rounded-xl bg-[#2a2a2a] border border-white/5 flex items-center justify-center text-[#d0bcff] group-hover:text-[#89ceff] transition-colors shrink-0">
                  <FiTerminal className="text-3xl" />
                </div>

                <div className="flex-grow space-y-2">
                  <div className="flex items-center gap-3">
                    <h4 className="text-xl font-display font-bold text-white">{h.title}</h4>
                    {(() => {
                      const rs = getRealStatus(h);
                      return (
                        <span className={`glass-pill px-3 py-1 text-[10px] font-mono-code uppercase tracking-widest ${statusColor(rs)}`}>
                          {statusLabel(rs)}
                        </span>
                      );
                    })()}
                  </div>
                  <p className="text-gray-400 text-sm">
                    {myTeam && idx === 0 ? myTeam.name : 'Your team'} • Status: {phaseText(getRealStatus(h))}
                  </p>

                  <div className="flex items-center gap-6 pt-2 font-mono-code text-xs">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-gray-500 uppercase mb-1">Time Left</span>
                      {(() => {
                        const now = new Date();
                        const regDeadline = h.registrationDeadline ? new Date(h.registrationDeadline) : null;
                        const startDate   = h.startDate            ? new Date(h.startDate)            : null;
                        const endDate     = h.endDate              ? new Date(h.endDate)              : null;

                        // Pick the nearest future date in priority order
                        if (regDeadline && regDeadline > now) {
                          return <CountdownTimer targetDate={h.registrationDeadline} label="Reg closes" />;
                        } else if (startDate && startDate > now) {
                          return <CountdownTimer targetDate={h.startDate} label="Starts in" />;
                        } else if (endDate && endDate > now) {
                          return <CountdownTimer targetDate={h.endDate} label="Ends in" />;
                        } else {
                          return <span className="text-gray-500 text-xs">✅ Finished</span>;
                        }
                      })()}
                    </div>
                    <div className="flex flex-col border-l border-white/10 pl-6">
                      <span className="text-[10px] text-gray-500 uppercase">Submission</span>
                      {(() => {
                        const sub = submissions[h._id];
                        if (!sub) return <span className="text-gray-500 font-bold">Not Submitted</span>;
                        const s = sub.status;
                        if (s === 'Approved')    return <span className="text-green-400 font-bold">✅ Approved</span>;
                        if (s === 'Rejected')    return <span className="text-red-400 font-bold">❌ Rejected</span>;
                        if (s === 'UnderReview') return <span className="text-blue-400 font-bold">🔍 Under Review</span>;
                        if (s === 'Pending')     return <span className="text-amber-400 font-bold">⏳ Submitted</span>;
                        return <span className="text-white font-bold capitalize">{s}</span>;
                      })()}
                    </div>
                  </div>
                </div>

                <div className="w-full md:w-auto shrink-0 flex flex-col gap-2">
                  <Link to={`/hackathons/${h._id}`}>
                    <button className="w-full md:w-auto px-6 py-3 rounded-full bg-gradient-to-r from-[#8B5CF6] to-[#0EA5E9] hover:shadow-[0_0_20px_rgba(139,92,246,0.4)] text-white text-sm font-bold transition-all">
                      Go to Workspace
                    </button>
                  </Link>
                  {getRealStatus(h) === 'finished' && (
                    <button
                      onClick={() => setCertModal({ isOpen: true, title: h.title })}
                      className="w-full md:w-auto px-5 py-2 rounded-full border border-purple-500/30 text-purple-300 hover:bg-purple-500/10 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
                    >
                      <FiAward /> Claim Certificate
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Recent Results & Bookmarked Hackathons */}
        <div className="lg:col-span-4 space-y-8">
          {/* Bookmarked Hackathons Widget */}
          {user?.bookmarks && user.bookmarks.length > 0 && (
            <div className="glass-card p-8 rounded-2xl space-y-4 border border-purple-500/20">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-display font-bold text-white flex items-center gap-2">
                  <FiBookmark className="text-purple-400" /> Saved Events
                </h3>
                <span className="text-xs font-mono-code text-purple-300 font-bold bg-purple-500/20 px-2 py-0.5 rounded-full">
                  {user.bookmarks.length}
                </span>
              </div>
              <div className="space-y-3">
                {user.bookmarks.map((bm) => (
                  <Link
                    key={bm._id}
                    to={`/hackathons/${bm._id}`}
                    className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] hover:bg-white/10 transition-all border border-white/5 group"
                  >
                    <span className="text-sm font-semibold text-white group-hover:text-purple-300 transition-colors line-clamp-1">
                      {bm.title}
                    </span>
                    <FiArrowRight className="text-gray-500 group-hover:text-white group-hover:translate-x-1 transition-all shrink-0" />
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Recent Results Card */}
          <div className="glass-card p-8 rounded-2xl space-y-6">
            <h3 className="text-lg font-display font-bold text-white">Recent Results</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-white/5">
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-white">Void Dash v1</span>
                  <span className="text-[10px] font-mono-code text-gray-400 uppercase">Global Hackathon</span>
                </div>
                <div className="text-right">
                  <div className="text-lg font-display font-black text-[#d0bcff]">#4</div>
                  <div className="text-[10px] font-mono-code text-gray-400">88.5 PTS</div>
                </div>
              </div>

              <div className="flex items-center justify-between py-3 border-b border-white/5">
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-white">Kernel Panix</span>
                  <span className="text-[10px] font-mono-code text-gray-400 uppercase">Local Qualifier</span>
                </div>
                <div className="text-right">
                  <div className="text-lg font-display font-black text-[#89ceff]">#1</div>
                  <div className="text-[10px] font-mono-code text-gray-400">94.2 PTS</div>
                </div>
              </div>

              <div className="flex items-center justify-between py-3 opacity-60">
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-white">Legacy Code</span>
                  <span className="text-[10px] font-mono-code text-gray-400 uppercase">2023 Open</span>
                </div>
                <div className="text-right">
                  <div className="text-lg font-display font-black text-gray-400">#12</div>
                  <div className="text-[10px] font-mono-code text-gray-400">72.0 PTS</div>
                </div>
              </div>
            </div>

            {activeHackathon && (
              <Link to={`/hackathons/${activeHackathon._id}/leaderboard`} className="block">
                <button className="w-full py-2.5 glass-pill text-[10px] font-mono-code uppercase tracking-widest text-white hover:bg-white/10 transition-all rounded-lg">
                  View All History
                </button>
              </Link>
            )}
          </div>
        </div>

      </div>

      {/* Certificate Modal */}
      <CertificateModal
        isOpen={certModal.isOpen}
        onClose={() => setCertModal({ isOpen: false, title: '' })}
        participantName={user?.name}
        hackathonTitle={certModal.title}
      />
    </div>
  );
};

export default ParticipantDashboard;
