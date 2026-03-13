import { useState } from "react";

// ─── DATA ────────────────────────────────────────────────────────────────────
const SCANS = [
  { id: "BT-0984-MH", drug: "Amoxicillin 500mg", mfr: "Sun Pharma", qty: 240, score: 4, status: "verified", time: "09:14", loc: "Mumbai Warehouse" },
  { id: "BT-0981-MH", drug: "Metformin 1000mg", mfr: "Cipla", qty: 120, score: 62, status: "anomaly", time: "08:52", loc: "Mumbai Warehouse" },
  { id: "BT-0978-MH", drug: "Atorvastatin 20mg", mfr: "Dr. Reddy's", qty: 180, score: 8, status: "verified", time: "08:30", loc: "Pune Hub" },
  { id: "BT-0975-MH", drug: "Paracetamol 650mg", mfr: "Unknown", qty: 500, score: 94, status: "alert", time: "08:05", loc: "Mumbai Warehouse" },
  { id: "BT-0972-MH", drug: "Azithromycin 250mg", mfr: "Alkem", qty: 60, score: 11, status: "verified", time: "07:48", loc: "Thane Branch" },
  { id: "BT-0969-MH", drug: "Pantoprazole 40mg", mfr: "Zydus", qty: 90, score: 0, status: "scanning", time: "07:22", loc: "Mumbai Warehouse" },
  { id: "BT-0960-MH", drug: "Insulin Glargine", mfr: "Sanofi", qty: 48, score: 87, status: "alert", time: "15:22", loc: "Cold Storage Bay" },
  { id: "BT-0958-MH", drug: "Cetirizine 10mg", mfr: "Mankind", qty: 200, score: 2, status: "verified", time: "13:05", loc: "Pune Hub" },
  { id: "BT-0955-MH", drug: "Omeprazole 20mg", mfr: "Zydus", qty: 150, score: 48, status: "anomaly", time: "10:41", loc: "Mumbai Warehouse" },
];

const ALERTS = [
  { id: "BT-0975-MH", drug: "Paracetamol 650mg", mfr: "Unknown", qty: 500, score: 94, type: "critical", title: "Counterfeit Risk Detected", evidence: "QR code hash mismatch with manufacturer database. Seal texture anomaly flagged. Supply chain gap detected between manufacturer and first checkpoint.", risks: ["QR hash mismatch", "Unknown manufacturer", "Chain gap detected", "Seal texture anomaly"] },
  { id: "BT-0960-MH", drug: "Insulin Glargine", mfr: "Sanofi", qty: 48, score: 87, type: "critical", title: "Cold Chain Breach", evidence: "Temperature deviation detected — storage reached +12°C during transit. Cold chain integrity compromised. Product efficacy may be affected.", risks: ["Temp +12°C detected", "Cold chain broken", "Efficacy risk", "Transit breach"] },
  { id: "BT-0981-MH", drug: "Metformin 1000mg", mfr: "Cipla", qty: 120, score: 62, type: "warning", title: "Seal Mismatch", evidence: "Hologram discrepancy detected on batch seal. Visual pattern does not match Cipla's registered seal template.", risks: ["Hologram mismatch", "Seal pattern off", "Needs manual review"] },
  { id: "BT-0955-MH", drug: "Omeprazole 20mg", mfr: "Zydus", qty: 150, score: 48, type: "warning", title: "Expiry Proximity", evidence: "Batch expires in 21 days. Below minimum recommended shelf life for dispatch. Immediate action required.", risks: ["Expires in 21 days", "Below dispatch threshold"] },
  { id: "BT-0941-MH", drug: "Amlodipine 5mg", mfr: "Cadila", qty: 300, score: 55, type: "warning", title: "Duplicate Batch ID", evidence: "Batch ID scanned at two separate warehouse locations simultaneously. Possible ID duplication or spoofing.", risks: ["ID scanned at 2 locations", "Possible duplication", "Spoofing risk"] },
];

