import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import EmptyState from '../components/ui/EmptyState';
import CountdownTimer from '../components/ui/CountdownTimer';
import { hackathonService } from '../services';
import { useAuth } from '../context/AuthContext';
import { FiSearch, FiChevronLeft, FiChevronRight, FiChevronDown, FiAward, FiBookmark } from 'react-icons/fi';
import toast from 'react-hot-toast';


const HackathonList = () => {
  const { user, updateUser } = useAuth();
  const [hackathons, setHackathons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [mode, setMode] = useState('All');
  const [status, setStatus] = useState('');
  const [themeFilter, setThemeFilter] = useState('');
  const [page, setPage] = useState(1);

  // Default fallback images matching Stitch design
  const defaultImages = [
    'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80',
  ];

  const fetchHackathons = async () => {
    setLoading(true);
    try {
      const modeParam = mode === 'All' ? '' : mode;
      const res = await hackathonService.getAll({
        search,
        mode: modeParam,
        status,
        theme: themeFilter,
        page,
        limit: 6,
      });
      const list = res?.data?.data?.hackathons || res?.data?.hackathons || [];
      setHackathons(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error('Failed to fetch hackathons:', err);
      setHackathons([]);
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchHackathons();
  }, [mode, status, themeFilter, page]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchHackathons();
  };

  const handleCardMouseMove = (e) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;

    const rotateX = (-y / (rect.height / 2)) * 12;
    const rotateY = (x / (rect.width / 2)) * 12;

    card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-6px) scale(1.02)`;
  };

  const handleCardMouseLeave = (e) => {
    const card = e.currentTarget;
    card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px) scale(1)';
  };

  const handleToggleBookmark = async (e, hackathonId) => {
    e.stopPropagation();
    e.preventDefault();
    if (!user) {
      toast.error('Please login to bookmark hackathons.');
      return;
    }
    try {
      const res = await hackathonService.toggleBookmark(hackathonId);
      const isBookmarked = res.data.data.bookmarked;
      toast.success(isBookmarked ? 'Hackathon saved to bookmarks!' : 'Bookmark removed');

      // Update user bookmarks array in Context
      const updatedBookmarks = isBookmarked
        ? [...(user.bookmarks || []), { _id: hackathonId }]
        : (user.bookmarks || []).filter((b) => (b._id || b) !== hackathonId);
      updateUser({ ...user, bookmarks: updatedBookmarks });
    } catch (err) {
      toast.error('Failed to update bookmark.');
    }
  };

  return (
    <div className="relative min-h-screen">
      {/* Void Mesh Radial Background */}
      <div className="fixed inset-0 -z-10 pointer-events-none bg-[radial-gradient(circle_at_50%_50%,rgba(208,188,255,0.05)_0%,transparent_50%),radial-gradient(circle_at_80%_20%,rgba(137,206,255,0.05)_0%,transparent_40%)]"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
        {/* Header Section */}
        <header className="space-y-6">
          <h1 className="font-display text-4xl md:text-6xl font-black text-[#e5e2e1] tracking-tight">
            Explore Hackathons
          </h1>

          <form onSubmit={handleSearchSubmit} className="relative max-w-2xl">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-[#958ea0] text-xl" />
            <input
              type="text"
              placeholder="Search hackathons..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#0a0e1a] border border-white/10 rounded-xl py-4 pl-12 pr-4 text-[#e5e2e1] placeholder-[#494454] focus:border-[#67e8f9] outline-none transition-all font-sans text-base"
            />
          </form>
        </header>

        {/* Filter Bar */}
        <section className="flex flex-wrap items-center gap-4">
          {/* Mode Toggle */}
          <div className="bg-[#1c1b1b] rounded-full p-1 flex items-center border border-white/5 font-mono-code text-xs">
            {['All', 'Online', 'Offline'].map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => { setMode(m); setPage(1); }}
                className={`px-6 py-1.5 rounded-full transition-all ${
                  mode === m
                    ? 'bg-white/10 text-[#67e8f9] border border-white/10 backdrop-blur-md font-bold'
                    : 'text-[#494454] hover:text-[#e5e2e1]'
                }`}
              >
                {m}
              </button>
            ))}
          </div>

          {/* Dropdowns & Status Chips */}
          <div className="flex flex-wrap items-center gap-3 font-mono-code text-xs">
            {/* Theme Filter Dropdown */}
            <div className="relative">
              <select
                value={themeFilter}
                onChange={(e) => { setThemeFilter(e.target.value); setPage(1); }}
                className="bg-[#1c1b1b] border border-white/10 px-4 py-2 rounded-lg text-[#e5e2e1] hover:border-white/20 outline-none cursor-pointer appearance-none pr-8"
              >
                <option value="">Theme: All</option>
                <option value="AI">AI & Machine Learning</option>
                <option value="Web3">Web3 & Crypto</option>
                <option value="Open Source">Open Source</option>
                <option value="Fintech">Fintech</option>
              </select>
              <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>

            <div className="hidden sm:block h-6 w-[1px] bg-white/10 mx-1"></div>

            <button
              type="button"
              onClick={() => { setStatus(status === 'upcoming' ? '' : 'upcoming'); setPage(1); }}
              className={`border px-4 py-2 rounded-full transition-colors ${
                status === 'upcoming'
                  ? 'bg-[#89ceff]/10 border-[#89ceff]/40 text-[#89ceff] font-bold'
                  : 'bg-[#1c1b1b] border-white/10 text-[#89ceff] hover:bg-[#89ceff]/10'
              }`}
            >
              Registration Open
            </button>

            <button
              type="button"
              onClick={() => { setStatus(status === 'upcoming' ? '' : 'upcoming'); setPage(1); }}
              className={`border px-4 py-2 rounded-full transition-colors ${
                status === 'upcoming'
                  ? 'bg-white/15 border-white/30 text-white font-bold'
                  : 'bg-[#1c1b1b] border-white/10 text-[#494454] hover:text-[#e5e2e1]'
              }`}
            >
              Upcoming
            </button>

            <button
              type="button"
              onClick={() => { setStatus(status === 'ongoing' ? '' : 'ongoing'); setPage(1); }}
              className={`border px-4 py-2 rounded-full transition-colors ${
                status === 'ongoing'
                  ? 'bg-[#67e8f9]/20 border-[#67e8f9]/40 text-[#67e8f9] font-bold'
                  : 'bg-[#1c1b1b] border-white/10 text-[#494454] hover:text-[#e5e2e1]'
              }`}
            >
              Ongoing
            </button>
          </div>
        </section>

        {/* Hackathons Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="glass-card rounded-xl overflow-hidden flex flex-col h-full opacity-60">
                <div className="aspect-[1.79/1] w-full skeleton"></div>
                <div className="p-6 flex flex-col flex-grow space-y-4">
                  <div className="flex gap-2">
                    <div className="h-6 w-16 skeleton rounded"></div>
                    <div className="h-6 w-20 skeleton rounded"></div>
                  </div>
                  <div className="h-8 w-3/4 skeleton rounded-lg"></div>
                  <div className="h-6 w-1/2 skeleton rounded"></div>
                  <div className="mt-auto pt-4 space-y-4">
                    <div className="flex justify-between">
                      <div className="h-4 w-12 skeleton rounded"></div>
                      <div className="h-8 w-24 skeleton rounded-full"></div>
                    </div>
                    <div className="h-12 w-full skeleton rounded-lg"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : hackathons.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {hackathons.map((h, index) => {
              const bgImg = h.bannerImage || defaultImages[index % defaultImages.length];
              return (
                <div
                  key={h._id}
                  onMouseMove={handleCardMouseMove}
                  onMouseLeave={handleCardMouseLeave}
                  className="glass-card rounded-xl overflow-hidden flex flex-col h-full group cursor-pointer"
                  style={{ transformStyle: 'preserve-3d', transition: 'transform 0.15s ease-out, border-color 0.3s ease, box-shadow 0.3s ease' }}
                >

                  {/* Banner Header */}
                  <div className="relative aspect-[1.79/1] w-full overflow-hidden bg-[#1c1b1b]">
                    <img
                      src={bgImg}
                      alt={h.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-4 left-4 bg-[#050810]/70 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
                      <span className="text-[11px] font-mono-code text-[#89ceff]">
                        {h.mode || 'Online'} {h.location ? `• ${h.location}` : ''}
                      </span>
                    </div>
                    {/* Bookmark Button */}
                    {(() => {
                      const isSaved = (user?.bookmarks || []).some((b) => (b._id || b) === h._id);
                      return (
                        <button
                          onClick={(e) => handleToggleBookmark(e, h._id)}
                          className={`absolute top-4 right-4 p-2 rounded-full backdrop-blur-md border transition-all ${
                            isSaved
                              ? 'bg-cyan-600 text-white border-cyan-400 shadow-[0_0_12px_rgba(168,85,247,0.5)]'
                              : 'bg-[#050810]/70 text-gray-400 border-white/10 hover:text-white hover:bg-white/20'
                          }`}
                          title={isSaved ? 'Remove Bookmark' : 'Bookmark Hackathon'}
                        >
                          <FiBookmark className="text-sm" />
                        </button>
                      );
                    })()}
                  </div>

                  {/* Card Content */}
                  <div className="p-6 flex flex-col flex-grow">
                    {/* Tags */}
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <span className="bg-white/5 border border-white/10 px-2.5 py-0.5 rounded text-[11px] font-mono-code text-[#ffafd3]">
                        {h.theme || 'AI'}
                      </span>
                      <span className="bg-white/5 border border-white/10 px-2.5 py-0.5 rounded text-[11px] font-mono-code text-[#958ea0]">
                        Open Source
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="font-display text-xl font-bold text-[#e5e2e1] mb-2 group-hover:text-[#67e8f9] transition">
                      {h.title}
                    </h3>

                    {/* Prize Pool */}
                    <div className="flex items-center gap-2 text-[#cbc3d7] mb-6 font-sans text-sm">
                      <FiAward className="text-[#89ceff] text-lg" />
                      <span className="font-semibold text-white">
                        ${h.prizePool ? h.prizePool.toLocaleString() : '50,000'} Prize Pool
                      </span>
                    </div>

                    {/* Footer inside card */}
                    <div className="mt-auto space-y-4 pt-2">
                    {/* Countdown Timer */}
                      <div className="flex items-center justify-between font-mono-code text-xs">
                        {h.status === 'upcoming' && h.registrationDeadline ? (
                          <CountdownTimer
                            targetDate={h.registrationDeadline}
                            label="Reg closes in"
                          />
                        ) : h.status === 'ongoing' && h.endDate ? (
                          <CountdownTimer
                            targetDate={h.endDate}
                            label="Ends in"
                          />
                        ) : (
                          <span className="text-xs font-mono-code text-gray-500">
                            {h.status === 'completed' ? '✅ Completed' : h.status || 'Upcoming'}
                          </span>
                        )}
                      </div>

                      <Link to={`/hackathons/${h._id}`} className="block">
                        <button className="w-full py-3 rounded-lg bg-gradient-to-r from-[#67e8f9] to-[#89ceff] hover:shadow-[0_0_15px_rgba(208,188,255,0.5)] hover:scale-[1.01] text-[#3c0091] font-bold text-sm transition-all duration-200">
                          View Details
                        </button>
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <EmptyState
            title="No Hackathons Found"
            description="We couldn't find any hackathons matching your search parameters. Try adjusting your search query or reset filters."
            actionText="Reset Filters"
            onAction={() => { setSearch(''); setMode('All'); setStatus(''); setThemeFilter(''); setPage(1); }}
          />
        )}

        {/* Pagination matching Stitch reference */}
        <footer className="mt-16 flex justify-center">
          <div className="inline-flex items-center gap-2 bg-[#1c1b1b] border border-white/5 p-2 rounded-full font-mono-code text-xs">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="w-10 h-10 rounded-full flex items-center justify-center text-[#494454] hover:text-[#e5e2e1] hover:bg-white/5 transition-all disabled:opacity-40"
            >
              <FiChevronLeft size={18} />
            </button>

            <button className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${page === 1 ? 'bg-[#67e8f9] text-[#3c0091]' : 'text-gray-400 hover:text-white'}`}>
              1
            </button>
            <button className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${page === 2 ? 'bg-[#67e8f9] text-[#3c0091]' : 'text-gray-400 hover:text-white'}`}>
              2
            </button>
            <button className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${page === 3 ? 'bg-[#67e8f9] text-[#3c0091]' : 'text-gray-400 hover:text-white'}`}>
              3
            </button>

            <span className="text-[#494454] mx-1">...</span>

            <button className="w-10 h-10 rounded-full flex items-center justify-center text-[#494454] hover:text-[#e5e2e1]">
              10
            </button>

            <button
              onClick={() => setPage(page + 1)}
              className="w-10 h-10 rounded-full flex items-center justify-center text-[#494454] hover:text-[#e5e2e1] hover:bg-white/5 transition-all"
            >
              <FiChevronRight size={18} />
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default HackathonList;


