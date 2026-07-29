import React from 'react';

const Badge = ({ status, children, className = '' }) => {
  const norm = (status || children || '').toString().toLowerCase();

  let badgeClass = 'badge-pending';
  if (['approved', 'registered', 'success', 'completed'].includes(norm)) {
    badgeClass = 'badge-approved';
  } else if (['rejected', 'blocked', 'cancelled', 'withdrawn', 'danger'].includes(norm)) {
    badgeClass = 'badge-rejected';
  } else if (['live', 'ongoing'].includes(norm)) {
    badgeClass = 'badge-live';
  } else if (['closed'].includes(norm)) {
    badgeClass = 'badge-closed';
  } else if (['upcoming'].includes(norm)) {
    badgeClass = 'badge-upcoming';
  } else if (['online'].includes(norm)) {
    badgeClass = 'badge-online';
  } else if (['offline'].includes(norm)) {
    badgeClass = 'badge-offline';
  }

  return (
    <span className={`badge ${badgeClass} ${className}`}>
      {children || status}
    </span>
  );
};

export default Badge;
