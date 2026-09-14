import React, { useState } from 'react';
import { X, Calendar, MapPin, Sparkles, FileText } from 'lucide-react';

export default function CampaignModal({ isOpen, onClose, onCreateCampaign }) {
  const [name, setName] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !eventDate || !location) {
      setError('Please fill in all required fields (Name, Date, Location).');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, eventDate, location, description }),
      });

      const data = await res.json();
      if (data.success) {
        onCreateCampaign(data.data);
        setName('');
        setEventDate('');
        setLocation('');
        setDescription('');
        onClose();
      } else {
        setError(data.error || 'Failed to create campaign');
      }
    } catch (err) {
      setError('Network error: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="glass-panel w-full max-w-lg rounded-3xl border border-slate-700/80 bg-slate-900/95 overflow-hidden shadow-2xl">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100">Create New RSVP Campaign</h2>
              <p className="text-xs text-slate-400">Setup event metadata for AI call dispatcher</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
              {error}
            </div>
          )}

          {/* Campaign Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Campaign / Event Title *</label>
            <input
              type="text"
              placeholder="e.g. GlobalVox AI & Tech Leadership Summit 2026"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full glass-input bg-slate-950/80 px-3.5 py-2.5 rounded-xl text-xs text-slate-100 border border-slate-700 focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          {/* Event Date & Location Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                Event Date *
              </label>
              <input
                type="date"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                className="w-full glass-input bg-slate-950/80 px-3.5 py-2.5 rounded-xl text-xs text-slate-100 border border-slate-700 focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                Location / Venue *
              </label>
              <input
                type="text"
                placeholder="e.g. San Francisco Convention Center"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full glass-input bg-slate-950/80 px-3.5 py-2.5 rounded-xl text-xs text-slate-100 border border-slate-700 focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-indigo-400" />
              Event Description & AI Prompt Context
            </label>
            <textarea
              rows={3}
              placeholder="Provide background info for the AI agent (e.g., keynote topics, dress code, VIP parking available)..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full glass-input bg-slate-950/80 px-3.5 py-2.5 rounded-xl text-xs text-slate-100 border border-slate-700 focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Modal Actions */}
          <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-200 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20 cursor-pointer disabled:opacity-50"
            >
              {submitting ? 'Creating Campaign...' : 'Save & Launch Campaign'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
