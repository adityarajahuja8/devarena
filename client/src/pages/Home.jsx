import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import Button from '../components/ui/Button';
import Card, { StatCard } from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import CountdownTimer from '../components/ui/CountdownTimer';
import { hackathonService } from '../services';
import { FiArrowRight, FiZap, FiShield, FiUsers, FiAward } from 'react-icons/fi';

const Home = () => {
  const { isAuthenticated, isAdmin, isOrganizer, isJudge } = useAuth();
  const navigate = useNavigate();
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated) {
      const dashboardLink = isAdmin ? '/admin/dashboard'
        : isOrganizer ? '/organizer/dashboard'
        : isJudge ? '/judge/dashboard'
        : '/participant/dashboard';
      navigate(dashboardLink, { replace: true });
      return;
    }

    const fetchFeatured = async () => {
      try {
        const res = await hackathonService.getFeatured();
        setFeatured(res.data.data.hackathons || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, [isAuthenticated]);


  return (
    <div className="py-12 space-y-24">
      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-4 text-center py-12">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-950/50 border border-purple-800/40 text-purple-300 text-xs font-bold uppercase tracking-wider mb-6"
        >
          <FiZap className="text-amber-400" /> DevArena — Where Innovation Competes
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="font-display text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-tight text-white mb-6"
        >
          One platform. <br className="hidden sm:block" />
          Every hackathon. <br className="hidden sm:block" />
          <span className="text-gradient">Zero chaos.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-2xl mx-auto text-sm sm:text-base text-gray-400 mb-8 leading-relaxed"
        >
          Replace Google Forms, WhatsApp groups, and Excel spreadsheets. Govern hackathons end-to-end with 4 dedicated role workflows, unique team join codes, and live judge scoring.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <Link to="/hackathons">
            <Button variant="primary" size="lg" icon={<FiArrowRight />}>
              Explore Hackathons
            </Button>
          </Link>
          <Link to="/signup">
            <Button variant="outline" size="lg">
              Host a Hackathon
            </Button>
          </Link>
        </motion.div>
      </section>

      {/* Stats Counter Bar */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Active Hackathons" value="120+" gradient />
          <StatCard label="Registered Builders" value="15,000+" gradient />
          <StatCard label="Prizes Distributed" value="$250K+" gradient />
          <StatCard label="Evaluated Projects" value="3,400+" gradient />
        </div>
      </section>

      {/* Featured Hackathons */}
      <section className="max-w-6xl mx-auto px-4 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-white/10 pb-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-purple-400">Featured Events</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold font-display text-white mt-1">
              Top Upcoming & Live Hackathons
            </h2>
          </div>
          <Link to="/hackathons">
            <Button variant="ghost" size="sm" icon={<FiArrowRight />}>
              View All Events
            </Button>
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="glass-card p-6 h-56 animate-pulse bg-white/5" />
            ))}
          </div>
        ) : featured.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featured.map((hackathon) => (
              <Card key={hackathon._id} hover className="flex flex-col justify-between p-6">
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <Badge status={hackathon.status}>{hackathon.status}</Badge>
                    <span className="text-xs text-purple-400 font-semibold px-2 py-0.5 rounded bg-purple-950/40 border border-purple-800/30">
                      {hackathon.mode}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold font-display text-white line-clamp-1">
                    {hackathon.title}
                  </h3>
                  <p className="text-xs text-gray-400 line-clamp-2">{hackathon.description}</p>
                </div>

                <div className="space-y-3 pt-4 border-t border-white/10 mt-4">
                  <div className="flex justify-between text-xs text-gray-300">
                    <span>Prize Pool: <strong className="text-emerald-400">{hackathon.prizePool || 'TBA'}</strong></span>
                    <span>Max Team: <strong className="text-white">{hackathon.maxTeamSize}</strong></span>
                  </div>

                  <CountdownTimer targetDate={hackathon.startDate} label="Starts" />

                  <Link to={`/hackathons/${hackathon._id}`} className="block">
                    <Button variant="outline" size="sm" className="w-full">
                      View Details
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="glass-card p-8 text-center text-gray-400 text-sm">
            No featured hackathons right now. Check back soon!
          </div>
        )}
      </section>

      {/* Why Participate / Platform Pillars */}
      <section className="max-w-6xl mx-auto px-4 space-y-8">
        <div className="text-center max-w-2xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-widest text-purple-400">Built for Growth</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold font-display text-white mt-1">
            Why Organizers & Builders Choose DevArena
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card hover className="p-6 space-y-3">
            <div className="w-10 h-10 rounded-lg bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400 text-xl">
              <FiShield />
            </div>
            <h3 className="text-base font-bold font-display text-white">4-Role Governed System</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Clear segregation of powers. Admins approve Organizers & Judges; Organizers set up rubrics; Participants team up; Judges evaluate without noise.
            </p>
          </Card>

          <Card hover className="p-6 space-y-3">
            <div className="w-10 h-10 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 text-xl">
              <FiUsers />
            </div>
            <h3 className="text-base font-bold font-display text-white">Join Code Teaming</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Create a team to auto-generate a unique 6-character code (e.g. <code>X7K2QP</code>). Teammates join in seconds with full validation.
            </p>
          </Card>

          <Card hover className="p-6 space-y-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 text-xl">
              <FiAward />
            </div>
            <h3 className="text-base font-bold font-display text-white">Live Leaderboard</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Socket.io powered live leaderboard updates instantly as judges submit rubric-based scores. Transparent and thrill-inducing.
            </p>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="glass-card p-10 text-center">
          <div className="max-w-xl mx-auto space-y-4">
            <h2 className="text-2xl sm:text-4xl font-extrabold font-display text-white">
              Ready to Host or Participate?
            </h2>
            <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
              Join thousands of developers, organizers, and industry judges creating the future of hackathons today.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <Link to="/signup">
                <Button variant="primary" size="md">
                  Get Started Free
                </Button>
              </Link>
              <Link to="/hackathons">
                <Button variant="outline" size="md">
                  Browse Events
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
