import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from 'recharts';
import { BarChart3, PieChart as PieIcon } from 'lucide-react';

export default function AnalyticsCharts({ stats = {} }) {
  const data = [
    { name: 'Confirmed', value: stats.confirmed || 0, color: '#10b981' },
    { name: 'Declined', value: stats.declined || 0, color: '#f43f5e' },
    { name: 'Undecided', value: stats.undecided || 0, color: '#f59e0b' },
    { name: 'Pending', value: stats.pending || 0, color: '#0ea5e9' },
    { name: 'Failed', value: stats.failed || 0, color: '#a855f7' },
  ];

  const total = stats.totalInvitees || 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Pie Distribution Chart */}
      <div className="glass-card p-5 rounded-2xl border border-slate-800/80 bg-slate-900/60">
        <div className="flex items-center gap-2 mb-4">
          <PieIcon className="w-4 h-4 text-indigo-400" />
          <h3 className="text-sm font-bold text-slate-200">RSVP Status Breakdown</h3>
        </div>

        {total === 0 ? (
          <div className="h-48 flex items-center justify-center text-xs text-slate-500">
            No statistics available for this campaign yet.
          </div>
        ) : (
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="#0f172a" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '0.75rem',
                    color: '#f8fafc',
                    fontSize: '12px',
                  }}
                />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  iconType="circle"
                  formatter={(value) => <span className="text-xs text-slate-300 font-medium">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Bar Comparative Chart */}
      <div className="glass-card p-5 rounded-2xl border border-slate-800/80 bg-slate-900/60">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="w-4 h-4 text-cyan-400" />
          <h3 className="text-sm font-bold text-slate-200">Response Volume Comparison</h3>
        </div>

        {total === 0 ? (
          <div className="h-48 flex items-center justify-center text-xs text-slate-500">
            No statistics available for this campaign yet.
          </div>
        ) : (
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '0.75rem',
                    color: '#f8fafc',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {data.map((entry, index) => (
                    <Cell key={`bar-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}
