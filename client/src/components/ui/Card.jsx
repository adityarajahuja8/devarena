import React from 'react';

const Card = ({ children, className = '', hover = true, glow = false, onClick, ...props }) => {
  const handleMouseMove = (e) => {
    if (!hover) return;
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;

    const rotateX = (-y / (rect.height / 2)) * 10;
    const rotateY = (x / (rect.width / 2)) * 10;

    card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-6px) scale(1.01)`;
  };

  const handleMouseLeave = (e) => {
    if (!hover) return;
    const card = e.currentTarget;
    card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px) scale(1)';
  };

  return (
    <div
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`glass-card p-6 ${glow ? 'shadow-[0_0_30px_rgba(208,188,255,0.25)] border-[#d0bcff]/40' : ''} ${
        onClick ? 'cursor-pointer' : ''
      } ${className}`}
      style={{ transformStyle: 'preserve-3d', transition: 'transform 0.15s ease-out, border-color 0.3s ease, box-shadow 0.3s ease' }}
      {...props}
    >
      {children}
    </div>
  );
};

export const GradientCard = ({ children, className = '', onClick }) => (
  <Card onClick={onClick} className={`border border-[#a078ff]/30 ${className}`}>
    {children}
  </Card>
);

export const StatCard = ({ label, value, icon, gradient = false, suffix = '' }) => (
  <Card className="text-center" hover>
    {icon && (
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3"
        style={{ background: 'rgba(208, 188, 255, 0.15)' }}
      >
        <span className="text-2xl">{icon}</span>
      </div>
    )}
    <div className={`text-3xl font-extrabold mb-1 font-display ${gradient ? 'text-transparent bg-clip-text bg-gradient-to-r from-[#d0bcff] to-[#89ceff]' : 'text-white'}`}>
      {value}{suffix}
    </div>
    <div className="text-xs font-mono-code uppercase tracking-wider text-gray-400">{label}</div>
  </Card>
);

export default Card;

