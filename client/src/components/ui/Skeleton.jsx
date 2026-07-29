import React from 'react';

export const Skeleton = ({ className = '', height, width, circle = false }) => (
  <div
    className={`skeleton ${circle ? 'rounded-full' : ''} ${className}`}
    style={{
      height: height || undefined,
      width: width || undefined,
    }}
  />
);

export const SkeletonCard = () => (
  <div className="glass-card p-6 flex flex-col gap-4">
    <Skeleton height="180px" className="w-full rounded-xl" />
    <Skeleton height="24px" width="70%" />
    <Skeleton height="16px" width="90%" />
    <Skeleton height="16px" width="50%" />
    <div className="flex justify-between items-center pt-2">
      <Skeleton height="32px" width="100px" />
      <Skeleton height="36px" width="120px" className="rounded-lg" />
    </div>
  </div>
);

export const SkeletonTable = ({ rows = 5 }) => (
  <div className="glass-card overflow-hidden">
    <div className="p-4 border-b border-white/10 flex justify-between">
      <Skeleton height="24px" width="150px" />
      <Skeleton height="24px" width="80px" />
    </div>
    <div className="p-4 space-y-4">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 items-center">
          <Skeleton height="20px" width="40px" />
          <Skeleton height="20px" className="flex-1" />
          <Skeleton height="20px" width="100px" />
          <Skeleton height="20px" width="80px" />
        </div>
      ))}
    </div>
  </div>
);

export default Skeleton;
