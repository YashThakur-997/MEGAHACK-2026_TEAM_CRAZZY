import React, { useState } from 'react';
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
  Info,
  Megaphone,
  User,
  FlaskConical,
  ChevronDown
} from 'lucide-react';

const batches = [
  { id: '#BTCH-2024-001', name: 'Paracetamol', dosage: '500mg', mfg: '12 Oct 2023', exp: '12 Oct 2025', status: 'Verified', scans: 452, location: ['Berlin', 'Logistics Hub'] },
  { id: '#BTCH-2024-002', name: 'Amoxicillin', dosage: '250mg', mfg: '15 Nov 2023', exp: '15 Nov 2024', status: 'Verified', scans: 218, location: ['Paris', 'Distribution'] },
  { id: '#BTCH-2024-003', name: 'Metformin', dosage: '500mg', mfg: '02 Dec 2023', exp: '02 Dec 2026', status: 'Flagged', scans: 89, location: ['London Port', '(Audit)'] },
  { id: '#BTCH-2024-005', name: 'Lisinopril', dosage: '10mg', mfg: '15 Feb 2021', exp: '10 Jan 2024', status: 'Expired', scans: 312, location: ['Munich', 'Warehouse'] },
  { id: '#BTCH-2024-006', name: 'Atorvastatin', dosage: '20mg', mfg: '20 Mar 2024', exp: '20 Mar 2024', status: 'Verified', scans: 45, location: ['Madrid', 'Logistics'] },
  { id: '#BTCH-2024-007', name: 'Omeprazole', dosage: '20mg', mfg: '05 Apr 2024', exp: '05 Apr 2027', status: 'Verified', scans: 23, location: ['Vienna', 'HQ'] },
  { id: '#BTCH-2024-008', name: 'Salbutamol', dosage: 'Inhaler', mfg: '12 Apr 2024', exp: '12 Apr 2026', status: 'Verified', scans: 12, location: ['Amsterdam', 'Airport'] },
];

const initialRecalls = [
  { id: "BTC-88210", product: "Cough Syrup", dosage: "MaxStrength", status: "ACTIVE", reason: "Temperature Excursion", notified: 412, total: 412 },
  { id: "BTC-77102", product: "Vitamin C Complex", dosage: "", status: "RESOLVED", reason: "Labeling Error", notified: 825, total: 838, closedDate: "Oct 12, 2023" }
];

