import React, { useEffect, useMemo, useState } from 'react';
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
  Bell,
  Search,
  Calendar,
  Eye,
  QrCode,
  Clock,
  ArrowUp,
  Filter
} from 'lucide-react';

export default function BatchList() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('batchList');
  const [searchTerm, setSearchTerm] = useState('');
  const [batchesData, setBatchesData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    const loadBatches = async () => {
      setIsLoading(true);
      setLoadError('');
      try {
        const response = await fetch('/api/drugs');
        const data = await response.json();

        if (!response.ok || !data?.ok) {
          throw new Error(data?.message || 'Failed to load batches');
        }

        setBatchesData(Array.isArray(data.batches) ? data.batches : []);
      } catch (err) {
        setLoadError(err.message || 'Unable to load batch list');
      } finally {
        setIsLoading(false);
      }
    };

    loadBatches();
  }, []);

  const formatDate = (isoOrDate) => {
    if (!isoOrDate) return 'N/A';
    const d = new Date(isoOrDate);
    if (Number.isNaN(d.getTime())) return String(isoOrDate);
    return d.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const tableRows = useMemo(() => {
    return batchesData.map((b) => {
      const exp = new Date(b.expDate);
      const isExpired = !Number.isNaN(exp.getTime()) && exp < new Date();
      const status = isExpired ? 'Expired' : (b.txHash ? 'Verified' : 'Flagged');
      return {
        id: b.batchId,
        name: b.productName,
        dosage: b.category || 'N/A',
        mfg: formatDate(b.mfgDate),
        exp: formatDate(b.expDate),
        status,
        scans: 0,
        location: [b.plantCode || 'Unknown Plant', b.manufacturerId || 'Unknown Manufacturer'],
      };
    });
  }, [batchesData]);

  const filteredRows = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return tableRows;
    return tableRows.filter((r) =>
      r.id.toLowerCase().includes(q) ||
      r.name.toLowerCase().includes(q)
    );
  }, [searchTerm, tableRows]);

  const stats = useMemo(() => {
    const total = tableRows.length;
    const verified = tableRows.filter((b) => b.status === 'Verified').length;
    const flagged = tableRows.filter((b) => b.status === 'Flagged').length;
    const expired = tableRows.filter((b) => b.status === 'Expired').length;
    return { total, verified, flagged, expired };
  }, [tableRows]);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Verified':
        return <span className="px-3 py-1 bg-emerald-100/80 text-emerald-700 rounded-full text-[11px] font-bold tracking-wide border border-emerald-200 uppercase">Verified</span>;
      case 'Flagged':
        return <span className="px-3 py-1 bg-red-100/80 text-red-700 rounded-full text-[11px] font-bold tracking-wide border border-red-200 uppercase">Flagged</span>;
      case 'Expired':
        return <span className="px-3 py-1 bg-orange-100/80 text-orange-700 rounded-full text-[11px] font-bold tracking-wide border border-orange-200 uppercase">Expired</span>;
      default:
        return <span className="px-3 py-1 bg-slate-100/80 text-slate-700 rounded-full text-[11px] font-bold tracking-wide border border-slate-200 uppercase">{status}</span>;
    }
  };

  return (
    <div className="flex h-screen bg-[#f8fafc] font-sans text-slate-900 overflow-hidden">
      
      {/* SIDEBAR */}
      <aside className="w-[260px] bg-[#1e293b] flex flex-col text-slate-300 flex-shrink-0">
        <Link to="/" className="w-full bg-transparent border-0 flex items-center gap-3 px-6 py-8 hover:opacity-90 transition-opacity text-left cursor-pointer">
          <div className="w-8 h-8 rounded bg-emerald-500 flex items-center justify-center text-white font-bold text-xl">
            P
          </div>
          <span className="text-white font-bold tracking-wide text-lg">
            PRAMANCHAIN
          </span>
        </Link>

        <nav className="flex-1 px-4 space-y-2">
          <button onClick={() => navigate('/manufacturer')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'dashboard' ? 'bg-slate-700/50 text-emerald-400 font-medium border border-slate-700/50' : 'hover:bg-slate-800 hover:text-white'}`}>
            <LayoutDashboard size={20} />
            Dashboard
          </button>
          <button onClick={() => navigate('/manufacturer/register-batch')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'register' ? 'bg-slate-700/50 text-emerald-400 font-medium border border-slate-700/50' : 'hover:bg-slate-800 hover:text-white'}`}>
            <PlusSquare size={20} />
            Register Batch
          </button>
          <button onClick={() => navigate('/manufacturer/batch-list')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'batchList' ? 'bg-slate-700/60 text-emerald-400 font-medium border border-slate-700/50 -ml-1 pl-5' : 'hover:bg-slate-800 hover:text-white'}`}>
            <Layers size={20} />
            Batch List
          </button>
          <button 
          onClick={() => navigate('/manufacturer/batch-detail')}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-800 hover:text-white transition-colors cursor-pointer">
            <FileText size={20} />
            Batch Detail
          </button>
          <button 
          onClick={() => navigate('/manufacturer/anomaly-alerts')}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-800 hover:text-white transition-colors cursor-pointer">
            <AlertTriangle size={20} />
            Anomaly Alerts
          </button>
          <button 
          onClick={() => navigate('/manufacturer/trigger-recall')}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-800 hover:text-white transition-colors cursor-pointer">
            <Zap size={20} />
            Trigger Recall
          </button>
          <button
            onClick={() => navigate('/manufacturer/compliance-export')}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-800 hover:text-white transition-colors cursor-pointer"
          >
            <Download size={20} />
            Compliance Export
          </button>
        </nav>

        <div className="p-4 border-t border-slate-700/50">
          <div className="flex items-center justify-between cursor-pointer hover:bg-slate-800 p-2 rounded-lg transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-slate-600 overflow-hidden border border-slate-500">
                <img src="https://i.pravatar.cc/150?img=11" alt="Profile" className="w-full h-full object-cover" />
              </div>
              <div className="text-left">
                <p className="text-white text-sm font-semibold">Sun Pharma Ltd</p>
                <p className="text-slate-400 text-[11px] font-mono tracking-wider mt-0.5">0xAb3c...8f1d</p>
              </div>
            </div>
            <Settings size={16} className="text-slate-400" />
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col overflow-y-auto">
        <header className="flex items-center justify-between px-8 py-5 bg-white border-b border-slate-100 sticky top-0 z-20">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold text-slate-800">Dashboard Overview</h1>
          </div>
          
        </header>

        <div className="px-8 py-8 w-[1050px]">
          
          {/* Header */}
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">Batch List</h2>
            <div className="flex items-center gap-4">
               <button className="text-slate-400 hover:text-slate-600 relative p-2 rounded-full hover:bg-slate-100 transition-colors">
                 <Bell size={20} />
                 <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full border border-white"></span>
               </button>
               <button onClick={() => navigate('/manufacturer/register-batch')} className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors shadow-sm">
                 <PlusSquare size={18} />
                 Register New Batch
               </button>
            </div>
          </div>

          <div className="flex items-center text-sm text-slate-600 gap-1.5 mb-8 font-medium">
            <Clock size={14} className="text-slate-400" />
            <span>{stats.total} total batches &bull; Synced from blockchain registry</span>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-5 border border-slate-200/80 rounded-2xl shadow-sm flex flex-col justify-center">
               <h4 className="text-sm font-semibold text-slate-700 mb-2 mt-1">Total Batches</h4>
               <div className="text-[32px] font-extrabold text-slate-800 mb-2 leading-none">{stats.total}</div>
               <div className="flex items-center text-xs font-semibold text-emerald-600">
                 <ArrowUp size={14} strokeWidth={3} className="mr-1" />
                 12% from last month
               </div>
            </div>
            
            <div className="bg-white p-5 border border-slate-200/80 rounded-2xl shadow-sm flex flex-col justify-center">
               <h4 className="text-sm font-semibold text-slate-700 mb-2 mt-1">Verified</h4>
               <div className="text-[32px] font-extrabold text-slate-800 mb-2 leading-none">{stats.verified}</div>
               <div className="text-xs font-semibold text-slate-500">
                 97.7% Compliance rate
               </div>
            </div>

            <div className="bg-white p-5 border border-slate-200/80 rounded-2xl shadow-sm flex flex-col justify-center">
               <h4 className="text-sm font-semibold text-slate-700 mb-2 mt-1">Flagged</h4>
               <div className="text-[32px] font-extrabold text-rose-600 mb-2 leading-none">{stats.flagged}</div>
               <div className="text-xs font-semibold text-rose-700">
                 Requires immediate attention
               </div>
            </div>

            <div className="bg-white p-5 border border-slate-200/80 rounded-2xl shadow-sm flex flex-col justify-center">
               <h4 className="text-sm font-semibold text-slate-700 mb-2 mt-1">Expired</h4>
               <div className="text-[32px] font-extrabold text-orange-500 mb-2 leading-none">{stats.expired}</div>
               <div className="text-xs font-semibold text-orange-600">
                 Removal pending
               </div>
            </div>
          </div>

          {/* Table Component */}
          <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm flex flex-col overflow-hidden">
            
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-[17px] font-bold text-slate-800">All Registered Batches</h3>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search drug or ID..."
                    className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm font-medium focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 w-[240px] shadow-sm transition-all text-slate-700 placeholder:text-slate-400"
                  />
                </div>
                <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 text-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-50 shadow-sm transition-colors">
                  All Statuses
                </button>
                <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 text-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-50 shadow-sm transition-colors">
                  <Calendar size={16} className="text-slate-400" />
                  Date Filter
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse whitespace-nowrap">
                <thead>
                  <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-800 uppercase tracking-widest bg-slate-50/50">
                    <th className="px-6 py-4 rounded-tl-xl">BATCH ID</th>
                    <th className="px-6 py-4">DRUG NAME</th>
                    <th className="px-6 py-4">MANUFACTURED</th>
                    <th className="px-6 py-4">EXPIRY</th>
                    <th className="px-6 py-4">STATUS</th>
                    <th className="px-6 py-4">SCANS</th>
                    <th className="px-6 py-4">LAST LOCATION</th>
                    <th className="px-6 py-4 text-right rounded-tr-xl">ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {!isLoading && !loadError && filteredRows.map((batch, i) => (
                    <tr key={i} className="hover:bg-slate-50/80 transition-colors group">
                      <td className="px-6 py-4 font-semibold text-blue-600">#{batch.id}</td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-800 mb-0.5">{batch.name}</div>
                        <div className="text-xs font-semibold text-slate-500">{batch.dosage}</div>
                      </td>
                      <td className="px-6 py-4 font-semibold text-slate-600">{batch.mfg}</td>
                      <td className="px-6 py-4 font-semibold text-slate-600">{batch.exp}</td>
                      <td className="px-6 py-4">{getStatusBadge(batch.status)}</td>
                      <td className="px-6 py-4 font-bold text-slate-700">{batch.scans}</td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-800 mb-0.5">{batch.location[0]}</div>
                        <div className="text-[11px] font-medium text-slate-500">{batch.location[1]}</div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => navigate(`/manufacturer/batch-detail/${encodeURIComponent(batch.id)}`)}
                            className="text-blue-600 hover:text-blue-800 text-sm font-bold flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md hover:bg-blue-50 transition-colors"
                          >
                            View
                            <span className="flex flex-col items-center justify-center gap-[2px]">
                               <QrCode size={16} className="text-slate-400 group-hover:text-blue-600 transition-colors" />
                            </span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {isLoading && (
                    <tr>
                      <td colSpan={8} className="px-6 py-10 text-center text-slate-500 font-medium">Loading registered batches...</td>
                    </tr>
                  )}
                  {!isLoading && loadError && (
                    <tr>
                      <td colSpan={8} className="px-6 py-10 text-center text-rose-600 font-medium">{loadError}</td>
                    </tr>
                  )}
                  {!isLoading && !loadError && filteredRows.length === 0 && (
                    <tr>
                      <td colSpan={8} className="px-6 py-10 text-center text-slate-500 font-medium">No batches found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between text-sm bg-slate-50/30">
              <div className="text-slate-500 font-medium">
                Showing <span className="font-bold text-slate-800">{filteredRows.length > 0 ? 1 : 0}</span> to <span className="font-bold text-slate-800">{filteredRows.length}</span> of <span className="font-bold text-slate-800">{stats.total}</span> results
              </div>
              <div className="flex items-center gap-1.5">
                <button className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 font-semibold hover:bg-slate-100 transition-colors shadow-sm bg-white">Previous</button>
                <button className="w-9 h-9 flex items-center justify-center bg-blue-600 text-white rounded-lg font-bold shadow-sm">1</button>
                <button className="w-9 h-9 flex items-center justify-center border border-slate-200 bg-white text-slate-600 rounded-lg font-bold hover:bg-slate-50 transition-colors shadow-sm">2</button>
                <button className="w-9 h-9 flex items-center justify-center border border-slate-200 bg-white text-slate-600 rounded-lg font-bold hover:bg-slate-50 transition-colors shadow-sm">3</button>
                <span className="px-2 text-slate-400 font-bold tracking-widest">...</span>
                <button className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 font-semibold hover:bg-slate-100 transition-colors shadow-sm bg-white">Next</button>
              </div>
            </div>
          </div>
          
        </div>
      </main>
    </div>
  );
}
