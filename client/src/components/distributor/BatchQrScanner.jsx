import React, { useEffect, useRef, useState } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";

export default function BatchQrScanner() {
  const scannerRef = useRef(null);
  const [scanResult, setScanResult] = useState(null);
  const [verifyResult, setVerifyResult] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [recentBatches, setRecentBatches] = useState([]);
  const [pendingQueue, setPendingQueue] = useState([]);
  const [queueError, setQueueError] = useState("");
  const [isBusy, setIsBusy] = useState(false);
  const [error, setError] = useState("");
  const [isRunning, setIsRunning] = useState(false);

  const parseQrPayload = (decodedText) => {
    const raw = String(decodedText || "").trim();
    if (!raw) {
      throw new Error("Empty QR payload");
    }

    try {
      const parsed = JSON.parse(raw);
      return {
        payload: parsed,
        batchId: String(parsed?.batch?.batchId || parsed?.bid || parsed?.batchId || "").trim(),
      };
    } catch {
      // Try URL query params format.
    }

    if (/^https?:\/\//i.test(raw)) {
      const u = new URL(raw);
      return {
        payload: { url: raw },
        batchId: String(u.searchParams.get("bid") || u.searchParams.get("batchId") || "").trim(),
      };
    }

    return { payload: { raw }, batchId: raw };
  };

  const stopScanner = async () => {
    try {
      if (scannerRef.current) {
        await scannerRef.current.clear();
        scannerRef.current = null;
      }
    } catch {
      // Ignore scanner teardown errors to prevent UI lock-ups.
    }
    setIsRunning(false);
  };

  const loadQueueAndRecent = async () => {
    try {
      const [batchesRes, anomaliesRes] = await Promise.all([
        fetch("/api/drugs"),
        fetch("/api/drugs/anomalies"),
      ]);

      const [batchesJson, anomaliesJson] = await Promise.all([
        batchesRes.json(),
        anomaliesRes.json(),
      ]);

      if (!batchesRes.ok || !batchesJson?.ok) {
        throw new Error(batchesJson?.message || "Unable to load recent batches");
      }
      if (!anomaliesRes.ok || !anomaliesJson?.ok) {
        throw new Error(anomaliesJson?.message || "Unable to load anomaly queue");
      }

      const batches = Array.isArray(batchesJson.batches) ? batchesJson.batches : [];
      const alerts = Array.isArray(anomaliesJson.alerts) ? anomaliesJson.alerts : [];

      const recent = batches.slice(0, 6).map((b) => ({
        batchId: b.batchId,
        productName: b.productName,
        manufacturerId: b.manufacturerId,
        updatedAt: b.updatedAt || b.createdAt || b.timestamp,
      }));

      const queue = alerts.slice(0, 6).map((a) => ({
        id: a.id,
        batchId: a.batchId,
        title: a.title || a.type || "Anomaly",
        severity: String(a.severity || "MEDIUM").toUpperCase(),
      }));

      setRecentBatches(recent);
      setPendingQueue(queue);
      setQueueError("");
    } catch (e) {
      setQueueError(e.message || "Unable to load scanner context.");
    }
  };

  const verifyBatch = async (batchId, payload) => {
    setIsBusy(true);
    setError("");
    setTimeline([]);

    try {
      const verifyRes = await fetch(`/api/drugs/verify/${encodeURIComponent(batchId)}`);
      const verifyJson = await verifyRes.json();
      if (!verifyRes.ok || !verifyJson?.ok) {
        throw new Error(verifyJson?.message || "Verification failed");
      }

      setScanResult(payload);
      setVerifyResult(verifyJson);

      const historyRes = await fetch(`/api/drugs/history/${encodeURIComponent(batchId)}`);
      const historyJson = await historyRes.json();
      if (historyRes.ok && historyJson?.ok) {
        setTimeline(Array.isArray(historyJson.timeline) ? historyJson.timeline : []);
      }
    } catch (e) {
      setError(e.message || "Unable to verify scanned batch");
      setVerifyResult(null);
    } finally {
      setIsBusy(false);
    }
  };

  const startScanner = () => {
    if (isRunning) return;
    setError("");
    setVerifyResult(null);
    setTimeline([]);

    const scanner = new Html5QrcodeScanner("qr-reader", { fps: 10, qrbox: 250 }, false);
    scannerRef.current = scanner;
    setIsRunning(true);

    scanner.render(
      async (decodedText) => {
        try {
          await stopScanner();

          const parsed = parseQrPayload(decodedText);
          const batchId = parsed.batchId;
          if (!batchId) throw new Error("batchId not found in QR");

          await verifyBatch(batchId, parsed.payload);
        } catch (e) {
          setError("Invalid QR content: " + e.message);
        }
      },
      () => {}
    );
  };

  useEffect(() => {
    loadQueueAndRecent();
    const timer = setInterval(loadQueueAndRecent, 30000);
    return () => {
      clearInterval(timer);
      stopScanner();
    };
  }, []);

  const severityColor = (severity) => {
    if (severity === "HIGH") return "#b91c1c";
    if (severity === "MEDIUM") return "#b45309";
    return "#065f46";
  };

  const formatWhen = (value) => {
    if (!value) return "--";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "--";
    return d.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  return (
    <div style={{ padding: 20, display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 16 }}>
      <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 12, padding: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <h3 style={{ margin: 0, fontSize: 18, color: "#0f172a" }}>Distributor QR Verification</h3>
          <span style={{ fontSize: 12, color: isRunning ? "#166534" : "#64748b" }}>
            {isRunning ? "Scanner running" : "Scanner idle"}
          </span>
        </div>

        <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
          <button onClick={startScanner} disabled={isRunning || isBusy} style={{ padding: "8px 12px", borderRadius: 8, border: "none", background: "#2563eb", color: "#fff", cursor: "pointer" }}>
            Start Scanner
          </button>
          <button onClick={stopScanner} disabled={!isRunning} style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid #cbd5e1", background: "#fff", color: "#334155", cursor: "pointer" }}>
            Stop Scanner
          </button>
          <button onClick={loadQueueAndRecent} style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid #cbd5e1", background: "#fff", color: "#334155", cursor: "pointer" }}>
            Refresh Data
          </button>
        </div>

        <div id="qr-reader" style={{ width: 360, maxWidth: "100%", minHeight: 220 }} />
        {isBusy && <p style={{ color: "#2563eb", fontSize: 13 }}>Verifying batch with blockchain and DB...</p>}
        {error && <p style={{ color: "#b91c1c", fontSize: 13 }}>{error}</p>}

        {verifyResult?.ok && (
          <div style={{ marginTop: 14, border: "1px solid #e2e8f0", borderRadius: 10, padding: 12, background: "#f8fafc" }}>
            <h4 style={{ margin: "0 0 8px", color: "#0f172a" }}>
              Status: <span style={{ color: verifyResult.status === "VERIFIED" ? "#15803d" : "#b91c1c" }}>{verifyResult.status}</span>
            </h4>
            <div style={{ fontSize: 12, color: "#334155", lineHeight: 1.7 }}>
              <div><b>Batch:</b> {verifyResult.batch?.batchId || "--"}</div>
              <div><b>Product:</b> {verifyResult.batch?.productName || "--"}</div>
              <div><b>DB Hash:</b> {verifyResult.dbHash || "--"}</div>
              <div><b>On-chain Hash:</b> {verifyResult.onChainHash || "--"}</div>
              <div><b>Recomputed:</b> {verifyResult.recomputedHash || "--"}</div>
              <div><b>Tx Hash:</b> {verifyResult.txHash || "--"}</div>
            </div>
          </div>
        )}

        {!!timeline.length && (
          <div style={{ marginTop: 14, border: "1px solid #e2e8f0", borderRadius: 10, padding: 12 }}>
            <h4 style={{ margin: "0 0 8px", color: "#0f172a" }}>Live Batch Timeline</h4>
            {timeline.map((step, idx) => (
              <div key={`${step.title || step.action}-${idx}`} style={{ fontSize: 12, color: "#334155", marginBottom: 8 }}>
                <div style={{ fontWeight: 600 }}>{step.title || step.action}</div>
                <div>{step.location || "Unknown"} · {formatWhen(step.time)}</div>
              </div>
            ))}
          </div>
        )}

        {scanResult && (
          <div style={{ marginTop: 14 }}>
            <h4 style={{ margin: "0 0 6px", color: "#0f172a" }}>Decoded Payload</h4>
            <pre style={{ background: "#0f172a", color: "#e2e8f0", borderRadius: 10, padding: 10, overflowX: "auto", fontSize: 11 }}>
              {JSON.stringify(scanResult, null, 2)}
            </pre>
          </div>
        )}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 12, padding: 14 }}>
          <h4 style={{ margin: "0 0 10px", color: "#0f172a" }}>Pending Queue (Live Alerts)</h4>
          {pendingQueue.map((item) => (
            <div key={item.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #f1f5f9", padding: "8px 0" }}>
              <div>
                <div style={{ fontSize: 13, color: "#0f172a", fontWeight: 600 }}>{item.batchId || "--"}</div>
                <div style={{ fontSize: 12, color: "#64748b" }}>{item.title}</div>
              </div>
              <span style={{ fontSize: 11, fontWeight: 700, color: severityColor(item.severity) }}>{item.severity}</span>
            </div>
          ))}
          {!pendingQueue.length && <div style={{ fontSize: 12, color: "#64748b" }}>No pending anomaly queue.</div>}
        </div>

        <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 12, padding: 14 }}>
          <h4 style={{ margin: "0 0 10px", color: "#0f172a" }}>Recent Registered Batches</h4>
          {recentBatches.map((item) => (
            <div key={item.batchId} style={{ borderTop: "1px solid #f1f5f9", padding: "8px 0" }}>
              <div style={{ fontSize: 13, color: "#0f172a", fontWeight: 600 }}>{item.batchId}</div>
              <div style={{ fontSize: 12, color: "#334155" }}>{item.productName || "--"}</div>
              <div style={{ fontSize: 11, color: "#64748b" }}>{item.manufacturerId || "--"} · {formatWhen(item.updatedAt)}</div>
            </div>
          ))}
          {!recentBatches.length && <div style={{ fontSize: 12, color: "#64748b" }}>No batches available.</div>}
          {queueError && <div style={{ marginTop: 8, fontSize: 12, color: "#b91c1c" }}>{queueError}</div>}
        </div>
      </div>
    </div>
  );
}