import React from 'react';
import { Link } from 'react-router-dom';
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
  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900 overflow-hidden">
      
      {/* 
        ========================================
        SIDEBAR
        ========================================
      */}
      <aside className="w-64 bg-[#1e293b] flex flex-col text-slate-300">
        <div className="flex items-center gap-3 px-6 py-8">
          <div className="w-8 h-8 rounded bg-emerald-500 flex items-center justify-center text-white font-bold text-xl">
            P
          </div>
          <span className="text-white font-bold tracking-wide text-lg">
            Praman Chain
          </span>
        </div>

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
          <a
            href="#"
            className="flex items-center gap-3 px-4 py-3 rounded-lg bg-slate-700/50 text-emerald-400 font-medium border border-slate-700/50 transition-colors"
          >
            <FileText size={20} />
            Batch Detail
          </a>
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
              Viewing BATCH-2024-447 • Paracetamol 500mg
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-4 gap-4">
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

          <div className="grid grid-cols-5 gap-6">
            
            {/* Left Column: Custody Journey */}
            <div className="col-span-3 bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center gap-2 mb-8">
                <ClipboardList size={20} className="text-emerald-500" />
                <h2 className="text-lg font-bold text-slate-800">Custody Journey</h2>
              </div>

              <div className="px-2">
                <div className="relative border-l-[2px] border-slate-200 ml-3 space-y-10 pb-4">
                  
                  {/* Step 1 */}
                  <div className="relative pl-8">
                    <div className="absolute -left-[11px] top-1 w-5 h-5 rounded-full bg-emerald-500 border-[3px] border-white ring-1 ring-slate-200 shadow-sm flex items-center justify-center"></div>
                    <div>
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="font-bold text-slate-800 text-base">PharmaMfg Industrial Unit</h4>
                        <span className="text-xs font-medium text-slate-400 uppercase">2024-01-15 08:39 UTC</span>
                      </div>
                      <p className="text-sm text-slate-500 mb-3">Batch Production & Packaging Complete</p>
                      <div className="flex items-center gap-3">
                        <span className="inline-flex items-center text-xs font-medium text-slate-600 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200">
                          <span className="text-slate-400 mr-1 uppercase text-[10px]">Temp:</span> 2.8°C
                        </span>
                        <span className="inline-flex items-center text-xs font-medium text-slate-600 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200">
                          <span className="text-slate-400 mr-1 uppercase text-[10px]">Tx Hash:</span> <span className="font-mono">0x9f32b...7e21</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div className="relative pl-8">
                    <div className="absolute -left-[11px] top-1 w-5 h-5 rounded-full bg-emerald-500 border-[3px] border-white ring-1 ring-slate-200 shadow-sm flex items-center justify-center"></div>
                    <div>
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="font-bold text-slate-800 text-base">Regional Distribution Center</h4>
                        <span className="text-xs font-medium text-slate-400 uppercase">2024-01-18 14:15 UTC</span>
                      </div>
                      <p className="text-sm text-slate-500 mb-3">In-transit inspection successful. Storage initiated.</p>
                      <div className="flex items-center gap-3">
                        <span className="inline-flex items-center text-xs font-medium text-slate-600 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200">
                          <span className="text-slate-400 mr-1 uppercase text-[10px]">Temp:</span> 3.0°C
                        </span>
                        <span className="inline-flex items-center text-xs font-medium text-slate-600 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200">
                          <span className="text-slate-400 mr-1 uppercase text-[10px]">Tx Hash:</span> <span className="font-mono">0x4a2e1...8fbb</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Step 3 */}
                  <div className="relative pl-8">
                    <div className="absolute -left-[11px] top-1 w-5 h-5 rounded-full bg-indigo-500 border-[3px] border-white ring-1 ring-slate-200 shadow-sm flex items-center justify-center"></div>
                    <div>
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="font-bold text-indigo-700 text-base">HealthPlus Pharmacy</h4>
                        <span className="text-xs font-medium text-slate-400 uppercase">2024-01-28 09:45 UTC</span>
                      </div>
                      <p className="text-sm text-slate-500 italic mb-3">Currently Available for Prescription</p>
                      <div className="flex items-center gap-3">
                        <span className="inline-flex items-center text-xs font-medium text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-md border border-indigo-100">
                          <span className="text-indigo-400 mr-1 uppercase text-[10px]">Temp:</span> 3.2°C
                        </span>
                        <span className="inline-flex items-center text-xs font-medium text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-md border border-indigo-100">
                          <span className="text-indigo-400 mr-1 uppercase text-[10px]">Tx Hash:</span> <span className="font-mono">0xec211...33d2</span>
                        </span>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            </div>

            {/* Right Column: Product Hash Details */}
            <div className="col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col">
              <h2 className="text-lg font-bold text-slate-800 mb-6">Product Hash Details</h2>
              
              <div className="space-y-6">
                
                <div>
                  <p className="text-[10px] font-bold text-slate-400 tracking-wider uppercase mb-2">FULL LEDGER HASH</p>
                  <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-4 text-emerald-800 font-mono text-sm break-all leading-relaxed">
                    7f83b1657ff1fc53b82dc18148a1d65dfc2d4b1fa3d677284addd208126d9869
                  </div>
                </div>

                <div>
                  <p className="text-[10px] font-bold text-slate-400 tracking-wider uppercase mb-2">IPFS CONTENT IDENTIFIER</p>
                  <div className="font-mono text-sm text-slate-700">
                    QmXoyp...3nK7v
                  </div>
                </div>

                <div className="pt-2">
                  <div className="py-3 items-center flex justify-between border-t border-slate-100">
                    <span className="text-sm font-medium text-slate-500">Verification Status</span>
                    <div className="flex items-center gap-1.5 text-emerald-600 font-bold text-xs uppercase">
                      <CheckCircle2 size={16} />
                      VERIFIED
                    </div>
                  </div>
                  <div className="py-3 items-center flex justify-between border-t border-slate-100">
                    <span className="text-sm font-medium text-slate-500">Expiry Date</span>
                    <span className="text-sm font-bold text-slate-800">2023-01-14</span>
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
                    <div className="grid grid-cols-3 text-sm font-medium text-slate-700 items-center px-1">
                      <div>HP-NYC-01</div>
                      <div>Stock Entry</div>
                      <div className="text-right text-slate-400 text-xs font-normal">2m ago</div>
                    </div>
                    <div className="grid grid-cols-3 text-sm font-medium text-slate-700 items-center px-1">
                      <div>HP-NYC-01</div>
                      <div>Audit Check</div>
                      <div className="text-right text-slate-400 text-xs font-normal">1h ago</div>
                    </div>
                    <div className="grid grid-cols-3 text-sm font-medium text-slate-700 items-center px-1">
                      <div>WH-NJ-04</div>
                      <div>Handover</div>
                      <div className="text-right text-slate-400 text-xs font-normal">12h ago</div>
                    </div>
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