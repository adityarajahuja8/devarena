import React, { useState, useEffect } from 'react';
import Modal from '../components/ui/Modal';
import { Textarea } from '../components/ui/Input';
import Skeleton, { SkeletonTable } from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';
import Button from '../components/ui/Button';
import { reviewService } from '../services';
import {
  FiCheckCircle, FiClock, FiStar, FiGithub, FiGlobe,
  FiLayers, FiCalendar, FiTrendingUp, FiAward, FiChevronRight
} from 'react-icons/fi';
import toast from 'react-hot-toast';

const JudgeDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filterTab, setFilterTab] = useState('pending');
  const [selectedHackathon, setSelectedHackathon] = useState(null);

  // Evaluate Modal state
  const [evalModalOpen, setEvalModalOpen] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [scores, setScores] = useState({});
  const [modalCriteria, setModalCriteria] = useState([]);
  const [generalFeedback, setGeneralFeedback] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await reviewService.getJudgeDashboard();
      setData(res.data.data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load judge dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openEvalModal = async (sub) => {
    setSelectedSubmission(sub);

    // Build default scores from hackathon's judgingCriteria
    const hackathon = data?.assignedHackathons?.find(
      (h) => h._id === (sub.hackathon?._id || sub.hackathon)
    );
    const criteria = hackathon?.judgingCriteria?.length > 0
      ? hackathon.judgingCriteria
      : [
          { name: 'Innovation', maxMarks: 40 },
          { name: 'Technical Complexity', maxMarks: 35 },
          { name: 'UI & Usability', maxMarks: 25 },
        ];

    // If they already have a saved review, load those scores
    if (sub.myReview && sub.myReview.scores) {
      const saved = {};
      const scoresObj = sub.myReview.scores instanceof Map
        ? Object.fromEntries(sub.myReview.scores)
        : sub.myReview.scores;
      Object.keys(scoresObj).forEach((k) => {
        saved[k] = scoresObj[k]?.marks ?? 0;
      });
      setScores(saved);
      setGeneralFeedback(sub.myReview.generalFeedback || '');
    } else {
      const defaultScores = {};
      criteria.forEach((c) => { defaultScores[c.name] = 0; });
      setScores(defaultScores);
      setGeneralFeedback('');
    }

    // Store criteria for the modal
    setModalCriteria(criteria);
    setEvalModalOpen(true);
  };

  const handleSubmitEvaluation = async (e) => {
    e.preventDefault();
    if (!selectedSubmission) return;
    setSubmitting(true);
    try {
      const formattedScores = {};
      Object.keys(scores).forEach((key) => {
        formattedScores[key] = { marks: Number(scores[key]), comment: '' };
      });

      await reviewService.submit({
        submissionId: selectedSubmission._id,
        hackathonId: selectedSubmission.hackathon?._id || selectedSubmission.hackathon,
        scores: formattedScores,
        generalFeedback,
        isSubmitted: true,
      });

      toast.success('Evaluation submitted!');
      setEvalModalOpen(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit evaluation.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-8 space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-28 rounded-2xl" />)}
        </div>
        <SkeletonTable rows={5} />
      </div>
    );
  }

  const stats = data?.stats || {};
  const assignedHackathons = data?.assignedHackathons || [];
  const allSubmissions = data?.submissions || [];
  const pending = data?.pending || [];
  const completed = data?.completed || [];

  // Filter by selected hackathon
  const filterByHackathon = (list) => {
    if (!selectedHackathon) return list;
    return list.filter(
      (s) => (s.hackathon?._id || s.hackathon) === selectedHackathon
    );
  };

  const displayList = filterTab === 'pending'
    ? filterByHackathon(pending)
    : filterByHackathon(completed);

  const progressPct = stats.totalSubmissions > 0
    ? Math.round((stats.completed / stats.totalSubmissions) * 100)
    : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Glow */}
      <div className="fixed top-[15%] left-[20%] w-[500px] h-[500px] bg-[#06b6d4]/10 rounded-full blur-[140px] pointer-events-none -z-10 animate-pulse" />

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <span className="text-xs font-mono-code uppercase tracking-widest text-[#67e8f9]">JUDGE PORTAL</span>
          <h1 className="text-3xl sm:text-4xl font-extrabold font-display text-white mt-1">Judge Console</h1>
        </div>

        {/* Progress Ring */}
        <div className="glass-card px-6 py-3 rounded-2xl flex items-center gap-4 border border-white/10">
          <div className="relative w-12 h-12">
            <svg className="w-12 h-12 -rotate-90" viewBox="0 0 36 36">
              <circle cx="18" cy="18" r="15.9" fill="none" stroke="#ffffff10" strokeWidth="3" />
              <circle
                cx="18" cy="18" r="15.9" fill="none"
                stroke="#06b6d4" strokeWidth="3"
                strokeDasharray={`${progressPct} ${100 - progressPct}`}
                strokeDashoffset="0"
                strokeLinecap="round"
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-[10px] font-mono-code font-bold text-[#67e8f9]">
              {progressPct}%
            </span>
          </div>
          <div>
            <div className="text-xs font-mono-code uppercase tracking-wider text-white">Review Progress</div>
            <div className="text-[11px] font-mono-code text-gray-400">
              {stats.completed || 0} of {stats.totalSubmissions || 0} Done
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards — all real data */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="glass-card p-5 rounded-2xl border border-white/10">
          <div className="flex justify-between items-start mb-2">
            <span className="text-[10px] font-mono-code uppercase tracking-widest text-gray-400">Hackathons</span>
            <FiLayers className="text-[#67e8f9]" />
          </div>
          <div className="text-3xl font-black font-display text-white">{stats.hackathonsAssigned || 0}</div>
          <p className="text-[10px] font-mono-code text-[#67e8f9] mt-1">Assigned to you</p>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-white/10">
          <div className="flex justify-between items-start mb-2">
            <span className="text-[10px] font-mono-code uppercase tracking-widest text-gray-400">Total</span>
            <FiCalendar className="text-[#89ceff]" />
          </div>
          <div className="text-3xl font-black font-display text-white">{stats.totalSubmissions || 0}</div>
          <p className="text-[10px] font-mono-code text-[#89ceff] mt-1">Submissions to review</p>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-white/10">
          <div className="flex justify-between items-start mb-2">
            <span className="text-[10px] font-mono-code uppercase tracking-widest text-gray-400">Pending</span>
            <FiClock className="text-amber-400" />
          </div>
          <div className="text-3xl font-black font-display text-white">{stats.pending || 0}</div>
          <p className="text-[10px] font-mono-code text-amber-300 mt-1">Awaiting your review</p>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-white/10">
          <div className="flex justify-between items-start mb-2">
            <span className="text-[10px] font-mono-code uppercase tracking-widest text-gray-400">Avg Score</span>
            <FiTrendingUp className="text-emerald-400" />
          </div>
          <div className="text-3xl font-black font-display text-white">{stats.avgScore || 0}</div>
          <p className="text-[10px] font-mono-code text-emerald-400 mt-1">Your average given</p>
        </div>
      </div>

      {/* Assigned Hackathons */}
      {assignedHackathons.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-bold font-display text-white flex items-center gap-2">
            <FiAward className="text-[#67e8f9]" /> Your Assigned Hackathons
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {assignedHackathons.map((h) => {
              const hackSubs = allSubmissions.filter(
                (s) => (s.hackathon?._id || s.hackathon) === h._id
              );
              const hackPending = pending.filter(
                (s) => (s.hackathon?._id || s.hackathon) === h._id
              );
              const isActive = selectedHackathon === h._id;

              return (
                <button
                  key={h._id}
                  onClick={() => setSelectedHackathon(isActive ? null : h._id)}
                  className={`text-left glass-card p-5 rounded-2xl border transition-all ${
                    isActive
                      ? 'border-[#06b6d4] shadow-lg shadow-[#06b6d4]/20'
                      : 'border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className={`text-[10px] font-mono-code uppercase tracking-wider px-2 py-0.5 rounded ${
                      h.status === 'ongoing' ? 'bg-emerald-500/20 text-emerald-400' :
                      h.status === 'upcoming' ? 'bg-[#67e8f9]/20 text-[#67e8f9]' :
                      'bg-gray-500/20 text-gray-400'
                    }`}>{h.status}</span>
                    <FiChevronRight className={`text-gray-400 transition ${isActive ? 'rotate-90 text-[#67e8f9]' : ''}`} />
                  </div>
                  <h4 className="font-bold text-white text-base mt-1">{h.title}</h4>
                  <p className="text-xs text-gray-400 font-mono-code mb-3">{h.theme}</p>
                  <div className="flex gap-4 text-xs font-mono-code text-gray-400 pt-2 border-t border-white/5">
                    <span>{hackSubs.length} submissions</span>
                    <span className="text-amber-400">{hackPending.length} pending</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Submissions Table */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 space-y-6 border border-white/10">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/10 pb-4">
          <div className="flex items-center gap-2 p-1 bg-[#0a0e1a] rounded-xl border border-white/10">
            <button
              onClick={() => setFilterTab('pending')}
              className={`px-4 py-2 rounded-lg text-xs font-mono-code uppercase tracking-wider font-bold transition ${
                filterTab === 'pending'
                  ? 'bg-[#06b6d4]/20 text-[#67e8f9] border border-[#06b6d4]/30'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Pending ({filterByHackathon(pending).length})
            </button>
            <button
              onClick={() => setFilterTab('completed')}
              className={`px-4 py-2 rounded-lg text-xs font-mono-code uppercase tracking-wider font-bold transition ${
                filterTab === 'completed'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Completed ({filterByHackathon(completed).length})
            </button>
          </div>
          {selectedHackathon && (
            <button
              onClick={() => setSelectedHackathon(null)}
              className="text-xs font-mono-code text-gray-400 hover:text-white transition"
            >
              Clear filter ✕
            </button>
          )}
        </div>

        {displayList.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Project & Team</th>
                  <th>Hackathon</th>
                  <th>Links</th>
                  <th>Status</th>
                  <th className="text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {displayList.map((sub) => {
                  const isReviewed = filterTab === 'completed';
                  return (
                    <tr key={sub._id}>
                      <td>
                        <div className="font-bold text-white">{sub.projectName}</div>
                        <div className="text-xs font-mono-code text-[#67e8f9]">
                          {sub.team?.name || 'Unknown Team'}
                        </div>
                      </td>
                      <td className="text-xs font-mono-code text-gray-300">
                        {sub.hackathon?.title || '—'}
                      </td>
                      <td>
                        <div className="flex gap-3 text-xs text-[#89ceff] font-mono-code">
                          {sub.githubRepo && (
                            <a href={sub.githubRepo} target="_blank" rel="noreferrer" className="hover:underline flex items-center gap-1">
                              <FiGithub /> Repo
                            </a>
                          )}
                          {sub.liveDemo && (
                            <a href={sub.liveDemo} target="_blank" rel="noreferrer" className="hover:underline flex items-center gap-1">
                              <FiGlobe /> Demo
                            </a>
                          )}
                          {!sub.githubRepo && !sub.liveDemo && <span className="text-gray-600">—</span>}
                        </div>
                      </td>
                      <td>
                        {isReviewed ? (
                          <span className="flex items-center gap-1 text-xs font-mono-code text-emerald-400">
                            <FiCheckCircle /> Reviewed
                            {sub.myReview?.totalScore > 0 && (
                              <span className="ml-1 text-white font-bold">{sub.myReview.totalScore} pts</span>
                            )}
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-xs font-mono-code text-amber-400">
                            <FiClock /> Pending
                          </span>
                        )}
                      </td>
                      <td className="text-right">
                        <button
                          onClick={() => openEvalModal(sub)}
                          className={`py-2 px-5 text-xs font-mono-code font-bold uppercase tracking-wider rounded-lg transition ${
                            isReviewed
                              ? 'border border-white/20 text-gray-300 hover:text-white hover:border-white/40'
                              : 'btn-primary'
                          }`}
                        >
                          {isReviewed ? 'Edit Review' : 'Review'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            title={filterTab === 'pending' ? 'No Pending Submissions' : 'No Completed Reviews'}
            description={
              filterTab === 'pending'
                ? assignedHackathons.length === 0
                  ? 'You have not been assigned to any hackathon yet. Ask an organizer to assign you.'
                  : 'All submissions have been reviewed. Great work!'
                : 'You have not submitted any reviews yet.'
            }
            icon={filterTab === 'pending' ? '⚖️' : '✅'}
          />
        )}
      </div>

      {/* Evaluation Modal */}
      <Modal
        isOpen={evalModalOpen}
        onClose={() => setEvalModalOpen(false)}
        title={`Review: ${selectedSubmission?.projectName}`}
        maxWidth="max-w-2xl"
      >
        {selectedSubmission && (
          <form onSubmit={handleSubmitEvaluation} className="space-y-6">
            {/* Submission Info */}
            <div className="p-4 rounded-2xl bg-[#0a0e1a] border border-white/10 space-y-2">
              <h3 className="text-base font-bold font-display text-white">{selectedSubmission.projectName}</h3>
              <p className="text-xs text-gray-300">
                <span className="text-gray-500">Team:</span> {selectedSubmission.team?.name}
              </p>
              {selectedSubmission.problemStatement && (
                <p className="text-xs text-gray-300">
                  <span className="text-gray-500">Problem:</span> {selectedSubmission.problemStatement}
                </p>
              )}
              {selectedSubmission.solutionDescription && (
                <p className="text-xs text-gray-300">
                  <span className="text-gray-500">Solution:</span> {selectedSubmission.solutionDescription}
                </p>
              )}
              {selectedSubmission.techStack?.length > 0 && (
                <div className="flex flex-wrap gap-1 pt-1">
                  {selectedSubmission.techStack.map((t) => (
                    <span key={t} className="text-[10px] font-mono-code px-2 py-0.5 rounded bg-[#06b6d4]/10 text-[#67e8f9] border border-[#06b6d4]/20">
                      {t}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Scoring Rubric — Sliders */}
            <div className="space-y-4">
              {/* Total score header with ring */}
              {(() => {
                const totalMax = modalCriteria.reduce((a, c) => a + (c.maxMarks || 0), 0) || 100;
                const totalScore = Object.values(scores).reduce((a, b) => a + Number(b), 0);
                const pct = Math.round((totalScore / totalMax) * 100);
                const ringColor = pct >= 70 ? '#34d399' : pct >= 40 ? '#fbbf24' : '#f87171';
                return (
                  <div className="flex items-center justify-between p-4 rounded-2xl bg-[#0a0e1a] border border-white/10">
                    <div>
                      <div className="text-xs font-mono-code uppercase tracking-wider text-gray-400 mb-0.5">Scoring Rubric</div>
                      <div className="text-[11px] font-mono-code text-gray-500">Drag sliders to assign marks per criterion</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="relative w-14 h-14">
                        <svg className="w-14 h-14 -rotate-90" viewBox="0 0 36 36">
                          <circle cx="18" cy="18" r="15.9" fill="none" stroke="#ffffff10" strokeWidth="3.5" />
                          <circle
                            cx="18" cy="18" r="15.9" fill="none"
                            stroke={ringColor} strokeWidth="3.5"
                            strokeDasharray={`${pct} ${100 - pct}`}
                            strokeLinecap="round"
                            style={{ transition: 'stroke-dasharray 0.3s ease' }}
                          />
                        </svg>
                        <span className="absolute inset-0 flex items-center justify-center text-[10px] font-mono-code font-black text-white">
                          {pct}%
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-black font-display" style={{ color: ringColor }}>
                          {totalScore}
                        </div>
                        <div className="text-[10px] font-mono-code text-gray-500">/ {totalMax} pts</div>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {modalCriteria.map((criterion) => {
                const key = criterion.name;
                const max = criterion.maxMarks || 20;
                const val = Number(scores[key] || 0);
                const pct = max > 0 ? (val / max) * 100 : 0;
                const sliderColor = pct >= 70
                  ? '#34d399'
                  : pct >= 40
                  ? '#fbbf24'
                  : pct > 0
                  ? '#06b6d4'
                  : '#374151';

                return (
                  <div key={key} className="p-4 rounded-xl bg-white/[0.03] border border-white/10 space-y-3 hover:border-white/20 transition-colors">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-sm font-bold text-white">{key}</span>
                        <span className="ml-2 text-[10px] font-mono-code text-gray-500 uppercase">max {max} pts</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className="text-2xl font-black font-display transition-colors"
                          style={{ color: sliderColor }}
                        >
                          {val}
                        </span>
                        <span className="text-xs font-mono-code text-gray-500">/ {max}</span>
                      </div>
                    </div>

                    {/* Slider */}
                    <div className="relative">
                      <input
                        type="range"
                        min={0}
                        max={max}
                        step={1}
                        value={val}
                        onChange={(e) => setScores({ ...scores, [key]: Number(e.target.value) })}
                        className="w-full h-2 rounded-full appearance-none cursor-pointer"
                        style={{
                          background: `linear-gradient(to right, ${sliderColor} ${pct}%, #1f2937 ${pct}%)`,
                          WebkitAppearance: 'none',
                        }}
                      />
                    </div>

                    {/* Tick marks: 0, 25%, 50%, 75%, 100% */}
                    <div className="flex justify-between text-[9px] font-mono-code text-gray-600 px-0.5">
                      <span>0</span>
                      <span>{Math.round(max * 0.25)}</span>
                      <span>{Math.round(max * 0.5)}</span>
                      <span>{Math.round(max * 0.75)}</span>
                      <span>{max}</span>
                    </div>
                  </div>
                );
              })}
            </div>


            <Textarea
              label="Feedback & Comments"
              placeholder="Constructive feedback for the team..."
              value={generalFeedback}
              onChange={(e) => setGeneralFeedback(e.target.value)}
              rows={3}
            />

            <Button type="submit" variant="primary" loading={submitting} className="w-full font-bold py-3.5">
              Submit Evaluation
            </Button>
          </form>
        )}
      </Modal>
    </div>
  );
};

export default JudgeDashboard;
