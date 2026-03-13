import React from 'react';
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
  { name: 'In Transit', value: 640, color: '#10b981' }, // Emerald 500
  { name: 'Warehouse', value: 420, color: '#3b82f6' }, // Blue 500
  { name: 'Flagged', value: 187, color: '#f97316' }, // Orange 500
];

export default function ManufacturerDashboard() {
  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900 overflow-hidden">
      
      {/* 
        ========================================
        SIDEBAR
        ========================================
      */}
      <aside className="w-64 bg-[#1e293b] flex flex-col text-slate-300">
        {/* Logo Area */}
        <div className="flex items-center gap-3 px-6 py-8">
          <div className="w-8 h-8 rounded bg-emerald-500 flex items-center justify-center text-white font-bold text-xl">
            P
          </div>
          <span className="text-white font-bold tracking-wide text-lg">
            PHARMACHAIN
          </span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 space-y-2">
          <a
            href="#"
            className="flex items-center gap-3 px-4 py-3 rounded-lg bg-slate-700/50 text-emerald-400 font-medium border border-slate-700/50 transition-colors"
          >
            <LayoutDashboard size={20} />
            Dashboard
          </a>
          <a
            href="#"
            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-800 hover:text-white transition-colors"
          >
            <PlusSquare size={20} />
            Register Batch
          </a>
          <a
            href="#"
            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-800 hover:text-white transition-colors"
          >
            <Layers size={20} />
            Batch List
          </a>
          <a
            href="#"
            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-800 hover:text-white transition-colors"
          >
            <FileText size={20} />
            Batch Detail
          </a>
          <a
            href="#"
            className="flex items-center justify-between px-4 py-3 rounded-lg hover:bg-slate-800 hover:text-white transition-colors"
          >
            <div className="flex items-center gap-3">
              <AlertTriangle size={20} />
              Anomaly Alerts
            </div>
            <span className="bg-orange-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
              3
            </span>
          </a>
          <a
            href="#"
            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-800 hover:text-white transition-colors"
          >
            <Zap size={20} />
            Trigger Recall
          </a>
          <a
            href="#"
            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-800 hover:text-white transition-colors"
          >
            <Download size={20} />
            Compliance Export
          </a>
        </nav>

        {/* User Profile Footer */}
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
                <p className="text-slate-400 text-xs font-mono">0xAb3c...8f1d</p>
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
            <h1 className="text-2xl font-bold text-slate-800">Dashboard Overview</h1>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-semibold border border-emerald-200">
              <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
              Live on Polygon
            </div>
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

        {/* Dashboard Content */}
        <div className="px-8 pb-8 space-y-6">
          
          {/* Info Banner */}
          <div className="bg-blue-50/80 border border-blue-100 rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3 text-blue-800 text-sm font-medium">
              <Info size={18} className="text-blue-600" />
              Network Status: Connected to Polygon Amoy Testnet. All transactions are immutable and verifiable.
            </div>
            <a href="#" className="text-blue-700 text-sm font-semibold hover:underline">
              Block Explorer
            </a>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-4 gap-6">
            
            {/* Stat Card 1 */}
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

            {/* Stat Card 2 */}
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
                {/* SVG Circle visual */}
                <div className="relative w-10 h-10">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    <path className="text-slate-100" strokeWidth="4" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                    <path className="text-emerald-500" strokeDasharray="98, 100" strokeWidth="4" strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Stat Card 3 */}
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

            {/* Stat Card 4 */}
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

          {/* Charts Row */}
          <div className="grid grid-cols-3 gap-6">
            
            {/* Chart 1: Line Chart */}
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
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.15}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#64748b', fontSize: 12 }} 
                      dy={10} 
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#64748b', fontSize: 12 }} 
                    />
                    <Tooltip 
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="registrations" 
                      stroke="#10b981" 
                      strokeWidth={2}
                      fillOpacity={1} 
                      fill="url(#colorReg)" 
                    />
                    <Line 
                      type="monotone" 
                      dataKey="scans" 
                      stroke="#3b82f6" 
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      dot={{ r: 3, fill: '#fff', strokeWidth: 2 }}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 2: Donut Chart */}
            <div className="col-span-1 bg-white rounded-xl shadow-sm border border-slate-100 p-6 flex flex-col">
              <h3 className="text-md font-bold text-slate-800 mb-2">Batch Status Distribution</h3>
              <div className="flex-1 flex flex-col justify-center items-center relative min-h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={70}
                      outerRadius={90}
                      paddingAngle={0}
                      dataKey="value"
                      stroke="none"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                {/* Center Text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center font-sans pointer-events-none mt-2">
                  <span className="text-2xl font-bold text-slate-800">1.2k</span>
                  <span className="text-[10px] font-bold text-slate-400 tracking-wider">TOTAL</span>
                </div>
              </div>
              
              {/* Custom Legend Built with HTML for Exact Spacing */}
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
      </main>
    </div>
  );
}