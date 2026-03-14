import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
  ShoppingCart,
  CheckCircle2,
  ArrowUpRight,
  Building2
} from 'lucide-react';

function DashboardContent() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [metrics, setMetrics] = useState({
    totalBatches: 0,
    verifiedBatches: 0,
    activeAlerts: 0,
    totalScans: 0,
    chartData: [],
    pieData: [],
  });

  const monthBuckets = useMemo(() => {
    const buckets = [];
    const now = new Date();
    for (let i = 5; i >= 0; i -= 1) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      buckets.push({
        key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
        name: d.toLocaleString('en-US', { month: 'short' }),
      });
    }
    return buckets;
  }, []);

  useEffect(() => {
    let cancelled = false;

    const loadDashboard = async () => {
      setLoading(true);
      setError('');
      try {
        const [batchesRes, anomaliesRes] = await Promise.all([
          fetch('/api/drugs'),
          fetch('/api/drugs/anomalies'),
        ]);

        const batchesJson = await batchesRes.json();
        const anomaliesJson = await anomaliesRes.json();

        if (!batchesRes.ok || !batchesJson?.ok) {
          throw new Error(batchesJson?.message || 'Unable to load batches');
        }
        if (!anomaliesRes.ok || !anomaliesJson?.ok) {
          throw new Error(anomaliesJson?.message || 'Unable to load anomaly alerts');
        }

        const batches = Array.isArray(batchesJson.batches) ? batchesJson.batches : [];
        const alerts = Array.isArray(anomaliesJson.alerts) ? anomaliesJson.alerts : [];

        const flaggedBatchIds = new Set(alerts.map((a) => a.batchId).filter(Boolean));
        const totalBatches = batches.length;
        const activeAlerts = alerts.length;
        const verifiedBatches = Math.max(totalBatches - flaggedBatchIds.size, 0);
        const totalScans = totalBatches + activeAlerts;

        const registrationsByMonth = Object.fromEntries(monthBuckets.map((m) => [m.key, 0]));
        const alertsByMonth = Object.fromEntries(monthBuckets.map((m) => [m.key, 0]));

        for (const b of batches) {
          const ts = new Date(b.createdAt || b.timestamp || Date.now());
          const key = `${ts.getFullYear()}-${String(ts.getMonth() + 1).padStart(2, '0')}`;
          if (registrationsByMonth[key] !== undefined) registrationsByMonth[key] += 1;
        }

        for (const a of alerts) {
          const ts = new Date(a.createdAt || Date.now());
          const key = `${ts.getFullYear()}-${String(ts.getMonth() + 1).padStart(2, '0')}`;
          if (alertsByMonth[key] !== undefined) alertsByMonth[key] += 1;
        }

        const chartData = monthBuckets.map((m) => ({
          name: m.name,
          registrations: registrationsByMonth[m.key],
          scans: registrationsByMonth[m.key] + alertsByMonth[m.key],
        }));

        let inTransit = 0;
        let warehouse = 0;
        let flagged = 0;
        for (const b of batches) {
          if (flaggedBatchIds.has(b.batchId)) {
            flagged += 1;
          } else if (!b.txHash || String(b.txHash).trim().length < 10) {
            inTransit += 1;
          } else {
            warehouse += 1;
          }
        }

        const pieData = [
          { name: 'In Transit', value: inTransit, color: '#10b981' },
          { name: 'Warehouse', value: warehouse, color: '#3b82f6' },
          { name: 'Flagged', value: flagged, color: '#f97316' },
        ];

        if (!cancelled) {
          setMetrics({
            totalBatches,
            verifiedBatches,
            activeAlerts,
            totalScans,
            chartData,
            pieData,
          });
        }
      } catch (err) {
        if (!cancelled) {
          setError(err?.message || 'Failed to load dashboard data');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadDashboard();
    return () => {
      cancelled = true;
    };
  }, [monthBuckets]);

  const verificationPct = metrics.totalBatches
    ? Math.round((metrics.verifiedBatches / metrics.totalBatches) * 100)
    : 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <p className="text-slate-500 text-sm font-medium">Total Batches</p>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Package size={18} />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-bold text-slate-800">{metrics.totalBatches.toLocaleString()}</h3>
            <p className="text-emerald-500 text-sm font-medium mt-1">Live count from registered batches</p>
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
              <h3 className="text-3xl font-bold text-slate-800">{metrics.verifiedBatches.toLocaleString()}</h3>
              <p className="text-slate-400 text-sm font-medium mt-1">{verificationPct}% Success Rate</p>
            </div>
            <div className="relative w-10 h-10">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path className="text-slate-100" strokeWidth="4" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                <path className="text-emerald-500" strokeDasharray={`${verificationPct}, 100`} strokeWidth="4" strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
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
            <h3 className="text-3xl font-bold text-orange-600">{metrics.activeAlerts.toLocaleString()}</h3>
            <p className="text-slate-400 text-sm font-medium mt-1">Live anomaly alerts</p>
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
            <h3 className="text-3xl font-bold text-slate-800">{metrics.totalScans.toLocaleString()}</h3>
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
              <ComposedChart data={metrics.chartData} margin={{ top: 5, right: 30, left: -20, bottom: 0 }}>
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
                <Pie data={metrics.pieData} cx="50%" cy="50%" innerRadius={70} outerRadius={90} paddingAngle={0} dataKey="value" stroke="none">
                  {metrics.pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center font-sans pointer-events-none mt-2">
              <span className="text-2xl font-bold text-slate-800">{metrics.totalBatches.toLocaleString()}</span>
              <span className="text-[10px] font-bold text-slate-400 tracking-wider">TOTAL</span>
            </div>
          </div>

          <div className="mt-4 space-y-3">
            {metrics.pieData.map((item, index) => (
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

      {(loading || error) && (
        <div className={`rounded-xl border p-4 text-sm font-medium ${error ? 'border-red-200 bg-red-50 text-red-700' : 'border-blue-100 bg-blue-50 text-blue-700'}`}>
          {error ? `Dashboard data error: ${error}` : 'Loading dashboard metrics...'}
        </div>
      )}
    </div>
  );
}

function RegisterBatchContent() {
  const [formData, setFormData] = useState({
    productName: 'Paracetamol BP 500mg',
    batchId: 'BCH-2023-0891',
    manufacturerId: 'ML/2022/TX-90',
    category: 'Analgesics',
    mfgDate: '',
    expDate: '',
    quantity: '50000',
    plantCode: 'APEX-PLANT-01',
    storageConditions: '2°C to 8°C. Dry place',
    ingredients: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isHashing, setIsHashing] = useState(false);
  const [generatedHash, setGeneratedHash] = useState('');
  const [batchTimestamp, setBatchTimestamp] = useState(() => new Date().toISOString());
  const [submitError, setSubmitError] = useState('');
  const [submitResult, setSubmitResult] = useState(null);

  const handleFieldChange = (key) => (e) => {
    setFormData((prev) => ({ ...prev, [key]: e.target.value }));
    setGeneratedHash('');
  };

  const sortObject = (obj) => {
    if (Array.isArray(obj)) return obj.map(sortObject);
    if (obj && typeof obj === 'object') {
      return Object.keys(obj)
        .sort()
        .reduce((acc, key) => {
          acc[key] = sortObject(obj[key]);
          return acc;
        }, {});
    }
    return obj;
  };

  const computeLocalHash = async (payload) => {
    const canonical = JSON.stringify(sortObject(payload));
    const encoded = new TextEncoder().encode(canonical);
    const digest = await window.crypto.subtle.digest('SHA-256', encoded);
    const hex = Array.from(new Uint8Array(digest))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
    return `0x${hex}`;
  };

  const buildHashInput = (timestampValue) => ({
    batchId: formData.batchId.trim(),
    productName: formData.productName.trim(),
    manufacturerId: formData.manufacturerId.trim(),
    mfgDate: formData.mfgDate,
    expDate: formData.expDate,
    quantity: Number(formData.quantity),
    plantCode: formData.plantCode.trim(),
    timestamp: timestampValue,
  });

  const handleGenerateHash = async () => {
    setSubmitError('');
    if (
      !formData.batchId.trim() ||
      !formData.productName.trim() ||
      !formData.manufacturerId.trim() ||
      !formData.mfgDate ||
      !formData.expDate ||
      !formData.quantity ||
      !formData.plantCode.trim()
    ) {
      setSubmitError('Fill required batch fields before generating hash.');
      return;
    }

    try {
      setIsHashing(true);
      const ts = new Date().toISOString();
      setBatchTimestamp(ts);
      const hash = await computeLocalHash(buildHashInput(ts));
      setGeneratedHash(hash);
    } catch {
      setSubmitError('Unable to generate hash in browser.');
    } finally {
      setIsHashing(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError('');
    setSubmitResult(null);

    try {
      const apiBase = import.meta.env.VITE_API_BASE_URL || '';
      const payload = {
        batchId: formData.batchId.trim(),
        productName: formData.productName.trim(),
        manufacturerId: formData.manufacturerId.trim(),
        mfgDate: formData.mfgDate,
        expDate: formData.expDate,
        quantity: Number(formData.quantity),
        plantCode: formData.plantCode.trim(),
        category: formData.category,
        storageConditions: formData.storageConditions.trim(),
        ingredients: formData.ingredients.trim(),
        timestamp: batchTimestamp,
      };

      const res = await fetch(`${apiBase}/api/drugs/register-batch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const raw = await res.text();
      let data = {};
      if (raw) {
        try {
          data = JSON.parse(raw);
        } catch {
          data = { message: raw };
        }
      }

      if (!res.ok || !data.ok) {
        const message =
          data.message && typeof data.message === 'string' && !data.message.trim().startsWith('<')
            ? data.message
            : `Batch registration failed (HTTP ${res.status}). Check backend server/proxy config.`;
        throw new Error(message);
      }

      setSubmitResult({
        dataHash: data?.batch?.dataHash || '',
        txHash: data?.batch?.txHash || '',
        qrDataUrl: data?.qrDataUrl || '',
      });
    } catch (err) {
      setSubmitError(err?.message || 'Network error while registering batch');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl max-w-[1000px] mx-auto space-y-6 mt-2">
      <h2 className="text-3xl font-bold text-slate-800">Register Batch</h2>

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
      <form className="bg-white rounded-xl shadow-sm border border-slate-200 p-8" onSubmit={handleSubmit}>
        <h3 className="text-lg font-bold text-slate-800 mb-6">Step 1: Drug & Batch Information</h3>

        <div className="grid grid-cols-2 gap-x-8 gap-y-6">
          <div className="space-y-1.5 flex flex-col">
            <label className="text-sm font-medium text-slate-700">Drug Name</label>
            <input
              type="text"
              placeholder="e.g. Paracetamol BP 500mg"
              className="ps-input"
              value={formData.productName}
              onChange={handleFieldChange('productName')}
              required
            />
          </div>

          <div className="space-y-1.5 flex flex-col">
            <label className="text-sm font-medium text-slate-700">Batch Number</label>
            <input
              type="text"
              className="ps-input"
              value={formData.batchId}
              onChange={handleFieldChange('batchId')}
              required
            />
          </div>

          <div className="space-y-1.5 flex flex-col">
            <label className="text-sm font-medium text-slate-700">Manufacturing License</label>
            <input
              type="text"
              className="ps-input"
              value={formData.manufacturerId}
              onChange={handleFieldChange('manufacturerId')}
              required
            />
          </div>

          <div className="space-y-1.5 flex flex-col">
            <label className="text-sm font-medium text-slate-700">Category</label>
            <select className="ps-input" value={formData.category} onChange={handleFieldChange('category')}>
              <option>Analgesics</option>
              <option>Antibiotics</option>
              <option>Vaccines</option>
            </select>
          </div>

          <div className="space-y-1.5 flex flex-col">
            <label className="text-sm font-medium text-slate-700">Manufacturing Date</label>
            <input type="date" className="ps-input" value={formData.mfgDate} onChange={handleFieldChange('mfgDate')} required />
          </div>

          <div className="space-y-1.5 flex flex-col">
            <label className="text-sm font-medium text-slate-700">Expiry Date</label>
            <input type="date" className="ps-input" value={formData.expDate} onChange={handleFieldChange('expDate')} required />
          </div>

          <div className="space-y-1.5 flex flex-col">
            <label className="text-sm font-medium text-slate-700">Quantity (Units)</label>
            <input type="number" min="1" className="ps-input" value={formData.quantity} onChange={handleFieldChange('quantity')} required />
          </div>

          <div className="space-y-1.5 flex flex-col">
            <label className="text-sm font-medium text-slate-700">Storage Conditions</label>
            <input
              type="text"
              className="ps-input"
              value={formData.storageConditions}
              onChange={handleFieldChange('storageConditions')}
            />
          </div>

          <div className="space-y-1.5 flex flex-col">
            <label className="text-sm font-medium text-slate-700">Plant Code</label>
            <input
              type="text"
              className="ps-input"
              value={formData.plantCode}
              onChange={handleFieldChange('plantCode')}
              required
            />
          </div>

          <div className="col-span-2 space-y-1.5 flex flex-col pt-2">
            <label className="text-sm font-medium text-slate-700">Active Ingredients</label>
            <textarea
              placeholder="List ingredients and concentrations..."
              className="ps-input"
              style={{ height: "6rem", resize: "none" }}
              value={formData.ingredients}
              onChange={handleFieldChange('ingredients')}
            ></textarea>
          </div>
        </div>

        {submitError && (
          <div className="mt-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {submitError}
          </div>
        )}

        {generatedHash && (
          <div className="mt-5 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-xs text-blue-800 break-all">
            <span className="font-semibold">Generated Hash:</span> {generatedHash}
          </div>
        )}

        {submitResult && (
          <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4 space-y-3">
            <div className="flex items-center gap-2 text-emerald-700 text-sm font-semibold">
              <CheckCircle2 size={16} /> Batch registered successfully
            </div>
            <p className="text-xs text-slate-700 break-all">
              <span className="font-semibold">dataHash:</span> {submitResult.dataHash}
            </p>
            <p className="text-xs text-slate-700 break-all">
              <span className="font-semibold">txHash:</span> {submitResult.txHash}
            </p>
            {submitResult.qrDataUrl && (
              <div className="pt-2 flex flex-col gap-3">
                <img
                  src={submitResult.qrDataUrl}
                  alt="Batch QR"
                  className="w-44 h-44 rounded-lg border border-emerald-200 bg-white p-2"
                />
                <a
                  href={submitResult.qrDataUrl}
                  download={`${formData.batchId || 'batch'}-qr.png`}
                  className="inline-flex w-fit items-center gap-2 rounded-lg border border-emerald-300 bg-white px-3 py-2 text-sm font-semibold text-emerald-700 hover:bg-emerald-100"
                >
                  <Download size={16} /> Download QR
                </a>
              </div>
            )}
          </div>
        )}

        <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between">
          <button type="button" className="btn-secondary px-5 py-2.5" onClick={handleGenerateHash} disabled={isHashing}>
            {isHashing ? 'Generating...' : 'Generate Hash'}
          </button>
          <button type="submit" className="btn-primary px-6 py-2.5" disabled={isSubmitting}>
            {isSubmitting ? 'Registering...' : 'Register on Blockchain'}
          </button>
        </div>
      </form>

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

function BatchListContent() {
  const batches = [
    { id: 'BCH-2023-0891', name: 'Paracetamol BP 500mg', date: '2023-11-20', quantity: 50000, status: 'In Transit' },
    { id: 'BCH-2023-0892', name: 'Amoxicillin 250mg', date: '2023-11-21', quantity: 15000, status: 'Warehouse' },
    { id: 'BCH-2023-0893', name: 'Ibuprofen 400mg', date: '2023-11-22', quantity: 30000, status: 'Delivered' },
    { id: 'BCH-2023-0894', name: 'Cetirizine 10mg', date: '2023-11-23', quantity: 10000, status: 'Flagged' },
    { id: 'BCH-2023-0895', name: 'Azithromycin 500mg', date: '2023-11-24', quantity: 20000, status: 'In Transit' },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6 mt-2">
      <h2 className="text-3xl font-bold text-slate-800">Batch List</h2>
      
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="py-4 px-6 text-sm font-semibold text-slate-600">Batch ID</th>
                <th className="py-4 px-6 text-sm font-semibold text-slate-600">Drug Name</th>
                <th className="py-4 px-6 text-sm font-semibold text-slate-600">Date Registered</th>
                <th className="py-4 px-6 text-sm font-semibold text-slate-600">Quantity</th>
                <th className="py-4 px-6 text-sm font-semibold text-slate-600">Status</th>
                <th className="py-4 px-6 text-sm font-semibold text-slate-600 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {batches.map((batch) => (
                <tr key={batch.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-4 px-6 text-sm font-medium text-slate-800">{batch.id}</td>
                  <td className="py-4 px-6 text-sm text-slate-600">{batch.name}</td>
                  <td className="py-4 px-6 text-sm text-slate-600">{batch.date}</td>
                  <td className="py-4 px-6 text-sm text-slate-600">{batch.quantity.toLocaleString()}</td>
                  <td className="py-4 px-6 text-sm">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                      batch.status === 'In Transit' ? 'bg-blue-100 text-blue-700' :
                      batch.status === 'Warehouse' ? 'bg-indigo-100 text-indigo-700' :
                      batch.status === 'Delivered' ? 'bg-emerald-100 text-emerald-700' :
                      'bg-orange-100 text-orange-700'
                    }`}>
                      {batch.status}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-sm text-right">
                    <button className="text-emerald-600 hover:text-emerald-700 font-medium text-sm transition-colors cursor-pointer">View Details</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination placeholder */}
        <div className="py-4 px-6 border-t border-slate-100 flex items-center justify-between text-sm text-slate-500">
          <div>Showing 1 to 5 of 45 batches</div>
          <div className="flex gap-2">
            <button className="px-3 py-1 rounded border border-slate-200 hover:bg-slate-50 disabled:opacity-50 cursor-not-allowed" disabled>Previous</button>
            <button className="px-3 py-1 rounded border border-slate-200 hover:bg-slate-50 cursor-pointer">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function BatchDetailContent() {
  return (
    <div className="max-w-6xl mx-auto space-y-6 mt-2 pb-10">
      <div className="bg-[#334155] text-white rounded-lg px-4 py-3 flex items-center gap-2 text-sm shadow-sm">
        <Info size={16} className="text-slate-400" />
        <span className="text-slate-300">Viewing</span>
        <span className="font-semibold text-white">BATCH-2024-447 • Paracetamol 500mg</span>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
          <p className="text-slate-500 text-[10px] font-bold tracking-wider mb-2">TOTAL SCANS</p>
          <div className="flex items-baseline justify-between">
            <h3 className="text-3xl font-bold text-slate-800">234</h3>
            <span className="text-emerald-500 text-xs font-semibold flex items-center gap-0.5">
              <ArrowUpRight size={14} /> 12% vs avg
            </span>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
          <p className="text-slate-500 text-[10px] font-bold tracking-wider mb-2">CURRENT CUSTODIAN</p>
          <div className="flex items-center gap-2 mt-2">
            <Building2 className="text-slate-400" size={20} />
            <h3 className="text-base font-bold text-slate-800">HealthPlus Pharmacy</h3>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
          <p className="text-slate-500 text-[10px] font-bold tracking-wider mb-2">TEMP STATUS</p>
          <div className="flex items-baseline justify-between">
            <h3 className="text-3xl font-bold text-slate-800">3.2<span className="text-2xl">°C</span></h3>
            <span className="bg-emerald-50 text-emerald-600 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide border border-emerald-100">
              OPTIMAL
            </span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
          <p className="text-slate-500 text-[10px] font-bold tracking-wider mb-2">DAYS TO EXPIRY</p>
          <div className="flex items-baseline justify-between">
            <h3 className="text-3xl font-bold text-slate-800">362</h3>
            <span className="text-slate-400 text-xs font-medium">Jan 2025</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-5 gap-6">
        {/* Custody Journey */}
        <div className="col-span-3 bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
            <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-emerald-500" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <polyline points="10 9 9 9 8 9"></polyline>
            </svg>
            Custody Journey
          </h3>
          
          <div className="relative pl-8 space-y-8 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-100">
            {/* Step 1 */}
            <div className="relative">
              <div className="absolute -left-[30px] top-1 w-4 h-4 bg-emerald-100 rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
              </div>
              <div className="flex justify-between items-start mb-1">
                <h4 className="font-bold text-slate-800 text-[15px]">PharmaMfg Industrial Unit</h4>
                <span className="text-xs text-slate-400 font-medium font-mono">2024-01-15 08:39 UTC</span>
              </div>
              <p className="text-sm text-slate-500 mb-3">Batch Production & Packaging Complete</p>
              <div className="flex gap-3">
                <div className="bg-slate-50 border border-slate-200 rounded px-2.5 py-1 xl:text-xs text-[10px] font-mono text-slate-600">
                  <span className="text-slate-400 mr-1">TEMP:</span>2.8°C
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded px-2.5 py-1 xl:text-xs text-[10px] font-mono text-slate-600">
                  <span className="text-slate-400 mr-1">TX HASH:</span>0x9f32b...7e21
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative">
              <div className="absolute -left-[30px] top-1 w-4 h-4 bg-emerald-100 rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
              </div>
              <div className="flex justify-between items-start mb-1">
                <h4 className="font-bold text-slate-800 text-[15px]">Regional Distribution Center</h4>
                <span className="text-xs text-slate-400 font-medium font-mono">2024-01-18 14:15 UTC</span>
              </div>
              <p className="text-sm text-slate-500 mb-3">In-transit inspection successful. Storage initiated.</p>
              <div className="flex gap-3">
                <div className="bg-slate-50 border border-slate-200 rounded px-2.5 py-1 xl:text-xs text-[10px] font-mono text-slate-600">
                  <span className="text-slate-400 mr-1">TEMP:</span>3.0°C
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded px-2.5 py-1 xl:text-xs text-[10px] font-mono text-slate-600">
                  <span className="text-slate-400 mr-1">TX HASH:</span>0x4a2e1...8fbb
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative">
              <div className="absolute -left-[32px] top-0 w-5 h-5 bg-[#e0e7ff] rounded-full flex items-center justify-center border-2 border-white shadow-sm shadow-[#818cf8]">
                <div className="w-2.5 h-2.5 bg-indigo-500 rounded-full"></div>
              </div>
              <div className="flex justify-between items-start mb-1">
                <h4 className="font-bold text-indigo-700 text-[15px]">HealthPlus Pharmacy</h4>
                <span className="text-xs text-slate-400 font-medium font-mono">2024-01-28 09:45 UTC</span>
              </div>
              <p className="text-sm text-slate-500 mb-3 italic">Currently Available for Prescription</p>
              <div className="flex gap-3">
                <div className="bg-[#eef2ff] border border-indigo-100 rounded px-2.5 py-1 xl:text-xs text-[10px] font-mono text-indigo-900">
                  <span className="text-indigo-400 mr-1">TEMP:</span>3.2°C
                </div>
                <div className="bg-[#eef2ff] border border-indigo-100 rounded px-2.5 py-1 xl:text-xs text-[10px] font-mono text-indigo-900">
                  <span className="text-indigo-400 mr-1">TX HASH:</span>0xec211...33d2
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Product Hash Details */}
        <div className="col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Product Hash Details</h3>
          
          <div className="space-y-6">
            <div>
              <p className="text-slate-400 text-[10px] font-bold tracking-wider mb-2">FULL LEDGER HASH</p>
              <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-3 text-emerald-800 font-mono text-xs break-all leading-relaxed">
                7f83b1657ff1fc53b82dc18148a1d65dfc2d4b1fa3d677284addd2
                <br/>
                08126d9869
              </div>
            </div>

            <div>
              <p className="text-slate-400 text-[10px] font-bold tracking-wider mb-1.5">IPFS CONTENT IDENTIFIER</p>
              <div className="text-slate-800 font-mono text-sm border-b border-transparent">
                QmXoyp...3nK7v
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-sm text-slate-500 font-medium">Verification Status</span>
              <span className="flex items-center gap-1.5 text-emerald-600 text-[11px] font-bold tracking-wider uppercase">
                <CheckCircle2 size={14} className="text-emerald-500" /> VERIFIED
              </span>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-sm text-slate-500 font-medium">Expiry Date</span>
              <span className="text-slate-800 text-sm font-bold font-mono">2025-01-14</span>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-sm text-slate-500 font-medium">Storage Class</span>
              <span className="text-indigo-600 text-[10px] font-bold tracking-wider border border-indigo-100 bg-indigo-50 px-2.5 py-1 rounded">COLD CHAIN</span>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <p className="text-slate-400 text-[10px] font-bold tracking-wider mb-3">RECENT SCAN EVENTS</p>
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 text-xs">
                    <th className="pb-2 font-medium">Location</th>
                    <th className="pb-2 font-medium">Action</th>
                    <th className="pb-2 font-medium text-right">Time</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  <tr className="border-b border-slate-50">
                    <td className="py-2.5 text-slate-700 font-mono text-xs">HP-NYC-01</td>
                    <td className="py-2.5 text-slate-600 text-xs">Stock Entry</td>
                    <td className="py-2.5 text-slate-400 text-xs text-right">2m ago</td>
                  </tr>
                  <tr className="border-b border-slate-50">
                    <td className="py-2.5 text-slate-700 font-mono text-xs">HP-NYC-01</td>
                    <td className="py-2.5 text-slate-600 text-xs">Audit Check</td>
                    <td className="py-2.5 text-slate-400 text-xs text-right">1h ago</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 text-slate-700 font-mono text-xs">WH-NJ-04</td>
                    <td className="py-2.5 text-slate-600 text-xs">Handover</td>
                    <td className="py-2.5 text-slate-400 text-xs text-right">12h ago</td>
                  </tr>
                </tbody>
              </table>
            </div>

          </div>
        </div>
      </div>
      
      <div className="text-center pt-8 pb-4">
         <p className="text-[11px] text-slate-400 font-medium">© 2024 PramanChain Ledger Systems - Secured by Distributed Consensus</p>
      </div>

    </div>
  );
}

function AnomalyAlertsContent() {
  const alerts = [
    { id: 'ALRT-001', batchId: 'BCH-2024-8921', issue: 'Temperature Excursion', location: 'Transit (Route A)', severity: 'high', time: '10 mins ago', date: '2024-03-15' },
    { id: 'ALRT-002', batchId: 'BCH-2024-8845', issue: 'Route Deviation', location: 'Checkpoint Beta', severity: 'medium', time: '2 hours ago', date: '2024-03-15' },
    { id: 'ALRT-003', batchId: 'BCH-2024-8711', issue: 'Unverified Scan', location: 'Facility Delta', severity: 'low', time: '5 hours ago', date: '2024-03-15' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Critical Alerts</h2>
          <p className="text-sm text-slate-500 mt-1">Real-time supply chain anomalies requiring attention</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white text-sm font-medium rounded-lg hover:bg-slate-700 transition-colors cursor-pointer">
          <Settings size={16} />
          Alert Settings
        </button>
      </div>

      <div className="grid gap-4">
        {alerts.map((alert) => (
          <div key={alert.id} className="bg-white rounded-xl p-5 border border-red-100 shadow-sm flex items-start gap-4">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
              alert.severity === 'high' ? 'bg-red-100 text-red-600' :
              alert.severity === 'medium' ? 'bg-orange-100 text-orange-600' :
              'bg-amber-100 text-amber-600'
            }`}>
              <AlertTriangle size={20} />
            </div>
            
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-bold text-slate-800">{alert.issue}</h3>
                <span className="text-xs font-medium text-slate-500">{alert.time}</span>
              </div>
              <div className="flex items-center gap-4 text-sm text-slate-600">
                <span className="flex items-center gap-1"><Package size={14} className="text-slate-400" /> {alert.batchId}</span>
                <span className="flex items-center gap-1"><Building2 size={14} className="text-slate-400" /> {alert.location}</span>
                <span className="flex items-center gap-1"><QrCode size={14} className="text-slate-400" /> ID: {alert.id}</span>
              </div>
              
              <div className="mt-4 flex items-center gap-3">
                <button className="px-4 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 text-sm font-medium rounded-lg transition-colors border border-red-200 cursor-pointer">
                  Investigate
                </button>
                <button className="px-4 py-1.5 bg-white hover:bg-slate-50 text-slate-600 text-sm font-medium rounded-lg transition-colors border border-slate-200 cursor-pointer">
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TriggerRecallContent() {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-7xl mx-auto">
      <div className="mb-6">
        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Trigger Recall</h2>
        
        <div className="mt-4 flex items-center gap-3 bg-blue-50 text-blue-800 px-4 py-3 rounded-xl border border-blue-100 shadow-sm">
          <Info size={20} className="text-blue-500 shrink-0" />
          <p className="text-sm font-medium">Recall broadcasts reach all registered scan wallets instantly via blockchain synchronization.</p>
        </div>
      </div>
      
      {/* Stats row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">RECALLS ISSUED</p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">2</span>
            <span className="text-sm font-semibold text-slate-500">Active cases</span>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">PATIENTS NOTIFIED</p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">1,240</span>
            <span className="text-sm font-bold text-emerald-600">100% coverage</span>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">BATCHES RECALLED</p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">2</span>
            <span className="text-sm font-semibold text-slate-500">Total impact</span>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">AVG NOTIFICATION TIME</p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">4.2 <span className="text-xl">sec</span></span>
            <span className="text-sm font-bold text-emerald-600">Real-time</span>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column - Issue New Recall */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8">
          <div className="mb-6">
            <h3 className="text-xl font-bold text-slate-900">Issue New Recall</h3>
            <p className="text-slate-500 text-sm mt-1">Initiate a cryptographically signed recall event.</p>
          </div>
          
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-bold text-slate-800 mb-2">Affected Batch</label>
              <div className="relative">
                <select className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm font-medium rounded-xl px-4 py-3.5 outline-none focus:ring-2 focus:ring-red-500 focus:bg-white transition-all appearance-none cursor-pointer">
                  <option>Select Batch ID</option>
                  <option>BTC-88210</option>
                  <option>BTC-77102</option>
                  <option>BTC-60399</option>
                </select>
                <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-slate-400">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                </div>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-bold text-slate-800 mb-2">Recall Reason</label>
              <div className="relative">
                <select className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm font-medium rounded-xl px-4 py-3.5 outline-none focus:ring-2 focus:ring-red-500 focus:bg-white transition-all appearance-none cursor-pointer">
                  <option>Select Reason</option>
                  <option>Quality Control Failure</option>
                  <option>Temperature Excursion</option>
                  <option>Contamination Suspected</option>
                  <option>Labeling Error</option>
                </select>
                <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-slate-400">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mb-6">
            <label className="block text-sm font-bold text-slate-800 mb-3">Recall Severity</label>
            <div className="flex gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <div className="w-5 h-5 rounded-full border-2 border-red-600 flex items-center justify-center">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-600"></div>
                </div>
                <span className="text-sm font-medium text-slate-700">Critical (Class I)</span>
              </label>
              
              <label className="flex items-center gap-2 cursor-pointer opacity-70 hover:opacity-100 transition-opacity">
                <div className="w-5 h-5 rounded-full border-2 border-slate-300"></div>
                <span className="text-sm font-medium text-slate-700">High (Class II)</span>
              </label>
              
              <label className="flex items-center gap-2 cursor-pointer opacity-70 hover:opacity-100 transition-opacity">
                <div className="w-5 h-5 rounded-full border-2 border-slate-300"></div>
                <span className="text-sm font-medium text-slate-700">Standard (Class III)</span>
              </label>
            </div>
          </div>
          
          <div className="mb-6">
            <label className="block text-sm font-bold text-slate-800 mb-2">Patient Instructions & Message</label>
            <textarea 
              rows="4" 
              placeholder="Please provide detailed instructions for patients holding this medication..." 
              className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-red-500 focus:bg-white transition-all resize-none placeholder:text-slate-400 font-medium"
            ></textarea>
          </div>
          
          <div className="mb-8">
            <label className="block text-sm font-bold text-slate-800 mb-3">Notify via Channels</label>
            <div className="flex flex-wrap gap-3">
              <label className="flex items-center gap-2 px-4 py-2 rounded-lg border border-red-200 bg-red-50 text-red-800 font-semibold text-sm cursor-pointer shadow-sm">
                <div className="w-4 h-4 rounded bg-red-600 flex items-center justify-center text-white">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
                Wallet App
              </label>
              
              <label className="flex items-center gap-2 px-4 py-2 rounded-lg border border-red-200 bg-red-50 text-red-800 font-semibold text-sm cursor-pointer shadow-sm">
                <div className="w-4 h-4 rounded bg-red-600 flex items-center justify-center text-white">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
                SMS Alert
              </label>
              
              <label className="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 bg-white text-slate-600 font-semibold text-sm cursor-pointer hover:bg-slate-50 transition-colors shadow-sm">
                <div className="w-4 h-4 rounded border-2 border-slate-300"></div>
                API Hook
              </label>
            </div>
          </div>
          
          <div>
            <button className="w-full py-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-lg shadow-red-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer text-lg mb-3">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m3 11 18-5v12L3 14v-3z"/><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/></svg>
              Broadcast Recall on Blockchain
            </button>
            <p className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              IMMUTABLE ACTION: THIS CANNOT BE UNDONE
            </p>
          </div>
        </div>
        
        {/* Right Column - Previous Recalls */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8 flex flex-col">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
            <h3 className="text-xl font-bold text-slate-900">Previous Recalls</h3>
            <span className="text-xs font-bold bg-slate-100 text-slate-500 px-3 py-1 rounded-md tracking-wider">LOGS</span>
          </div>
          
          <div className="space-y-4 flex-1">
            {/* Active Recall Card */}
            <div className="bg-red-50 rounded-2xl p-5 border border-red-100/80 shadow-sm relative overflow-hidden">
              <div className="flex items-start justify-between mb-1">
                <h4 className="text-lg font-bold text-red-900">Cough Syrup (MaxStrength)</h4>
                <div className="flex items-center gap-1.5 bg-white border border-red-200 px-2.5 py-1 rounded-md shadow-sm">
                  <span className="text-[10px] font-extrabold text-red-700 tracking-wider">ACTIVE</span>
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></div>
                </div>
              </div>
              
              <p className="text-sm font-semibold text-red-800/70 mb-5">Batch: BTC-88210</p>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="font-semibold text-red-800/80">Reason:</span>
                  <span className="font-bold text-red-900 text-right">Temperature Excursion</span>
                </div>
                
                <div className="flex justify-between items-center text-sm">
                  <span className="font-semibold text-red-800/80">Patients Notified:</span>
                  <span className="font-bold text-red-900 text-right">412 / 412</span>
                </div>
                
                <div className="mt-2 w-full h-1.5 bg-red-200/60 rounded-full overflow-hidden">
                  <div className="h-full bg-red-600 rounded-full w-full"></div>
                </div>
              </div>
            </div>
            
            {/* Resolved Recall Card */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
              <div className="flex items-start justify-between mb-1">
                <h4 className="text-lg font-bold text-slate-800">Vitamin C Complex</h4>
                <div className="flex items-center px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-100/50">
                  <span className="text-[10px] font-extrabold tracking-wider">RESOLVED</span>
                </div>
              </div>
              
              <p className="text-sm font-semibold text-slate-500 mb-5">Batch: BTC-77102</p>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="font-medium text-slate-500">Reason:</span>
                  <span className="font-semibold text-slate-800 text-right">Labeling Error</span>
                </div>
                
                <div className="flex justify-between items-center text-sm">
                  <span className="font-medium text-slate-500">Patients Notified:</span>
                  <span className="font-semibold text-slate-800 text-right">825 / 838</span>
                </div>
                
                <div className="flex justify-between items-center text-sm">
                  <span className="font-medium text-slate-500">Closed Date:</span>
                  <span className="font-semibold text-slate-800 text-right">Oct 12, 2023</span>
                </div>
              </div>
              
              <button className="w-full mt-5 py-2.5 border-2 border-slate-100 hover:bg-slate-50 text-slate-700 font-bold rounded-xl text-sm transition-colors cursor-pointer shadow-sm">
                View Full Audit Report
              </button>
            </div>
          </div>
          
          <div className="pt-6 mt-4 opacity-90 border-t border-slate-50 text-center">
            <button className="text-sm font-bold text-red-600 hover:text-red-700 tracking-wide transition-colors cursor-pointer">
              Download Historical Recall Log (CSV)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ComplianceExportContent() {
  const exports = [
    { id: 'EXP-992', title: 'Q1 FDA Quality Report', type: 'PDF', date: 'Oct 24, 2024', size: '2.4 MB' },
    { id: 'EXP-991', title: 'Cold Chain Audit - Europe', type: 'CSV', date: 'Oct 20, 2024', size: '1.1 MB' },
    { id: 'EXP-990', title: 'EMA Compliance Summary', type: 'PDF', date: 'Oct 15, 2024', size: '3.8 MB' },
  ];

  return (
    <div className="max-w-4xl space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Compliance Exports</h2>
          <p className="text-slate-500 mt-2">Generate regulatory reports from blockchain provenance data.</p>
        </div>
        <button className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-lg shadow-sm shadow-emerald-500/20 transition-all cursor-pointer">
          <PlusSquare size={18} />
          New Export
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <h3 className="font-semibold text-slate-800">Recent Exports</h3>
          <div className="flex gap-2">
            <button className="p-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-white transition-colors bg-white cursor-pointer"><Settings size={16}/></button>
          </div>
        </div>
        
        <div className="divide-y divide-slate-100">
          {exports.map((exp) => (
            <div key={exp.id} className="p-5 flex items-center justify-between hover:bg-slate-50 transition-colors group">
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${exp.type === 'PDF' ? 'bg-red-50 text-red-500' : 'bg-emerald-50 text-emerald-500'}`}>
                  {exp.type === 'PDF' ? <FileIcon size={20} /> : <FileSpreadsheet size={20} />}
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 group-hover:text-emerald-600 transition-colors">{exp.title}</h4>
                  <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                    <span>ID: {exp.id}</span>
                    <span>•</span>
                    <span>{exp.date}</span>
                    <span>•</span>
                    <span>{exp.size}</span>
                  </div>
                </div>
              </div>
              <button className="p-2 bg-white border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 hover:text-emerald-600 transition-colors cursor-pointer">
                <Download size={18} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function RegisterBatch({ initialTab = 'register' }) {
  const navigate = useNavigate();
  const [activeTab] = useState(initialTab);

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "var(--bg)", fontFamily: "'Inter', system-ui, sans-serif", color: "var(--text2)" }}>

      {/* SIDEBAR */}
      <aside className="w-64 flex flex-col" style={{ background: "var(--sidebar)", color: "var(--side-mute)" }}>
        <Link to="/" className="w-full bg-transparent border-0 flex items-center gap-3 px-6 py-8 hover:opacity-90 transition-opacity text-left cursor-pointer" style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
          <div className="w-8 h-8 rounded flex items-center justify-center text-white font-bold text-xl" style={{ background: "var(--green)" }}>
            P
          </div>
          <span className="font-bold tracking-wide text-lg" style={{ color: "var(--side-text)" }}>
            PRAMANCHAIN
          </span>
        </Link>

        <nav className="flex-1 px-4 space-y-2">
          <button
            onClick={() => navigate('/manufacturer')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'dashboard'
                ? 'bg-slate-700/50 text-emerald-400 font-medium border border-slate-700/50'
                : 'hover:bg-slate-800 hover:text-white'
              }`}
          >
            <LayoutDashboard size={20} />
            Dashboard
          </button>
          <button
            onClick={() => navigate('/manufacturer/register-batch')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'register'
                ? 'bg-slate-700/50 text-emerald-400 font-medium border border-slate-700/50'
                : 'hover:bg-slate-800 hover:text-white'
              }`}
          >
            <PlusSquare size={20} />
            Register Batch
          </button>

          <button
            onClick={() => navigate('/manufacturer/batch-list')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors cursor-pointer ${activeTab === 'batchList'
                ? 'bg-slate-700/50 text-emerald-400 font-medium border border-slate-700/50'
                : 'hover:bg-slate-800 hover:text-white'
              }`}
          >
            <Layers size={20} />
            Batch List
          </button>
          <button
            onClick={() => navigate('/manufacturer/batch-detail')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors cursor-pointer ${activeTab === 'batchDetail'
                ? 'bg-slate-700/50 text-emerald-400 font-medium border border-slate-700/50'
                : 'hover:bg-slate-800 hover:text-white'
              }`}
          >
            <FileText size={20} />
            Batch Detail
          </button>
          <button
            onClick={() => navigate('/manufacturer/anomaly-alerts')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors cursor-pointer ${activeTab === 'anomalyAlerts'
                ? 'bg-slate-700/50 text-emerald-400 font-medium border border-slate-700/50'
                : 'hover:bg-slate-800 hover:text-white'
              }`}
          >
            <AlertTriangle size={20} />
            Anomaly Alerts
          </button>
          <button
            onClick={() => navigate('/manufacturer/trigger-recall')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors cursor-pointer ${activeTab === 'triggerRecall'
                ? 'bg-slate-700/50 text-emerald-400 font-medium border border-slate-700/50'
                : 'hover:bg-slate-800 hover:text-white'
              }`}
          >
            <Zap size={20} />
            Trigger Recall
          </button>
          <button
            onClick={() => navigate('/manufacturer/compliance-export')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors cursor-pointer ${activeTab === 'complianceExport'
                ? 'bg-slate-700/50 text-emerald-400 font-medium border border-slate-700/50'
                : 'hover:bg-slate-800 hover:text-white'
              }`}
          >
            <Download size={20} />
            Compliance Export
          </button>
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
            <h1 className="text-2xl font-bold text-slate-800">
              {activeTab === 'dashboard' ? 'Dashboard' : activeTab === 'batchList' ? 'Batch List' : activeTab === 'batchDetail' ? 'Batch Detail' : activeTab === 'anomalyAlerts' ? 'Anomaly Alerts' : activeTab === 'triggerRecall' ? 'Trigger Recall' : activeTab === 'complianceExport' ? 'Compliance Export' : 'Register Batch'}
            </h1>
          </div>

        </header>

        <div className="px-8 pb-8 pt-6 relative min-h-0 flex-1 overflow-auto">
          {activeTab === 'dashboard' && <DashboardContent />}
          {activeTab === 'register' && <RegisterBatchContent />}
          {activeTab === 'batchList' && <BatchListContent />}
          {activeTab === 'batchDetail' && <BatchDetailContent />}
          {activeTab === 'anomalyAlerts' && <AnomalyAlertsContent />}
          {activeTab === 'triggerRecall' && <TriggerRecallContent />}
          {activeTab === 'complianceExport' && <ComplianceExportContent />}
        </div>
      </main>
    </div>
  );
}