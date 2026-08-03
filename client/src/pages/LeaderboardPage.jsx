import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import io from 'socket.io-client';
import Badge from '../components/ui/Badge';
import { SkeletonTable } from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';
import { reviewService } from '../services';
import { FiAward, FiUsers, FiChevronDown, FiChevronUp } from 'react-icons/fi';

// Color based on % score
const scoreColor = (pct) =>
  pct >= 70 ? '#34d399' : pct >= 40 ? '#fbbf24' : '#06b6d4';

// Expandable row showing per-criterion breakdown
const BreakdownRow = ({ item, colSpan }) => {
  const { criterionBreakdown, judgingCriteria } = item;
  const criteria = judgingCriteria?.length > 0
    ? judgingCriteria
    : Object.keys(criterionBreakdown || {}).map((name) => ({ name, maxMarks: 20 }));

  if (!criteria.length) return null;

  return (
    <tr className="bg-white/[0.015]">
      <td colSpan={colSpan} className="px-6 pb-5 pt-2">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {criteria.map((c) => {
            const raw = criterionBreakdown?.[c.name] ?? 0;
            const pct = c.maxMarks > 0 ? (raw / c.maxMarks) * 100 : 0;
            const color = scoreColor(pct);
            return (
              <div key={c.name} className="p-3 rounded-xl bg-[#0a0e1a] border border-white/10 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-mono-code text-gray-300 font-semibold">{c.name}</span>
                  <span className="text-sm font-black font-display" style={{ color }}>
                    {raw.toFixed(1)}
                    <span className="text-[10px] text-gray-500 font-normal"> / {c.maxMarks}</span>
                  </span>
                </div>
                <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${Math.min(100, pct)}%`, background: color }}
                  />
                </div>
                <div className="text-[10px] font-mono-code text-gray-600 text-right">{pct.toFixed(0)}%</div>
              </div>
            );
          })}
        </div>
        <p className="text-[10px] font-mono-code text-gray-600 mt-2 text-right">
          Avg across {item.reviewCount} judge{item.reviewCount !== 1 ? 's' : ''}
          {' · '}Raw: {item.rawScore?.toFixed(1)} / {item.maxMarks}
        </p>
      </td>
    </tr>
  );
};

const LeaderboardPage = () => {
  const { id: hackathonId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [liveConnected, setLiveConnected] = useState(false);
  const [expandedId, setExpandedId] = useState(null);

  const fetchLeaderboard = async () => {
    try {
      const res = await reviewService.getLeaderboard(hackathonId);
      setData(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();

    // Connect directly via WebSocket (skip HTTP long-polling upgrade — much faster)
    const SOCKET_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:5000';
    const socket = io(SOCKET_URL, {
      transports: ['websocket'],   // skip polling → instant connect
      timeout: 5000,               // fail fast if server unreachable
      reconnectionAttempts: 3,
    });
    socket.on('connect', () => {
      setLiveConnected(true);
      socket.emit('join:hackathon', hackathonId);
    });
    socket.on('leaderboard:update', (updatedLeaderboard) => {
      setData((prev) => ({ ...prev, leaderboard: updatedLeaderboard }));
    });
    socket.on('connect_error', () => setLiveConnected(false));
    socket.on('disconnect', () => setLiveConnected(false));
    return () => {
      socket.emit('leave:hackathon', hackathonId);
      socket.disconnect();
    };
  }, [hackathonId]);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-8 space-y-6">
        <SkeletonTable rows={8} />
      </div>
    );
  }

  const hackathon = data?.hackathon;
  const leaderboard = data?.leaderboard || [];
  const firstPlace = leaderboard.find((i) => i.rank === 1);
  const secondPlace = leaderboard.find((i) => i.rank === 2);
  const thirdPlace = leaderboard.find((i) => i.rank === 3);
  const runnerUps = leaderboard.filter((i) => i.rank > 3);

  const toggleExpand = (id) => setExpandedId(expandedId === id ? null : id);

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 space-y-12">
      <div className="fixed top-[20%] left-[20%] w-[500px] h-[500px] bg-[#06b6d4]/10 rounded-full blur-[140px] pointer-events-none -z-10 animate-pulse" />

      {/* Header */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-mono-code uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            LIVE · REAL-TIME SCORES
          </span>
          {liveConnected && (
            <span className="text-xs font-mono-code text-[#67e8f9]">Socket.io Sync Active</span>
          )}
        </div>
        <h1 className="text-4xl sm:text-6xl font-black font-display tracking-tight text-white">
          {hackathon?.title || 'Hackathon'} <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#67e8f9] via-[#89ceff] to-[#ffafd3]">
            Leaderboard
          </span>
        </h1>
      </div>

      {/* Top 3 Podium */}
      {leaderboard.length > 0 && (
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
          {/* 2nd */}
          <div className="order-2 md:order-1 flex flex-col gap-3">
            {secondPlace ? (
              <div className="glass-card rounded-2xl p-6 h-64 border-t-2 border-slate-300/60 flex flex-col justify-end relative overflow-hidden hover:bg-white/5 transition-all">
                <div className="absolute top-4 right-5 text-slate-300 font-display text-4xl font-black opacity-30">#2</div>
                <div className="text-[11px] font-mono-code text-[#89ceff] tracking-widest uppercase mb-1">
                  {secondPlace.team?.name}
                </div>
                <h3 className="text-xl font-bold font-display text-white mb-2 truncate">{secondPlace.projectName}</h3>
                <div className="font-display text-4xl font-black text-[#89ceff]">
                  {secondPlace.averageScore.toFixed(1)}<span className="text-xl">%</span>
                </div>
              </div>
            ) : (
              <div className="glass-card rounded-2xl p-6 h-56 flex items-center justify-center text-xs font-mono-code text-gray-500">2nd Place Pending</div>
            )}
            <div className="flex justify-center"><div className="w-16 h-1 bg-slate-300/30 rounded-full blur-sm" /></div>
          </div>

          {/* 1st */}
          <div className="order-1 md:order-2 flex flex-col gap-3">
            {firstPlace ? (
              <div className="glass-card rounded-2xl p-8 h-80 border-t-4 border-amber-400 flex flex-col justify-end relative overflow-hidden hover:bg-white/5 transition-all bg-gradient-to-b from-amber-500/10 to-transparent">
                <div className="absolute top-4 right-6 text-amber-400 font-display text-6xl font-black opacity-40">#1</div>
                <div className="text-xs font-mono-code text-amber-300 tracking-widest uppercase mb-1">
                  🏆 {firstPlace.team?.name}
                </div>
                <h3 className="text-2xl font-bold font-display text-white mb-3 truncate">{firstPlace.projectName}</h3>
                <div className="font-display text-5xl font-black text-amber-300">
                  {firstPlace.averageScore.toFixed(1)}<span className="text-2xl font-bold">%</span>
                </div>
              </div>
            ) : (
              <div className="glass-card rounded-2xl p-8 h-64 flex items-center justify-center text-xs font-mono-code text-gray-500">1st Place Pending</div>
            )}
            <div className="flex justify-center"><div className="w-24 h-2 bg-amber-400/40 rounded-full blur-md" /></div>
          </div>

          {/* 3rd */}
          <div className="order-3 flex flex-col gap-3">
            {thirdPlace ? (
              <div className="glass-card rounded-2xl p-6 h-56 border-t-2 border-orange-500/60 flex flex-col justify-end relative overflow-hidden hover:bg-white/5 transition-all">
                <div className="absolute top-4 right-5 text-orange-400 font-display text-4xl font-black opacity-30">#3</div>
                <div className="text-[11px] font-mono-code text-[#ffafd3] tracking-widest uppercase mb-1">
                  {thirdPlace.team?.name}
                </div>
                <h3 className="text-lg font-bold font-display text-white mb-2 truncate">{thirdPlace.projectName}</h3>
                <div className="font-display text-3xl font-black text-[#ffafd3]">
                  {thirdPlace.averageScore.toFixed(1)}<span className="text-lg font-bold">%</span>
                </div>
              </div>
            ) : (
              <div className="glass-card rounded-2xl p-6 h-48 flex items-center justify-center text-xs font-mono-code text-gray-500">3rd Place Pending</div>
            )}
            <div className="flex justify-center"><div className="w-16 h-1 bg-orange-500/30 rounded-full blur-sm" /></div>
          </div>
        </section>
      )}

      {/* Full Rankings Table with expandable criterion breakdown */}
      {leaderboard.length > 0 ? (
        <section className="glass-card rounded-3xl p-6 sm:p-8 space-y-4 border border-white/10">
          <div className="flex justify-between items-center border-b border-white/10 pb-4">
            <h2 className="text-xl font-bold font-display text-white">
              {runnerUps.length > 0 ? 'Runner Ups' : 'All Rankings'}
            </h2>
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono-code text-gray-400">
                {leaderboard.length} Teams Evaluated
              </span>
              <span className="text-[10px] font-mono-code text-gray-600 border border-white/10 px-2 py-1 rounded">
                Click row for breakdown ↓
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th className="w-16 text-center">Rank</th>
                  <th>Team</th>
                  <th>Project</th>
                  <th className="text-right">Score</th>
                  <th className="w-10" />
                </tr>
              </thead>
              <tbody>
                {(runnerUps.length > 0 ? runnerUps : leaderboard).map((item) => {
                  const isExpanded = expandedId === item.submissionId;
                  const color = scoreColor(item.averageScore);
                  return (
                    <>
                      <tr
                        key={item.submissionId}
                        className="transition hover:bg-white/5 cursor-pointer"
                        onClick={() => toggleExpand(item.submissionId)}
                      >
                        <td className="text-center font-mono-code font-bold text-gray-400 text-sm">
                          {item.rank < 10 ? `0${item.rank}` : item.rank}
                        </td>
                        <td>
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-[#0a0e1a] border border-white/10 flex items-center justify-center text-[#67e8f9]">
                              <FiUsers size={14} />
                            </div>
                            <span className="font-bold text-white text-sm">{item.team?.name || 'Team'}</span>
                          </div>
                        </td>
                        <td className="text-gray-300 text-sm">{item.projectName}</td>
                        <td className="text-right">
                          <div className="flex items-center justify-end gap-3">
                            <div className="w-20 h-1.5 bg-white/10 rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full"
                                style={{ width: `${Math.min(100, item.averageScore)}%`, background: color }}
                              />
                            </div>
                            <span className="font-display font-black text-xl w-20 text-right" style={{ color }}>
                              {item.averageScore.toFixed(1)}<span className="text-xs text-gray-500 font-normal">%</span>
                            </span>
                          </div>
                        </td>
                        <td className="text-center text-gray-500">
                          {isExpanded ? <FiChevronUp size={14} /> : <FiChevronDown size={14} />}
                        </td>
                      </tr>
                      {isExpanded && <BreakdownRow item={item} colSpan={5} />}
                    </>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      ) : (
        <EmptyState
          title="No Score Data Yet"
          description="Judges haven't submitted evaluations yet. Scores will update live here as soon as reviews are submitted!"
          icon="📊"
        />
      )}
    </div>
  );
};

export default LeaderboardPage;
