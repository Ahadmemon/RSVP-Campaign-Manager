import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar';
import MetricCards from './components/MetricCards';
import InviteeTable from './components/InviteeTable';
import CSVUploader from './components/CSVUploader';
import InviteeDrawer from './components/InviteeDrawer';
import CampaignModal from './components/CampaignModal';
import AnalyticsCharts from './components/AnalyticsCharts';
import { AlertCircle, CheckCircle2, Sparkles, PhoneCall, RefreshCw, BarChart2 } from 'lucide-react';

export default function App() {
  const [campaigns, setCampaigns] = useState([]);
  const [activeCampaign, setActiveCampaign] = useState(null);
  const [invitees, setInvitees] = useState([]);
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 50, totalPages: 1 });
  const [loading, setLoading] = useState(false);
  const [selectedInvitee, setSelectedInvitee] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isCSVOpen, setIsCSVOpen] = useState(false);
  const [isCampaignOpen, setIsCampaignOpen] = useState(false);
  const [isCalling, setIsCalling] = useState(false);
  const [systemMode, setSystemMode] = useState('Demo Engine');
  const [showCharts, setShowCharts] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Trigger Toast Notification
  const notify = (msg, type = 'success') => {
    setToastMessage({ msg, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Fetch System Health & Engine Mode
  const checkHealth = useCallback(async () => {
    try {
      const res = await fetch('/api/health');
      const data = await res.json();
      if (data.mode) setSystemMode(data.mode);
    } catch (e) {
      setSystemMode('In-Memory Demo Engine');
    }
  }, []);

  // Fetch Campaigns List
  const fetchCampaigns = useCallback(async () => {
    try {
      const res = await fetch('/api/campaigns');
      const data = await res.json();
      if (data.success && data.data.length > 0) {
        setCampaigns(data.data);
        setActiveCampaign((prev) => {
          if (!prev) return data.data[0];
          const updated = data.data.find((c) => c._id === prev._id);
          return updated || data.data[0];
        });
      }
    } catch (err) {
      console.error('Error fetching campaigns:', err);
    }
  }, []);

  const activeCampaignId = activeCampaign?._id;

  // Fetch Invitees for Active Campaign
  const fetchInvitees = useCallback(async () => {
    if (!activeCampaignId) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({
        campaignId: activeCampaignId,
        status: activeFilter,
        page: pagination.page,
        limit: pagination.limit,
      });
      if (searchQuery) params.append('search', searchQuery);

      const res = await fetch(`/api/invitees?${params.toString()}`);
      const data = await res.json();

      if (data.success) {
        setInvitees(data.data);
        if (data.pagination) setPagination(data.pagination);
      }

      // Also refresh active campaign stats without breaking object identity needlessly
      const campRes = await fetch(`/api/campaigns/${activeCampaignId}`);
      const campData = await campRes.json();
      if (campData.success) {
        setActiveCampaign((prev) => {
          if (!prev || JSON.stringify(prev.stats) === JSON.stringify(campData.data.stats)) {
            return prev;
          }
          return campData.data;
        });
      }
    } catch (err) {
      console.error('Error fetching invitees:', err);
    } finally {
      setLoading(false);
    }
  }, [activeCampaignId, activeFilter, searchQuery, pagination.page, pagination.limit]);

  useEffect(() => {
    checkHealth();
    fetchCampaigns();
  }, [checkHealth, fetchCampaigns]);

  useEffect(() => {
    fetchInvitees();
  }, [fetchInvitees]);

  // Manual status override handler with Optimistic UI update
  const handleUpdateStatus = async (inviteeId, newStatus) => {
    // Optimistically update invitees list & selected invitee
    setInvitees((prev) =>
      prev.map((inv) => (inv._id === inviteeId ? { ...inv, status: newStatus } : inv))
    );
    if (selectedInvitee && selectedInvitee._id === inviteeId) {
      setSelectedInvitee((prev) => ({ ...prev, status: newStatus }));
    }

    try {
      const res = await fetch(`/api/invitees/${inviteeId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        notify(`Updated status to ${newStatus}`);
        fetchInvitees();
      }
    } catch (err) {
      notify('Failed to update status', 'error');
    }
  };

  // Start RSVP Calling Batch Trigger
  const handleStartCalling = async () => {
    if (!activeCampaign) return;
    setIsCalling(true);
    notify('Initiating AI outbound calling batch...', 'info');

    try {
      const res = await fetch(`/api/campaigns/${activeCampaign._id}/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ triggerExternalTring: true }),
      });

      const data = await res.json();
      if (data.success) {
        notify(`Completed RSVP calling campaign! Processed ${data.processedCount} invitees.`);
        await fetchInvitees();
      } else {
        notify(data.error || 'Calling execution failed', 'error');
      }
    } catch (err) {
      notify('Network error during calling execution', 'error');
    } finally {
      setIsCalling(false);
    }
  };

  const pendingCount = activeCampaign?.stats?.pending || 0;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce">
          <div
            className={`px-4 py-3 rounded-2xl shadow-2xl border text-xs font-bold flex items-center gap-2.5 backdrop-blur-xl ${
              toastMessage.type === 'error'
                ? 'bg-rose-950/90 border-rose-500/30 text-rose-200'
                : toastMessage.type === 'info'
                ? 'bg-sky-950/90 border-sky-500/30 text-sky-200'
                : 'bg-emerald-950/90 border-emerald-500/30 text-emerald-200'
            }`}
          >
            {toastMessage.type === 'error' ? (
              <AlertCircle className="w-4 h-4 text-rose-400" />
            ) : toastMessage.type === 'info' ? (
              <PhoneCall className="w-4 h-4 text-sky-400 animate-pulse" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            )}
            {toastMessage.msg}
          </div>
        </div>
      )}

      {/* Navigation Header */}
      <Navbar
        campaigns={campaigns}
        activeCampaign={activeCampaign}
        onSelectCampaign={(c) => {
          setActiveCampaign(c);
          setPagination((p) => ({ ...p, page: 1 }));
        }}
        onOpenCampaignModal={() => setIsCampaignOpen(true)}
        onOpenCSVModal={() => setIsCSVOpen(true)}
        onStartCalling={handleStartCalling}
        isCalling={isCalling}
        pendingCount={pendingCount}
        systemMode={systemMode}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Top Section: Metrics Cards & Chart Toggle */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              Real-Time Campaign Metrics
            </h2>
            <button
              onClick={() => setShowCharts(!showCharts)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-slate-300 transition-colors cursor-pointer"
            >
              <BarChart2 className="w-4 h-4 text-cyan-400" />
              {showCharts ? 'Hide Visual Analytics' : 'Show Visual Analytics'}
            </button>
          </div>

          <MetricCards
            stats={activeCampaign?.stats || {}}
            activeFilter={activeFilter}
            onFilterChange={(f) => {
              setActiveFilter(f);
              setPagination((p) => ({ ...p, page: 1 }));
            }}
          />

          {showCharts && <AnalyticsCharts stats={activeCampaign?.stats || {}} />}
        </div>

        {/* Invitee Data Table */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wider">
              Invitee Roster ({pagination.total || 0})
            </h2>
            <button
              onClick={fetchInvitees}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-900 transition-colors cursor-pointer"
              title="Refresh Data"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          <InviteeTable
            invitees={invitees}
            activeFilter={activeFilter}
            onFilterChange={(f) => {
              setActiveFilter(f);
              setPagination((p) => ({ ...p, page: 1 }));
            }}
            searchQuery={searchQuery}
            onSearchChange={(q) => {
              setSearchQuery(q);
              setPagination((p) => ({ ...p, page: 1 }));
            }}
            onSelectInvitee={(inv) => {
              setSelectedInvitee(inv);
              setIsDrawerOpen(true);
            }}
            onUpdateStatus={handleUpdateStatus}
            pagination={pagination}
            onPageChange={(p) => setPagination((prev) => ({ ...prev, page: p }))}
            loading={loading}
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-4 text-center text-xs text-slate-500">
        GlobalVox RSVP Campaign Manager • MERN Monorepo Architecture • Powered by Express & React
      </footer>

      {/* Modals & Slide-over Drawer */}
      <CSVUploader
        isOpen={isCSVOpen}
        onClose={() => setIsCSVOpen(false)}
        campaignId={activeCampaign?._id}
        onUploadSuccess={(data) => {
          notify(`Successfully imported ${data.insertedCount} invitees!`);
          fetchInvitees();
        }}
      />

      <CampaignModal
        isOpen={isCampaignOpen}
        onClose={() => setIsCampaignOpen(false)}
        onCreateCampaign={(newCamp) => {
          notify(`Created campaign "${newCamp.name}"`);
          fetchCampaigns();
          setActiveCampaign(newCamp);
        }}
      />

      <InviteeDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        invitee={selectedInvitee}
        onUpdateStatus={handleUpdateStatus}
      />
    </div>
  );
}
