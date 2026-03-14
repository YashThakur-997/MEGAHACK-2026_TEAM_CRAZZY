function severityWeight(severity) {
  if (severity === 'HIGH') return 50;
  if (severity === 'MEDIUM') return 25;
  return 10;
}

function toRecallClass(severity) {
  if (severity === 'HIGH') return 'Critical (Class I)';
  if (severity === 'MEDIUM') return 'High (Class II)';
  return 'Standard (Class III)';
}

function recommendedChannels(recallClass) {
  if (recallClass === 'Critical (Class I)') return ['wallet', 'sms', 'api'];
  if (recallClass === 'High (Class II)') return ['wallet', 'sms'];
  return ['wallet'];
}

function actionsByAlertType(type) {
  const map = {
    HASH_MISMATCH: 'Freeze distribution and run immediate integrity audit',
    DUPLICATE_HASH: 'Quarantine duplicate lots and start counterfeit investigation',
    MISSING_CHAIN_PROOF: 'Block outbound shipments until chain anchoring is restored',
    INVALID_DATE_SEQUENCE: 'Hold inventory and validate manufacturing master record',
    EXPIRED_STOCK: 'Recall from all downstream points and notify regulators',
    EXPIRY_RISK: 'Prioritize stock pullback from low-turnover channels',
    LATE_REGISTRATION: 'Review registration SLA breach and trace ownership handoff',
  };
  return map[type] || 'Perform manual investigation and issue controlled recall if needed';
}

function buildRecallPlanCandidates({ batches, alerts, activeRecallBatchIds }) {
  const alertsByBatch = new Map();

  for (const alert of alerts) {
    if (!alertsByBatch.has(alert.batchId)) {
      alertsByBatch.set(alert.batchId, []);
    }
    alertsByBatch.get(alert.batchId).push(alert);
  }

  const candidates = [];

  for (const batch of batches) {
    const batchAlerts = alertsByBatch.get(batch.batchId) || [];
    if (!batchAlerts.length) continue;
    if (activeRecallBatchIds.has(batch.batchId)) continue;

    const riskScore = batchAlerts.reduce((acc, alert) => acc + severityWeight(alert.severity), 0);
    const topAlert = [...batchAlerts].sort(
      (a, b) => severityWeight(b.severity) - severityWeight(a.severity)
    )[0];

    const recallClass = toRecallClass(topAlert?.severity || 'LOW');
    const plannedActions = Array.from(
      new Set(batchAlerts.map((a) => actionsByAlertType(a.type)))
    );

    const title = topAlert?.title || `Potential risk detected: ${batch.productName}`;

    candidates.push({
      batchId: batch.batchId,
      productName: batch.productName,
      category: batch.category || 'N/A',
      quantity: Number(batch.quantity || 0),
      riskScore,
      anomalyCount: batchAlerts.length,
      recallClass,
      recommendedReason: title,
      recommendedChannels: recommendedChannels(recallClass),
      sourceAlertTypes: Array.from(new Set(batchAlerts.map((a) => a.type))),
      plannedActions,
      manufacturerId: batch.manufacturerId || 'Unknown Manufacturer',
      plantCode: batch.plantCode || 'Unknown Plant',
      updatedAt: batch.updatedAt || batch.createdAt || new Date().toISOString(),
    });
  }

  return candidates.sort((a, b) => b.riskScore - a.riskScore);
}

function generateRecallId() {
  const randomPart = Math.floor(1000 + Math.random() * 9000);
  const stamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  return `RC-${stamp}-${randomPart}`;
}

function latencyForSeverity(severity) {
  if (severity === 'Critical (Class I)') return 2.4;
  if (severity === 'High (Class II)') return 3.6;
  return 5.1;
}

module.exports = {
  buildRecallPlanCandidates,
  generateRecallId,
  latencyForSeverity,
};
