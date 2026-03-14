import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Scanner } from '@yudiel/react-qr-scanner';
import jsQR from 'jsqr';
import { Link } from 'react-router-dom';
import {
  ArrowLeft, QrCode, Share2, CheckCircle2,
  CircleCheck, Flag
} from 'lucide-react';
import './PatientDashboard.css';

/* ────────────────────────────────────────────────────────────────────
 *  DATA
 * ──────────────────────────────────────────────────────────────────── */
const PRODUCT = {
  name: 'Amoxicillin 500mg',
  brand: 'Sun Pharmaceutical Industries Ltd.',
  batch: 'BT-0984-MH',
  category: 'Antibiotic',
  mfg: 'Nov 2024',
  expiry: 'Nov 2027',
  storage: 'Below 25°C',
  units: '300',
  trustScore: 97,
};

const JOURNEY = [
  { title: 'Manufactured', date: 'Nov 12, 2024', chip: 'Hash sealed on Polygon', color: 'green' },
  { title: 'Quality Control', date: 'Nov 18, 2024', chip: 'Compliance verified', color: 'green' },
  { title: 'Distributor Received', date: 'Dec 04, 2024', chip: 'Polygon checkpoint', color: 'blue' },
  { title: 'Cold Chain Maintained', date: 'Dec 10, 2024', chip: 'IoT verified', color: 'blue' },
  { title: 'Pharmacy Dispensed', date: 'Mar 13, 2026', chip: 'You are here', color: 'purple' },
];

const PROOF = [
  { key: 'Network', value: 'Polygon Mainnet', green: true },
  { key: 'Block', value: '47291804' },
  { key: 'Tx Hash', value: '0x3f9a...c421' },
  { key: 'Contract', value: '0xPhrm...5E3c' },
  { key: 'IPFS', value: 'Qm7kX...w3pR' },
  { key: 'Anomaly Score', value: '3/100 Safe', green: true },
];

/* ── Inline style helpers (Tailwind v4 CSS-var compatibility) ── */
const s = {
  green: { color: 'var(--green)' },
  greenDim: { color: 'var(--green-dim)' },
  greenBg: { background: 'var(--green)', color: '#fff' },
  greenBgHover: { background: 'var(--green-dim)' },
  greenPill: { background: 'var(--green-bg)', border: '1px solid var(--green-bdr)', color: 'var(--green-dim)' },
  bluePill: { background: 'var(--blue-bg)', border: '1px solid #93C5FD', color: 'var(--blue)' },
  purplePill: { background: 'var(--purple-bg)', border: '1px solid var(--purple-bdr)', color: 'var(--purple)' },
  text: { color: 'var(--text)' },
  text3: { color: 'var(--text3)' },
  text4: { color: 'var(--text4)' },
  bg: { background: 'var(--bg)' },
  border2: { border: '1.5px solid var(--border2)' },
};

const chipStyles = { green: s.greenPill, blue: s.bluePill, purple: s.purplePill };

const dotStyles = {
  green: { width: 14, height: 14, borderRadius: '50%', background: 'var(--green)', border: '3px solid var(--green-bg)' },
  blue: { width: 12, height: 12, borderRadius: 3, background: 'var(--blue)', border: '3px solid var(--blue-bg)' },
  purple: { width: 14, height: 14, borderRadius: '50%', background: 'var(--purple)', border: '3px solid var(--purple-bg)' },
};

const parseQrPayload = (rawText) => {
  const raw = (rawText || '').trim();
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw);
    return {
      bid: String(parsed.bid || parsed.batchId || parsed.batchNumber || '').trim(),
      h: String(parsed.h || parsed.hash || parsed.dataHash || '').trim(),
    };
  } catch {
    // Try URL or plain text fallback.
  }

  if (/^https?:\/\//i.test(raw)) {
    try {
      const u = new URL(raw);
      return {
        bid: String(u.searchParams.get('bid') || u.searchParams.get('batchId') || '').trim(),
        h: String(u.searchParams.get('h') || u.searchParams.get('hash') || '').trim(),
      };
    } catch {
      // Fallback below.
    }
  }

  return { bid: raw, h: '' };
};

