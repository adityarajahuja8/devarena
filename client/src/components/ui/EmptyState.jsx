import React from 'react';
import Button from './Button';

const EmptyState = ({ title, description, actionText, onAction, icon = '🚀' }) => {
  return (
    <div className="glass-card p-12 text-center flex flex-col items-center justify-center max-w-lg mx-auto my-8">
      <div className="text-5xl mb-4 p-4 rounded-2xl bg-white/5 border border-white/10">
        {icon}
      </div>
      <h3 className="text-xl font-bold font-display text-white mb-2">{title}</h3>
      <p className="text-sm text-gray-400 mb-6 max-w-md">{description}</p>
      {actionText && onAction && (
        <Button onClick={onAction} variant="primary">
          {actionText}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;
