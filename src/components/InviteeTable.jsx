import React from 'react';
import { Search, MessageSquare, Phone, Mail, Clock, RefreshCw, ChevronLeft, ChevronRight, UserCheck, ShieldAlert } from 'lucide-react';

export default function InviteeTable({
  invitees = [],
  activeFilter = 'ALL',
  onFilterChange,
  searchQuery,
  onSearchChange,
  onSelectInvitee,
  onUpdateStatus,
  pagination = {},
  onPageChange,
  loading = false,
}) {
  const getStatusBadge = (status) => {
    switch (status) {
      case 'CONFIRMED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            Confirmed
          </span>
        );
      case 'DECLINED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
            Declined
          </span>
        );
      case 'UNDECIDED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
            Undecided
          </span>
        );
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-sky-500/10 text-sky-400 border border-sky-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-ping"></span>
            Pending
          </span>
        );
      case 'FAILED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span>
            Failed
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-800 text-slate-400">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="glass-card rounded-2xl border border-slate-800/80 bg-slate-900/70 overflow-hidden shadow-xl">
      {/* Table Action Bar */}
      <div className="p-4 sm:p-5 border-b border-slate-800 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Search Bar */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, E.164 phone, or email..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full glass-input bg-slate-950/80 pl-10 pr-4 py-2 rounded-xl text-xs font-medium text-slate-200 placeholder-slate-500 border border-slate-800 focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {['ALL', 'CONFIRMED', 'DECLINED', 'UNDECIDED', 'PENDING', 'FAILED'].map((tab) => (
            <button
              key={tab}
              onClick={() => onFilterChange(tab)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                activeFilter === tab
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                  : 'bg-slate-950/40 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              {tab.charAt(0) + tab.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Table View */}
      <div className="overflow-x-auto min-h-[320px]">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-3">
            <RefreshCw className="w-6 h-6 animate-spin text-indigo-400" />
            <span className="text-xs font-medium">Fetching invitee database records...</span>
          </div>
        ) : invitees.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-2">
            <UserCheck className="w-10 h-10 text-slate-600 mb-1" />
            <div className="text-sm font-semibold text-slate-300">No invitees found</div>
            <div className="text-xs text-slate-500 max-w-sm text-center">
              Try adjusting your search filters or upload a CSV list of contacts for this campaign.
            </div>
          </div>
        ) : (
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] font-bold tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4 sm:px-6">Invitee Name</th>
                <th className="py-3.5 px-4">Contact info</th>
                <th className="py-3.5 px-4">RSVP Status</th>
                <th className="py-3.5 px-4">Call Duration</th>
                <th className="py-3.5 px-4">Transcript</th>
                <th className="py-3.5 px-4 text-right sm:pr-6">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {invitees.map((invitee) => (
                <tr
                  key={invitee._id}
                  onClick={() => onSelectInvitee(invitee)}
                  className="hover:bg-slate-800/40 transition-colors cursor-pointer group"
                >
                  {/* Name */}
                  <td className="py-3.5 px-4 sm:px-6 font-bold text-slate-200 group-hover:text-indigo-300 transition-colors">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-slate-800 to-slate-700 flex items-center justify-center text-slate-200 font-black text-xs border border-slate-700">
                        {invitee.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div>{invitee.name}</div>
                        {invitee.lastCalledAt && (
                          <div className="text-[10px] text-slate-500 font-normal">
                            Called {new Date(invitee.lastCalledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Phone & Email */}
                  <td className="py-3.5 px-4">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5 font-mono text-indigo-300 font-medium">
                        <Phone className="w-3 h-3 text-slate-500" />
                        {invitee.phone}
                      </div>
                      {invitee.email && (
                        <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
                          <Mail className="w-3 h-3 text-slate-500" />
                          {invitee.email}
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Status Badge with Interactive Dropdown */}
                  <td className="py-3.5 px-4" onClick={(e) => e.stopPropagation()}>
                    <select
                      value={invitee.status}
                      onChange={(e) => onUpdateStatus(invitee._id, e.target.value)}
                      className="bg-transparent border-none text-xs font-semibold cursor-pointer focus:ring-0"
                    >
                      <option value="CONFIRMED" className="bg-slate-900 text-emerald-400">Confirmed</option>
                      <option value="DECLINED" className="bg-slate-900 text-rose-400">Declined</option>
                      <option value="UNDECIDED" className="bg-slate-900 text-amber-400">Undecided</option>
                      <option value="PENDING" className="bg-slate-900 text-sky-400">Pending</option>
                      <option value="FAILED" className="bg-slate-900 text-purple-400">Failed</option>
                    </select>
                    {getStatusBadge(invitee.status)}
                  </td>

                  {/* Duration */}
                  <td className="py-3.5 px-4 font-mono text-slate-400">
                    {invitee.callDuration > 0 ? (
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-indigo-400" />
                        {invitee.callDuration}s
                      </span>
                    ) : (
                      <span className="text-slate-600">—</span>
                    )}
                  </td>

                  {/* Transcript indicator */}
                  <td className="py-3.5 px-4">
                    {invitee.transcript && invitee.transcript.length > 0 ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectInvitee(invitee);
                        }}
                        className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/20 font-medium text-[11px] transition-colors cursor-pointer"
                      >
                        <MessageSquare className="w-3 h-3" />
                        {invitee.transcript.length} msgs
                      </button>
                    ) : (
                      <span className="text-slate-600 text-[11px]">No transcript</span>
                    )}
                  </td>

                  {/* Action */}
                  <td className="py-3.5 px-4 text-right sm:pr-6" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => onSelectInvitee(invitee)}
                      className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-medium border border-slate-700 transition-colors cursor-pointer"
                    >
                      View Detail
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination Footer */}
      {pagination.totalPages > 1 && (
        <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between text-xs text-slate-400">
          <div>
            Showing page <span className="font-semibold text-slate-200">{pagination.page}</span> of{' '}
            <span className="font-semibold text-slate-200">{pagination.totalPages}</span> ({pagination.total} total)
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onPageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <button
              onClick={() => onPageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
              className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
