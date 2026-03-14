import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
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
  CheckCircle2,
  Building2,
  FileSpreadsheet,
  ChevronDown,
  ClipboardList
} from 'lucide-react';

export default function BatchDetail() {
  const { batchId } = useParams();
  const [detail, setDetail] = useState(null);
  const [isLoading, setIsLoading] = useState(Boolean(batchId));
  const [loadError, setLoadError] = useState('');
  const [historyData, setHistoryData] = useState({ timeline: [], recentEvents: [] });

  useEffect(() => {
    if (!batchId) {
      setIsLoading(false);
      return;
    }

    const loadDetail = async () => {
      setIsLoading(true);
      setLoadError('');
      try {
        const [verifyRes, historyRes] = await Promise.all([
          fetch(`/api/drugs/verify/${encodeURIComponent(batchId)}`),
          fetch(`/api/drugs/history/${encodeURIComponent(batchId)}`),
        ]);

        const data = await verifyRes.json();

        if (!verifyRes.ok || !data?.ok) {
          throw new Error(data?.message || 'Unable to load batch details');
        }

        setDetail(data);

        if (historyRes.ok) {
          const historyJson = await historyRes.json();
          if (historyJson?.ok) {
            setHistoryData({
              timeline: Array.isArray(historyJson.timeline) ? historyJson.timeline : [],
              recentEvents: Array.isArray(historyJson.recentEvents) ? historyJson.recentEvents : [],
            });
          }
        }
      } catch (err) {
        setLoadError(err.message || 'Unable to load batch details');
      } finally {
        setIsLoading(false);
      }
    };

    loadDetail();
  }, [batchId]);

  const batch = detail?.batch || {};
  const verified = detail?.status === 'VERIFIED';
  const displayBatchId = batch.batchId || batchId || 'N/A';
  const displayProduct = batch.productName || 'Unknown Product';
  const displayTx = detail?.txHash || batch.txHash || 'N/A';
  const displayDbHash = detail?.dbHash || batch.dataHash || 'N/A';
  const displayRecomputed = detail?.recomputedHash || 'N/A';

  const formatDateTime = (input) => {
    if (!input) return 'N/A';
    const d = new Date(input);
    if (Number.isNaN(d.getTime())) return String(input);
    return d.toLocaleString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formattedExpiry = useMemo(() => {
    if (!batch.expDate) return 'N/A';
    const d = new Date(batch.expDate);
    return Number.isNaN(d.getTime()) ? String(batch.expDate) : d.toLocaleDateString('en-GB');
  }, [batch.expDate]);

  const timeline = historyData.timeline.length > 0 ? historyData.timeline : [
    {
      title: 'Manufactured',
      action: 'Batch Production Complete',
      location: batch.plantCode || 'Unknown Plant',
      time: batch.mfgDate,
      txHash: displayTx,
    },
  ];

  const recentEvents = historyData.recentEvents.length > 0 ? historyData.recentEvents : [
    {
      location: batch.plantCode || 'Unknown Plant',
      action: 'Batch Registered',
      time: batch.createdAt || batch.timestamp,
    },
  ];

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900 overflow-hidden">
      
      {/* 
        ========================================
        SIDEBAR
        ========================================
      */}
      <aside className="w-64 bg-[#1e293b] flex flex-col text-slate-300">
        <Link to="/" className="flex items-center gap-3 px-6 py-8 hover:opacity-90 transition-opacity">
          <div className="w-8 h-8 rounded bg-emerald-500 flex items-center justify-center text-white font-bold text-xl">
            P
          </div>
          <span className="text-white font-bold tracking-wide text-lg">
            Praman Chain
          </span>
        </Link>

        <nav className="flex-1 px-4 space-y-2">
          <Link
            to="/manufacturer"
            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-800 hover:text-white transition-colors"
          >
            <LayoutDashboard size={20} />
            Dashboard
          </Link>
          <Link
            to="/manufacturer/register-batch"
            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-800 hover:text-white transition-colors"
          >
            <PlusSquare size={20} />
            Register Batch
          </Link>
          <Link
            to="/manufacturer/batch-list"
            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-800 hover:text-white transition-colors"
          >
            <Layers size={20} />
            Batch List
          </Link>
          <Link
            to="/manufacturer/batch-detail"
            className="flex items-center gap-3 px-4 py-3 rounded-lg bg-slate-700/50 text-emerald-400 font-medium border border-slate-700/50 transition-colors"
          >
            <FileText size={20} />
            Batch Detail
          </Link>
          <Link
            to="/manufacturer/anomaly-alerts"
            className="flex items-center justify-between px-4 py-3 rounded-lg hover:bg-slate-800 hover:text-white transition-colors"
          >
            <div className="flex items-center gap-3">
              <AlertTriangle size={20} />
              Anomaly Alerts
            </div>
            <span className="bg-orange-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
              3
            </span>
          </Link>
          <Link
            to="/manufacturer/trigger-recall"
            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-800 hover:text-white transition-colors"
          >
            <Zap size={20} />
            Trigger Recall
          </Link>
          <Link
            to="/manufacturer/compliance-export"
            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-800 hover:text-white transition-colors"
          >
            <Download size={20} />
            Compliance Export
          </Link>

        </nav>

        <div className="p-4 border-t border-slate-700/50">
          <div className="flex items-center justify-between cursor-pointer hover:bg-slate-800 p-2 rounded-lg transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-slate-600 overflow-hidden border-2 border-slate-500">
                <img 
                  src="https://i.pravatar.cc/150?img=11" 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <p className="text-white text-sm font-semibold">Sun Pharma Ltd</p>
                <p className="text-slate-400 text-xs font-mono">SHAWSE...0P2H</p>
              </div>
            </div>
            <Settings size={18} className="text-slate-400" />
          </div>
        </div>
      </aside>

      {/* 
        ========================================
        MAIN CONTENT
        ========================================
      */}
      <main className="flex-1 flex flex-col overflow-y-auto">
        
        {/* Top Header */}
        <header className="flex items-center justify-between px-8 py-6 bg-slate-50">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-slate-800">Batch Detail</h1>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-xs font-semibold border border-emerald-100">
              <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
              Live on Polygon
            </div>
          </div>
          

        </header>

        {/* Dashboard Content */}
        <div className="px-8 pb-8 space-y-6">
          
          {/* Info Banner */}
          <div className="bg-[#334155] text-slate-200 border border-slate-700 rounded-xl p-4 flex items-center shadow-sm">
            <div className="flex items-center gap-3 text-sm font-medium">
              <Info size={18} className="text-slate-400" />
              {isLoading ? 'Loading batch details...' : `Viewing ${displayBatchId} • ${displayProduct}`}
            </div>
          </div>

          {loadError && (
            <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 text-rose-700 text-sm font-medium">
              {loadError}
            </div>
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {/* Stat Card 1 */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex flex-col justify-between">
              <p className="text-slate-500 text-xs font-bold tracking-wider mb-4">TOTAL SCANS</p>
              <div className="flex items-end justify-between">
                <h3 className="text-3xl font-bold text-slate-800 leading-none">234</h3>
                <span className="text-emerald-500 text-xs font-semibold mb-1">↑ 12% vs avg</span>
              </div>
            </div>

            {/* Stat Card 2 */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex flex-col justify-between">
              <p className="text-slate-500 text-xs font-bold tracking-wider mb-4">CURRENT CUSTODIAN</p>
              <div className="flex items-center gap-2">
                <Building2 size={18} className="text-slate-400" />
                <h3 className="text-lg font-bold text-slate-800 leading-none">HealthPlus Pharmacy</h3>
              </div>
            </div>

            {/* Stat Card 3 */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex flex-col justify-between">
              <p className="text-slate-500 text-xs font-bold tracking-wider mb-4">TEMP STATUS</p>
              <div className="flex items-end justify-between">
                <h3 className="text-3xl font-bold text-slate-800 leading-none">3.2°C</h3>
                <span className="bg-emerald-50 text-emerald-600 text-[10px] font-bold px-2 py-1 rounded border border-emerald-100 uppercase mb-0.5">Optimal</span>
              </div>
            </div>

            {/* Stat Card 4 */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex flex-col justify-between">
              <p className="text-slate-500 text-xs font-bold tracking-wider mb-4">DAYS TO EXPIRY</p>
              <div className="flex items-end justify-between">
                <h3 className="text-3xl font-bold text-slate-800 leading-none">362</h3>
                <span className="text-slate-400 text-xs font-medium mb-1">Jan 2025</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
            
            {/* Left Column: Custody Journey */}
            <div className="xl:col-span-3 bg-white rounded-xl shadow-sm border border-slate-200 p-6 overflow-hidden">
              <div className="flex items-center gap-2 mb-8">
                <ClipboardList size={20} className="text-emerald-500" />
                <h2 className="text-lg font-bold text-slate-800">Custody Journey</h2>
              </div>

              <div className="px-2">
                <div className="relative border-l-[2px] border-slate-200 ml-3 space-y-10 pb-4">
                  {timeline.map((event, idx) => (
                    <div key={`${event.title}-${idx}`} className="relative pl-8">
                      <div className={`absolute -left-[11px] top-1 w-5 h-5 rounded-full ${idx === timeline.length - 1 ? 'bg-indigo-500' : 'bg-emerald-500'} border-[3px] border-white ring-1 ring-slate-200 shadow-sm flex items-center justify-center`}></div>
                      <div>
                        <div className="flex flex-wrap justify-between items-start gap-2 mb-1">
                          <h4 className={`font-bold text-base break-all ${idx === timeline.length - 1 ? 'text-indigo-700' : 'text-slate-800'}`}>{event.location || event.title}</h4>
                          <span className="text-xs font-medium text-slate-400 uppercase">{formatDateTime(event.time)}</span>
                        </div>
                        <p className={`text-sm mb-3 ${idx === timeline.length - 1 ? 'text-slate-500 italic' : 'text-slate-500'}`}>{event.action || event.title}</p>
                        <div className="flex flex-wrap items-start gap-2 max-w-full">
                          <span className={`inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-md border max-w-full ${idx === timeline.length - 1 ? 'text-indigo-700 bg-indigo-50 border-indigo-100' : 'text-slate-600 bg-slate-50 border-slate-200'}`}>
                            <span className="text-slate-400 mr-1 uppercase text-[10px]">Event:</span> {event.title}
                          </span>
                          <span className={`inline-flex items-start gap-1.5 text-xs font-medium px-2.5 py-1 rounded-md border max-w-full overflow-hidden ${idx === timeline.length - 1 ? 'text-indigo-700 bg-indigo-50 border-indigo-100' : 'text-slate-600 bg-slate-50 border-slate-200'}`}>
                            <span className="text-slate-400 uppercase text-[10px] shrink-0">Tx Hash:</span>
                            <span className="font-mono min-w-0 break-all leading-relaxed">{event.txHash || displayTx}</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: Product Hash Details */}
            <div className="xl:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col overflow-hidden">
              <h2 className="text-lg font-bold text-slate-800 mb-6">Product Hash Details</h2>
              
              <div className="space-y-6">
                
                <div>
                  <p className="text-[10px] font-bold text-slate-400 tracking-wider uppercase mb-2">FULL LEDGER HASH</p>
                  <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-4 text-emerald-800 font-mono text-sm break-all leading-relaxed">
                    {displayDbHash}
                  </div>
                </div>

                <div>
                  <p className="text-[10px] font-bold text-slate-400 tracking-wider uppercase mb-2">IPFS CONTENT IDENTIFIER</p>
                  <div className="font-mono text-sm text-slate-700 break-all leading-relaxed">
                    {displayRecomputed}
                  </div>
                </div>

                <div className="pt-2">
                  <div className="py-3 items-center flex justify-between border-t border-slate-100">
                    <span className="text-sm font-medium text-slate-500">Verification Status</span>
                    <div className={`flex items-center gap-1.5 font-bold text-xs uppercase ${verified ? 'text-emerald-600' : 'text-rose-600'}`}>
                      <CheckCircle2 size={16} />
                      {verified ? 'VERIFIED' : 'TAMPERED'}
                    </div>
                  </div>
                  <div className="py-3 items-center flex justify-between border-t border-slate-100">
                    <span className="text-sm font-medium text-slate-500">Expiry Date</span>
                    <span className="text-sm font-bold text-slate-800">{formattedExpiry}</span>
                  </div>
                  <div className="py-3 items-center flex justify-between border-t border-slate-100">
                    <span className="text-sm font-medium text-slate-500">Storage Class</span>
                    <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded border border-indigo-100 uppercase tracking-widest">
                      COLD CHAIN
                    </span>
                  </div>
                </div>

              </div>

              <div className="mt-8 border-t border-slate-100 pt-6">
                <p className="text-[10px] font-bold text-slate-400 tracking-wider uppercase mb-4">RECENT SCAN EVENTS</p>
                <div className="w-full">
                  <div className="grid grid-cols-3 text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 px-1">
                    <div>Location</div>
                    <div>Action</div>
                    <div className="text-right">Time</div>
                  </div>
                  <div className="space-y-3">
                    {recentEvents.map((event, idx) => (
                      <div key={`${event.action}-${idx}`} className="grid grid-cols-3 text-sm font-medium text-slate-700 items-center px-1 gap-2">
                        <div className="break-all">{event.location || 'N/A'}</div>
                        <div className="break-all">{event.action || 'N/A'}</div>
                        <div className="text-right text-slate-400 text-xs font-normal">{formatDateTime(event.time)}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

            </div>
          </div>
          
          {/* Footer */}
          <div className="text-center pt-8 pb-4">
            <p className="text-slate-400 text-xs">© 2024 PharmaChain Ledger Systems - Secured by Distributed Consensus</p>
          </div>

        </div>
      </main>
    </div>
  );
}