const decodeQrFromImageFile = async (file) => {
  const dataUrl = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('Failed to read image file.'));
    reader.readAsDataURL(file);
  });

  const image = await new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Invalid image.'));
    img.src = dataUrl;
  });

  const canvas = document.createElement('canvas');
  canvas.width = image.width;
  canvas.height = image.height;

  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) throw new Error('Unable to read PNG image data.');

  ctx.drawImage(image, 0, 0);
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const decoded = jsQR(imageData.data, imageData.width, imageData.height, {
    inversionAttempts: 'attemptBoth',
  });

  if (!decoded?.data) {
    throw new Error('No QR content found in uploaded PNG image.');
  }

  return decoded.data;
};

/* ────────────────────────────────────────────────────────────────────
 *  SMALL REUSABLE PIECES
 * ──────────────────────────────────────────────────────────────────── */
const PulsingDot = () => <span className="pd-pulsing-dot" />;

/* ────────────────────────────────────────────────────────────────────
 *  SCREEN 1 — QR SCAN
 * ──────────────────────────────────────────────────────────────────── */
const QrScanScreen = ({ onScan, verifyError, clearError }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [manualBatchId, setManualBatchId] = useState('');
  const [manualHash, setManualHash] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [uploadedImageName, setUploadedImageName] = useState('');

  const verifyRaw = async (rawValue, fallbackBatchId = '', fallbackHash = '') => {
    setIsChecking(true);
    await onScan({ rawValue, fallbackBatchId, fallbackHash });
    setIsChecking(false);
  };

  return (
    <motion.div
      key="scan"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="pd-screen-scan"
    >
      {/* Logo */}
      <img src="/pramanchain-logo.png" alt="PramanChain" className="w-20 h-20 rounded-xl object-contain" />

      <div className="text-center">
        <h1 className="text-[26px] font-bold text-white tracking-tight">Verify Your Medicine</h1>
        <p className="text-sm mt-2" style={s.text4}>Scan QR code on medicine packaging</p>
      </div>

      {/* QR Frame / Scanner */}
      <div className="w-[220px] h-[220px] relative">
        {isScanning ? (
          <div className="w-full h-full rounded-2xl overflow-hidden border-2" style={{ borderColor: 'var(--green-dim)' }}>
            <Scanner
              onScan={(result) => {
                if (result && result.length > 0) {
                  const rawValue = result[0]?.rawValue || result[0]?.text || '';
                  if (rawValue) {
                    verifyRaw(rawValue);
                  }
                }
              }}
              onError={(error) => console.log(error)}
              styles={{
                container: { width: '100%', height: '100%', borderRadius: '14px' },
                video: { objectFit: 'cover' }
              }}
              components={{
                audio: false,
                onOff: true,
                torch: true,
                zoom: false,
                finder: false,
              }}
            />
          </div>
        ) : (
          <div className="pd-qr-frame">
            <div className="pd-corner-bl" />
            <div className="pd-corner-br" />
            <div className="pd-qr-inner">
              {[1,1,1,0,1,1,1, 1,0,1,1,1,0,1, 1,1,1,0,0,1,1, 0,1,0,1,0,1,0, 1,1,0,0,1,1,1, 1,0,1,1,1,0,1, 1,1,1,0,1,1,1]
                .map((v, i) => <span key={i} style={{ opacity: v ? 1 : 0 }} />)}
            </div>
            <div className="pd-scan-line" />
          </div>
        )}
      </div>

      {/* CTA */}
      <button
        onClick={() => {
          if (isScanning) {
            verifyRaw('', manualBatchId, manualHash);
          } else {
            clearError();
            setIsScanning(true);
          }
        }}
        className="pd-btn-scan"
      >
        <QrCode size={20} />
        {isChecking ? 'Checking Blockchain...' : isScanning ? 'Verify Current Input' : 'Open Camera to Scan'}
      </button>

      <div className="w-full max-w-[340px] rounded-xl p-3" style={{ border: '1px solid var(--border2)', background: 'rgba(255,255,255,0.02)' }}>
        <div className="text-[11px] uppercase tracking-[0.16em] mb-2" style={s.text4}>Manual / PNG Verify</div>
        <input
          value={manualBatchId}
          onChange={(e) => setManualBatchId(e.target.value)}
          placeholder="Batch ID (e.g. BT-0984-MH)"
          className="w-full rounded-lg px-3 py-2 text-sm mb-2"
          style={{ background: '#0b1220', border: '1px solid var(--border2)', color: 'white', outline: 'none' }}
        />
        <input
          value={manualHash}
          onChange={(e) => setManualHash(e.target.value)}
          placeholder="Expected hash (optional)"
          className="w-full rounded-lg px-3 py-2 text-sm"
          style={{ background: '#0b1220', border: '1px solid var(--border2)', color: 'white', outline: 'none' }}
        />
        <div className="flex items-center gap-2 mt-3">
          <label className="px-3 py-2 rounded-lg text-xs font-medium cursor-pointer" style={{ border: '1px solid var(--border2)', color: 'white' }}>
            Upload QR PNG
            <input
              type="file"
              accept="image/png"
              style={{ display: 'none' }}
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                try {
                  clearError();
                  setUploadedImageName(file.name);
                  const raw = await decodeQrFromImageFile(file);
                  await verifyRaw(raw, manualBatchId, manualHash);
                } catch (err) {
                  await onScan({ error: err.message || 'QR decode failed.' });
                }
              }}
            />
          </label>
          <button
            onClick={() => verifyRaw('', manualBatchId, manualHash)}
            className="px-3 py-2 rounded-lg text-xs font-semibold"
            style={{ background: 'var(--green)', color: 'white' }}
          >
            Verify Manual
          </button>
        </div>
        {uploadedImageName && <div className="text-[11px] mt-2" style={s.text4}>Uploaded: {uploadedImageName}</div>}
        {verifyError && <div className="text-[12px] mt-2" style={{ color: '#fca5a5' }}>{verifyError}</div>}
      </div>

      {/* Pill badge */}
      <div className="pd-pill-badge">
        <PulsingDot />
        No login or account needed
      </div>
    </motion.div>
  );
};