const INVENTORY = [
  { drug: "Amoxicillin 500mg", cat: "Antibiotic", id: "BT-0984-MH", mfr: "Sun Pharma", stock: 240, max: 300, expiry: "Nov 2027", loc: "Bay 4 · Mumbai", status: "instock" },
  { drug: "Metformin 1000mg", cat: "Diabetes", id: "BT-0981-MH", mfr: "Cipla", stock: 38, max: 120, expiry: "Feb 2027", loc: "Bay 2 · Mumbai", status: "low" },
  { drug: "Paracetamol 650mg", cat: "Analgesic", id: "BT-0975-MH", mfr: "Unknown", stock: 500, max: 500, expiry: "Mar 2027", loc: "Quarantine Bay", status: "quarantine" },
  { drug: "Atorvastatin 20mg", cat: "Cardiac", id: "BT-0978-MH", mfr: "Dr. Reddy's", stock: 180, max: 200, expiry: "Jan 2028", loc: "Bay 6 · Pune", status: "instock" },
  { drug: "Insulin Glargine", cat: "Cold Chain", id: "BT-0960-MH", mfr: "Sanofi", stock: 48, max: 50, expiry: "Aug 2026", loc: "Cold Bay · Mumbai", status: "quarantine" },
  { drug: "Azithromycin 250mg", cat: "Antibiotic", id: "BT-0972-MH", mfr: "Alkem", stock: 60, max: 60, expiry: "May 2028", loc: "Bay 3 · Thane", status: "instock" },
  { drug: "Cetirizine 10mg", cat: "Antihistamine", id: "BT-0958-MH", mfr: "Mankind", stock: 22, max: 200, expiry: "Sep 2027", loc: "Bay 1 · Pune", status: "low" },
];

const CHART_BARS = [30, 50, 40, 70, 60, 85, 75, 90];
const PENDING = [
  { id: "BT-0987", drug: "Metformin 500mg", qty: 120 },
  { id: "BT-0988", drug: "Lisinopril 10mg", qty: 90 },
  { id: "BT-0989", drug: "Cetirizine 10mg", qty: 60 },
];

