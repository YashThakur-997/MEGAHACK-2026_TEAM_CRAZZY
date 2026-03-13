import React from 'react';
import { useNavigate } from 'react-router-dom';
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
  AlertCircle
} from 'lucide-react';

export default function AnomalyAlerts() {
  const navigate = useNavigate();

  return (
    <div className="flex h-screen bg-[#1e2330] font-sans overflow-hidden">
      {/* SIDEBAR */}
      <aside className="w-[260px] bg-[#1e293b] flex flex-col text-slate-300 flex-shrink-0 z-20">
        <div className="flex items-center gap-3 px-6 py-8">
          <div className="w-8 h-8 rounded bg-emerald-500 flex items-center justify-center text-white font-bold text-xl">
            P
          </div>
          <span className="text-white font-bold tracking-wide text-lg">
            Praman Chain
          </span>
        </div>

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
            <span className="bg-orange-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">3</span>
          </button>
          <button
            onClick={() => navigate('/manufacturer/trigger-recall')}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-800 hover:text-white transition-colors"
          >
            <Zap size={20} />
            Trigger Recall
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
              <span className="text-slate-200">3 active alerts</span>
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
              <p className="text-3xl font-bold text-red-600">3</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Duplicate Hash</h3>
              <p className="text-3xl font-bold text-slate-800">1</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Geo Breach</h3>
              <p className="text-3xl font-bold text-slate-800">1</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Temp Breach</h3>
              <p className="text-3xl font-bold text-slate-800">1</p>
            </div>
          </div>

          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-slate-800">Active Anomaly Alerts</h2>
            <button className="text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors">
              Refresh Feed
            </button>
          </div>

          {/* ALERTS LIST */}
          <div className="space-y-4 flex-1">
            {/* Alert 1 */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-3">
                  <span className="bg-red-100 text-red-700 text-xs font-bold px-2.5 py-1 rounded">
                    HIGH RISK
                  </span>
                  <span className="text-slate-400 text-sm font-medium font-mono">
                    ID: PC-8521-X
                  </span>
                </div>
                <span className="text-sm text-slate-400">2h ago</span>
              </div>
              <div className="flex justify-between items-end mt-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Duplicate Hash Detected: Metformin 500mg</h3>
                  <p className="text-slate-600 mt-1 max-w-2xl">
                    Critical security anomaly: simultaneous scans reported in Kolkata and Mumbai for the s...
                  </p>
                </div>
                <div className="flex gap-3">
                  <button className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded-lg transition-colors">
                    Freeze Passport
                  </button>
                  <button className="px-4 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-sm font-medium rounded-lg transition-colors">
                    Investigate
                  </button>
                </div>
              </div>
            </div>

            {/* Alert 2 */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-3">
                  <span className="bg-orange-100 text-orange-700 text-xs font-bold px-2.5 py-1 rounded">
                    WARNING
                  </span>
                  <span className="text-slate-400 text-sm font-medium font-mono">
                    ID: PC-4490-G
                  </span>
                </div>
                <span className="text-sm text-slate-400">3h ago</span>
              </div>
              <div className="flex justify-between items-end mt-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Geo Breach: Amoxicillin 250mg</h3>
                  <p className="text-slate-600 mt-1 max-w-2xl">
                    Shipment detected <span className="text-red-500 font-medium">847km</span> outside the approved logistics corridor. Possible unauthorized...
                  </p>
                </div>
                <div className="flex gap-3">
                  <button className="px-4 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-sm font-medium rounded-lg transition-colors">
                    View Route
                  </button>
                  <button className="px-4 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-sm font-medium rounded-lg transition-colors">
                    Mark Safe
                  </button>
                </div>
              </div>
            </div>

            {/* Alert 3 */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-3">
                  <span className="bg-orange-100 text-orange-700 text-xs font-bold px-2.5 py-1 rounded">
                    WARNING
                  </span>
                  <span className="text-slate-400 text-sm font-medium font-mono">
                    ID: PC-1102-T
                  </span>
                </div>
                <span className="text-sm text-slate-400">4h ago</span>
              </div>
              <div className="flex justify-between items-end mt-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Temperature Breach: Azithromycin 500mg</h3>
                  <p className="text-slate-600 mt-1 max-w-2xl">
                    Cold chain integrity compromised. Current reading: <span className="text-red-500 font-medium">9.4°C</span> (Threshold maximum: 8°C).
                  </p>
                </div>
                <div className="flex gap-3">
                  <button className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium rounded-lg transition-colors">
                    Mark Safe
                  </button>
                  <button className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-lg transition-colors">
                    Invalidate
                  </button>
                </div>
              </div>
            </div>

            {/* Alert 4 */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-3">
                  <span className="bg-purple-100 text-purple-700 text-xs font-bold px-2.5 py-1 rounded">
                    FULFILLED REQUEST
                  </span>
                  <span className="text-slate-400 text-sm font-medium font-mono">
                    ID: F-REQ-001
                  </span>
                </div>
                <span className="text-sm text-slate-400">5h ago</span>
              </div>
              <div className="flex justify-between items-end mt-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">just add the contain in the white panel in to the previous response</h3>
                  <p className="text-slate-600 mt-1 max-w-2xl flex items-center gap-1">
                    📝 Verification: Verbatim manual inclusion of user input into dashboard view. 📲.
                  </p>
                </div>
                <div className="flex gap-3">
                  <button className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-lg transition-colors border border-slate-200">
                    Acknowledge
                  </button>
                  <button className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-lg transition-colors border border-slate-200">
                    Mark as Fulfilled
                  </button>
                </div>
              </div>
            </div>
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