/* ────────────────────────────────────────────────────────────────────
 *  CARD COMPONENTS
 * ──────────────────────────────────────────────────────────────────── */
const CardLabel = ({ children }) => (
  <div className="pd-card-label">{children}</div>
);

// ── Trust Score ──
const TrustScoreCard = ({ trustScore, isAuthentic }) => (
  <motion.div className="pd-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
    <CardLabel>Trust Score</CardLabel>
    <div className="flex items-center gap-5">
      <div className="pd-trust-ring relative w-[90px] h-[90px] shrink-0">
        <svg width="90" height="90" viewBox="0 0 100 100">
          <circle className="ring-bg" cx="50" cy="50" r="44" />
          <circle className="ring-fg" cx="50" cy="50" r="44" />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="pd-ring-num">{trustScore}</span>
          <span className="pd-ring-den">/ 100</span>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <span className="text-[17px] font-semibold" style={s.text}>{isAuthentic ? 'Excellent · Authentic' : 'Warning · Check Batch'}</span>
        <span className="pd-verified-badge">
          <CheckCircle2 size={14} />
          {isAuthentic ? 'Verified by PramanChain' : 'Verification Mismatch Detected'}
        </span>
      </div>
    </div>
  </motion.div>
);

// ── Product Details ──
const DetailTile = ({ label, value, mono, green }) => (
  <div className="pd-detail-tile">
    <div className="pd-detail-tile-label">{label}</div>
    <div className={`pd-detail-tile-value ${mono ? 'mono' : ''} ${green ? 'green' : ''}`}>
      {value}
    </div>
  </div>
);

const ProductDetailsCard = ({ product }) => (
  <motion.div className="pd-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
    <CardLabel>Product Details</CardLabel>
    <div className="mb-3.5">
      <div className="text-[17px] font-semibold" style={s.text}>{product.name}</div>
      <div className="text-[13px] mt-0.5" style={s.text3}>{product.brand}</div>
    </div>
    <div className="pd-detail-grid">
      <DetailTile label="Batch ID" value={product.batch} mono />
      <DetailTile label="Category" value={product.category} />
      <DetailTile label="Manufactured" value={product.mfg} mono />
      <DetailTile label="Expiry" value={product.expiry} mono green />
      <DetailTile label="Storage" value={product.storage} />
      <DetailTile label="Units" value={product.units} mono green />
    </div>
  </motion.div>
);

