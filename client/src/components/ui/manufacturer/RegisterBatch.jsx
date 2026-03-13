import React, { useState } from 'react';
import {
  LineChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ComposedChart,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
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
  Package,
  ShieldCheck,
  Flame,
  QrCode,
  FileSpreadsheet,
  FileIcon,
  Factory,
  ShoppingCart
} from 'lucide-react';

// --- Mock Data ---

const chartData = [
  { name: 'Jan', registrations: 45, scans: 120 },
  { name: 'Feb', registrations: 50, scans: 190 },
  { name: 'Mar', registrations: 48, scans: 150 },
  { name: 'Apr', registrations: 60, scans: 280 },
  { name: 'May', registrations: 55, scans: 240 },
  { name: 'Jun', registrations: 65, scans: 310 },
];

const pieData = [
  { name: 'In Transit', value: 640, color: '#10b981' },
  { name: 'Warehouse', value: 420, color: '#3b82f6' },
  { name: 'Flagged', value: 187, color: '#f97316' },
];

function DashboardContent() {
  return (
    <div className="space-y-6">
      <div className="bg-blue-50/80 border border-blue-100 rounded-xl p-4 flex items-center justify-between">
        <div className="flex items-center gap-3 text-blue-800 text-sm font-medium">
          <Info size={18} className="text-blue-600" />
          Network Status: Connected to Polygon Amoy Testnet. All transactions are immutable and verifiable.
        </div>
        <a href="#" className="text-blue-700 text-sm font-semibold hover:underline">
          Block Explorer
        </a>
      </div>

      <div className="grid grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <p className="text-slate-500 text-sm font-medium">Total Batches</p>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Package size={18} />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-bold text-slate-800">1,247</h3>
            <p className="text-emerald-500 text-sm font-medium mt-1">↑ 12% from last month</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <p className="text-slate-500 text-sm font-medium">Verified (Hash Match)</p>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ShieldCheck size={18} />
            </div>
          </div>
          <div className="mt-4 flex items-end justify-between">
            <div>
              <h3 className="text-3xl font-bold text-slate-800">1,219</h3>
              <p className="text-slate-400 text-sm font-medium mt-1">98% Success Rate</p>
            </div>
            <div className="relative w-10 h-10">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path className="text-slate-100" strokeWidth="4" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                <path className="text-emerald-500" strokeDasharray="98, 100" strokeWidth="4" strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <p className="text-slate-500 text-sm font-medium">Active Alerts</p>
            <div className="w-8 h-8 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center">
              <Flame size={18} />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-bold text-orange-600">3</h3>
            <p className="text-slate-400 text-sm font-medium mt-1">Requires immediate attention</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <p className="text-slate-500 text-sm font-medium">Total QR Scans</p>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <QrCode size={18} />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-bold text-slate-800">3,891</h3>
            <p className="text-slate-400 text-sm font-medium mt-1 flex items-center gap-1">
              <span className="w-3 h-3 rounded-full border border-slate-300 grid place-items-center">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
              </span>
              82 countries tracking
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 bg-white rounded-xl shadow-sm border border-slate-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-md font-bold text-slate-800">Scan Activity vs Registrations</h3>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
                <span className="text-xs font-medium text-slate-600">Registrations</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-blue-500"></div>
                <span className="text-xs font-medium text-slate-600">Scans</span>
              </div>
            </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData} margin={{ top: 5, right: 30, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorReg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Area type="monotone" dataKey="registrations" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorReg)" />
                <Line type="monotone" dataKey="scans" stroke="#3b82f6" strokeWidth={2} strokeDasharray="5 5" dot={{ r: 3, fill: '#fff', strokeWidth: 2 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="col-span-1 bg-white rounded-xl shadow-sm border border-slate-100 p-6 flex flex-col">
          <h3 className="text-md font-bold text-slate-800 mb-2">Batch Status Distribution</h3>
          <div className="flex-1 flex flex-col justify-center items-center relative min-h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={70} outerRadius={90} paddingAngle={0} dataKey="value" stroke="none">
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center font-sans pointer-events-none mt-2">
              <span className="text-2xl font-bold text-slate-800">1.2k</span>
              <span className="text-[10px] font-bold text-slate-400 tracking-wider">TOTAL</span>
            </div>
          </div>

          <div className="mt-4 space-y-3">
            {pieData.map((item, index) => (
              <div key={index} className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }}></div>
                  <span className="text-slate-600 font-medium">{item.name}</span>
                </div>
                <span className="font-bold text-slate-800">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function RegisterBatchContent() {
  return (
    <div className="max-w-4xl max-w-[1000px] mx-auto space-y-6 mt-2">
      <h2 className="text-3xl font-bold text-slate-800">Register Batch</h2>

      {/* Info Banner */}
      <div className="info-banner flex items-center gap-3">
        <Info size={18} style={{ color: "var(--blue)", flexShrink: 0 }} />
        <p className="text-sm font-medium">New batch will be registered on Polygon blockchain for immutable tracking.</p>
      </div>

      {/* Stepper */}
      <div className="flex items-center justify-between py-2 px-1 mb-2">
        <div className="flex items-center gap-3">
          <div className="step-done">✓</div>
          <span className="text-sm font-semibold" style={{ color: "var(--green-dim)" }}>Drug Details</span>
        </div>
        <div className="flex-1 h-[2px] mx-4" style={{ background: "var(--green)" }}></div>

        <div className="flex items-center gap-3">
          <div className="step-pending">2</div>
          <span className="text-sm font-medium" style={{ color: "var(--text3)" }}>Supply Chain</span>
        </div>
        <div className="flex-1 h-[2px] mx-4" style={{ background: "var(--border)" }}></div>

        <div className="flex items-center gap-3">
          <div className="step-pending">3</div>
          <span className="text-sm font-medium" style={{ color: "var(--text3)" }}>Review & Register</span>
        </div>
      </div>

      {/* Step 1 Card */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
        <h3 className="text-lg font-bold text-slate-800 mb-6">Step 1: Drug & Batch Information</h3>

        <div className="grid grid-cols-2 gap-x-8 gap-y-6">
          <div className="space-y-1.5 flex flex-col">
            <label className="text-sm font-medium text-slate-700">Drug Name</label>
            <input type="text" placeholder="e.g. Paracetamol BP 500mg" className="ps-input" />
          </div>

          <div className="space-y-1.5 flex flex-col">
            <label className="text-sm font-medium text-slate-700">Batch Number</label>
            <input type="text" defaultValue="BCH-2023-0891" className="ps-input" />
          </div>

          <div className="space-y-1.5 flex flex-col">
            <label className="text-sm font-medium text-slate-700">Manufacturing License</label>
            <input type="text" defaultValue="ML/2022/TX-90" className="ps-input" />
          </div>

          <div className="space-y-1.5 flex flex-col">
            <label className="text-sm font-medium text-slate-700">Category</label>
            <select className="ps-input">
              <option>Analgesics</option>
              <option>Antibiotics</option>
              <option>Vaccines</option>
            </select>
          </div>

          <div className="space-y-1.5 flex flex-col">
            <label className="text-sm font-medium text-slate-700">Manufacturing Date</label>
            <input type="date" className="ps-input" />
          </div>

          <div className="space-y-1.5 flex flex-col">
            <label className="text-sm font-medium text-slate-700">Expiry Date</label>
            <input type="date" className="ps-input" />
          </div>

          <div className="space-y-1.5 flex flex-col">
            <label className="text-sm font-medium text-slate-700">Quantity (Units)</label>
            <input type="number" defaultValue="50000" className="ps-input" />
          </div>

          <div className="space-y-1.5 flex flex-col">
            <label className="text-sm font-medium text-slate-700">Storage Conditions</label>
            <input type="text" defaultValue="2°C to 8°C. Dry place" className="ps-input" />
          </div>

          <div className="col-span-2 space-y-1.5 flex flex-col pt-2">
            <label className="text-sm font-medium text-slate-700">Active Ingredients</label>
            <textarea placeholder="List ingredients and concentrations..." className="ps-input" style={{ height: "6rem", resize: "none" }}></textarea>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between">
          <button className="btn-secondary px-5 py-2.5">
            Generate Hash
          </button>
          <button className="btn-primary px-6 py-2.5">
            Next: Supply Chain
          </button>
        </div>
      </div>

      {/* Step 2 Card */}
      <div className="bg-slate-50 rounded-xl border border-slate-200 p-8 shadow-sm">
        <h3 className="text-lg font-bold text-slate-800 mb-6">Step 2: Supply Chain Configuration</h3>

        <div className="py-8 relative">
          <div className="absolute left-[15%] right-[15%] h-[2px] bg-slate-200 top-1/2 -translate-y-1/2 z-0"></div>

          <div className="flex items-center justify-between relative z-10 px-8">
            <div className="bg-white border border-emerald-500 shadow-sm rounded-xl py-6 px-4 flex flex-col items-center w-40 text-center">
              <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
                <Factory size={18} />
              </div>
              <span className="font-bold text-slate-800 text-sm">Factory</span>
              <span className="text-xs text-slate-500 mt-1">Apex Pharma Ind.</span>
            </div>

            <div className="bg-white border border-slate-200 shadow-sm rounded-xl py-6 px-4 flex flex-col items-center w-40 text-center">
              <div className="w-10 h-10 rounded-full bg-slate-50 text-slate-400 flex items-center justify-center mb-3">
                <Package size={18} />
              </div>
              <span className="font-bold text-slate-800 text-sm">Warehouse</span>
              <span className="text-xs text-slate-500 mt-1">Global Logistics Hub</span>
            </div>

            <div className="bg-white border border-slate-200 shadow-sm rounded-xl py-6 px-4 flex flex-col items-center w-40 text-center">
              <div className="w-10 h-10 rounded-full bg-slate-50 text-slate-400 flex items-center justify-center mb-3">
                <ShoppingCart size={18} />
              </div>
              <span className="font-bold text-slate-800 text-sm">Pharmacy</span>
              <span className="text-xs text-slate-500 mt-1">MediCare Retail</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-[#f1f5f9] border border-slate-200 text-slate-500 flex items-center justify-center py-4 rounded-xl text-sm italic font-medium mb-10 shadow-sm text-center">
        Complete Step 1 and 2 to Review & Register
      </div>

    </div>
  );
}

export default function RegisterBatch() {
  const [activeTab, setActiveTab] = useState('register');

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "var(--bg)", fontFamily: "'Inter', system-ui, sans-serif", color: "var(--text2)" }}>

      {/* SIDEBAR */}
      <aside className="w-64 flex flex-col" style={{ background: "var(--sidebar)", color: "var(--side-mute)" }}>
        <div className="flex items-center gap-3 px-6 py-8" style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
          <div className="w-8 h-8 rounded flex items-center justify-center text-white font-bold text-xl" style={{ background: "var(--green)" }}>
            P
          </div>
          <span className="font-bold tracking-wide text-lg" style={{ color: "var(--side-text)" }}>
            PHARMACHAIN
          </span>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          <button
            onClick={() => setActiveTab('dashboard')}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors"
            style={{
              background: activeTab === 'dashboard' ? 'rgba(34,197,94,0.15)' : 'transparent',
              color:      activeTab === 'dashboard' ? 'var(--green)'          : 'var(--side-mute)',
            }}
          >
            <LayoutDashboard size={20} />
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('register')}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors"
            style={{
              background: activeTab === 'register' ? 'rgba(34,197,94,0.15)' : 'transparent',
              color:      activeTab === 'register' ? 'var(--green)'        : 'var(--side-mute)',
            }}
          >
            <PlusSquare size={20} />
            Register Batch
          </button>

          <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-lg transition-colors" style={{ color: "var(--side-mute)" }}>
            <Layers size={20} />
            Batch List
          </a>
          <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-lg transition-colors" style={{ color: "var(--side-mute)" }}>
            <FileText size={20} />
            Batch Detail
          </a>
          <a href="#" className="flex items-center justify-between px-4 py-3 rounded-lg transition-colors" style={{ color: "var(--side-mute)" }}>
            <div className="flex items-center gap-3">
              <AlertTriangle size={20} />
              Anomaly Alerts
            </div>
            <span className="text-white text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: "var(--amber)" }}>3</span>
          </a>
          <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-lg transition-colors" style={{ color: "var(--side-mute)" }}>
            <Zap size={20} />
            Trigger Recall
          </a>
          <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-lg transition-colors" style={{ color: "var(--side-mute)" }}>
            <Download size={20} />
            Compliance Export
          </a>
        </nav>

        <div className="p-4" style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
          <div className="flex items-center justify-between cursor-pointer p-2 rounded-lg transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full overflow-hidden" style={{ border: "2px solid rgba(34,197,94,0.4)" }}>
                <img src="https://i.pravatar.cc/150?img=11" alt="Profile" className="w-full h-full object-cover" />
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold" style={{ color: "var(--side-text)" }}>Sun Pharma Ltd</p>
                <p className="text-xs" style={{ fontFamily: "monospace", color: "var(--side-mute)" }}>0xAb3c...8f1d</p>
              </div>
            </div>
            <Settings size={18} style={{ color: "var(--side-mute)" }} />
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col overflow-y-auto">
        <header className="flex items-center justify-between px-8 py-6 sticky top-0 z-20" style={{ background: "var(--surface)", borderBottom: "1px solid var(--border)", boxShadow: "var(--shadow-card)" }}>
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-slate-800">Register Batch</h1>
            <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold"
              style={{ background: "var(--green-bg)", color: "var(--green-dim)", border: "1px solid var(--green-bdr)" }}>
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "var(--green)" }} />
              Live on Polygon
            </span>
          </div>

          <div className="flex items-center gap-4">
            <select className="bg-white border border-slate-200 text-slate-600 text-sm rounded-lg px-4 py-2 outline-none shadow-sm focus:ring-2 focus:ring-emerald-500">
              <option>All Batches</option>
              <option>In Transit</option>
              <option>Warehouse</option>
            </select>
            <select className="bg-white border border-slate-200 text-slate-600 text-sm rounded-lg px-4 py-2 outline-none shadow-sm focus:ring-2 focus:ring-emerald-500">
              <option>2024-25</option>
              <option>2023-24</option>
            </select>

            <button className="flex items-center gap-2 bg-white border border-slate-200 shadow-sm text-slate-600 text-sm font-medium px-4 py-2 rounded-lg hover:bg-slate-50 transition-colors">
              <FileSpreadsheet size={16} className="text-emerald-500" />
              CSV
            </button>
            <button className="flex items-center gap-2 bg-white border border-slate-200 shadow-sm text-slate-600 text-sm font-medium px-4 py-2 rounded-lg hover:bg-slate-50 transition-colors">
              <FileIcon size={16} className="text-red-500" />
              PDF
            </button>
          </div>
        </header>

        <div className="px-8 pb-8 pt-6 relative min-h-0 flex-1 overflow-auto">
          {activeTab === 'dashboard' && <DashboardContent />}
          {activeTab === 'register' && <RegisterBatchContent />}
        </div>
      </main>
    </div>
  );
}