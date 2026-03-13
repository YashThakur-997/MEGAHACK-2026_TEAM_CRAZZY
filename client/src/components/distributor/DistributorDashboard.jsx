import React, { useEffect, useState } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";

function DistributorDashboard() {
  const [scanResult, setScanResult] = useState(null);
  const [verifyResult, setVerifyResult] = useState(null);
  const [error, setError] = useState("");

  const startScanner = () => {
    setError("");
    const scanner = new Html5QrcodeScanner(
      "qr-reader",
      { fps: 10, qrbox: 250 },
      false
    );

    scanner.render(
      async (decodedText) => {
        try {
          scanner.clear();

          const parsed = JSON.parse(decodedText); // QR JSON payload
          setScanResult(parsed);

          // Verify with backend using batchId
          const batchId = parsed?.batch?.batchId || parsed?.bid;
          if (!batchId) throw new Error("batchId not found in QR");

          const res = await fetch(`/api/drugs/verify/${batchId}`);
          const data = await res.json();
          setVerifyResult(data);
        } catch (e) {
          setError("Invalid QR content: " + e.message);
        }
      },
      () => {
        // scan errors are frequent; ignore noisy logs
      }
    );
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Scan Batch QR</h2>
      <button onClick={startScanner}>Start Scanner</button>
      <div id="qr-reader" style={{ width: 320, marginTop: 16 }} />

      {error && <p style={{ color: "red" }}>{error}</p>}

      {scanResult && (
        <div style={{ marginTop: 20 }}>
          <h3>QR Decoded Batch Info</h3>
          <pre>{JSON.stringify(scanResult, null, 2)}</pre>
        </div>
      )}

      {verifyResult?.ok && (
        <div style={{ marginTop: 20 }}>
          <h3>
            Verification Status:{" "}
            <span style={{ color: verifyResult.status === "VERIFIED" ? "green" : "red" }}>
              {verifyResult.status}
            </span>
          </h3>
          <pre>{JSON.stringify(verifyResult, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
// ─── DATA ────────────────────────────────────────────────────────────────────
const SCANS = [
  { id:"BT-0984-MH", drug:"Amoxicillin 500mg",  mfr:"Sun Pharma",  qty:240, score:4,  status:"verified", time:"09:14", loc:"Mumbai Warehouse" },
  { id:"BT-0981-MH", drug:"Metformin 1000mg",   mfr:"Cipla",       qty:120, score:62, status:"anomaly",  time:"08:52", loc:"Mumbai Warehouse" },
  { id:"BT-0978-MH", drug:"Atorvastatin 20mg",  mfr:"Dr. Reddy's", qty:180, score:8,  status:"verified", time:"08:30", loc:"Pune Hub" },
  { id:"BT-0975-MH", drug:"Paracetamol 650mg",  mfr:"Unknown",     qty:500, score:94, status:"alert",    time:"08:05", loc:"Mumbai Warehouse" },
  { id:"BT-0972-MH", drug:"Azithromycin 250mg", mfr:"Alkem",       qty:60,  score:11, status:"verified", time:"07:48", loc:"Thane Branch" },
  { id:"BT-0969-MH", drug:"Pantoprazole 40mg",  mfr:"Zydus",       qty:90,  score:0,  status:"scanning", time:"07:22", loc:"Mumbai Warehouse" },
  { id:"BT-0960-MH", drug:"Insulin Glargine",   mfr:"Sanofi",      qty:48,  score:87, status:"alert",    time:"15:22", loc:"Cold Storage Bay" },
  { id:"BT-0958-MH", drug:"Cetirizine 10mg",    mfr:"Mankind",     qty:200, score:2,  status:"verified", time:"13:05", loc:"Pune Hub" },
  { id:"BT-0955-MH", drug:"Omeprazole 20mg",    mfr:"Zydus",       qty:150, score:48, status:"anomaly",  time:"10:41", loc:"Mumbai Warehouse" },
];

const ALERTS = [
  { id:"BT-0975-MH", drug:"Paracetamol 650mg", mfr:"Unknown", qty:500, score:94, type:"critical", title:"Counterfeit Risk Detected", evidence:"QR code hash mismatch with manufacturer database. Seal texture anomaly flagged. Supply chain gap detected.", risks:["QR hash mismatch","Unknown manufacturer","Chain gap detected","Seal texture anomaly"] },
  { id:"BT-0960-MH", drug:"Insulin Glargine",  mfr:"Sanofi",  qty:48,  score:87, type:"critical", title:"Cold Chain Breach",          evidence:"Temperature deviation detected — storage reached +12°C during transit. Cold chain integrity compromised.",   risks:["Temp +12°C detected","Cold chain broken","Efficacy risk","Transit breach"] },
  { id:"BT-0981-MH", drug:"Metformin 1000mg",  mfr:"Cipla",   qty:120, score:62, type:"warning",  title:"Seal Mismatch",              evidence:"Hologram discrepancy detected on batch seal. Visual pattern does not match Cipla's registered seal template.",    risks:["Hologram mismatch","Seal pattern off","Needs manual review"] },
  { id:"BT-0955-MH", drug:"Omeprazole 20mg",   mfr:"Zydus",   qty:150, score:48, type:"warning",  title:"Expiry Proximity",           evidence:"Batch expires in 21 days. Below minimum recommended shelf life for dispatch.",                                      risks:["Expires in 21 days","Below dispatch threshold"] },
  { id:"BT-0941-MH", drug:"Amlodipine 5mg",    mfr:"Cadila",  qty:300, score:55, type:"warning",  title:"Duplicate Batch ID",         evidence:"Batch ID scanned at two separate warehouse locations simultaneously.",                                              risks:["ID scanned at 2 locations","Possible duplication","Spoofing risk"] },
];

const INVENTORY = [
  { drug:"Amoxicillin 500mg",  cat:"Antibiotic",   id:"BT-0984-MH", mfr:"Sun Pharma",  stock:240, max:300, expiry:"Nov 2027", loc:"Bay 4 · Mumbai",    status:"instock"    },
  { drug:"Metformin 1000mg",   cat:"Diabetes",      id:"BT-0981-MH", mfr:"Cipla",       stock:38,  max:120, expiry:"Feb 2027", loc:"Bay 2 · Mumbai",    status:"low"        },
  { drug:"Paracetamol 650mg",  cat:"Analgesic",     id:"BT-0975-MH", mfr:"Unknown",     stock:500, max:500, expiry:"Mar 2027", loc:"Quarantine Bay",    status:"quarantine" },
  { drug:"Atorvastatin 20mg",  cat:"Cardiac",       id:"BT-0978-MH", mfr:"Dr. Reddy's", stock:180, max:200, expiry:"Jan 2028", loc:"Bay 6 · Pune",      status:"instock"    },
  { drug:"Insulin Glargine",   cat:"Cold Chain",    id:"BT-0960-MH", mfr:"Sanofi",      stock:48,  max:50,  expiry:"Aug 2026", loc:"Cold Bay · Mumbai", status:"quarantine" },
  { drug:"Azithromycin 250mg", cat:"Antibiotic",    id:"BT-0972-MH", mfr:"Alkem",       stock:60,  max:60,  expiry:"May 2028", loc:"Bay 3 · Thane",     status:"instock"    },
];

const PENDING = [
  { id:"BT-0987", drug:"Metformin 500mg",  qty:120 },
  { id:"BT-0988", drug:"Lisinopril 10mg",  qty:90  },
  { id:"BT-0989", drug:"Cetirizine 10mg",  qty:60  },
];
const CHART_BARS = [30,50,40,70,60,85,75,90];

// ─── HELPERS ─────────────────────────────────────────────────────────────────
const mono = { fontFamily:"'IBM Plex Mono', monospace" };
const inter = { fontFamily:"'Inter', system-ui, sans-serif" };

const scoreClass = s => s>=80?{color:"var(--red)"}:s>=40?{color:"var(--amber)"}:{color:"var(--green)"};
const barFill = pct => pct>50?"#22C55E":pct>=15?"#F59E0B":"#EF4444";

function StatusBadge({ status }) {
  const m = {
    verified:   { label:"✓ Verified",   bg:"var(--green-bg)", color:"#16A34A", border:"1px solid var(--green-bdr)" },
    anomaly:    { label:"⚠ Anomaly",    bg:"var(--amber-bg)", color:"#D97706", border:"1px solid #FCD34D" },
    alert:      { label:"✕ Alert",      bg:"var(--red-bg)",   color:"#DC2626", border:"1px solid var(--red-bdr)"   },
    scanning:   { label:"↻ Scanning",   bg:"var(--blue-bg)",  color:"var(--blue)", border:"1px solid #BFDBFE"      },
    instock:    { label:"In Stock",     bg:"var(--green-bg)", color:"#16A34A", border:"1px solid var(--green-bdr)" },
    low:        { label:"⚠ Low Stock",  bg:"var(--amber-bg)", color:"#D97706", border:"1px solid #FCD34D" },
    quarantine: { label:"🔒 Quarantined",bg:"var(--red-bg)", color:"#DC2626", border:"1px solid var(--red-bdr)"   },
  }[status] || {};
  return (
    <span style={{ ...m, ...inter, fontSize:11, fontWeight:500, borderRadius:99, padding:"4px 10px", whiteSpace:"nowrap" }}>
      {m.label}
    </span>
  );
}

// Sparkline polyline
function Sparkline({ color, values }) {
  const w=64, h=20;
  const max=Math.max(...values), min=Math.min(...values);
  const pts = values.map((v,i)=>`${(i/(values.length-1))*w},${h-((v-min)/(max-min||1))*(h-2)}`).join(" ");
  return (
    <svg width={w} height={h} style={{ opacity:0.45, flexShrink:0 }}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

// Hex SVG icon (logo)
function HexLogo() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32">
      <polygon points="16,2 28,9 28,23 16,30 4,23 4,9"
        fill="rgba(34,197,94,0.15)" stroke="#22C55E" strokeWidth="1.5" strokeLinejoin="round"/>
      <path d="M11 16l3 3 7-7" stroke="#22C55E" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    </svg>
  );
}

// Count-up hook
function useCountUp(target, duration=1000) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let start=0, step=Math.ceil(target/40), t=setInterval(()=>{
      start=Math.min(start+step, target);
      setVal(start);
      if(start>=target) clearInterval(t);
    }, duration/40);
    return () => clearInterval(t);
  }, [target, duration]);
  return val;
}

// ─── PAGES ───────────────────────────────────────────────────────────────────
function Dashboard({ setPage }) {
  return (
    <div style={{ padding:32, display:"flex", flexDirection:"column", gap:20 }}>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:16 }}>
        {[
          { label:"Scans Today",      value:"142", sub:"↑ 12% vs yesterday",    accent:"#22C55E", valColor:"var(--green)" },
          { label:"Pending Scans",    value:"17",  sub:"3 batches awaiting",     accent:"#F59E0B", valColor:"var(--amber)" },
          { label:"Active Alerts",    value:"5",   sub:"2 critical, 3 warnings", accent:"#EF4444", valColor:"var(--red)"   },
          { label:"Batches In Stock", value:"389", sub:"↑ 8% this week",         accent:"#1D4ED8", valColor:"var(--blue)"  },
        ].map(s=>(
          <div key={s.label} style={{ background:"var(--surface)", border:"1px solid var(--border)", borderTop:`3px solid ${s.accent}`, borderRadius:12, padding:"20px 24px", boxShadow:"var(--shadow-card)" }}>
            <div style={{ ...mono, fontSize:10, color:"var(--text3)", textTransform:"uppercase", letterSpacing:2, marginBottom:10 }}>{s.label}</div>
            <div style={{ fontSize:40, fontWeight:800, color:s.valColor, ...inter, marginBottom:6 }}>{s.value}</div>
            <div style={{ fontSize:12, color:"var(--text4)" }}>{s.sub}</div>
          </div>
        ))}
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"3fr 2fr", gap:20 }}>
        <div style={{ background:"var(--surface)", border:"1px solid var(--border)", borderRadius:12, overflow:"hidden", boxShadow:"var(--shadow-card)" }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"16px 20px", borderBottom:"1px solid var(--border)" }}>
            <div>
              <div style={{ fontSize:14, fontWeight:700, color:"var(--text)" }}>Recent Scan Activity</div>
              <div style={{ ...mono, fontSize:11, color:"var(--text3)", marginTop:2 }}>Last 24 hours · Auto-refreshing</div>
            </div>
            <button onClick={()=>setPage("history")} style={{ ...inter, fontSize:12, color:"var(--text3)", border:"1px solid var(--border)", borderRadius:7, padding:"5px 12px", background:"none", cursor:"pointer" }}>View all →</button>
          </div>
          <table style={{ width:"100%", borderCollapse:"collapse" }}>
            <thead><tr style={{ background:"#F8FAFC" }}>
              {["Batch ID","Drug","Qty","Status","Time"].map(h=>(
                <th key={h} style={{ ...mono, fontSize:10, color:"var(--text3)", textTransform:"uppercase", letterSpacing:1, padding:"10px 16px", textAlign:"left", fontWeight:500 }}>{h}</th>
              ))}
            </tr></thead>
            <tbody>{SCANS.slice(0,6).map(s=>(
              <tr key={s.id} style={{ borderBottom:"1px solid #F1F5F9" }}
                onMouseEnter={e=>e.currentTarget.style.background="#F8FAFC"}
                onMouseLeave={e=>e.currentTarget.style.background=""}>
                <td style={{ ...mono, fontSize:11, color:"var(--text2)", padding:"13px 16px" }}>{s.id}</td>
                <td style={{ fontSize:13, color:"var(--text)", padding:"13px 16px" }}>{s.drug}</td>
                <td style={{ fontSize:13, color:"var(--text3)", padding:"13px 16px" }}>{s.qty}</td>
                <td style={{ padding:"13px 16px" }}><StatusBadge status={s.status}/></td>
                <td style={{ ...mono, fontSize:11, color:"var(--text3)", padding:"13px 16px" }}>{s.time}</td>
              </tr>
            ))}</tbody>
          </table>
        </div>
        <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
          <div style={{ background:"var(--surface)", border:"1px solid var(--border)", borderRadius:12, overflow:"hidden", boxShadow:"var(--shadow-card)" }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"16px 20px", borderBottom:"1px solid var(--border)" }}>
              <div style={{ fontSize:14, fontWeight:700, color:"var(--text)" }}>Active Alerts</div>
              <StatusBadge status="alert"/>
            </div>
            {ALERTS.slice(0,3).map(a=>(
              <div key={a.id} style={{ display:"flex", alignItems:"center", gap:12, padding:"12px 20px", borderBottom:"1px solid #F1F5F9" }}>
                <div style={{ width:8, height:8, borderRadius:"50%", flexShrink:0, background:a.type==="critical"?"var(--red)":"var(--amber)", boxShadow:a.type==="critical"?"0 0 6px rgba(239,68,68,0.5)":"0 0 6px rgba(245,158,11,0.5)" }}/>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:12, fontWeight:600, color:"var(--text)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{a.title}</div>
                  <div style={{ ...mono, fontSize:10, color:"var(--text3)", marginTop:2 }}>{a.id} · {a.score}/100</div>
                </div>
                <StatusBadge status={a.type==="critical"?"alert":"anomaly"}/>
              </div>
            ))}
          </div>
          <div style={{ background:"var(--surface)", border:"1px solid var(--border)", borderRadius:12, padding:"20px", boxShadow:"var(--shadow-card)" }}>
            <div style={{ fontSize:14, fontWeight:700, color:"var(--text)", marginBottom:4 }}>Scan Rate</div>
            <div style={{ ...mono, fontSize:11, color:"var(--text3)", marginBottom:16 }}>Batches per hour today</div>
            <div style={{ display:"flex", alignItems:"flex-end", gap:4, height:56 }}>
              {CHART_BARS.map((h,i)=>(
                <div key={i} style={{ flex:1, display:"flex", alignItems:"flex-end" }}>
                  <div style={{ width:"100%", borderRadius:"3px 3px 0 0", height:`${h}%`, background:i===CHART_BARS.length-1?"rgba(34,197,94,0.35)":"rgba(34,197,94,0.12)", borderTop:i===CHART_BARS.length-1?"2px solid var(--green)":"2px solid rgba(34,197,94,0.35)" }}/>
                </div>
              ))}
            </div>
            <div style={{ display:"flex", justifyContent:"space-between", ...mono, fontSize:10, color:"var(--text4)", marginTop:8 }}>
              {["02:00","04:00","06:00","08:00","Now"].map(t=><span key={t}>{t}</span>)}
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
  const steps = [
    { label:"Manufacturer Release",         meta:"Sun Pharma · 07 Mar 2026 · 10:20",  done:true  },
    { label:"Regional Hub — Pune",          meta:"Scanned · 09 Mar 2026 · 14:35",     done:true  },
    { label:"Distributor Receive — Mumbai", meta:"Scanned · 13 Mar 2026 · 09:14",     done:true  },
    { label:"Pharmacy Dispatch",            meta:"Awaiting scan",                      done:false },
  ];
  const inputStyle = { background:"var(--surface)", border:"1px solid var(--border2)", borderRadius:8, padding:"9px 14px", fontSize:13, color:"var(--text)", outline:"none", width:"100%", ...inter };
  const focusIn = e=>{ e.target.style.borderColor="var(--green)"; e.target.style.boxShadow="0 0 0 3px rgba(34,197,94,0.15)"; };
  const focusOut = e=>{ e.target.style.borderColor="var(--border2)"; e.target.style.boxShadow="none"; };
  return (
    <div style={{ padding:32 }}>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:24 }}>
        <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
          <div style={{ background:"var(--surface)", border:"1px solid var(--border)", borderRadius:12, padding:24, boxShadow:"var(--shadow-card)" }}>
            <div onClick={()=>setBatchId("BT-0990-MH")} style={{ border:"2px dashed var(--border2)", borderRadius:10, padding:40, textAlign:"center", cursor:"pointer", marginBottom:20, transition:"all 0.15s" }}
              onMouseEnter={e=>{e.currentTarget.style.borderColor="var(--green)"; e.currentTarget.style.background="var(--green-bg)";}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor="var(--border2)"; e.currentTarget.style.background="";}}>
              <svg style={{ width:48, height:48, margin:"0 auto 12px", color:"var(--text3)" }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="5" height="5"/><rect x="16" y="3" width="5" height="5"/><rect x="3" y="16" width="5" height="5"/><line x1="16" y1="16" x2="21" y2="21"/><line x1="16" y1="21" x2="21" y2="16"/></svg>
              <div style={{ fontSize:13, color:"var(--text2)", marginBottom:4 }}>Tap to scan QR / Barcode</div>
              <div style={{ ...mono, fontSize:11, color:"var(--text3)" }}>or drag & drop · supports all 2D formats</div>
            </div>
            <div style={{ textAlign:"center", ...mono, fontSize:11, color:"var(--text4)", marginBottom:16 }}>— or enter manually —</div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
              {[
                { label:"Batch ID", val:batchId, set:setBatchId, ph:"BT-0985-MH" },
                { label:"Drug Name", val:"", set:()=>{}, ph:"Amoxicillin 500mg" },
                { label:"Manufacturer", val:"", set:()=>{}, ph:"Sun Pharma" },
                { label:"Quantity (units)", val:"", set:()=>{}, ph:"240", type:"number" },
                { label:"Mfg. Date", val:"", set:()=>{}, ph:"", type:"date" },
                { label:"Expiry Date", val:"", set:()=>{}, ph:"", type:"date" },
              ].map(f=>(
                <div key={f.label}>
                  <label style={{ ...mono, fontSize:10, color:"var(--text3)", textTransform:"uppercase", letterSpacing:1.5, display:"block", marginBottom:6 }}>{f.label}</label>
                  <input value={f.val} onChange={e=>f.set(e.target.value)} placeholder={f.ph} type={f.type||"text"} style={inputStyle} onFocus={focusIn} onBlur={focusOut}/>
                </div>
              ))}
            </div>
            <div style={{ marginTop:14 }}>
              <label style={{ ...mono, fontSize:10, color:"var(--text3)", textTransform:"uppercase", letterSpacing:1.5, display:"block", marginBottom:6 }}>Checkpoint Location</label>
              <input placeholder="Mumbai Central Warehouse — Bay 4" style={inputStyle} onFocus={focusIn} onBlur={focusOut}/>
            </div>
            <div style={{ display:"flex", gap:12, marginTop:20 }}>
              <button onClick={()=>{setLogged(true); setTimeout(()=>setLogged(false),2000);}}
                style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", gap:8, padding:"10px 0", borderRadius:8, border:"none", background:logged?"var(--green-dim)":"var(--green)", color:"#fff", fontSize:13, fontWeight:600, cursor:"pointer", boxShadow:"0 2px 8px rgba(34,197,94,0.3)", ...inter }}>
                {logged ? "✓ Logged!" : "✓ Log & Verify Batch"}
              </button>
              <button style={{ padding:"10px 16px", borderRadius:8, border:"1px solid var(--border2)", background:"var(--surface)", color:"var(--text2)", fontSize:13, fontWeight:500, cursor:"pointer", ...inter }}>Clear</button>
            </div>
          </div>
        </div>
        <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
          <div style={{ background:"var(--surface)", border:"1px solid var(--border)", borderRadius:12, padding:24, boxShadow:"var(--shadow-card)" }}>
            <div style={{ fontSize:14, fontWeight:700, color:"var(--text)", marginBottom:4 }}>Checkpoint Log</div>
            <div style={{ ...mono, fontSize:11, color:"var(--text3)", marginBottom:24 }}>BT-0984-MH · Amoxicillin 500mg</div>
            {steps.map((s,i)=>(
              <div key={i}>
                <div style={{ display:"flex", gap:16, alignItems:"flex-start" }}>
                  <div className={s.done?"step-done":"step-pending"}>{s.done?"✓":i+1}</div>
                  <div style={{ paddingTop:2 }}>
                    <div style={{ fontSize:13, fontWeight:600, color:s.done?"var(--text)":"var(--text3)" }}>{s.label}</div>
                    <div style={{ ...mono, fontSize:11, color:"var(--text3)", marginTop:2 }}>{s.meta}</div>
                  </div>
                </div>
                {i<steps.length-1&&<div style={{ width:1, height:16, background:"var(--border)", marginLeft:13, marginTop:4, marginBottom:4 }}/>}
              </div>
            ))}
            <div style={{ borderTop:"1px solid var(--border)", marginTop:20, paddingTop:16, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <div>
                <div style={{ ...mono, fontSize:10, color:"var(--text3)", textTransform:"uppercase", letterSpacing:1.5 }}>Chain Integrity</div>
                <div style={{ ...mono, fontSize:24, fontWeight:700, color:"var(--green)" }}>100%</div>
              </div>
              <StatusBadge status="verified"/>
            </div>
          </div>
          <div style={{ background:"var(--surface)", border:"1px solid var(--border)", borderRadius:12, padding:24, boxShadow:"var(--shadow-card)" }}>
            <div style={{ fontSize:14, fontWeight:700, color:"var(--text)", marginBottom:16 }}>Pending Scans</div>
            {PENDING.map(p=>(
              <div key={p.id} style={{ display:"flex", alignItems:"center", gap:12, padding:"10px 0", borderTop:"1px solid var(--border)" }}>
                <span style={{ ...mono, fontSize:11, background:"#F1F5F9", border:"1px solid var(--border)", borderRadius:4, padding:"2px 8px", color:"var(--text3)" }}>{p.id}</span>
                <span style={{ flex:1, fontSize:13, color:"var(--text)" }}>{p.drug}</span>
                <span style={{ ...mono, fontSize:11, color:"var(--text3)" }}>{p.qty} units</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ScanHistory() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const filtered = SCANS.filter(s=>{
    const ms=s.id.toLowerCase().includes(search.toLowerCase())||s.drug.toLowerCase().includes(search.toLowerCase());
    const mf=statusFilter==="all"||s.status===statusFilter;
    return ms&&mf;
  });
  const inputS = { background:"var(--surface)", border:"1px solid var(--border2)", borderRadius:8, padding:"8px 14px", fontSize:13, color:"var(--text)", outline:"none", height:36, ...inter };
  const fIn=e=>{e.target.style.borderColor="var(--green)"; e.target.style.boxShadow="0 0 0 3px rgba(34,197,94,0.15)";};
  const fOut=e=>{e.target.style.borderColor="var(--border2)"; e.target.style.boxShadow="none";};
  return (
    <div style={{ padding:32, display:"flex", flexDirection:"column", gap:16 }}>
      <div style={{ display:"flex", gap:10 }}>
        <div style={{ position:"relative", flex:1 }}>
          <svg style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", width:14, height:14, color:"var(--text3)" }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search by Batch ID, Drug, Manufacturer..." style={{ ...inputS, paddingLeft:36, width:"100%" }} onFocus={fIn} onBlur={fOut}/>
        </div>
        <select value={statusFilter} onChange={e=>setStatusFilter(e.target.value)} style={{ ...inputS, width:140 }} onFocus={fIn} onBlur={fOut}>
          {[["all","All Status"],["verified","Verified"],["anomaly","Anomaly"],["alert","Alert"]].map(([v,l])=><option key={v} value={v}>{l}</option>)}
        </select>
        <select style={{ ...inputS, width:130 }} onFocus={fIn} onBlur={fOut}><option>Last 7 days</option><option>Last 30 days</option><option>All time</option></select>
        <button style={{ ...inter, padding:"0 16px", height:36, borderRadius:8, border:"1px solid var(--border2)", background:"var(--surface)", color:"var(--text2)", fontSize:13, fontWeight:500, cursor:"pointer" }}>Export CSV</button>
      </div>
      <div style={{ background:"var(--surface)", border:"1px solid var(--border)", borderRadius:12, overflow:"hidden", boxShadow:"var(--shadow-card)" }}>
        <div style={{ padding:"14px 20px", borderBottom:"1px solid var(--border)" }}>
          <div style={{ fontSize:14, fontWeight:700, color:"var(--text)" }}>All Scan Records</div>
          <div style={{ ...mono, fontSize:11, color:"var(--text3)", marginTop:2 }}>{filtered.length} records · sorted by latest</div>
        </div>
        <table style={{ width:"100%", borderCollapse:"collapse" }}>
          <thead><tr style={{ background:"#F8FAFC" }}>
            {["Batch ID","Drug Name","Manufacturer","Qty","Anomaly Score","Status","Scanned At","Location"].map(h=>(
              <th key={h} style={{ ...mono, fontSize:10, color:"var(--text3)", textTransform:"uppercase", letterSpacing:1, padding:"10px 16px", textAlign:"left", fontWeight:500 }}>{h}</th>
            ))}
          </tr></thead>
          <tbody>{filtered.map(s=>(
            <tr key={s.id} style={{ borderBottom:"1px solid #F1F5F9" }}
              onMouseEnter={e=>e.currentTarget.style.background="#F8FAFC"}
              onMouseLeave={e=>e.currentTarget.style.background=""}>
              <td style={{ ...mono, fontSize:11, color:"var(--text2)", padding:"13px 16px" }}>{s.id}</td>
              <td style={{ fontSize:13, fontWeight:600, color:"var(--text)", padding:"13px 16px" }}>{s.drug}</td>
              <td style={{ fontSize:13, color:"var(--text3)", padding:"13px 16px" }}>{s.mfr}</td>
              <td style={{ fontSize:13, color:"var(--text3)", padding:"13px 16px" }}>{s.qty}</td>
              <td style={{ padding:"13px 16px" }}><span style={{ ...mono, fontSize:13, fontWeight:700, ...scoreClass(s.score) }}>{s.score}/100</span></td>
              <td style={{ padding:"13px 16px" }}><StatusBadge status={s.status}/></td>
              <td style={{ ...mono, fontSize:11, color:"var(--text3)", padding:"13px 16px" }}>13 Mar · {s.time}</td>
              <td style={{ fontSize:12, color:"var(--text3)", padding:"13px 16px" }}>{s.loc}</td>
            </tr>
          ))}</tbody>
        </table>
      </div>
    </div>
  );
}

function AlertDetail() {
  const [selected, setSelected] = useState(ALERTS[0]);
  return (
    <div style={{ padding:32 }}>
      <div style={{ display:"grid", gridTemplateColumns:"2fr 3fr", gap:24 }}>
        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
          {ALERTS.map(a=>(
            <div key={a.id} onClick={()=>setSelected(a)} style={{ borderRadius:12, padding:16, display:"flex", alignItems:"flex-start", gap:14, cursor:"pointer", transition:"all 0.15s", background:selected.id===a.id?"#F8FAFC":"var(--surface)", border:selected.id===a.id?"1px solid var(--border2)":"1px solid var(--border)", borderLeft:`3px solid ${a.type==="critical"?"var(--red)":"var(--amber)"}`, boxShadow:"var(--shadow-card)" }}>
              <div style={{ width:36, height:36, borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, background:a.type==="critical"?"var(--red-bg)":"var(--amber-bg)", color:a.type==="critical"?"var(--red)":"var(--amber)" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
              </div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontSize:13, fontWeight:600, color:"var(--text)" }}>{a.title}</div>
                <div style={{ ...mono, fontSize:10, color:"var(--text3)", marginTop:3 }}>{a.id} · {a.drug}</div>
                <div style={{ marginTop:8, height:4, background:"var(--border)", borderRadius:99, overflow:"hidden" }}>
                  <div style={{ height:"100%", width:`${a.score}%`, background:a.type==="critical"?"var(--red)":"var(--amber)", borderRadius:99 }}/>
                </div>
              </div>
              <div style={{ textAlign:"right", flexShrink:0 }}>
                <div style={{ ...mono, fontSize:18, fontWeight:700, color:a.type==="critical"?"var(--red)":"var(--amber)" }}>{a.score}</div>
                <div style={{ ...mono, fontSize:10, color:"var(--text4)" }}>/100</div>
              </div>
            </div>
          ))}
        </div>
        <div style={{ background:"var(--surface)", border:"1px solid var(--border)", borderRadius:12, padding:24, boxShadow:"var(--shadow-card)" }}>
          <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:16 }}>
            <StatusBadge status={selected.type==="critical"?"alert":"anomaly"}/>
            <span style={{ ...mono, fontSize:11, color:"var(--text3)" }}>{selected.id}</span>
          </div>
          <div style={{ fontSize:18, fontWeight:700, color:"var(--text)", marginBottom:4 }}>{selected.title}</div>
          <div style={{ fontSize:13, color:"var(--text3)", marginBottom:24 }}>{selected.drug} · {selected.qty} units · {selected.mfr}</div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:20 }}>
            <div style={{ background:"#F8FAFC", border:"1px solid var(--border)", borderRadius:12, padding:16, textAlign:"center" }}>
              <div style={{ ...mono, fontSize:48, fontWeight:700, color:selected.type==="critical"?"var(--red)":"var(--amber)" }}>{selected.score}</div>
              <div style={{ ...mono, fontSize:10, color:"var(--text3)", textTransform:"uppercase", letterSpacing:2 }}>Anomaly Score</div>
            </div>
            <div style={{ background:"#F8FAFC", border:"1px solid var(--border)", borderRadius:12, padding:16 }}>
              <div style={{ ...mono, fontSize:10, color:"var(--text3)", textTransform:"uppercase", letterSpacing:2, marginBottom:12 }}>Risk Factors</div>
              {selected.risks.map(r=>(
                <div key={r} style={{ display:"flex", alignItems:"center", gap:8, fontSize:12, color:"var(--text2)", marginBottom:8 }}>
                  <span style={{ color:"var(--red)", fontWeight:700 }}>✕</span> {r}
                </div>
              ))}
            </div>
          </div>
          <div style={{ borderRadius:10, padding:16, marginBottom:20, background:selected.type==="critical"?"var(--red-bg)":"var(--amber-bg)", borderLeft:`4px solid ${selected.type==="critical"?"var(--red)":"var(--amber)"}`, fontSize:13, lineHeight:1.6, color:selected.type==="critical"?"#991B1B":"#92400E" }}>{selected.evidence}</div>
          <div style={{ borderTop:"1px solid var(--border)", paddingTop:16 }}>
            <div style={{ ...mono, fontSize:10, color:"var(--text3)", textTransform:"uppercase", letterSpacing:2, marginBottom:12 }}>Actions</div>
            <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
              <button style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:8, padding:"10px 0", borderRadius:8, border:"none", background:"var(--green)", color:"#fff", fontSize:13, fontWeight:600, cursor:"pointer", boxShadow:"0 2px 8px rgba(34,197,94,0.3)", ...inter }}>Report to Authority (CDSCO)</button>
              <button style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:8, padding:"10px 0", borderRadius:8, border:"1px solid var(--border2)", background:"var(--surface)", color:"var(--text2)", fontSize:13, fontWeight:500, cursor:"pointer", ...inter }}>Quarantine Batch</button>
              <button style={{ padding:"10px 0", borderRadius:8, border:"none", background:"none", color:"var(--text3)", fontSize:13, cursor:"pointer", ...inter }}>Dismiss Alert</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── INVENTORY (new spec) ────────────────────────────────────────────────────
