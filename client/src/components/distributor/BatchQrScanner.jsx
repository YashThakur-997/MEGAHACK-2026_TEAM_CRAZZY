import React, { useRef, useState } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";

export default function BatchQrScanner() {
  const scannerRef = useRef(null);
  const [scanResult, setScanResult] = useState(null);
  const [verifyResult, setVerifyResult] = useState(null);
  const [error, setError] = useState("");
  const [isRunning, setIsRunning] = useState(false);

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

  const startScanner = () => {
    if (isRunning) return;
    setError("");
    setVerifyResult(null);

    const scanner = new Html5QrcodeScanner("qr-reader", { fps: 10, qrbox: 250 }, false);
    scannerRef.current = scanner;
    setIsRunning(true);

    scanner.render(
      async (decodedText) => {
        try {
          await stopScanner();

          const parsed = JSON.parse(decodedText);
          setScanResult(parsed);

          const batchId = parsed?.batch?.batchId || parsed?.bid;
          if (!batchId) throw new Error("batchId not found in QR");

          const res = await fetch(`/api/drugs/verify/${batchId}`);
          const data = await res.json();
          if (!res.ok) throw new Error(data?.message || "Verification failed");
          setVerifyResult(data);
        } catch (e) {
          setError("Invalid QR content: " + e.message);
        }
      },
      () => {}
    );
  };

  return (
    <div>
      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <button onClick={startScanner}>Start Scanner</button>
        <button onClick={stopScanner}>Stop Scanner</button>
      </div>

      <div id="qr-reader" style={{ width: 320 }} />
      {error && <p style={{ color: "red" }}>{error}</p>}

      {scanResult && (
        <div style={{ marginTop: 16 }}>
          <h4>Batch Info from QR</h4>
          <pre>{JSON.stringify(scanResult.batch || scanResult, null, 2)}</pre>
        </div>
      )}

      {verifyResult?.ok && (
        <div style={{ marginTop: 16 }}>
          <h4>
            Status:{" "}
            <span style={{ color: verifyResult.status === "VERIFIED" ? "green" : "red" }}>
              {verifyResult.status}
            </span>
          </h4>
          <pre>{JSON.stringify(verifyResult, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}