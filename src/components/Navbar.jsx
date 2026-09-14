import React from 'react';
import { PhoneCall, Plus, Upload, Calendar, MapPin, Sparkles, Server } from 'lucide-react';

export default function Navbar({
  campaigns = [],
  activeCampaign,
  onSelectCampaign,
  onOpenCampaignModal,
  onOpenCSVModal,
  onStartCalling,
  isCalling,
  pendingCount = 0,
  systemMode = 'Demo Engine',
}) {
  return (
    <header className="sticky top-0 z-30 glass-panel border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Brand Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 p-0.5 shadow-lg shadow-indigo-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <PhoneCall className="w-5 h-5 text-cyan-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-extrabold tracking-widest text-indigo-400 uppercase">GlobalVox</span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                {systemMode}
              </span>
            </div>
            <h1 className="text-lg font-bold text-slate-100 tracking-tight flex items-center gap-2">
              RSVP Campaign Manager
            </h1>
          </div>
        </div>

        {/* Center: Campaign Selector */}
        <div className="flex items-center gap-3">
          <div className="relative min-w-[260px]">
            <select
              value={activeCampaign?._id || ''}
              onChange={(e) => {
                const selected = campaigns.find((c) => c._id === e.target.value);
                if (selected) onSelectCampaign(selected);
              }}
              className="w-full glass-input bg-slate-900/90 text-slate-200 text-sm font-medium rounded-xl px-3.5 py-2 pr-8 border border-slate-700/80 focus:ring-2 focus:ring-indigo-500 appearance-none cursor-pointer"
            >
              {campaigns.length === 0 ? (
                <option value="">No campaigns available</option>
              ) : (
                campaigns.map((c) => (
                  <option key={c._id} value={c._id} className="bg-slate-900 text-slate-200">
                    {c.name} ({new Date(c.eventDate).toLocaleDateString()})
                  </option>
                ))
              )}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
              ▼
            </div>
          </div>

          <button
            onClick={onOpenCampaignModal}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
            title="Create New Campaign"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={onOpenCSVModal}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700/80 text-xs font-semibold transition-all cursor-pointer shadow-sm hover:border-slate-600"
          >
            <Upload className="w-4 h-4 text-indigo-400" />
            Upload CSV
          </button>

          <button
            onClick={onStartCalling}
            disabled={isCalling || pendingCount === 0}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-lg cursor-pointer ${
              isCalling
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 cursor-not-allowed'
                : pendingCount === 0
                ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed shadow-none'
                : 'bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white border border-indigo-400/30 shadow-indigo-500/25 hover:shadow-indigo-500/40 transform active:scale-95'
            }`}
          >
            {isCalling ? (
              <>
                <div className="w-4 h-4 border-2 border-amber-300 border-t-transparent rounded-full animate-spin"></div>
                Calling in Progress...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-cyan-300" />
                Start RSVP Calls
                {pendingCount > 0 && (
                  <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-black bg-white/20 text-white">
                    {pendingCount}
                  </span>
                )}
              </>
            )}
          </button>
        </div>
      </div>

      {/* Active Campaign Detail Banner */}
      {activeCampaign && (
        <div className="border-t border-slate-800/50 bg-slate-900/40 px-4 sm:px-6 lg:px-8 py-2 flex flex-wrap items-center justify-between text-xs text-slate-400 gap-4">
          <div className="flex items-center gap-4 flex-wrap">
            <span className="flex items-center gap-1.5 font-medium text-slate-300">
              <Calendar className="w-3.5 h-3.5 text-indigo-400" />
              {new Date(activeCampaign.eventDate).toLocaleDateString('en-US', {
                weekday: 'short',
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            </span>
            <span className="flex items-center gap-1.5 text-slate-400">
              <MapPin className="w-3.5 h-3.5 text-cyan-400" />
              {activeCampaign.location}
            </span>
          </div>
          {activeCampaign.description && (
            <div className="text-slate-400 italic truncate max-w-md">
              "{activeCampaign.description}"
            </div>
          )}
        </div>
      )}
    </header>
  );
}
