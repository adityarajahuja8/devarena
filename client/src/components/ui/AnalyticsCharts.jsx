import React from 'react';
import {
  AreaChart, Area, BarChart, Bar,
  PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';

// ─── Shared theme tokens ───────────────────────────────────────────────────
const COLORS = {
  violet: '#06b6d4',
  blue:   '#89ceff',
  pink:   '#ffafd3',
  gold:   '#fbbf24',
  green:  '#34d399',
  red:    '#f87171',
};

const tooltipStyle = {
  background: '#0d0d12',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '12px',
  color: '#f5f5f7',
  fontSize: '12px',
  fontFamily: 'monospace',
};

const axisStyle = { fill: '#6b7280', fontSize: 11, fontFamily: 'monospace' };

// ─── Month label helper ────────────────────────────────────────────────────
const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const monthLabel = (d) => `${MONTH_NAMES[(d._id?.month ?? 1) - 1]} '${String(d._id?.year ?? '').slice(-2)}`;

// ──────────────────────────────────────────────────────────────────────────
// 1. Registrations Over Time — AreaChart (Admin)
// ──────────────────────────────────────────────────────────────────────────
export const RegistrationsChart = ({ data = [] }) => {
  const chartData = data.map((d) => ({
    month: monthLabel(d),
    Registrations: d.count,
  }));

  // If no real data, show placeholder zeros so chart renders
  const display = chartData.length > 0
    ? chartData
    : MONTH_NAMES.slice(0, 6).map((m) => ({ month: m, Registrations: 0 }));

  return (
    <div className="glass-card rounded-2xl p-6 space-y-3 border border-white/10">
      <div className="flex items-center gap-3 mb-1">
        <div className="w-2 h-2 rounded-full bg-[#06b6d4] animate-pulse" />
        <h3 className="text-sm font-bold font-display text-white">Registrations Over Time</h3>
        <span className="ml-auto text-[10px] font-mono-code text-gray-500">Last 6 months</span>
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={display} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="regGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor={COLORS.violet} stopOpacity={0.35} />
              <stop offset="95%" stopColor={COLORS.violet} stopOpacity={0}    />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis dataKey="month" tick={axisStyle} axisLine={false} tickLine={false} />
          <YAxis tick={axisStyle} axisLine={false} tickLine={false} allowDecimals={false} />
          <Tooltip contentStyle={tooltipStyle} cursor={{ stroke: COLORS.violet, strokeWidth: 1, strokeDasharray: '4 4' }} />
          <Area
            type="monotone"
            dataKey="Registrations"
            stroke={COLORS.violet}
            strokeWidth={2}
            fill="url(#regGrad)"
            dot={{ fill: COLORS.violet, r: 3, strokeWidth: 0 }}
            activeDot={{ fill: '#fff', r: 4, stroke: COLORS.violet, strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

// ──────────────────────────────────────────────────────────────────────────
// 2. User Role Breakdown — PieChart (Admin)
// ──────────────────────────────────────────────────────────────────────────
export const UserBreakdownChart = ({ data = {} }) => {
  const chartData = [
    { name: 'Participants', value: data.participants || 0 },
    { name: 'Organizers',   value: data.organizers   || 0 },
    { name: 'Judges',       value: data.judges       || 0 },
  ].filter((d) => d.value > 0);

  const PIE_COLORS = [COLORS.violet, COLORS.blue, COLORS.pink];

  // Custom label
  const renderLabel = ({ name, percent }) =>
    percent > 0.05 ? `${name} ${(percent * 100).toFixed(0)}%` : '';

  return (
    <div className="glass-card rounded-2xl p-6 space-y-3 border border-white/10">
      <div className="flex items-center gap-3 mb-1">
        <div className="w-2 h-2 rounded-full bg-[#89ceff] animate-pulse" />
        <h3 className="text-sm font-bold font-display text-white">User Role Breakdown</h3>
      </div>
      {chartData.length === 0 ? (
        <div className="h-[200px] flex items-center justify-center text-xs font-mono-code text-gray-600">
          No user data yet
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={80}
              paddingAngle={3}
              dataKey="value"
              label={renderLabel}
              labelLine={false}
              fontSize={10}
              fontFamily="monospace"
              fill="#fff"
            >
              {chartData.map((_, i) => (
                <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} stroke="transparent" />
              ))}
            </Pie>
            <Tooltip contentStyle={tooltipStyle} />
            <Legend
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ fontSize: 11, fontFamily: 'monospace', color: '#9ca3af' }}
            />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

// ──────────────────────────────────────────────────────────────────────────
// 3. Submissions by Status — BarChart (Admin)
// ──────────────────────────────────────────────────────────────────────────
const STATUS_COLOR_MAP = {
  pending:      COLORS.gold,
  'under review': COLORS.blue,
  approved:     COLORS.green,
  rejected:     COLORS.red,
};

export const SubmissionsByStatusChart = ({ data = [] }) => {
  const chartData = data.map((d) => ({
    status: d._id ? d._id.charAt(0).toUpperCase() + d._id.slice(1) : 'Unknown',
    count: d.count,
    color: STATUS_COLOR_MAP[d._id?.toLowerCase()] || COLORS.violet,
  }));

  return (
    <div className="glass-card rounded-2xl p-6 space-y-3 border border-white/10">
      <div className="flex items-center gap-3 mb-1">
        <div className="w-2 h-2 rounded-full bg-[#ffafd3] animate-pulse" />
        <h3 className="text-sm font-bold font-display text-white">Submissions by Status</h3>
      </div>
      {chartData.length === 0 ? (
        <div className="h-[200px] flex items-center justify-center text-xs font-mono-code text-gray-600">
          No submissions yet
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="status" tick={axisStyle} axisLine={false} tickLine={false} />
            <YAxis tick={axisStyle} axisLine={false} tickLine={false} allowDecimals={false} />
            <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
            <Bar dataKey="count" name="Submissions" radius={[6, 6, 0, 0]}>
              {chartData.map((entry, i) => (
                <Cell key={i} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

// ──────────────────────────────────────────────────────────────────────────
// 4. Per-hackathon Registrations vs Submissions — BarChart (Organizer)
// ──────────────────────────────────────────────────────────────────────────
export const HackathonStatsChart = ({ hackathons = [] }) => {
  const chartData = hackathons.slice(0, 8).map((h) => ({
    name: h.title?.length > 14 ? h.title.slice(0, 14) + '…' : (h.title || 'Unnamed'),
    Registrations: h.registrationCount || 0,
    Submissions:   h.submissionCount   || 0,
  }));

  return (
    <div className="glass-card rounded-2xl p-6 space-y-3 border border-white/10">
      <div className="flex items-center gap-3 mb-1">
        <div className="w-2 h-2 rounded-full bg-[#06b6d4] animate-pulse" />
        <h3 className="text-sm font-bold font-display text-white">Registrations vs Submissions</h3>
        <span className="ml-auto text-[10px] font-mono-code text-gray-500">Per hackathon</span>
      </div>
      {chartData.length === 0 ? (
        <div className="h-[200px] flex items-center justify-center text-xs font-mono-code text-gray-600">
          No hackathon data yet
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis
              dataKey="name"
              tick={{ ...axisStyle, fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              angle={-25}
              textAnchor="end"
              interval={0}
            />
            <YAxis tick={axisStyle} axisLine={false} tickLine={false} allowDecimals={false} />
            <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
            <Legend
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ fontSize: 11, fontFamily: 'monospace', color: '#9ca3af', paddingTop: 12 }}
            />
            <Bar dataKey="Registrations" fill={COLORS.violet} radius={[4, 4, 0, 0]} />
            <Bar dataKey="Submissions"   fill={COLORS.blue}   radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};
