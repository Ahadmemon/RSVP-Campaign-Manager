import React from 'react';
import { X, Phone, Mail, Clock, ShieldCheck, MessageSquare, Bot, User, Sparkles, Volume2 } from 'lucide-react';

export default function InviteeDrawer({ invitee, isOpen, onClose, onUpdateStatus }) {
  if (!isOpen || !invitee) return null;

  const getStatusBadge = (status) => {
    switch (status) {
      case 'CONFIRMED':
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Confirmed</span>;
      case 'DECLINED':
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">Declined</span>;
      case 'UNDECIDED':
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">Undecided</span>;
      case 'PENDING':
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-sky-500/10 text-sky-400 border border-sky-500/20">Pending</span>;
      case 'FAILED':
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20">Failed</span>;
      default:
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-800 text-slate-400">{status}</span>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/70 backdrop-blur-sm animate-fade-in flex justify-end">
      <div className="w-full max-w-lg glass-panel h-full border-l border-slate-700/80 bg-slate-900/95 flex flex-col shadow-2xl animate-slide-left">
        {/* Drawer Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center text-white font-black text-base shadow-lg shadow-indigo-500/20">
              {invitee.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100">{invitee.name}</h2>
              <div className="flex items-center gap-2 mt-0.5">
                {getStatusBadge(invitee.status)}
                {invitee.callId && (
                  <span className="text-[11px] font-mono text-slate-500">{invitee.callId}</span>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Invitee Contact Info Card */}
          <div className="glass-card p-4 rounded-2xl border border-slate-800 space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Contact Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="space-y-1">
                <span className="text-slate-500 font-medium">E.164 Phone</span>
                <div className="font-mono text-indigo-300 font-bold flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-indigo-400" />
                  {invitee.phone}
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-slate-500 font-medium">Email Address</span>
                <div className="text-slate-200 truncate flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  {invitee.email || 'N/A'}
                </div>
              </div>
            </div>
          </div>

          {/* Call Metadata & Simulated Audio Bar */}
          <div className="glass-card p-4 rounded-2xl border border-slate-800 space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
              <span>AI Call Execution Summary</span>
              {invitee.callDuration > 0 && (
                <span className="text-indigo-400 font-mono font-bold flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {invitee.callDuration}s
                </span>
              )}
            </h3>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
                <span className="text-slate-500 block text-[10px]">Call Disposition</span>
                <span className="font-semibold text-slate-200">
                  {invitee.disposition || 'Not Dispatched'}
                </span>
              </div>
              <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
                <span className="text-slate-500 block text-[10px]">Last Timestamp</span>
                <span className="font-semibold text-slate-200">
                  {invitee.lastCalledAt
                    ? new Date(invitee.lastCalledAt).toLocaleString()
                    : 'Pending Call'}
                </span>
              </div>
            </div>

            {/* Audio Waveform Player Mockup */}
            {invitee.callDuration > 0 && (
              <div className="p-3 rounded-xl bg-slate-950 border border-indigo-500/20 flex items-center gap-3">
                <button className="w-8 h-8 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center shadow-md cursor-pointer shrink-0">
                  <Volume2 className="w-4 h-4" />
                </button>
                <div className="flex-1 space-y-1">
                  <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                    <span>0:00</span>
                    <span>0:{invitee.callDuration < 10 ? `0${invitee.callDuration}` : invitee.callDuration}</span>
                  </div>
                  <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden flex items-center gap-0.5">
                    <div className="w-1/3 bg-indigo-500 h-full rounded-full"></div>
                    <div className="w-2/3 bg-slate-800 h-full"></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Conversational Transcript Section */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <MessageSquare className="w-4 h-4 text-indigo-400" />
              Conversational AI Transcript
            </h3>

            {!invitee.transcript || invitee.transcript.length === 0 ? (
              <div className="p-8 rounded-2xl border border-slate-800 bg-slate-950/50 text-center text-slate-500 text-xs">
                No conversational transcript available yet. Click "Start RSVP Calls" to initiate the AI call agent.
              </div>
            ) : (
              <div className="space-y-3 p-4 rounded-2xl border border-slate-800 bg-slate-950/70 max-h-80 overflow-y-auto">
                {invitee.transcript.map((msg, index) => {
                  const isAgent = msg.speaker === 'AI_AGENT';
                  const isSystem = msg.speaker === 'SYSTEM';

                  if (isSystem) {
                    return (
                      <div key={index} className="text-center py-1">
                        <span className="inline-block px-3 py-1 rounded-full text-[10px] bg-slate-800 text-slate-400 border border-slate-700 italic">
                          {msg.text}
                        </span>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={index}
                      className={`flex items-start gap-2.5 ${isAgent ? 'justify-start' : 'justify-end'}`}
                    >
                      {isAgent && (
                        <div className="w-7 h-7 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
                          <Bot className="w-3.5 h-3.5" />
                        </div>
                      )}

                      <div
                        className={`max-w-[80%] p-3 rounded-2xl text-xs space-y-1 shadow-sm ${
                          isAgent
                            ? 'bg-slate-900 border border-indigo-500/20 text-slate-200 rounded-tl-none'
                            : 'bg-indigo-600 text-white rounded-tr-none'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2 text-[10px] opacity-75 font-semibold">
                          <span>{isAgent ? 'GlobalVox AI Concierge' : invitee.name}</span>
                          <span>
                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="leading-relaxed">{msg.text}</p>
                      </div>

                      {!isAgent && (
                        <div className="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 shrink-0">
                          <User className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Drawer Footer Status Override */}
        <div className="p-6 border-t border-slate-800 bg-slate-950/90 flex items-center justify-between gap-3">
          <div className="text-xs text-slate-400 font-medium">Manual Status Override:</div>
          <select
            value={invitee.status}
            onChange={(e) => onUpdateStatus(invitee._id, e.target.value)}
            className="glass-input bg-slate-900 text-slate-200 text-xs font-semibold rounded-xl px-3 py-2 border border-slate-700 cursor-pointer focus:ring-2 focus:ring-indigo-500"
          >
            <option value="CONFIRMED" className="bg-slate-900 text-emerald-400">Mark as Confirmed</option>
            <option value="DECLINED" className="bg-slate-900 text-rose-400">Mark as Declined</option>
            <option value="UNDECIDED" className="bg-slate-900 text-amber-400">Mark as Undecided</option>
            <option value="PENDING" className="bg-slate-900 text-sky-400">Reset to Pending</option>
            <option value="FAILED" className="bg-slate-900 text-purple-400">Mark as Failed</option>
          </select>
        </div>
      </div>
    </div>
  );
}
