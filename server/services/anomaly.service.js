const { computeBatchHash } = require('../utils/hash');

function parseDateSafe(value) {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

function daysBetween(fromDate, toDate) {
  const ms = toDate.getTime() - fromDate.getTime();
  return Math.floor(ms / (1000 * 60 * 60 * 24));
}

function buildAnomalyAlert({ batch, type, severity, title, description, reason, meta = {} }) {
  return {
    id: `ANOM-${batch.batchId}-${type}`,
    type,
    severity,
    title,
    description,
    reason,
    batchId: batch.batchId,
    productName: batch.productName,
    plantCode: batch.plantCode || 'Unknown Plant',
    manufacturerId: batch.manufacturerId || 'Unknown Manufacturer',
    createdAt: batch.updatedAt || batch.createdAt || new Date().toISOString(),
    ...meta,
  };
}

function detectBatchAnomalies(batch, duplicateHashSet) {
  const anomalies = [];
  const now = new Date();
  const mfgDate = parseDateSafe(batch.mfgDate);
  const expDate = parseDateSafe(batch.expDate);
  const regTimestamp = parseDateSafe(batch.timestamp);

  const recomputed = computeBatchHash({
    batchId: batch.batchId,
    productName: batch.productName,
    manufacturerId: batch.manufacturerId,
    mfgDate: batch.mfgDate,
    expDate: batch.expDate,
    quantity: batch.quantity,
    plantCode: batch.plantCode,
    timestamp: batch.timestamp,
  });

  if ((batch.dataHash || '').toLowerCase() !== recomputed.toLowerCase()) {
    anomalies.push(
      buildAnomalyAlert({
        batch,
        type: 'HASH_MISMATCH',
        severity: 'HIGH',
        title: `Hash integrity mismatch: ${batch.productName}`,
        description: 'Stored hash differs from recomputed payload hash. Batch payload may have been altered post registration.',
        reason: 'Ledger hash mismatch with recomputed batch fingerprint',
        meta: {
          expectedHash: batch.dataHash,
          recomputedHash: recomputed,
        },
      })
    );
  }

  if (duplicateHashSet.has((batch.dataHash || '').toLowerCase())) {
    anomalies.push(
      buildAnomalyAlert({
        batch,
        type: 'DUPLICATE_HASH',
        severity: 'HIGH',
        title: `Duplicate hash detected: ${batch.productName}`,
        description: 'The same ledger hash appears across multiple batch IDs, indicating potential cloning or duplicate registration.',
        reason: 'Identical hash reused by multiple batches',
      })
    );
  }

  if (!batch.txHash || String(batch.txHash).trim().length < 10) {
    anomalies.push(
      buildAnomalyAlert({
        batch,
        type: 'MISSING_CHAIN_PROOF',
        severity: 'MEDIUM',
        title: `Missing on-chain proof: ${batch.productName}`,
        description: 'Batch has no valid transaction hash anchor. Verifiability on ledger is incomplete.',
        reason: 'Missing or malformed transaction hash',
      })
    );
  }

  if (mfgDate && expDate && expDate <= mfgDate) {
    anomalies.push(
      buildAnomalyAlert({
        batch,
        type: 'INVALID_DATE_SEQUENCE',
        severity: 'HIGH',
        title: `Date sequence anomaly: ${batch.productName}`,
        description: 'Expiry date is not after manufacturing date. Product chronology is invalid.',
        reason: 'Expiry date earlier than or equal to manufacturing date',
      })
    );
  }

  if (expDate) {
    const daysToExpiry = daysBetween(now, expDate);
    if (daysToExpiry < 0) {
      anomalies.push(
        buildAnomalyAlert({
          batch,
          type: 'EXPIRED_STOCK',
          severity: 'HIGH',
          title: `Expired batch still in ledger: ${batch.productName}`,
          description: `Batch expired ${Math.abs(daysToExpiry)} day(s) ago but remains active in operational records.`,
          reason: 'Expired inventory requires immediate action',
          meta: { daysToExpiry },
        })
      );
    } else if (daysToExpiry <= 30) {
      anomalies.push(
        buildAnomalyAlert({
          batch,
          type: 'EXPIRY_RISK',
          severity: 'MEDIUM',
          title: `Expiry risk window: ${batch.productName}`,
          description: `Batch will expire in ${daysToExpiry} day(s). Review channel allocation and recall readiness.`,
          reason: 'Short remaining shelf life',
          meta: { daysToExpiry },
        })
      );
    }
  }

  if (mfgDate && regTimestamp) {
    const regDelayDays = daysBetween(mfgDate, regTimestamp);
    if (regDelayDays > 7) {
      anomalies.push(
        buildAnomalyAlert({
          batch,
          type: 'LATE_REGISTRATION',
          severity: 'LOW',
          title: `Delayed ledger registration: ${batch.productName}`,
          description: `Batch was registered ${regDelayDays} day(s) after manufacturing. Investigate operational latency.`,
          reason: 'Registration timestamp significantly delayed',
          meta: { regDelayDays },
        })
      );
    }
  }

  return anomalies;
}

function getAnomalySnapshot(batches) {
  const hashFrequency = new Map();
  for (const batch of batches) {
    const key = (batch.dataHash || '').toLowerCase();
    if (!key) continue;
    hashFrequency.set(key, (hashFrequency.get(key) || 0) + 1);
  }

  const duplicateHashSet = new Set(
    Array.from(hashFrequency.entries())
      .filter(([, count]) => count > 1)
      .map(([hash]) => hash)
  );

  const alerts = batches
    .flatMap((batch) => detectBatchAnomalies(batch, duplicateHashSet))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const stats = {
    total: alerts.length,
    high: alerts.filter((a) => a.severity === 'HIGH').length,
    medium: alerts.filter((a) => a.severity === 'MEDIUM').length,
    low: alerts.filter((a) => a.severity === 'LOW').length,
    duplicateHash: alerts.filter((a) => a.type === 'DUPLICATE_HASH').length,
    integrityMismatch: alerts.filter((a) => a.type === 'HASH_MISMATCH').length,
    expiryRisk: alerts.filter((a) => a.type === 'EXPIRY_RISK' || a.type === 'EXPIRED_STOCK').length,
    registrationDelay: alerts.filter((a) => a.type === 'LATE_REGISTRATION').length,
  };

  return { alerts, stats };
}

module.exports = { getAnomalySnapshot };
