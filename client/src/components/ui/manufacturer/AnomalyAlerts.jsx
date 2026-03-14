import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  PlusSquare,
  Layers,
  FileText,
  AlertTriangle,
  Zap,
  Download,
  Settings,
  CheckCircle2,
  RefreshCw,
  ShieldAlert,
  Clock,
  FileSearch
} from 'lucide-react';

export default function AnomalyAlerts() {
  const navigate = useNavigate();
  const [alerts, setAlerts] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    high: 0,
    medium: 0,
    low: 0,
    duplicateHash: 0,
    integrityMismatch: 0,
    expiryRisk: 0,
  });
  const [generatedAt, setGeneratedAt] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const loadAlerts = useCallback(async () => {
    setIsLoading(true);
    setLoadError('');
    try {
      const response = await fetch('/api/drugs/anomalies');
      const data = await response.json();

      if (!response.ok || !data?.ok) {
        throw new Error(data?.message || 'Failed to load anomaly alerts');
      }

      setAlerts(Array.isArray(data.alerts) ? data.alerts : []);
      setStats(data.stats || {});
      setGeneratedAt(data.generatedAt || '');
    } catch (err) {
      setLoadError(err.message || 'Unable to load anomaly alerts');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAlerts();
  }, [loadAlerts]);

  const formatDateTime = (value) => {
    if (!value) return 'N/A';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return String(value);
    return date.toLocaleString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatRelativeTime = (value) => {
    if (!value) return 'just now';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return 'recent';
    const diffMs = Date.now() - date.getTime();
    const diffMinutes = Math.max(1, Math.floor(diffMs / (1000 * 60)));
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  const severityStyles = {
    HIGH: 'bg-red-100 text-red-700 border border-red-200',
    MEDIUM: 'bg-orange-100 text-orange-700 border border-orange-200',
    LOW: 'bg-amber-100 text-amber-700 border border-amber-200',
  };

  const activeAlertsCount = useMemo(() => (Array.isArray(alerts) ? alerts.length : 0), [alerts]);

  return (
    <div className="flex h-screen bg-[#1e2330] font-sans overflow-hidden">
      {/* SIDEBAR */}
      <aside className="w-[260px] bg-[#1e293b] flex flex-col text-slate-300 flex-shrink-0 z-20">
        <Link to="/" className="w-full bg-transparent border-0 flex items-center gap-3 px-6 py-8 hover:opacity-90 transition-opacity text-left cursor-pointer">
          <div className="w-8 h-8 rounded bg-emerald-500 flex items-center justify-center text-white font-bold text-xl">
            P
          </div>
          <span className="text-white font-bold tracking-wide text-lg">
            Praman Chain
          </span>
        </Link>

        <nav className="flex-1 px-4 space-y-2">
          <button
            onClick={() => navigate('/manufacturer')}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-800 hover:text-white transition-colors"
          >
            <LayoutDashboard size={20} />
            Dashboard
          </button>
          <button
            onClick={() => navigate('/manufacturer/register-batch')}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors hover:bg-slate-800 hover:text-white"
          >
            <PlusSquare size={20} />
            Register Batch
          </button>
          <button
            onClick={() => navigate('/manufacturer/batch-list')}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors hover:bg-slate-800 hover:text-white"
          >
            <Layers size={20} />
            Batch List
          </button>
          <button
            onClick={() => navigate('/manufacturer/batch-detail')}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors hover:bg-slate-800 hover:text-white"
          >
            <FileText size={20} />
            Batch Detail
          </button>
          <button
            onClick={() => navigate('/manufacturer/anomaly-alerts')}
            className="w-full flex items-center justify-between px-4 py-3 rounded-lg transition-colors bg-slate-700/50 text-emerald-400 font-medium border border-slate-700/50"
          >
            <div className="flex items-center gap-3">
              <AlertTriangle size={20} />
              Anomaly Alerts
            </div>
            <span className="bg-orange-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{activeAlertsCount}</span>
          </button>
          <button
            onClick={() => navigate('/manufacturer/trigger-recall')}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-800 hover:text-white transition-colors"
          >
            <Zap size={20} />
            Trigger Recall
          </button>
          <button
            onClick={() => navigate('/manufacturer/compliance-export')}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-800 hover:text-white transition-colors"
          >
            <Download size={20} />
            Compliance Export
          </button>

        </nav>

        <div className="p-4 border-t border-slate-700/50">
          <div className="flex items-center justify-between cursor-pointer hover:bg-slate-800 p-2 rounded-lg transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-slate-700 border border-slate-600 flex items-center justify-center text-slate-300 overflow-hidden">
                <img src="https://ui-avatars.com/api/?name=Sun+Pharma+Ltd&background=1e293b&color=cbd5e1" alt="Avatar" className="w-full h-full object-cover" />
              </div>
              <div className="leading-tight">
                <p className="text-sm font-medium text-white">Sun Pharma Ltd</p>
                <p className="text-xs text-slate-400 font-mono">@x0b2t...bf1d</p>
              </div>
            </div>
            <Settings size={18} className="text-slate-400" />
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 overflow-y-auto flex flex-col relative z-10 w-full bg-[#f8fafc]">
        {/* TOP HEADER */}
        <div className="bg-[#1e2330] px-8 py-6 flex justify-between items-center text-white border-b border-slate-700 shadow-sm">
          <div>
            <h1 className="text-2xl font-bold tracking-wide">Anomaly Alerts</h1>
            <p className="text-slate-400 text-sm mt-1">PharmaChain Supply Chain Integrity Monitor</p>
          </div>
          <div className="flex items-center gap-4 text-sm font-medium">
            <div className="flex items-center gap-2 bg-slate-800/50 border border-slate-700 px-4 py-2 rounded-full">
              <div className="w-2 h-2 rounded-full bg-red-500"></div>
              <span className="text-slate-200">{activeAlertsCount} active alerts</span>
            </div>
            <div className="flex items-center gap-2 bg-slate-800/50 border border-slate-700 px-4 py-2 rounded-full">
              <CheckCircle2 size={16} className="text-emerald-500" />
              <span className="text-slate-200">Auto-monitoring enabled</span>
            </div>
          </div>
        </div>

        <div className="w-full max-w-6xl mx-auto p-8 flex-1 flex flex-col">
          {/* STATS CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Active Alerts</h3>
              <p className="text-3xl font-bold text-red-600">{stats.total || 0}</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">High Risk</h3>
              <p className="text-3xl font-bold text-slate-800">{stats.high || 0}</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Integrity Mismatch</h3>
              <p className="text-3xl font-bold text-slate-800">{stats.integrityMismatch || 0}</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Expiry Risk</h3>
              <p className="text-3xl font-bold text-slate-800">{stats.expiryRisk || 0}</p>
            </div>
          </div>

          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-slate-800">Active Anomaly Alerts</h2>
            <div className="flex items-center gap-4">
              <div className="text-xs text-slate-500 font-medium">
                Updated: {generatedAt ? formatDateTime(generatedAt) : 'N/A'}
              </div>
              <button
                onClick={loadAlerts}
                className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
              >
                <RefreshCw size={15} className={isLoading ? 'animate-spin' : ''} />
                Refresh Feed
              </button>
            </div>
          </div>

          {/* ALERTS LIST */}
          <div className="space-y-4 flex-1">
            {loadError && (
              <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 text-rose-700 text-sm font-medium">
                {loadError}
              </div>
            )}

            {!isLoading && !loadError && alerts.length === 0 && (
              <div className="bg-white rounded-xl border border-slate-200 p-10 text-center">
                <ShieldAlert size={34} className="mx-auto mb-3 text-emerald-500" />
                <h3 className="text-lg font-bold text-slate-800">No active anomalies detected</h3>
                <p className="text-sm text-slate-500 mt-2">Integrity checks are running continuously and no violations were found.</p>
              </div>
            )}

            {isLoading && (
              <div className="bg-white rounded-xl border border-slate-200 p-10 text-center text-slate-500 font-medium">
                Loading anomaly feed...
              </div>
            )}

            {!isLoading && !loadError && alerts.map((alert) => (
              <div key={alert.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <div className="flex flex-wrap justify-between items-start gap-3 mb-2">
                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded ${severityStyles[alert.severity] || 'bg-slate-100 text-slate-700 border border-slate-200'}`}>
                      {alert.severity || 'UNKNOWN'}
                    </span>
                    <span className="text-slate-400 text-sm font-medium font-mono">ID: {alert.id}</span>
                  </div>
                  <span className="text-sm text-slate-400">{formatRelativeTime(alert.createdAt)}</span>
                </div>

                <div className="mt-4">
                  <h3 className="text-lg font-bold text-slate-900 break-all">{alert.title}</h3>
                  <p className="text-slate-600 mt-1 max-w-3xl">{alert.description}</p>
                  <div className="mt-3 text-xs text-slate-500 grid grid-cols-1 md:grid-cols-3 gap-2">
                    <span className="inline-flex items-center gap-1.5"><FileSearch size={13} /> Batch: {alert.batchId}</span>
                    <span className="inline-flex items-center gap-1.5"><AlertTriangle size={13} /> Type: {alert.type}</span>
                    <span className="inline-flex items-center gap-1.5"><Clock size={13} /> {formatDateTime(alert.createdAt)}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3 mt-5">
                  <button
                    onClick={() => navigate(`/manufacturer/batch-detail/${alert.batchId}`)}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-700 text-white text-sm font-medium rounded-lg transition-colors"
                  >
                    View Batch
                  </button>
                  <button
                    onClick={() => navigate('/manufacturer/trigger-recall')}
                    className="px-4 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-sm font-medium rounded-lg transition-colors"
                  >
                    Trigger Recall
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 text-center pb-4">
            <p className="text-xs text-slate-500">
              © 2023 PharmaChain Systems. All supply chain events are cryptographically secured on the ledger.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
