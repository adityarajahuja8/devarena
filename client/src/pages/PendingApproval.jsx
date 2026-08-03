import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { FiClock, FiShield, FiLogOut } from 'react-icons/fi';

const PendingApproval = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <Card hover={false} glow className="p-10 text-center max-w-lg">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center mx-auto mb-6 text-amber-400">
          <FiClock size={32} />
        </div>
        <h2 className="text-2xl font-bold font-display text-white mb-2">Approval Pending</h2>
        <p className="text-sm text-gray-300 mb-6">
          Hello <strong className="text-cyan-300">{user?.name || 'User'}</strong>, your request for an{' '}
          <strong className="uppercase text-amber-400">{user?.role || 'Organizer/Judge'}</strong> account has been registered and is currently awaiting Admin review.
        </p>

        <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-xs text-gray-400 mb-8 space-y-2 text-left">
          <div className="flex items-center gap-2 text-gray-200 font-semibold">
            <FiShield className="text-cyan-400" /> Account Security Policy
          </div>
          <p>
            To maintain platform integrity, all Organizers and Judges must be approved by a DevArena Administrator before hosting events or grading projects.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/">
            <Button variant="outline" size="sm" className="w-full sm:w-auto">
              Return Home
            </Button>
          </Link>
          <Button variant="ghost" size="sm" onClick={logout} icon={<FiLogOut />} className="w-full sm:w-auto">
            Sign Out
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default PendingApproval;