export default function TriggerRecall() {
  const navigate = useNavigate();
  const [recalls, setRecalls] = useState(initialRecalls);
  const [selectedBatch, setSelectedBatch] = useState("");
  const [reason, setReason] = useState("");
  const [severity, setSeverity] = useState("Critical (Class I)");
  const [instructions, setInstructions] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  const handleBroadcast = () => {
    if (!selectedBatch || !reason) {
      alert("Please select a batch and a reason.");
      return;
    }

    const batchDetails = batches.find(b => b.id === selectedBatch);
    const newRecall = {
      id: selectedBatch,
      product: batchDetails ? batchDetails.name : "Unknown Product",
      dosage: batchDetails ? batchDetails.dosage : "",
      status: "ACTIVE",
      reason: reason,
      notified: 0,
      total: batchDetails ? batchDetails.scans : 0,
    };

    setRecalls([newRecall, ...recalls]);
    setShowSuccess(true);
    
    // Clear form
    setSelectedBatch("");
    setReason("");
    setInstructions("");
    
    setTimeout(() => setShowSuccess(false), 5000);
  };

  return (
    <div className="flex h-screen bg-[#f8fafc] font-sans text-slate-900 overflow-hidden">

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
          <button onClick={() => navigate('/manufacturer/anomaly-alerts')} className="w-full flex items-center justify-between px-4 py-3 rounded-lg hover:bg-slate-800 hover:text-white transition-colors">
            <div className="flex items-center gap-3">
              <AlertTriangle size={20} />
              Anomaly Alerts
            </div>
            <span className="bg-orange-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">3</span>
          </button>
          <button onClick={() => navigate('/manufacturer/trigger-recall')} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors bg-slate-700/50 text-emerald-400 font-medium border border-slate-700/50">
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
      <main className="flex-1 overflow-y-auto bg-slate-50 flex flex-col relative z-10 w-full">
        <div className="w-full max-w-6xl mx-auto pt-6 px-8 pb-8 flex-1 flex flex-col">

          <h1 className="text-3xl font-bold text-slate-900 mb-6 tracking-tight">Trigger Recall</h1>

          {/* ALERT BOX */}
          {showSuccess ? (
            <div className="bg-emerald-50/80 border border-emerald-200 rounded-lg p-4 flex items-center gap-3 text-emerald-800 text-sm font-medium mb-8">
              <div className="w-5 h-5 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0 border border-emerald-200">
                <svg viewBox="0 0 24 24" className="w-3 h-3 text-emerald-600 fill-current">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                </svg>
              </div>
              Recall broadcasted successfully to all nodes. Patients are being notified.
            </div>
          ) : (
            <div className="bg-blue-50/80 border border-blue-100 rounded-lg p-4 flex items-center gap-3 text-blue-800 text-sm font-medium mb-8">
              <Info size={18} className="text-blue-600" />
              Recall broadcasts reach all registered scan wallets instantly via blockchain synchronization.
            </div>
          )}

          {/* STATS */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col">
              <span className="text-[11px] font-bold text-slate-500 tracking-wider mb-2">RECALLS ISSUED</span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-slate-800">2</span>
                <span className="text-sm text-slate-500 font-medium">Active cases</span>
              </div>
            </div>
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col">
              <span className="text-[11px] font-bold text-slate-500 tracking-wider mb-2">PATIENTS NOTIFIED</span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-slate-800">1,240</span>
                <span className="text-sm text-emerald-500 font-medium">100% coverage</span>
              </div>
            </div>
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col">
              <span className="text-[11px] font-bold text-slate-500 tracking-wider mb-2">BATCHES RECALLED</span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-slate-800">2</span>
                <span className="text-sm text-slate-500 font-medium">Total impact</span>
              </div>
            </div>
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col">
              <span className="text-[11px] font-bold text-slate-500 tracking-wider mb-2">AVG NOTIFICATION TIME</span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-slate-800">4.2 sec</span>
                <span className="text-sm text-slate-400 font-medium">Real-time</span>
              </div>
            </div>
          </div>

          {/* MAIN PANELS */}
          <div className="flex flex-col lg:flex-row gap-8 flex-1">
            {/* LEFT PANEL */}
            <div className="flex-[3] bg-white rounded-2xl border border-slate-200 shadow-sm p-8 pb-10">
              <h2 className="text-xl font-bold text-slate-800 mb-1 tracking-tight">Issue New Recall</h2>
              <p className="text-slate-500 text-sm mb-8">Initiate a cryptographically signed recall event.</p>

              <div className="flex gap-4 mb-6">
                <div className="flex-1">
                  <label className="block text-sm font-bold text-slate-700 mb-2">Affected Batch</label>
                  <div className="relative">
                    <select 
                      value={selectedBatch}
                      onChange={(e) => setSelectedBatch(e.target.value)}
                      className="w-full appearance-none bg-white border border-slate-300 rounded-lg px-4 py-3 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select Batch ID</option>
                      {batches.map(batch => (
                        <option key={batch.id} value={batch.id}>{batch.id} - {batch.name}</option>
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
                      <option value="Contamination detected">Contamination detected</option>
                      <option value="Temperature Excursion">Temperature Excursion</option>
                      <option value="Labeling Error">Labeling Error</option>
                      <option value="Quality Test Failed">Quality Test Failed</option>
                    </select>
                    <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-bold text-slate-700 mb-3">Recall Severity</label>
                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2 cursor-pointer group" onClick={() => setSeverity('Critical (Class I)')}>
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${severity === 'Critical (Class I)' ? 'border-red-600' : 'border-slate-300 group-hover:border-slate-400'}`}>
                      {severity === 'Critical (Class I)' && <div className="w-2 h-2 rounded-full bg-red-600"></div>}
                    </div>
                    <span className={`text-sm font-medium ${severity === 'Critical (Class I)' ? 'text-slate-900' : 'text-slate-500 group-hover:text-slate-700'}`}>Critical (Class I)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer group" onClick={() => setSeverity('High (Class II)')}>
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${severity === 'High (Class II)' ? 'border-red-600' : 'border-slate-300 group-hover:border-slate-400'}`}>
                      {severity === 'High (Class II)' && <div className="w-2 h-2 rounded-full bg-red-600"></div>}
                    </div>
                    <span className={`text-sm font-medium ${severity === 'High (Class II)' ? 'text-slate-900' : 'text-slate-500 group-hover:text-slate-700'}`}>High (Class II)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer group" onClick={() => setSeverity('Standard (Class III)')}>
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${severity === 'Standard (Class III)' ? 'border-red-600' : 'border-slate-300 group-hover:border-slate-400'}`}>
                      {severity === 'Standard (Class III)' && <div className="w-2 h-2 rounded-full bg-red-600"></div>}
                    </div>
                    <span className={`text-sm font-medium ${severity === 'Standard (Class III)' ? 'text-slate-900' : 'text-slate-500 group-hover:text-slate-700'}`}>Standard (Class III)</span>
                  </label>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-bold text-slate-700 mb-2">Patient Instructions & Message</label>
                <textarea
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  rows={4}
                  placeholder="Please provide detailed instructions for patients holding this medication..."
                  className="w-full bg-white border border-slate-300 rounded-lg px-4 py-3 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none placeholder-slate-400"
                ></textarea>
              </div>

              <div className="mb-8">
                <label className="block text-sm font-bold text-slate-700 mb-3">Notify via Channels</label>
                <div className="flex gap-4">
                  <label className="flex-1 flex items-center gap-3 border border-red-600 bg-red-50/50 rounded-lg p-3 cursor-pointer">
                    <div className="w-4 h-4 bg-red-600 rounded border border-red-700 flex items-center justify-center text-white">
                      <svg viewBox="0 0 24 24" className="w-3 h-3 fill-current">
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                      </svg>
                    </div>
                    <span className="text-sm font-medium text-slate-800">Wallet App</span>
                  </label>
                  <label className="flex-1 flex items-center gap-3 border border-red-600 bg-red-50/50 rounded-lg p-3 cursor-pointer">
                    <div className="w-4 h-4 bg-red-600 rounded border border-red-700 flex items-center justify-center text-white">
                      <svg viewBox="0 0 24 24" className="w-3 h-3 fill-current">
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                      </svg>
                    </div>
                    <span className="text-sm font-medium text-slate-800">SMS Alert</span>
                  </label>
                  <label className="flex-1 flex items-center gap-3 border border-slate-200 hover:border-slate-300 rounded-lg p-3 cursor-pointer transition-colors bg-white">
                    <div className="w-4 h-4 border border-slate-300 rounded bg-white"></div>
                    <span className="text-sm text-slate-600">API Hook</span>
                  </label>
                </div>
              </div>

              <button 
                onClick={handleBroadcast}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-xl shadow-[0_4px_14px_rgba(220,38,38,0.4)] transition-all flex items-center justify-center gap-3 text-lg mb-4"
              >
                <Megaphone size={22} className="fill-current text-white/20" />
                Broadcast Recall on Blockchain
              </button>

              <p className="text-center text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                IMMUTABLE ACTION: THIS CANNOT BE UNDONE
              </p>
            </div>

            {/* RIGHT PANEL */}
            <div className="flex-[2] bg-slate-50/50 border border-transparent flex flex-col items-center">
              <div className="w-full bg-white rounded-2xl border border-slate-200 shadow-sm p-6 relative flex flex-col h-full">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-bold text-slate-800">Previous Recalls</h3>
                  <button className="text-xs font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded transition-colors">
                    LOGS
                  </button>
                </div>

                <div className="space-y-4 flex-1">
                  {recalls.map((recall, index) => (
                    <div key={index} className={`border rounded-xl p-5 relative overflow-hidden ${recall.status === 'ACTIVE' ? 'bg-red-50/50 border-red-100' : 'bg-white border-slate-200'}`}>
                      {recall.status === 'ACTIVE' && (
                        <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-transparent to-red-100/50 rounded-bl-full pointer-events-none"></div>
                      )}
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-bold text-slate-800 text-base">{recall.product} {recall.dosage && <span className="text-slate-500 font-medium text-sm">({recall.dosage})</span>}</h4>
                        <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full ${recall.status === 'ACTIVE' ? 'bg-red-100 border border-red-200' : 'bg-emerald-50 border border-emerald-100'}`}>
                          {recall.status === 'ACTIVE' && <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></div>}
                          <span className={`text-[10px] font-bold tracking-wide ${recall.status === 'ACTIVE' ? 'text-red-600' : 'text-emerald-600'}`}>{recall.status}</span>
                        </div>
                      </div>
                      <p className="text-xs text-slate-500 mb-4 font-mono">Batch: {recall.id}</p>

                      <div className="flex justify-between items-center text-sm mb-2">
                        <span className="text-slate-500">Reason:</span>
                        <span className="font-medium text-slate-800">{recall.reason}</span>
                      </div>
                      <div className={`flex justify-between items-center text-sm ${recall.status === 'ACTIVE' ? 'mb-3' : 'mb-2'}`}>
                        <span className="text-slate-500">Patients Notified:</span>
                        <span className={`font-medium ${recall.status === 'ACTIVE' ? 'font-bold' : ''} text-slate-800`}>{recall.notified} / {recall.total}</span>
                      </div>

                      {recall.status === 'ACTIVE' && (
                        <div className="w-full h-1.5 bg-red-200 rounded-full overflow-hidden">
                          <div className="h-full bg-red-600 rounded-full w-full"></div>
                        </div>
                      )}

                      {recall.status === 'RESOLVED' && recall.closedDate && (
                        <div className="flex justify-between items-center text-sm mb-5">
                          <span className="text-slate-500">Closed Date:</span>
                          <span className="font-medium text-slate-800">{recall.closedDate}</span>
                        </div>
                      )}

                      {recall.status === 'RESOLVED' && (
                        <button className="w-full py-2.5 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-800 transition-colors">
                          View Full Audit Report
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                <div className="mt-8 text-center pb-2">
                  <button className="text-sm font-bold text-red-600 hover:text-red-700 transition-colors">
                    Download Historical Recall Log (CSV)
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center pt-8 text-slate-400 text-xs">
            © 2023 PharmaChain Technologies. All Recall events are recorded on the Ethereum Layer 2 Network.
          </div>
        </div>
      </main>

    </div>
  );
}
