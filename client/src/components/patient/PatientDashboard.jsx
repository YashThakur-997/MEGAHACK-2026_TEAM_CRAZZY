import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Scanner } from '@yudiel/react-qr-scanner';
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

/* ────────────────────────────────────────────────────────────────────
 *  SMALL REUSABLE PIECES
 * ──────────────────────────────────────────────────────────────────── */
const PulsingDot = () => <span className="pd-pulsing-dot" />;

/* ────────────────────────────────────────────────────────────────────
 *  SCREEN 1 — QR SCAN
 * ──────────────────────────────────────────────────────────────────── */
const QrScanScreen = ({ onScan }) => {
  const [isScanning, setIsScanning] = useState(false);

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
                  onScan(); // proceed to next screen
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
            onScan();
          } else {
            setIsScanning(true);
          }
        }}
        className="pd-btn-scan"
      >
        <QrCode size={20} />
        {isScanning ? "Simulate Scan (Bypass)" : "Open Camera to Scan"}
      </button>

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
const TrustScoreCard = () => (
  <motion.div className="pd-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
    <CardLabel>Trust Score</CardLabel>
    <div className="flex items-center gap-5">
      <div className="pd-trust-ring relative w-[90px] h-[90px] shrink-0">
        <svg width="90" height="90" viewBox="0 0 100 100">
          <circle className="ring-bg" cx="50" cy="50" r="44" />
          <circle className="ring-fg" cx="50" cy="50" r="44" />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="pd-ring-num">{PRODUCT.trustScore}</span>
          <span className="pd-ring-den">/ 100</span>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <span className="text-[17px] font-semibold" style={s.text}>Excellent · Authentic</span>
        <span className="pd-verified-badge">
          <CheckCircle2 size={14} />
          Verified by PramanChain
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

const ProductDetailsCard = () => (
  <motion.div className="pd-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
    <CardLabel>Product Details</CardLabel>
    <div className="mb-3.5">
      <div className="text-[17px] font-semibold" style={s.text}>{PRODUCT.name}</div>
      <div className="text-[13px] mt-0.5" style={s.text3}>{PRODUCT.brand}</div>
    </div>
    <div className="pd-detail-grid">
      <DetailTile label="Batch ID" value={PRODUCT.batch} mono />
      <DetailTile label="Category" value={PRODUCT.category} />
      <DetailTile label="Manufactured" value={PRODUCT.mfg} mono />
      <DetailTile label="Expiry" value={PRODUCT.expiry} mono green />
      <DetailTile label="Storage" value={PRODUCT.storage} />
      <DetailTile label="Units" value={PRODUCT.units} mono green />
    </div>
  </motion.div>
);

// ── Anomaly Banner ──
const AnomalyBanner = () => (
  <motion.div
    className="pd-anomaly-banner"
    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
  >
    <CircleCheck size={24} className="shrink-0 mt-0.5" style={s.greenDim} />
    <div>
      <strong className="pd-anomaly-title">No anomalies detected</strong>
      <span className="pd-anomaly-sub">Supply chain integrity confirmed</span>
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
const BlockchainProofCard = () => (
  <motion.div className="pd-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
    <CardLabel>Blockchain Proof</CardLabel>
    <div className="flex flex-col">
      {PROOF.map((row, i) => (
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
const ProductPassportScreen = ({ onBack }) => (
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
      <span className="pd-status-bar-title">PramanChain</span>
    </div>

    {/* Hero Banner */}
    <div className="pd-hero">
      <span className="pd-verified-pill">
        <PulsingDot />
        BLOCKCHAIN VERIFIED
      </span>
      <div className="pd-hero-check">
        <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
          <path d="M10 18L16 24L26 12" stroke="#22C55E" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <h2 className="text-2xl font-bold text-white tracking-tight">{PRODUCT.name}</h2>
      <p className="text-[13px]" style={s.text4}>
        Sun Pharma · Batch <span className="pd-mono text-xs">{PRODUCT.batch}</span> · Sealed on Polygon
      </p>
    </div>

    {/* Desktop Layout Grid */}
    <div className="pd-layout-grid">
      {/* Left Column */}
      <div className="pd-column">
        <TrustScoreCard />
        <ProductDetailsCard />
        <AnomalyBanner />
      </div>

      {/* Right Column */}
      <div className="pd-column">
        <JourneyMapCard />
        <BlockchainProofCard />
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

/* ────────────────────────────────────────────────────────────────────
 *  MAIN EXPORT
 * ──────────────────────────────────────────────────────────────────── */
export default function PatientDashboard() {
  const [screen, setScreen] = useState('scan');

  const goToPassport = () => { setScreen('passport'); window.scrollTo(0, 0); };
  const goToScan = () => { setScreen('scan'); window.scrollTo(0, 0); };

  return (
    <div className="patient-app">
      <AnimatePresence mode="wait">
        {screen === 'scan'
          ? <QrScanScreen key="scan" onScan={goToPassport} />
          : <ProductPassportScreen key="passport" onBack={goToScan} />
        }
      </AnimatePresence>
    </div>
  );
}