// ── Anomaly Banner ──
const AnomalyBanner = ({ isAuthentic }) => (
  <motion.div
    className="pd-anomaly-banner"
    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
  >
    <CircleCheck size={24} className="shrink-0 mt-0.5" style={s.greenDim} />
    <div>
      <strong className="pd-anomaly-title">{isAuthentic ? 'No anomalies detected' : 'Potential anomaly detected'}</strong>
      <span className="pd-anomaly-sub">{isAuthentic ? 'Supply chain integrity confirmed' : 'Hash mismatch or chain mismatch found'}</span>
    </div>
  </motion.div>
);

// ── Journey Map ──
const JourneyMapCard = () => (
  <motion.div className="pd-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
    <CardLabel>Full Journey Map</CardLabel>
    <div className="pd-timeline">
      {JOURNEY.map((step, i) => (
        <div key={i} className={`relative flex flex-col gap-1 ${i < JOURNEY.length - 1 ? 'pb-6' : ''}`}>
          <div className="pd-timeline-dot">
            <div style={dotStyles[step.color]} />
          </div>
          <span className="text-sm font-semibold" style={s.text}>{step.title}</span>
          <span className="pd-timeline-date">{step.date}</span>
          <span className="pd-timeline-chip" style={chipStyles[step.color]}>
            {step.chip}
          </span>
        </div>
      ))}
    </div>
  </motion.div>
);

// ── Blockchain Proof ──
const BlockchainProofCard = ({ proofRows }) => (
  <motion.div className="pd-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
    <CardLabel>Blockchain Proof</CardLabel>
    <div className="flex flex-col">
      {proofRows.map((row, i) => (
        <div key={i} className="pd-proof-row">
          <span className="pd-proof-key">{row.key}</span>
          <span className={`pd-proof-val ${row.green ? 'green' : ''}`}>
            {row.value}
          </span>
        </div>
      ))}
    </div>
  </motion.div>
);

// ── Report Banner ──
const ReportBanner = () => (
  <motion.div
    className="pd-report-banner"
    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
  >
    <Flag size={24} className="shrink-0 mt-0.5" style={{ color: 'var(--blue)' }} />
    <div>
      <strong className="pd-report-title">Report a concern</strong>
      <span className="pd-report-sub">Report tampered medicine to PramanChain and CDSCO</span>
    </div>
  </motion.div>
);

/* ────────────────────────────────────────────────────────────────────
 *  SCREEN 2 — PRODUCT PASSPORT
 * ──────────────────────────────────────────────────────────────────── */
