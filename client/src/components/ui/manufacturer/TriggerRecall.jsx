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
  Info,
  Megaphone,
  ChevronDown,
  RefreshCw,
  ShieldAlert,
  CheckCircle2,
} from 'lucide-react';

const SEVERITY_OPTIONS = [
  'Critical (Class I)',
  'High (Class II)',
  'Standard (Class III)',
];

const REASON_OPTIONS = [
  'Contamination detected',
  'Temperature Excursion',
  'Labeling Error',
  'Quality Test Failed',
  'Counterfeit suspicion',
  'Integrity mismatch detected',
];

export default function TriggerRecall() {
  const navigate = useNavigate();

  const [planCandidates, setPlanCandidates] = useState([]);
  const [recalls, setRecalls] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const [selectedBatch, setSelectedBatch] = useState('');
  const [reason, setReason] = useState('');
  const [severity, setSeverity] = useState('Critical (Class I)');
  const [instructions, setInstructions] = useState('');
  const [channels, setChannels] = useState({
    wallet: true,
    sms: true,
    api: false,
  });

  const loadRecallData = useCallback(async () => {
    setIsLoading(true);
    setLoadError('');

    try {
      const [planRes, recallsRes] = await Promise.all([
        fetch('/api/drugs/recalls/plan'),
        fetch('/api/drugs/recalls'),
      ]);

      const [planData, recallsData] = await Promise.all([planRes.json(), recallsRes.json()]);

      if (!planRes.ok || !planData?.ok) {
        throw new Error(planData?.message || 'Unable to load recall planning data');
      }
      if (!recallsRes.ok || !recallsData?.ok) {
        throw new Error(recallsData?.message || 'Unable to load recall records');
      }

      setPlanCandidates(Array.isArray(planData.candidates) ? planData.candidates : []);
      setRecalls(Array.isArray(recallsData.recalls) ? recallsData.recalls : []);
    } catch (err) {
      setLoadError(err.message || 'Unable to load recall data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRecallData();
  }, [loadRecallData]);

  const selectedCandidate = useMemo(() => (
    planCandidates.find((candidate) => candidate.batchId === selectedBatch) || null
  ), [planCandidates, selectedBatch]);

  useEffect(() => {
    if (!selectedCandidate) return;

    setReason(selectedCandidate.recommendedReason || '');
    setSeverity(selectedCandidate.recallClass || 'High (Class II)');
    setInstructions(
      `Immediate recall initiated for ${selectedCandidate.productName} (${selectedCandidate.batchId}).\n` +
      `Impact estimate: ${selectedCandidate.quantity} unit(s).\n` +
      `Primary risk signals: ${selectedCandidate.sourceAlertTypes.join(', ') || 'N/A'}.\n` +
      'Please stop use and return product to nearest verified pharmacy node.'
    );

    setChannels({
      wallet: selectedCandidate.recommendedChannels.includes('wallet'),
      sms: selectedCandidate.recommendedChannels.includes('sms'),
      api: selectedCandidate.recommendedChannels.includes('api'),
    });
  }, [selectedCandidate]);

  const activeRecalls = useMemo(() => recalls.filter((r) => r.status === 'ACTIVE'), [recalls]);
  const resolvedRecalls = useMemo(() => recalls.filter((r) => r.status === 'RESOLVED'), [recalls]);

  const kpis = useMemo(() => {
    const totalNotified = recalls.reduce((acc, recall) => acc + Number(recall.notified || 0), 0);
    const totalTargets = recalls.reduce((acc, recall) => acc + Number(recall.totalTargets || 0), 0);
    const batchesRecalled = new Set(recalls.map((recall) => recall.batchId)).size;

    const avgLatency = recalls.length
      ? (recalls.reduce((acc, recall) => acc + Number(recall.notificationLatencySec || 0), 0) / recalls.length)
      : 0;

    return {
      activeCount: activeRecalls.length,
      totalNotified,
      totalTargets,
      batchesRecalled,
      avgLatency: avgLatency.toFixed(1),
    };
  }, [activeRecalls.length, recalls]);

  const toggleChannel = (channelKey) => {
    setChannels((prev) => ({ ...prev, [channelKey]: !prev[channelKey] }));
  };

  const selectedChannels = useMemo(
    () => Object.entries(channels).filter(([, enabled]) => enabled).map(([key]) => key),
    [channels]
  );

  const handleBroadcast = async () => {
    setSubmitError('');
    setSuccessMessage('');

    if (!selectedBatch || !reason) {
      setSubmitError('Select a plan candidate and provide recall reason.');
      return;
    }

    if (selectedChannels.length === 0) {
      setSubmitError('At least one notification channel must be selected.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        batchId: selectedBatch,
        reason,
        severity,
        instructions,
        channels: selectedChannels,
        sourceAlertTypes: selectedCandidate?.sourceAlertTypes || [],
        plannedActions: selectedCandidate?.plannedActions || [],
        riskScore: selectedCandidate?.riskScore || 0,
      };

      const response = await fetch('/api/drugs/recalls', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok || !data?.ok) {
        throw new Error(data?.message || 'Failed to trigger recall');
      }

      const newRecallId = data?.recall?.recallId || 'Recall case';
      setSuccessMessage(`${newRecallId} broadcasted successfully to selected channels.`);

      setSelectedBatch('');
      setReason('');
      setInstructions('');
      setChannels({ wallet: true, sms: true, api: false });

      await loadRecallData();
    } catch (err) {
      setSubmitError(err.message || 'Unable to broadcast recall');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resolveRecall = async (recallId) => {
    try {
      const response = await fetch(`/api/drugs/recalls/${encodeURIComponent(recallId)}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'RESOLVED' }),
      });

      const data = await response.json();
      if (!response.ok || !data?.ok) {
        throw new Error(data?.message || 'Unable to resolve recall');
      }

      await loadRecallData();
    } catch (err) {
      setSubmitError(err.message || 'Unable to resolve recall case');
    }
  };

  return (
    <div className="flex h-screen bg-[#f8fafc] font-sans text-slate-900 overflow-hidden">
      <aside className="w-[260px] bg-[#1e293b] flex flex-col text-slate-300 flex-shrink-0 z-20">
        <Link to="/" className="w-full bg-transparent border-0 flex items-center gap-3 px-6 py-8 hover:opacity-90 transition-opacity text-left cursor-pointer">
          <div className="w-8 h-8 rounded bg-emerald-500 flex items-center justify-center text-white font-bold text-xl">P</div>
          <span className="text-white font-bold tracking-wide text-lg">Praman Chain</span>
        </Link>

        <nav className="flex-1 px-4 space-y-2">
          <button onClick={() => navigate('/manufacturer')} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-800 hover:text-white transition-colors">
            <LayoutDashboard size={20} />
            Dashboard
          </button>
          <button onClick={() => navigate('/manufacturer/register-batch')} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors hover:bg-slate-800 hover:text-white">
            <PlusSquare size={20} />
            Register Batch
          </button>
          <button onClick={() => navigate('/manufacturer/batch-list')} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors hover:bg-slate-800 hover:text-white">
            <Layers size={20} />
            Batch List
          </button>
          <button onClick={() => navigate('/manufacturer/batch-detail')} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors hover:bg-slate-800 hover:text-white">
            <FileText size={20} />
            Batch Detail
          </button>
          <button onClick={() => navigate('/manufacturer/anomaly-alerts')} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-800 hover:text-white transition-colors">
            <AlertTriangle size={20} />
            Anomaly Alerts
          </button>
          <button onClick={() => navigate('/manufacturer/trigger-recall')} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors bg-slate-700/50 text-emerald-400 font-medium border border-slate-700/50">
            <Zap size={20} />
            Trigger Recall
          </button>
          <button onClick={() => navigate('/manufacturer/compliance-export')} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-800 hover:text-white transition-colors">
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

      <main className="flex-1 overflow-y-auto bg-slate-50 flex flex-col relative z-10 w-full">
        <div className="w-full max-w-6xl mx-auto pt-6 px-8 pb-8 flex-1 flex flex-col">
          <div className="flex flex-wrap justify-between items-center gap-3 mb-6">
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Trigger Recall</h1>
            <button
              onClick={loadRecallData}
              className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 border border-slate-200 bg-white rounded-lg px-4 py-2 hover:bg-slate-50"
            >
              <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
              Refresh
            </button>
          </div>

          {successMessage && (
            <div className="bg-emerald-50/80 border border-emerald-200 rounded-lg p-4 flex items-center gap-3 text-emerald-800 text-sm font-medium mb-5">
              <CheckCircle2 size={18} className="text-emerald-600" />
              {successMessage}
            </div>
          )}

          {submitError && (
            <div className="bg-rose-50 border border-rose-200 rounded-lg p-4 text-rose-700 text-sm font-medium mb-5">
              {submitError}
            </div>
          )}

          {loadError ? (
            <div className="bg-rose-50 border border-rose-200 rounded-lg p-4 text-rose-700 text-sm font-medium mb-8">
              {loadError}
            </div>
          ) : (
            <div className="bg-blue-50/80 border border-blue-100 rounded-lg p-4 flex items-center gap-3 text-blue-800 text-sm font-medium mb-8">
              <Info size={18} className="text-blue-600" />
              Recall planning is generated from live anomaly intelligence and current active recalls.
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col">
              <span className="text-[11px] font-bold text-slate-500 tracking-wider mb-2">RECALLS ISSUED</span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-slate-800">{kpis.activeCount}</span>
                <span className="text-sm text-slate-500 font-medium">Active cases</span>
              </div>
            </div>
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col">
              <span className="text-[11px] font-bold text-slate-500 tracking-wider mb-2">PATIENTS NOTIFIED</span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-slate-800">{kpis.totalNotified}</span>
                <span className="text-sm text-emerald-500 font-medium">{kpis.totalTargets > 0 ? `${Math.round((kpis.totalNotified / kpis.totalTargets) * 100)}% coverage` : 'No active target'}</span>
              </div>
            </div>
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col">
              <span className="text-[11px] font-bold text-slate-500 tracking-wider mb-2">BATCHES RECALLED</span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-slate-800">{kpis.batchesRecalled}</span>
                <span className="text-sm text-slate-500 font-medium">Total impact</span>
              </div>
            </div>
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col">
              <span className="text-[11px] font-bold text-slate-500 tracking-wider mb-2">AVG NOTIFICATION TIME</span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-slate-800">{kpis.avgLatency} sec</span>
                <span className="text-sm text-slate-400 font-medium">From ledger fanout</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-8 flex-1">
            <div className="flex-[3] bg-white rounded-2xl border border-slate-200 shadow-sm p-8 pb-10">
              <h2 className="text-xl font-bold text-slate-800 mb-1 tracking-tight">Issue New Recall</h2>
              <p className="text-slate-500 text-sm mb-6">Choose a risk candidate and broadcast a signed recall event.</p>

              <div className="mb-6">
                <label className="block text-sm font-bold text-slate-700 mb-2">Risk-Based Recall Plan</label>
                {isLoading ? (
                  <div className="border border-slate-200 rounded-lg p-4 text-sm text-slate-500">Loading planning candidates...</div>
                ) : planCandidates.length === 0 ? (
                  <div className="border border-emerald-200 bg-emerald-50 rounded-lg p-4 text-sm text-emerald-700 flex items-center gap-2">
                    <ShieldAlert size={16} />
                    No unresolved high-risk candidates detected right now.
                  </div>
                ) : (
                  <div className="grid gap-3 max-h-56 overflow-y-auto pr-1">
                    {planCandidates.slice(0, 8).map((candidate) => (
                      <button
                        key={candidate.batchId}
                        onClick={() => setSelectedBatch(candidate.batchId)}
                        className={`text-left border rounded-lg p-3 transition-colors ${selectedBatch === candidate.batchId ? 'border-red-300 bg-red-50' : 'border-slate-200 hover:bg-slate-50'}`}
                      >
                        <div className="flex justify-between items-start gap-2">
                          <div>
                            <div className="font-semibold text-slate-800">{candidate.productName} ({candidate.batchId})</div>
                            <div className="text-xs text-slate-500 mt-1">{candidate.recommendedReason}</div>
                          </div>
                          <span className="text-xs font-bold text-red-600 bg-red-100 px-2 py-1 rounded">Risk {candidate.riskScore}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-4 mb-6 flex-col md:flex-row">
                <div className="flex-1">
                  <label className="block text-sm font-bold text-slate-700 mb-2">Affected Batch</label>
                  <div className="relative">
                    <select
                      value={selectedBatch}
                      onChange={(e) => setSelectedBatch(e.target.value)}
                      className="w-full appearance-none bg-white border border-slate-300 rounded-lg px-4 py-3 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select Batch ID</option>
                      {planCandidates.map((candidate) => (
                        <option key={candidate.batchId} value={candidate.batchId}>{candidate.batchId} - {candidate.productName}</option>
                      ))}
                    </select>
                    <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  </div>
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-bold text-slate-700 mb-2">Recall Reason</label>
                  <div className="relative">
                    <select
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      className="w-full appearance-none bg-white border border-slate-300 rounded-lg px-4 py-3 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select Reason</option>
                      <option value={reason}>{reason || 'Use planned reason'}</option>
                      {REASON_OPTIONS.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                    <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-bold text-slate-700 mb-3">Recall Severity</label>
                <div className="flex items-center gap-6 flex-wrap">
                  {SEVERITY_OPTIONS.map((option) => (
                    <label key={option} className="flex items-center gap-2 cursor-pointer group" onClick={() => setSeverity(option)}>
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${severity === option ? 'border-red-600' : 'border-slate-300 group-hover:border-slate-400'}`}>
                        {severity === option && <div className="w-2 h-2 rounded-full bg-red-600"></div>}
                      </div>
                      <span className={`text-sm font-medium ${severity === option ? 'text-slate-900' : 'text-slate-500 group-hover:text-slate-700'}`}>{option}</span>
                    </label>
                  ))}
                </div>
              </div>

              {selectedCandidate?.plannedActions?.length > 0 && (
                <div className="mb-6 bg-slate-50 border border-slate-200 rounded-lg p-4">
                  <div className="text-sm font-bold text-slate-700 mb-2">Planned Response Actions</div>
                  <ul className="space-y-2 text-sm text-slate-600">
                    {selectedCandidate.plannedActions.map((action, idx) => (
                      <li key={`${action}-${idx}`} className="flex items-start gap-2">
                        <span className="mt-1 w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                        <span>{action}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="mb-6">
                <label className="block text-sm font-bold text-slate-700 mb-2">Patient Instructions & Message</label>
                <textarea
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  rows={4}
                  placeholder="Provide clear patient handling and return instructions..."
                  className="w-full bg-white border border-slate-300 rounded-lg px-4 py-3 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none placeholder-slate-400"
                ></textarea>
              </div>

              <div className="mb-8">
                <label className="block text-sm font-bold text-slate-700 mb-3">Notify via Channels</label>
                <div className="flex gap-4 flex-wrap">
                  <button onClick={() => toggleChannel('wallet')} className={`flex-1 min-w-[160px] flex items-center gap-3 rounded-lg p-3 border ${channels.wallet ? 'border-red-600 bg-red-50/50' : 'border-slate-200 bg-white'}`}>
                    <div className={`w-4 h-4 rounded border flex items-center justify-center ${channels.wallet ? 'bg-red-600 border-red-700 text-white' : 'border-slate-300 bg-white'}`}>
                      {channels.wallet && <span className="text-[10px]">✓</span>}
                    </div>
                    <span className="text-sm font-medium text-slate-800">Wallet App</span>
                  </button>
                  <button onClick={() => toggleChannel('sms')} className={`flex-1 min-w-[160px] flex items-center gap-3 rounded-lg p-3 border ${channels.sms ? 'border-red-600 bg-red-50/50' : 'border-slate-200 bg-white'}`}>
                    <div className={`w-4 h-4 rounded border flex items-center justify-center ${channels.sms ? 'bg-red-600 border-red-700 text-white' : 'border-slate-300 bg-white'}`}>
                      {channels.sms && <span className="text-[10px]">✓</span>}
                    </div>
                    <span className="text-sm font-medium text-slate-800">SMS Alert</span>
                  </button>
                  <button onClick={() => toggleChannel('api')} className={`flex-1 min-w-[160px] flex items-center gap-3 rounded-lg p-3 border ${channels.api ? 'border-red-600 bg-red-50/50' : 'border-slate-200 bg-white'}`}>
                    <div className={`w-4 h-4 rounded border flex items-center justify-center ${channels.api ? 'bg-red-600 border-red-700 text-white' : 'border-slate-300 bg-white'}`}>
                      {channels.api && <span className="text-[10px]">✓</span>}
                    </div>
                    <span className="text-sm font-medium text-slate-800">API Hook</span>
                  </button>
                </div>
              </div>

              <button
                onClick={handleBroadcast}
                disabled={isSubmitting || isLoading}
                className="w-full bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white font-bold py-4 rounded-xl shadow-[0_4px_14px_rgba(220,38,38,0.4)] transition-all flex items-center justify-center gap-3 text-lg mb-4"
              >
                <Megaphone size={22} className="fill-current text-white/20" />
                {isSubmitting ? 'Broadcasting Recall...' : 'Broadcast Recall on Blockchain'}
              </button>

              <p className="text-center text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                IMMUTABLE ACTION: THIS CANNOT BE UNDONE
              </p>
            </div>

            <div className="flex-[2] bg-slate-50/50 border border-transparent flex flex-col items-center">
              <div className="w-full bg-white rounded-2xl border border-slate-200 shadow-sm p-6 relative flex flex-col h-full">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold text-slate-800">Recall Timeline</h3>
                  <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1.5 rounded">{recalls.length} total</span>
                </div>

                <div className="space-y-4 flex-1 max-h-[560px] overflow-y-auto pr-1">
                  {!isLoading && recalls.length === 0 && (
                    <div className="text-sm text-slate-500 border border-slate-200 rounded-lg p-4">No recall case has been issued yet.</div>
                  )}

                  {recalls.map((recall) => (
                    <div key={recall.recallId} className={`border rounded-xl p-5 relative overflow-hidden ${recall.status === 'ACTIVE' ? 'bg-red-50/50 border-red-100' : 'bg-white border-slate-200'}`}>
                      <div className="flex justify-between items-start mb-2 gap-2">
                        <h4 className="font-bold text-slate-800 text-base break-all">{recall.productName}</h4>
                        <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full ${recall.status === 'ACTIVE' ? 'bg-red-100 border border-red-200' : 'bg-emerald-50 border border-emerald-100'}`}>
                          {recall.status === 'ACTIVE' && <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></div>}
                          <span className={`text-[10px] font-bold tracking-wide ${recall.status === 'ACTIVE' ? 'text-red-600' : 'text-emerald-600'}`}>{recall.status}</span>
                        </div>
                      </div>

                      <p className="text-xs text-slate-500 mb-4 font-mono">Recall: {recall.recallId} | Batch: {recall.batchId}</p>

                      <div className="flex justify-between items-center text-sm mb-1">
                        <span className="text-slate-500">Reason:</span>
                        <span className="font-medium text-slate-800 text-right ml-3">{recall.reason}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm mb-1">
                        <span className="text-slate-500">Severity:</span>
                        <span className="font-medium text-slate-800">{recall.severity}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm mb-3">
                        <span className="text-slate-500">Notified:</span>
                        <span className="font-medium text-slate-800">{recall.notified} / {recall.totalTargets}</span>
                      </div>

                      {recall.status === 'ACTIVE' ? (
                        <button
                          onClick={() => resolveRecall(recall.recallId)}
                          className="w-full py-2.5 rounded-lg border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                        >
                          Mark as Resolved
                        </button>
                      ) : (
                        <div className="text-xs text-slate-500">
                          Closed: {recall.resolvedAt ? new Date(recall.resolvedAt).toLocaleString('en-GB') : 'N/A'}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {resolvedRecalls.length > 0 && (
                  <div className="mt-5 text-xs text-slate-500">
                    {resolvedRecalls.length} resolved case(s) available for compliance export.
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="text-center pt-8 text-slate-400 text-xs">
            © 2026 PramanChain Technologies. Recall events are versioned and auditable across ledger nodes.
          </div>
        </div>
      </main>
    </div>
  );
}
