import React, { useState } from 'react';
import { FiCopy, FiCheck, FiRefreshCw } from 'react-icons/fi';
import toast from 'react-hot-toast';

const JoinCodePill = ({ code, onRegenerate, isLeader = false }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!code) return;
    navigator.clipboard.writeText(code);
    setCopied(true);
    toast.success('Join code copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col items-center gap-2 my-4">
      <span className="text-xs uppercase tracking-widest text-gray-400 font-semibold">Team Join Code</span>
      <div className="flex items-center gap-3">
        <div
          onClick={handleCopy}
          className="join-code-pill group cursor-pointer"
          title="Click to copy code"
        >
          <span>{code || '──────'}</span>
          <span className="text-sm opacity-60 group-hover:opacity-100 transition">
            {copied ? <FiCheck className="text-emerald-400" /> : <FiCopy />}
          </span>
        </div>

        {isLeader && onRegenerate && (
          <button
            onClick={onRegenerate}
            className="p-3 rounded-full bg-white/5 border border-white/10 hover:border-purple-500/50 hover:bg-purple-500/10 text-gray-300 hover:text-purple-300 transition"
            title="Regenerate join code"
          >
            <FiRefreshCw size={18} />
          </button>
        )}
      </div>
      <p className="text-xs text-gray-500 text-center">Share this code with teammates so they can join your team.</p>
    </div>
  );
};

export default JoinCodePill;
