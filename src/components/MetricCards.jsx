import React from 'react';
import { Users, CheckCircle2, XCircle, HelpCircle, Clock, AlertTriangle } from 'lucide-react';

export default function MetricCards({ stats = {}, activeFilter = 'ALL', onFilterChange }) {
  const {
    totalInvitees = 0,
    confirmed = 0,
    declined = 0,
    undecided = 0,
    pending = 0,
    failed = 0,
  } = stats;

  const confirmationRate = totalInvitees > 0 ? Math.round((confirmed / totalInvitees) * 100) : 0;

  const cards = [
    {
      id: 'ALL',
      title: 'Total Invitees',
      count: totalInvitees,
      icon: Users,
      color: 'text-indigo-400',
      bgColor: 'bg-indigo-500/10',
      borderColor: 'border-indigo-500/20',
      activeBorder: 'border-indigo-500 ring-2 ring-indigo-500/30',
      subtext: `${totalInvitees} contacts listed`,
    },
    {
      id: 'CONFIRMED',
      title: 'Confirmed',
      count: confirmed,
      icon: CheckCircle2,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10',
      borderColor: 'border-emerald-500/20',
      activeBorder: 'border-emerald-500 ring-2 ring-emerald-500/30',
      subtext: `${totalInvitees > 0 ? Math.round((confirmed / totalInvitees) * 100) : 0}% of campaign`,
    },
    {
      id: 'DECLINED',
      title: 'Declined',
      count: declined,
      icon: XCircle,
      color: 'text-rose-400',
      bgColor: 'bg-rose-500/10',
      borderColor: 'border-rose-500/20',
      activeBorder: 'border-rose-500 ring-2 ring-rose-500/30',
      subtext: `${totalInvitees > 0 ? Math.round((declined / totalInvitees) * 100) : 0}% unavailable`,
    },
    {
      id: 'UNDECIDED',
      title: 'Undecided',
      count: undecided,
      icon: HelpCircle,
      color: 'text-amber-400',
      bgColor: 'bg-amber-500/10',
      borderColor: 'border-amber-500/20',
      activeBorder: 'border-amber-500 ring-2 ring-amber-500/30',
      subtext: 'Pending follow-up',
    },
    {
      id: 'PENDING',
      title: 'Pending Calls',
      count: pending,
      icon: Clock,
      color: 'text-sky-400',
      bgColor: 'bg-sky-500/10',
      borderColor: 'border-sky-500/20',
      activeBorder: 'border-sky-500 ring-2 ring-sky-500/30',
      subtext: 'Ready for AI dispatcher',
    },
    {
      id: 'FAILED',
      title: 'Failed Calls',
      count: failed,
      icon: AlertTriangle,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10',
      borderColor: 'border-purple-500/20',
      activeBorder: 'border-purple-500 ring-2 ring-purple-500/30',
      subtext: 'Unreachable / Busy',
    },
  ];

  return (
    <div className="space-y-4">
      {/* Top Banner Progress Bar */}
      <div className="glass-card p-4 rounded-2xl border border-slate-800/80 bg-slate-900/60 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold">
            {confirmationRate}%
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-200">Campaign Response Conversion</h3>
            <p className="text-xs text-slate-400">
              {confirmed} confirmed out of {totalInvitees} total invitees
            </p>
          </div>
        </div>

        <div className="flex-1 max-w-md">
          <div className="h-2.5 w-full bg-slate-800 rounded-full overflow-hidden flex">
            {totalInvitees > 0 && (
              <>
                <div
                  style={{ width: `${(confirmed / totalInvitees) * 100}%` }}
                  className="bg-emerald-500 h-full transition-all duration-500"
                  title={`Confirmed: ${confirmed}`}
                />
                <div
                  style={{ width: `${(declined / totalInvitees) * 100}%` }}
                  className="bg-rose-500 h-full transition-all duration-500"
                  title={`Declined: ${declined}`}
                />
                <div
                  style={{ width: `${(undecided / totalInvitees) * 100}%` }}
                  className="bg-amber-500 h-full transition-all duration-500"
                  title={`Undecided: ${undecided}`}
                />
                <div
                  style={{ width: `${(pending / totalInvitees) * 100}%` }}
                  className="bg-sky-500 h-full transition-all duration-500"
                  title={`Pending: ${pending}`}
                />
                <div
                  style={{ width: `${(failed / totalInvitees) * 100}%` }}
                  className="bg-purple-500 h-full transition-all duration-500"
                  title={`Failed: ${failed}`}
                />
              </>
            )}
          </div>
        </div>
      </div>

      {/* Grid of 6 Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {cards.map((card) => {
          const Icon = card.icon;
          const isActive = activeFilter === card.id;

          return (
            <button
              key={card.id}
              onClick={() => onFilterChange(card.id)}
              className={`text-left glass-card p-4 rounded-2xl border transition-all duration-200 cursor-pointer group hover:scale-[1.02] ${
                isActive ? card.activeBorder : `${card.borderColor} hover:border-slate-600`
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-400 group-hover:text-slate-200 transition-colors">
                  {card.title}
                </span>
                <div className={`p-2 rounded-xl ${card.bgColor} ${card.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-slate-100 tracking-tight mb-0.5">
                {card.count.toLocaleString()}
              </div>
              <div className="text-[11px] font-medium text-slate-500 truncate">
                {card.subtext}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