// ─── HELPERS ─────────────────────────────────────────────────────────────────
const statusConfig = {
  verified: { label: "✓ Verified", cls: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" },
  anomaly:  { label: "⚠ Anomaly",  cls: "bg-amber-500/10 text-amber-400 border border-amber-500/20" },
  alert:    { label: "✕ Alert",    cls: "bg-red-500/10 text-red-400 border border-red-500/20" },
  scanning: { label: "↻ Scanning", cls: "bg-sky-500/10 text-sky-400 border border-sky-500/20" },
  instock:  { label: "In Stock",   cls: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" },
  low:      { label: "⚠ Low Stock",cls: "bg-amber-500/10 text-amber-400 border border-amber-500/20" },
  quarantine:{ label: "Quarantined",cls: "bg-red-500/10 text-red-400 border border-red-500/20" },
};

const scoreColor = (s) => s >= 80 ? "text-red-400" : s >= 40 ? "text-amber-400" : "text-emerald-400";
const barColor   = (s) => s >= 80 ? "bg-red-500" : s >= 40 ? "bg-amber-500" : "bg-emerald-500";
const stockColor = (p) => p < 25 ? "bg-red-500" : p < 60 ? "bg-amber-500" : "bg-teal-400";

const Badge = ({ status }) => {
  const c = statusConfig[status];
  return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold font-mono ${c.cls}`}>{c.label}</span>;
};

// ─── ICONS ───────────────────────────────────────────────────────────────────
const Icon = {
  Grid: () => <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>,
  Qr: () => <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="5" height="5"/><rect x="16" y="3" width="5" height="5"/><rect x="3" y="16" width="5" height="5"/><line x1="16" y1="16" x2="21" y2="21"/><line x1="16" y1="21" x2="21" y2="16"/></svg>,
  Clock: () => <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/></svg>,
  Alert: () => <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
  Box: () => <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/></svg>,
  Plus: () => <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  Search: () => <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  Check: () => <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20,6 9,17 4,12"/></svg>,
  Shield: () => <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>,
  Phone: () => <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.8 9.81a19.79 19.79 0 01-3.07-8.67A2 2 0 012.68 0h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L6.91 7.61a16 16 0 006.29 6.29l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>,
  Refresh: () => <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 4v6h6"/><path d="M23 20v-6h-6"/><path d="M20.49 9A9 9 0 005.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 013.51 15"/></svg>,
};

// ─── PAGES ───────────────────────────────────────────────────────────────────

function Dashboard({ setPage }) {
  return (
    <div className="p-8 space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Scans Today", value: "142", sub: "↑ 12% vs yesterday", accent: "border-t-teal-400", val: "text-teal-400" },
          { label: "Pending Scans", value: "17", sub: "3 batches awaiting", accent: "border-t-amber-400", val: "text-amber-400" },
          { label: "Active Alerts", value: "5", sub: "2 critical, 3 warnings", accent: "border-t-red-400", val: "text-red-400" },
          { label: "Batches In Stock", value: "389", sub: "↑ 8% this week", accent: "border-t-sky-400", val: "text-sky-400" },
        ].map((s) => (
          <div key={s.label} className={`bg-slate-900 border border-slate-700/60 border-t-2 ${s.accent} rounded-xl p-5`}>
            <div className="text-xs font-mono text-slate-500 uppercase tracking-widest mb-3">{s.label}</div>
            <div className={`text-4xl font-bold font-mono ${s.val} mb-2`}>{s.value}</div>
            <div className="text-xs text-slate-400">{s.sub}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-5 gap-5">
        {/* Recent Scans Table */}
        <div className="col-span-3 bg-slate-900 border border-slate-700/60 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-700/60">
            <div>
              <div className="text-sm font-bold">Recent Scan Activity</div>
              <div className="text-xs font-mono text-slate-500 mt-0.5">Last 24 hours · Auto-refreshing</div>
            </div>
            <button onClick={() => setPage("history")} className="text-xs text-slate-400 hover:text-teal-400 transition-colors px-3 py-1.5 border border-slate-700 rounded-lg">View all →</button>
          </div>
          <table className="w-full">
            <thead>
              <tr className="bg-slate-800/50">
                {["Batch ID", "Drug", "Qty", "Status", "Time"].map(h => (
                  <th key={h} className="text-left text-xs font-mono text-slate-500 uppercase tracking-widest px-5 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {SCANS.slice(0, 6).map((s) => (
                <tr key={s.id} className="border-t border-slate-800 hover:bg-slate-800/40 transition-colors">
                  <td className="px-5 py-3 font-mono text-xs text-slate-300">{s.id}</td>
                  <td className="px-5 py-3 text-sm">{s.drug}</td>
                  <td className="px-5 py-3 text-sm text-slate-400">{s.qty}</td>
                  <td className="px-5 py-3"><Badge status={s.status} /></td>
                  <td className="px-5 py-3 font-mono text-xs text-slate-500">{s.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Right panels */}
        <div className="col-span-2 space-y-4">
          {/* Alerts */}
          <div className="bg-slate-900 border border-slate-700/60 rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-700/60">
              <div className="text-sm font-bold">Active Alerts</div>
              <Badge status="alert" />
            </div>
            <div className="divide-y divide-slate-800">
              {ALERTS.slice(0, 3).map((a) => (
                <div key={a.id} className="flex items-center gap-3 px-5 py-3">
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${a.type === "critical" ? "bg-red-400 shadow-[0_0_6px_#f87171]" : "bg-amber-400 shadow-[0_0_6px_#fbbf24]"}`} />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold truncate">{a.title}</div>
                    <div className="text-xs font-mono text-slate-500">{a.id} · {a.score}/100</div>
                  </div>
                  <Badge status={a.type === "critical" ? "alert" : "anomaly"} />
                </div>
              ))}
            </div>
          </div>

          {/* Scan Rate Chart */}
          <div className="bg-slate-900 border border-slate-700/60 rounded-xl p-5">
            <div className="text-sm font-bold mb-1">Scan Rate</div>
            <div className="text-xs font-mono text-slate-500 mb-4">Batches per hour today</div>
            <div className="flex items-end gap-1.5 h-14">
              {CHART_BARS.map((h, i) => (
                <div key={i} className="flex-1 flex items-end">
                  <div
                    className={`w-full rounded-t transition-all ${i === CHART_BARS.length - 1 ? "bg-teal-400/40 border-t-2 border-teal-400" : "bg-teal-400/10 border-t-2 border-teal-600/50"}`}
                    style={{ height: `${h}%` }}
                  />
                </div>
              ))}
            </div>
            <div className="flex justify-between text-xs font-mono text-slate-600 mt-2">
              <span>02:00</span><span>04:00</span><span>06:00</span><span>08:00</span><span>Now</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ScanBatch() {
  const [batchId, setBatchId] = useState("");
  const [logged, setLogged] = useState(false);

  const simulateScan = () => {
    setBatchId("BT-0990-MH");
    setTimeout(() => setBatchId("BT-0990-MH"), 100);
  };

  const handleLog = () => {
    setLogged(true);
    setTimeout(() => setLogged(false), 2000);
  };

  const steps = [
    { label: "Manufacturer Release", meta: "Sun Pharma · 07 Mar 2026 · 10:20", done: true },
    { label: "Regional Hub — Pune", meta: "Scanned · 09 Mar 2026 · 14:35", done: true },
    { label: "Distributor Receive — Mumbai", meta: "Scanned · 13 Mar 2026 · 09:14", done: true },
    { label: "Pharmacy Dispatch", meta: "Awaiting scan", done: false },
  ];

  return (
    <div className="p-8">
      <div className="grid grid-cols-2 gap-6">
        {/* Left — Form */}
        <div className="space-y-5">
          <div className="bg-slate-900 border border-slate-700/60 rounded-xl p-6">
            {/* QR Zone */}
            <div
              onClick={simulateScan}
              className="border-2 border-dashed border-slate-600 hover:border-teal-400 hover:bg-teal-400/5 rounded-xl p-10 text-center cursor-pointer transition-all mb-5"
            >
              <div className="flex justify-center mb-3 text-slate-500">
                <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="5" height="5"/><rect x="16" y="3" width="5" height="5"/><rect x="3" y="16" width="5" height="5"/><line x1="16" y1="16" x2="21" y2="21"/><line x1="16" y1="21" x2="21" y2="16"/></svg>
              </div>
              <div className="text-sm text-slate-300 mb-1">Tap to scan QR / Barcode</div>
              <div className="text-xs font-mono text-slate-500">or drag & drop · supports all 2D formats</div>
            </div>
            <div className="text-center text-xs font-mono text-slate-600 -mt-1 mb-4">— or enter manually —</div>

            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "Batch ID", ph: "BT-0985-MH", val: batchId, set: setBatchId },
              ].map(f => (
                <div key={f.label}>
                  <label className="block text-xs font-mono text-slate-500 uppercase tracking-widest mb-1.5">{f.label}</label>
                  <input value={f.val} onChange={e => f.set(e.target.value)} placeholder={f.ph} className="w-full bg-slate-800 border border-slate-700 text-slate-200 text-sm px-3 py-2.5 rounded-lg outline-none focus:border-teal-400 transition-colors placeholder:text-slate-600" />
                </div>
              ))}
              {[
                { label: "Drug Name", ph: "Amoxicillin 500mg" },
                { label: "Manufacturer", ph: "Sun Pharma" },
                { label: "Quantity (units)", ph: "240", type: "number" },
                { label: "Mfg. Date", ph: "", type: "date" },
                { label: "Expiry Date", ph: "", type: "date" },
              ].map(f => (
                <div key={f.label}>
                  <label className="block text-xs font-mono text-slate-500 uppercase tracking-widest mb-1.5">{f.label}</label>
                  <input type={f.type || "text"} placeholder={f.ph} className="w-full bg-slate-800 border border-slate-700 text-slate-200 text-sm px-3 py-2.5 rounded-lg outline-none focus:border-teal-400 transition-colors placeholder:text-slate-600" />
                </div>
              ))}
            </div>

            <div className="mt-4">
              <label className="block text-xs font-mono text-slate-500 uppercase tracking-widest mb-1.5">Checkpoint Location</label>
              <input placeholder="Mumbai Central Warehouse — Bay 4" className="w-full bg-slate-800 border border-slate-700 text-slate-200 text-sm px-3 py-2.5 rounded-lg outline-none focus:border-teal-400 transition-colors placeholder:text-slate-600" />
            </div>

            <div className="flex gap-3 mt-5">
              <button onClick={handleLog} className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all ${logged ? "bg-emerald-500 text-white" : "bg-teal-400 text-black hover:bg-teal-300"}`}>
                <Icon.Check /> {logged ? "Logged!" : "Log & Verify Batch"}
              </button>
              <button className="px-4 py-2.5 rounded-lg text-sm font-semibold text-slate-400 border border-slate-700 hover:bg-slate-800 transition-colors">Clear</button>
            </div>
          </div>
        </div>

        {/* Right — Checkpoint + Pending */}
        <div className="space-y-5">
          <div className="bg-slate-900 border border-slate-700/60 rounded-xl p-6">
            <div className="text-sm font-bold mb-0.5">Checkpoint Log</div>
            <div className="text-xs font-mono text-slate-500 mb-6">BT-0984-MH · Amoxicillin 500mg</div>
            <div className="space-y-1">
              {steps.map((s, i) => (
                <div key={i}>
                  <div className="flex gap-4 items-start">
                    <div className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold font-mono ${s.done ? "bg-teal-400 text-black" : "border-2 border-dashed border-slate-600 text-slate-500"}`}>
                      {s.done ? "✓" : i + 1}
                    </div>
                    <div className="pt-0.5">
                      <div className={`text-sm font-semibold ${!s.done && "text-slate-500"}`}>{s.label}</div>
                      <div className="text-xs font-mono text-slate-500 mt-0.5">{s.meta}</div>
                    </div>
                  </div>
                  {i < steps.length - 1 && <div className="w-px h-4 bg-slate-700 ml-3.5 my-1" />}
                </div>
              ))}
            </div>
            <div className="border-t border-slate-700 mt-6 pt-4 flex justify-between items-center">
              <div>
                <div className="text-xs font-mono text-slate-500 uppercase tracking-widest">Chain Integrity</div>
                <div className="text-2xl font-bold font-mono text-teal-400">100%</div>
              </div>
              <Badge status="verified" />
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-700/60 rounded-xl p-6">
            <div className="text-sm font-bold mb-4">Pending Scans</div>
            <div className="divide-y divide-slate-800">
              {PENDING.map(p => (
                <div key={p.id} className="flex items-center gap-3 py-2.5">
                  <span className="font-mono text-xs bg-slate-800 text-slate-400 px-2 py-1 rounded">{p.id}</span>
                  <span className="text-sm flex-1">{p.drug}</span>
                  <span className="text-xs font-mono text-slate-500">{p.qty} units</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ScanHistory() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = SCANS.filter(s => {
    const matchSearch = s.id.toLowerCase().includes(search.toLowerCase()) || s.drug.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || s.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="p-8">
      <div className="flex gap-3 mb-5">
        <div className="relative flex-1">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"><Icon.Search /></div>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by Batch ID, Drug, Manufacturer..." className="w-full bg-slate-900 border border-slate-700 text-slate-200 text-sm pl-9 pr-4 py-2.5 rounded-lg outline-none focus:border-teal-400 transition-colors placeholder:text-slate-600" />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="bg-slate-900 border border-slate-700 text-slate-300 text-sm px-3 py-2.5 rounded-lg outline-none focus:border-teal-400 w-40">
          <option value="all">All Status</option>
          <option value="verified">Verified</option>
          <option value="anomaly">Anomaly</option>
          <option value="alert">Alert</option>
        </select>
        <select className="bg-slate-900 border border-slate-700 text-slate-300 text-sm px-3 py-2.5 rounded-lg outline-none focus:border-teal-400 w-36">
          <option>Last 7 days</option>
          <option>Last 30 days</option>
          <option>All time</option>
        </select>
        <button className="px-4 py-2.5 rounded-lg text-sm font-semibold text-slate-400 border border-slate-700 hover:bg-slate-800 transition-colors">Export CSV</button>
      </div>

      <div className="bg-slate-900 border border-slate-700/60 rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-700/60">
          <div>
            <div className="text-sm font-bold">All Scan Records</div>
            <div className="text-xs font-mono text-slate-500 mt-0.5">{filtered.length} records · sorted by latest</div>
          </div>
        </div>
        <table className="w-full">
          <thead>
            <tr className="bg-slate-800/50">
              {["Batch ID", "Drug Name", "Manufacturer", "Qty", "Anomaly Score", "Status", "Scanned At", "Location"].map(h => (
                <th key={h} className="text-left text-xs font-mono text-slate-500 uppercase tracking-widest px-5 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(s => (
              <tr key={s.id} className="border-t border-slate-800 hover:bg-slate-800/40 transition-colors">
                <td className="px-5 py-3 font-mono text-xs text-slate-300">{s.id}</td>
                <td className="px-5 py-3 text-sm font-medium">{s.drug}</td>
                <td className="px-5 py-3 text-sm text-slate-400">{s.mfr}</td>
                <td className="px-5 py-3 text-sm text-slate-400">{s.qty}</td>
                <td className="px-5 py-3 font-mono text-sm font-bold"><span className={scoreColor(s.score)}>{s.score}/100</span></td>
                <td className="px-5 py-3"><Badge status={s.status} /></td>
                <td className="px-5 py-3 font-mono text-xs text-slate-500">13 Mar · {s.time}</td>
                <td className="px-5 py-3 text-xs text-slate-400">{s.loc}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AlertDetail() {
  const [selected, setSelected] = useState(ALERTS[0]);

  return (
    <div className="p-8">
      <div className="grid grid-cols-5 gap-6">
        {/* Alert List */}
        <div className="col-span-2 space-y-3">
          {ALERTS.map(a => (
            <div
              key={a.id}
              onClick={() => setSelected(a)}
              className={`rounded-xl p-4 flex items-start gap-4 cursor-pointer transition-all border-l-2 ${
                a.type === "critical" ? "border-l-red-500" : "border-l-amber-500"
              } ${
                selected.id === a.id
                  ? "bg-slate-800 border border-slate-600"
                  : "bg-slate-900 border border-slate-700/60 hover:bg-slate-800/60"
              }`}
            >
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${a.type === "critical" ? "bg-red-500/10" : "bg-amber-500/10"}`}>
                <Icon.Alert />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold">{a.title}</div>
                <div className="text-xs font-mono text-slate-500 mt-0.5">{a.id} · {a.drug}</div>
                <div className="mt-2">
                  <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${barColor(a.score)}`} style={{ width: `${a.score}%` }} />
                  </div>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <div className={`text-xl font-bold font-mono ${a.type === "critical" ? "text-red-400" : "text-amber-400"}`}>{a.score}</div>
                <div className="text-xs font-mono text-slate-600">/100</div>
              </div>
            </div>
          ))}
        </div>

        {/* Detail Panel */}
        <div className="col-span-3">
          <div className="bg-slate-900 border border-slate-700/60 rounded-xl p-6 sticky top-0">
            <div className="flex items-center gap-3 mb-4">
              <Badge status={selected.type === "critical" ? "alert" : "anomaly"} />
              <span className="font-mono text-xs text-slate-500">{selected.id}</span>
            </div>
            <div className="text-lg font-bold mb-1">{selected.title}</div>
            <div className="text-sm text-slate-400 mb-6">{selected.drug} · {selected.qty} units · {selected.mfr}</div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-slate-800 rounded-xl p-4 text-center">
                <div className={`text-5xl font-bold font-mono mb-1 ${selected.type === "critical" ? "text-red-400" : "text-amber-400"}`}>{selected.score}</div>
                <div className="text-xs font-mono text-slate-500 uppercase tracking-widest">Anomaly Score</div>
              </div>
              <div className="bg-slate-800 rounded-xl p-4">
                <div className="text-xs font-mono text-slate-500 uppercase tracking-widest mb-3">Risk Factors</div>
                <div className="space-y-1.5">
                  {selected.risks.map(r => (
                    <div key={r} className="text-xs text-slate-300 flex items-center gap-2">
                      <span className="text-red-400">✕</span> {r}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className={`rounded-xl p-4 mb-6 text-sm text-slate-300 leading-relaxed border ${selected.type === "critical" ? "bg-red-500/5 border-red-500/20" : "bg-amber-500/5 border-amber-500/20"}`}>
              {selected.evidence}
            </div>

            <div className="border-t border-slate-700 pt-5">
              <div className="text-xs font-mono text-slate-500 uppercase tracking-widest mb-3">Actions</div>
              <div className="space-y-2">
                <button className="w-full flex items-center justify-center gap-2 py-2.5 bg-teal-400 text-black text-sm font-semibold rounded-lg hover:bg-teal-300 transition-colors">
                  <Icon.Phone /> Report to Authority (CDSCO)
                </button>
                <button className="w-full flex items-center justify-center gap-2 py-2.5 border border-slate-700 text-slate-300 text-sm font-semibold rounded-lg hover:bg-slate-800 transition-colors">
                  <Icon.Refresh /> Quarantine Batch
                </button>
                <button className="w-full flex items-center justify-center gap-2 py-2.5 text-slate-500 text-sm font-semibold rounded-lg hover:bg-slate-800 transition-colors">
                  Dismiss Alert
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Inventory() {
  const [search, setSearch] = useState("");

  const filtered = INVENTORY.filter(i =>
    i.drug.toLowerCase().includes(search.toLowerCase()) || i.id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-8">
      {/* Mini stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: "Total Batches", value: "389", accent: "border-t-teal-400", val: "text-teal-400" },
          { label: "Low Stock", value: "12", accent: "border-t-amber-400", val: "text-amber-400" },
          { label: "Quarantined", value: "3", accent: "border-t-red-400", val: "text-red-400" },
        ].map(s => (
          <div key={s.label} className={`bg-slate-900 border border-slate-700/60 border-t-2 ${s.accent} rounded-xl p-5`}>
            <div className="text-xs font-mono text-slate-500 uppercase tracking-widest mb-2">{s.label}</div>
            <div className={`text-3xl font-bold font-mono ${s.val}`}>{s.value}</div>
          </div>
        ))}
      </div>

      <div className="flex gap-3 mb-5">
        <div className="relative flex-1">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"><Icon.Search /></div>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search drugs or batch..." className="w-full bg-slate-900 border border-slate-700 text-slate-200 text-sm pl-9 pr-4 py-2.5 rounded-lg outline-none focus:border-teal-400 transition-colors placeholder:text-slate-600" />
        </div>
        <select className="bg-slate-900 border border-slate-700 text-slate-300 text-sm px-3 py-2.5 rounded-lg outline-none w-44">
          <option>All Categories</option>
          <option>Antibiotics</option>
          <option>Cardiac</option>
          <option>Diabetes</option>
          <option>Cold Chain</option>
        </select>
        <select className="bg-slate-900 border border-slate-700 text-slate-300 text-sm px-3 py-2.5 rounded-lg outline-none w-40">
          <option>All Status</option>
          <option>In Stock</option>
          <option>Low Stock</option>
          <option>Quarantined</option>
        </select>
      </div>

      <div className="bg-slate-900 border border-slate-700/60 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-800/50">
              {["Drug", "Batch ID", "Manufacturer", "Stock Level", "Units", "Expiry", "Location", "Status"].map(h => (
                <th key={h} className="text-left text-xs font-mono text-slate-500 uppercase tracking-widest px-5 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(inv => {
              const pct = Math.round((inv.stock / inv.max) * 100);
              return (
                <tr key={inv.id} className="border-t border-slate-800 hover:bg-slate-800/40 transition-colors">
                  <td className="px-5 py-3">
                    <div className="text-sm font-semibold">{inv.drug}</div>
                    <div className="text-xs text-slate-500">{inv.cat}</div>
                  </td>
                  <td className="px-5 py-3 font-mono text-xs text-slate-300">{inv.id}</td>
                  <td className="px-5 py-3 text-sm text-slate-400">{inv.mfr}</td>
                  <td className="px-5 py-3 w-36">
                    <div className="text-xs font-mono text-slate-500 mb-1">{inv.stock} / {inv.max}</div>
                    <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${stockColor(pct)}`} style={{ width: `${pct}%` }} />
                    </div>
                  </td>
                  <td className={`px-5 py-3 font-mono text-sm font-bold ${inv.status === "instock" ? "text-teal-400" : inv.status === "low" ? "text-amber-400" : "text-red-400"}`}>{inv.stock}</td>
                  <td className="px-5 py-3 font-mono text-xs text-slate-500">{inv.expiry}</td>
                  <td className="px-5 py-3 text-xs text-slate-400">{inv.loc}</td>
                  <td className="px-5 py-3"><Badge status={inv.status} /></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── NAV CONFIG ──────────────────────────────────────────────────────────────
const NAV = [
  { id: "dashboard", label: "Dashboard",       icon: "Grid",  badge: null },
  { id: "scan",      label: "Scan Batch",      icon: "Qr",    badge: { val: "3", cls: "bg-teal-400 text-black" } },
  { id: "history",   label: "Scan History",    icon: "Clock", badge: null },
  { id: "alerts",    label: "Alert Detail",    icon: "Alert", badge: { val: "5", cls: "bg-red-500 text-white" } },
  { id: "inventory", label: "Inventory Status",icon: "Box",   badge: null },
];

const PAGE_META = {
  dashboard: ["Dashboard", "Overview — All systems operational"],
  scan:       ["Scan Batch", "Receive + log checkpoint"],
  history:    ["Scan History", "All scans · Anomaly flags · Audit trail"],
  alerts:     ["Alert Detail", "Anomaly score + evidence · 5 active alerts"],
  inventory:  ["Inventory Status", "Which batches are in stock"],
};

// ─── APP ─────────────────────────────────────────────────────────────────────
export default function PharmaSealDashboard() {
  const [page, setPage] = useState("dashboard");
  const [meta] = [PAGE_META[page]];

  const pages = { dashboard: <Dashboard setPage={setPage} />, scan: <ScanBatch />, history: <ScanHistory />, alerts: <AlertDetail />, inventory: <Inventory /> };

  return (
    <div className="flex h-screen bg-slate-950 text-slate-200 overflow-hidden" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=DM+Sans:wght@300;400;500;600;700&display=swap'); .font-mono { font-family: 'Space Mono', monospace !important; }`}</style>

      {/* SIDEBAR */}
      <aside className="w-60 flex-shrink-0 bg-slate-900 border-r border-slate-700/60 flex flex-col">
        {/* Logo */}
        <div className="px-5 py-6 border-b border-slate-700/60">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-teal-400 rounded-lg flex items-center justify-center text-black">
              <Icon.Shield />
            </div>
            <div>
              <div className="font-mono text-sm font-bold text-teal-400 tracking-wider">PharmaSeal</div>
              <div className="font-mono text-xs text-slate-600 tracking-widest uppercase">Distributor</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <div className="flex-1 px-3 py-4 space-y-1">
          <div className="text-xs font-mono text-slate-600 uppercase tracking-widest px-2 pb-2">Navigation</div>
          {NAV.map(n => {
            const IconComp = Icon[n.icon];
            const active = page === n.id;
            return (
              <button
                key={n.id}
                onClick={() => setPage(n.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  active
                    ? "bg-teal-400/10 text-teal-400 border border-teal-400/20"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                }`}
              >
                <IconComp />
                <span className="flex-1 text-left">{n.label}</span>
                {n.badge && (
                  <span className={`text-xs font-mono font-bold px-1.5 py-0.5 rounded-full ${n.badge.cls}`}>{n.badge.val}</span>
                )}
              </button>
            );
          })}
        </div>

        {/* User */}
        <div className="px-4 py-4 border-t border-slate-700/60">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-700 to-teal-900 border-2 border-teal-500/50 flex items-center justify-center font-mono text-xs font-bold text-teal-400">MR</div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold truncate">MedRx Pharma</div>
              <div className="text-xs font-mono text-slate-500">LIC · MH-2024-007</div>
            </div>
            <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399] animate-pulse" />
          </div>
        </div>
      </aside>

      {/* MAIN */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="bg-slate-900 border-b border-slate-700/60 px-8 py-4 flex items-center gap-4 flex-shrink-0">
          <div className="flex-1">
            <div className="text-lg font-bold">{meta[0]}</div>
            <div className="text-xs font-mono text-slate-500 mt-0.5">{meta[1]}</div>
          </div>
          <button className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-400 border border-slate-700 hover:bg-slate-800 transition-colors">
            <Icon.Search /> Search
          </button>
          <button onClick={() => setPage("scan")} className="flex items-center gap-2 px-4 py-2 bg-teal-400 text-black text-sm font-semibold rounded-lg hover:bg-teal-300 transition-colors">
            <Icon.Plus /> New Scan
          </button>
        </header>

        {/* Page */}
        <main className="flex-1 overflow-y-auto">
          {pages[page]}
        </main>
      </div>
    </div>
  );
}