function AnimatedNum({ target }) {
  const val = useCountUp(target, 900);
  return <>{val}</>;
}

function Inventory() {
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [clock, setClock] = useState(new Date());
  const [block, setBlock] = useState(47291804);

  useEffect(()=>{
    const t1 = setInterval(()=>setClock(new Date()), 1000);
    const t2 = setInterval(()=>setBlock(b=>b+1), 3500);
    return ()=>{ clearInterval(t1); clearInterval(t2); };
  }, []);

  const filtered = INVENTORY.filter(i=>{
    const ms = i.drug.toLowerCase().includes(search.toLowerCase()) || i.id.toLowerCase().includes(search.toLowerCase());
    const mc = catFilter==="all" || i.cat.toLowerCase()===catFilter.toLowerCase();
    const mf = statusFilter==="all" || i.status===statusFilter;
    return ms&&mc&&mf;
  });

  const sparkG = [55,60,58,70,65,80,72,80];
  const sparkA = [40,35,38,30,32,28,35,32];
  const sparkR = [90,88,92,95,90,88,94,90];

  const inputS = { background:"var(--surface)", border:"1px solid var(--border2)", borderRadius:7, padding:"8px 12px", fontSize:13, color:"var(--text)", outline:"none", height:36, ...inter };
  const fIn=e=>{e.target.style.borderColor="var(--green)"; e.target.style.boxShadow="0 0 0 3px rgba(34,197,94,0.15)";};
  const fOut=e=>{e.target.style.borderColor="var(--border2)"; e.target.style.boxShadow="none";};

  const formatClock = d => d.toLocaleTimeString("en-IN",{hour12:false,timeZone:"Asia/Kolkata"});

  return (
    <div style={{ padding:24, display:"flex", flexDirection:"column", gap:20 }}>
      {/* STAT CARDS */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:16 }}>
        {[
          { label:"Total Batches", target:389, meta:"↑ +12 this week",     accent:"#22C55E", spark:sparkG },
          { label:"Low Stock",     target:12,  meta:"⚠ Action required",    accent:"#F59E0B", spark:sparkA },
          { label:"Quarantined",   target:3,   meta:"Locked · Under review", accent:"#EF4444", spark:sparkR },
        ].map(s=>(
          <div key={s.label} style={{ background:"var(--surface)", border:"1px solid var(--border)", borderTop:`3px solid ${s.accent}`, borderRadius:12, padding:"20px 24px", boxShadow:"var(--shadow-card)", display:"flex", flexDirection:"column" }}>
            <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between" }}>
              <div>
                <div style={{ ...inter, fontSize:11, fontWeight:500, color:"var(--text3)", textTransform:"uppercase", letterSpacing:1, marginBottom:10 }}>{s.label}</div>
                <div style={{ fontSize:42, fontWeight:800, color:s.accent, lineHeight:1, ...inter }}><AnimatedNum target={s.target}/></div>
                <div style={{ fontSize:12, color:"var(--text4)", marginTop:8 }}>{s.meta}</div>
              </div>
              <Sparkline color={s.accent} values={s.spark}/>
            </div>
          </div>
        ))}
      </div>

      {/* INFO BANNER */}
      <div style={{ background:"var(--blue-bg)", borderLeft:"4px solid var(--blue)", borderRadius:"0 8px 8px 0", padding:"12px 16px", display:"flex", alignItems:"center", gap:10 }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--blue)" strokeWidth="2" style={{ flexShrink:0 }}><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
        <span style={{ ...inter, fontSize:13, fontWeight:500, color:"var(--blue)" }}>Blockchain verification active — all batches cryptographically sealed on Polygon.</span>
      </div>

      {/* FILTER BAR */}
      <div style={{ background:"var(--surface)", border:"1px solid var(--border)", borderRadius:10, padding:"14px 16px", boxShadow:"var(--shadow-card)", display:"flex", gap:10 }}>
        <div style={{ position:"relative", flex:1 }}>
          <svg style={{ position:"absolute", left:10, top:"50%", transform:"translateY(-50%)", width:13, height:13, color:"var(--text3)" }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search drugs or batch..." style={{ ...inputS, paddingLeft:32, width:"100%" }} onFocus={fIn} onBlur={fOut}/>
        </div>
        <select value={catFilter} onChange={e=>setCatFilter(e.target.value)} style={{ ...inputS, width:160 }} onFocus={fIn} onBlur={fOut}>
          {[["all","All Categories"],["antibiotic","Antibiotic"],["cardiac","Cardiac"],["diabetes","Diabetes"],["cold chain","Cold Chain"],["analgesic","Analgesic"],["antihistamine","Antihistamine"]].map(([v,l])=><option key={v} value={v}>{l}</option>)}
        </select>
        <select value={statusFilter} onChange={e=>setStatusFilter(e.target.value)} style={{ ...inputS, width:140 }} onFocus={fIn} onBlur={fOut}>
          {[["all","All Status"],["instock","In Stock"],["low","Low Stock"],["quarantine","Quarantined"]].map(([v,l])=><option key={v} value={v}>{l}</option>)}
        </select>
      </div>

      {/* DATA TABLE */}
      <div style={{ background:"var(--surface)", border:"1px solid var(--border)", borderRadius:12, overflow:"hidden", boxShadow:"var(--shadow-card)" }}>
        <table style={{ width:"100%", borderCollapse:"collapse" }}>
          <thead><tr style={{ background:"#F8FAFC", borderBottom:"1px solid var(--border)" }}>
            {["Drug","Batch ID","Manufacturer","Stock Level","Units","Expiry","Location","Status"].map(h=>(
              <th key={h} style={{ ...inter, fontSize:11, fontWeight:500, color:"var(--text3)", textTransform:"uppercase", letterSpacing:1, padding:"10px 16px", textAlign:"left" }}>{h}</th>
            ))}
          </tr></thead>
          <tbody>{filtered.map(inv=>{
            const pct = Math.round((inv.stock/inv.max)*100);
            const fill = barFill(inv.status==="quarantine"?0:pct);
            const unitColor = inv.status==="instock"?"var(--green)":inv.status==="low"?"var(--amber)":"var(--red)";
            return (
              <tr key={inv.id} style={{ borderBottom:"1px solid #F1F5F9", transition:"background 0.15s" }}
                onMouseEnter={e=>e.currentTarget.style.background="#F8FAFC"}
                onMouseLeave={e=>e.currentTarget.style.background=""}>
                <td style={{ padding:"13px 16px" }}>
                  <div style={{ fontSize:14, fontWeight:600, color:"var(--text)", ...inter }}>{inv.drug}</div>
                  <div style={{ fontSize:11, color:"var(--text4)", marginTop:2 }}>{inv.cat}</div>
                </td>
                <td style={{ padding:"13px 16px" }}>
                  <span style={{ ...mono, fontSize:11, color:"var(--text3)", background:"#F1F5F9", border:"1px solid var(--border)", borderRadius:4, padding:"2px 8px" }}>{inv.id}</span>
                </td>
                <td style={{ fontSize:13, color:"var(--text2)", padding:"13px 16px" }}>{inv.mfr}</td>
                <td style={{ padding:"13px 16px", width:160 }}>
                  <div style={{ ...mono, fontSize:11, color:"var(--text3)", marginBottom:5 }}>{inv.stock} / {inv.max}</div>
                  <div style={{ height:6, background:"var(--border)", borderRadius:99, overflow:"hidden", width:120 }}>
                    <div style={{ height:"100%", width:`${pct}%`, background:fill, borderRadius:99 }}/>
                  </div>
                </td>
                <td style={{ ...mono, fontSize:13, fontWeight:700, color:unitColor, padding:"13px 16px" }}>{inv.stock}</td>
                <td style={{ ...mono, fontSize:12, color:"var(--text3)", padding:"13px 16px" }}>{inv.expiry}</td>
                <td style={{ fontSize:12, color:"var(--text3)", padding:"13px 16px" }}>
                  <span style={{ color:"var(--border2)", marginRight:6 }}>·</span>{inv.loc}
                </td>
                <td style={{ padding:"13px 16px" }}><StatusBadge status={inv.status}/></td>
              </tr>
            );
          })}</tbody>
        </table>
        {/* TABLE FOOTER */}
        <div style={{ background:"#F8FAFC", borderTop:"1px solid var(--border)", padding:"10px 16px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <span style={{ ...mono, fontSize:11, color:"var(--text3)" }}>{formatClock(clock)} IST</span>
          <div style={{ display:"flex", alignItems:"center", gap:6 }}>
            <div style={{ width:8, height:8, borderRadius:"50%", background:"rgba(130,80,255,0.9)" }}/>
            <span style={{ ...mono, fontSize:11, color:"var(--text3)" }}>Polygon · Block {block.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── NAV ─────────────────────────────────────────────────────────────────────
const NAV = [
  { id:"dashboard", label:"Dashboard",       badge:null },
  { id:"scan",      label:"Scan Batch",      badge:{ val:"3", bg:"rgba(34,197,94,0.2)", color:"#22C55E" } },
  { id:"history",   label:"Scan History",    badge:null },
  { id:"alerts",    label:"Alert Detail",    badge:{ val:"5", bg:"rgba(239,68,68,0.2)",  color:"#EF4444" } },
  { id:"inventory", label:"Inventory Status",badge:null },
];

const PAGE_TITLES = {
  dashboard:"Dashboard", scan:"Scan Batch", history:"Scan History", alerts:"Alert Detail", inventory:"Inventory Status",
};

function PulsingDot({ color="#22C55E", size=6 }) {
  return (
    <span style={{ position:"relative", display:"inline-flex", alignItems:"center", justifyContent:"center", width:size, height:size, flexShrink:0 }}>
      <span style={{ position:"absolute", width:size, height:size, borderRadius:"50%", background:color, opacity:0.4, animation:"ps-pulse 2s infinite" }}/>
      <span style={{ width:size*0.7, height:size*0.7, borderRadius:"50%", background:color, position:"relative" }}/>
      <style>{`@keyframes ps-pulse{0%,100%{transform:scale(1);opacity:0.4}50%{transform:scale(1.8);opacity:0}}`}</style>
    </span>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function PharmaSealDashboard() {
  const [page, setPage] = useState("dashboard");
  const pages = { dashboard:<Dashboard setPage={setPage}/>, scan:<ScanBatch/>, history:<ScanHistory/>, alerts:<AlertDetail/>, inventory:<Inventory/> };

  return (
    <div style={{ display:"flex", height:"100vh", overflow:"hidden", background:"var(--bg)", ...inter }}>

      {/* ── SIDEBAR ── */}
      <aside style={{ width:220, flexShrink:0, background:"#162032", display:"flex", flexDirection:"column", overflow:"hidden" }}>
        {/* Logo */}
        <div style={{ padding:"24px 16px 20px", borderBottom:"1px solid rgba(255,255,255,0.08)" }}>
          <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:4 }}>
            <HexLogo/>
            <div>
              <div style={{ color:"#fff", fontSize:15, fontWeight:700, lineHeight:1.1 }}>PharmaSeal</div>
              <div style={{ ...mono, fontSize:9, color:"#94A3B8", textTransform:"uppercase", letterSpacing:2, marginTop:3 }}>Distributor Node</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <div style={{ padding:"16px 0" }}>
          <div style={{ ...mono, fontSize:9, color:"#94A3B8", textTransform:"uppercase", letterSpacing:2, padding:"0 16px", marginBottom:8 }}>Navigation</div>
          {NAV.map(n=>{
            const active = page===n.id;
            return (
              <button key={n.id} onClick={()=>setPage(n.id)}
                style={{ width:"100%", display:"flex", alignItems:"center", gap:10, padding:"9px 16px", background:active?"rgba(34,197,94,0.15)":"transparent", borderLeft:active?"3px solid #22C55E":"3px solid transparent", color:active?"#22C55E":"#94A3B8", fontSize:13, fontWeight:active?600:400, cursor:"pointer", border:"none", transition:"all 0.15s", textAlign:"left", ...inter }}
                onMouseEnter={e=>{ if(!active){ e.currentTarget.style.background="rgba(255,255,255,0.05)"; e.currentTarget.style.color="#fff"; }}}
                onMouseLeave={e=>{ if(!active){ e.currentTarget.style.background="transparent"; e.currentTarget.style.color="#94A3B8"; }}}
              >
                <span style={{ width:6, height:6, borderRadius:"50%", background:"currentColor", flexShrink:0 }}/>
                <span style={{ flex:1 }}>{n.label}</span>
                {n.badge&&(
                  <span style={{ ...mono, fontSize:9, fontWeight:700, background:n.badge.bg, color:n.badge.color, borderRadius:4, padding:"2px 6px" }}>{n.badge.val}</span>
                )}
              </button>
            );
          })}
        </div>

        {/* Wallet */}
        <div style={{ marginTop:"auto", borderTop:"1px solid rgba(255,255,255,0.08)", padding:"16px" }}>
          <div style={{ ...mono, fontSize:9, color:"#94A3B8", textTransform:"uppercase", letterSpacing:2, marginBottom:10 }}>Connected Wallet</div>
          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4 }}>
            <span style={{ color:"#fff", fontSize:13, fontWeight:500 }}>MedRx Pharma</span>
            <PulsingDot color="#22C55E" size={6}/>
          </div>
          <div style={{ ...mono, fontSize:10, color:"#94A3B8" }}>0xAb3c...8f1d</div>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden" }}>
        {/* Topbar */}
        <header style={{ background:"#fff", borderBottom:"1px solid var(--border)", height:64, padding:"0 24px", display:"flex", alignItems:"center", justifyContent:"space-between", flexShrink:0 }}>
          <div>
            <div style={{ fontSize:20, fontWeight:700, color:"#0F172A", lineHeight:1 }}>{PAGE_TITLES[page]}</div>
            <div style={{ display:"flex", alignItems:"center", gap:6, marginTop:5 }}>
              <PulsingDot color="#22C55E" size={6}/>
              <span style={{ ...inter, fontSize:11, fontWeight:500, color:"#16A34A", background:"#F0FDF4", border:"1px solid #BBF7D0", borderRadius:99, padding:"2px 8px" }}>Live on Polygon</span>
            </div>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <div style={{ position:"relative" }}>
              <svg style={{ position:"absolute", left:10, top:"50%", transform:"translateY(-50%)", width:13, height:13, color:"var(--text3)" }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input placeholder="Search drugs or batch..." style={{ background:"#fff", border:"1px solid #CBD5E1", borderRadius:8, height:36, width:200, padding:"0 12px 0 32px", fontSize:13, color:"#0F172A", outline:"none", ...inter }}
                onFocus={e=>{e.target.style.borderColor="#22C55E"; e.target.style.boxShadow="0 0 0 3px rgba(34,197,94,0.15)";}}
                onBlur={e=>{e.target.style.borderColor="#CBD5E1"; e.target.style.boxShadow="none";}}/>
            </div>
            <button onClick={()=>setPage("scan")} style={{ background:"#22C55E", color:"#fff", border:"none", borderRadius:8, height:36, padding:"0 16px", fontSize:13, fontWeight:600, cursor:"pointer", boxShadow:"0 2px 8px rgba(34,197,94,0.3)", ...inter,
              transition:"background 0.15s" }}
              onMouseEnter={e=>e.currentTarget.style.background="#16A34A"}
              onMouseLeave={e=>e.currentTarget.style.background="#22C55E"}>
              + New Scan
            </button>
          </div>
        </header>

        <main style={{ flex:1, overflowY:"auto", background:"var(--bg)" }}>
          {pages[page]}
        </main>
      </div>
    </div>
  );
}