const ProductPassportScreen = ({ onBack, verification }) => {
  const batch = verification?.batch || {};
  const isAuthentic = !!verification?.authentic;

  const product = {
    name: batch.productName || PRODUCT.name,
    brand: batch.manufacturerId || PRODUCT.brand,
    batch: batch.batchId || verification?.batchId || PRODUCT.batch,
    category: batch.category || PRODUCT.category,
    mfg: batch.mfgDate || PRODUCT.mfg,
    expiry: batch.expDate || PRODUCT.expiry,
    storage: batch.storageConditions || PRODUCT.storage,
    units: String(batch.quantity || PRODUCT.units),
  };

  const proofRows = [
    { key: 'Network', value: 'Polygon / Configured RPC', green: true },
    { key: 'Tx Hash', value: verification?.txHash || 'N/A' },
    { key: 'DB Hash', value: verification?.dbHash || 'N/A' },
    { key: 'On-chain Hash', value: verification?.onChainHash || 'N/A' },
    { key: 'Recomputed', value: verification?.recomputedHash || 'N/A' },
    { key: 'Status', value: isAuthentic ? 'VERIFIED' : 'MISMATCH', green: isAuthentic },
  ];

  return (
    <motion.div
    key="passport"
    initial={{ opacity: 0, x: 40 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -40 }}
    transition={{ duration: 0.3, ease: 'easeOut' }}
    className="pd-screen-passport"
  >
    {/* Status Bar */}
    <div className="pd-status-bar">
      <button onClick={onBack} className="pd-btn-back">
        <ArrowLeft size={20} />
        Back
      </button>
      <Link to="/" className="pd-status-bar-title" style={{ textDecoration: 'none' }}>PramanChain</Link>
    </div>

    {/* Hero Banner */}
    <div className="pd-hero">
      <span className="pd-verified-pill">
        <PulsingDot />
        {isAuthentic ? 'BLOCKCHAIN VERIFIED' : 'VERIFICATION WARNING'}
      </span>
      <div className="pd-hero-check">
        <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
          <path d="M10 18L16 24L26 12" stroke="#22C55E" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <h2 className="text-2xl font-bold text-white tracking-tight">{product.name}</h2>
      <p className="text-[13px]" style={s.text4}>
        {product.brand} · Batch <span className="pd-mono text-xs">{product.batch}</span> · Sealed on Polygon
      </p>
    </div>

    {/* Desktop Layout Grid */}
    <div className="pd-layout-grid">
      {/* Left Column */}
      <div className="pd-column">
        <TrustScoreCard trustScore={isAuthentic ? 97 : 42} isAuthentic={isAuthentic} />
        <ProductDetailsCard product={product} />
        <AnomalyBanner isAuthentic={isAuthentic} />
      </div>

      {/* Right Column */}
      <div className="pd-column">
        <JourneyMapCard />
        <BlockchainProofCard proofRows={proofRows} />
        <ReportBanner />
      </div>
    </div>

    {/* Bottom Actions */}
    <div className="pd-layout-grid" style={{ paddingTop: 0, marginTop: -8 }}>
      <div className="pd-bottom-actions w-full col-span-1 md:col-span-2">
        <button className="pd-btn-share">
          <Share2 size={18} />
          Share Verification Report
        </button>
        <button onClick={onBack} className="pd-btn-rescan">
          <QrCode size={18} />
          Scan Another Medicine
        </button>
      </div>
    </div>
  </motion.div>
  );
};

/* ────────────────────────────────────────────────────────────────────
 *  MAIN EXPORT
 * ──────────────────────────────────────────────────────────────────── */
export default function PatientDashboard() {
  const [screen, setScreen] = useState('scan');
  const [verifyError, setVerifyError] = useState('');
  const [verification, setVerification] = useState(null);

  const verifyFromScan = async ({ rawValue = '', fallbackBatchId = '', fallbackHash = '', error = '' }) => {
    if (error) {
      setVerifyError(error);
      return;
    }

    setVerifyError('');
    const parsed = parseQrPayload(rawValue);
    const batchId = (parsed?.bid || fallbackBatchId || '').trim();
    const suppliedHash = (parsed?.h || fallbackHash || '').trim().toLowerCase();

    if (!batchId) {
      setVerifyError('Batch ID is required. Scan a valid QR or enter batch ID manually.');
      return;
    }

    try {
      const response = await fetch(`/api/drugs/verify/${encodeURIComponent(batchId)}`);
      const data = await response.json();

      if (!response.ok || !data?.ok) {
        throw new Error(data?.message || 'Verification request failed.');
      }

      const dbHash = String(data.dbHash || '').toLowerCase();
      const onChainHash = String(data.onChainHash || '').toLowerCase();
      const chainMatched = dbHash && onChainHash && dbHash === onChainHash;
      const suppliedHashMatched = !suppliedHash || suppliedHash === dbHash;

      setVerification({
        authentic: data.status === 'VERIFIED' && chainMatched && suppliedHashMatched,
        batchId,
        batch: data.batch,
        dbHash: data.dbHash,
        onChainHash: data.onChainHash,
        recomputedHash: data.recomputedHash,
        txHash: data.txHash,
      });

      setScreen('passport');
      window.scrollTo(0, 0);
    } catch (err) {
      setVerifyError(err.message || 'Unable to verify this medicine right now.');
    }
  };

  const goToScan = () => {
    setScreen('scan');
    setVerifyError('');
    window.scrollTo(0, 0);
  };

  return (
    <div className="patient-app">
      <AnimatePresence mode="wait">
        {screen === 'scan'
          ? <QrScanScreen key="scan" onScan={verifyFromScan} verifyError={verifyError} clearError={() => setVerifyError('')} />
          : <ProductPassportScreen key="passport" onBack={goToScan} verification={verification} />
        }
      </AnimatePresence>
    </div>
  );
}
