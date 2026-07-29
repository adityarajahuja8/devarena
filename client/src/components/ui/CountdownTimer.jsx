import React, { useState, useEffect } from 'react';

const CountdownTimer = ({ targetDate, label = 'Starts in' }) => {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [isPassed, setIsPassed] = useState(false);

  useEffect(() => {
    const calculate = () => {
      const diff = new Date(targetDate) - new Date();
      if (diff <= 0) {
        setIsPassed(true);
        return;
      }
      setIsPassed(false);
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / 1000 / 60) % 60);
      const seconds = Math.floor((diff / 1000) % 60);
      setTimeLeft({ days, hours, minutes, seconds });
    };

    calculate();
    const interval = setInterval(calculate, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  if (isPassed) {
    return <span className="text-xs text-gray-500 font-mono">Event Ended</span>;
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-gray-400 font-medium">{label}:</span>
      <div className="flex items-center gap-1 font-mono text-xs font-bold text-purple-400 bg-purple-950/40 px-2 py-1 rounded border border-purple-800/30">
        <span>{String(timeLeft.days).padStart(2, '0')}d</span>
        <span>:</span>
        <span>{String(timeLeft.hours).padStart(2, '0')}h</span>
        <span>:</span>
        <span>{String(timeLeft.minutes).padStart(2, '0')}m</span>
        <span>:</span>
        <span>{String(timeLeft.seconds).padStart(2, '0')}s</span>
      </div>
    </div>
  );
};

export default CountdownTimer;
