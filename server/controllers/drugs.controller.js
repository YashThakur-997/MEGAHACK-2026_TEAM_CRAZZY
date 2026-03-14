const { computeBatchHash } = require("../utils/hash");
const { generateQrDataUrl } = require("../utils/qr");
const { registerBatchOnChain, getBatchOnChain } = require("../services/blockchain.service");
const { getAnomalySnapshot } = require('../services/anomaly.service');
const { buildRecallPlanCandidates, generateRecallId, latencyForSeverity } = require('../services/recall.service');
const DrugsBatch = require("../models/drugsbatch");
const RecallCase = require('../models/recall.case');

// keep hash fields centralized so register/verify always match
function getHashInput(batch) {
  return {
    batchId: batch.batchId,
    productName: batch.productName,
    manufacturerId: batch.manufacturerId,
    mfgDate: batch.mfgDate,
    expDate: batch.expDate,
    quantity: batch.quantity,
    plantCode: batch.plantCode,
    timestamp: batch.timestamp,
  };
}

// POST /api/drugs/register-batch
exports.registerBatchWithHashAndQR = async (req, res) => {
  try {
    const batch = req.body;
    if (!batch?.batchId) {
      return res.status(400).json({ ok: false, message: "batchId is required" });
    }

    const hashInput = getHashInput(batch);
    const dataHash = computeBatchHash(hashInput);

    // FIX: pass batchId (string), not whole batch object
    const txHash = await registerBatchOnChain(batch, dataHash);

    // QR now contains batch info + chain references
    const qrPayload = {
      v: 1,
      type: "BATCH_CERT",
      batch: hashInput,
      hash: dataHash,
      txHash,
      contract: process.env.BATCH_REGISTRY_ADDRESS,
    };

    const qrDataUrl = await generateQrDataUrl(qrPayload);

    let saved;
    let warning;
    try {
      saved = await DrugsBatch.create({
        ...batch,
        dataHash,
        txHash,
        qrPayload,
      });
    } catch (dbErr) {
      warning = `Batch saved on-chain, but DB persistence failed: ${dbErr.message}`;
      saved = { ...batch, dataHash, txHash, qrPayload, persisted: false };
    }

    return res.status(201).json({ ok: true, batch: saved, qrPayload, qrDataUrl, warning });
  } catch (err) {
    return res.status(500).json({ ok: false, message: err.message });
  }
};

// GET /api/drugs/verify/:batchId
exports.verifyBatchById = async (req, res) => {
  try {
    const { batchId } = req.params;
    const batch = await DrugsBatch.findOne({ batchId });
    if (!batch) return res.status(404).json({ ok: false, message: "Batch not found" });

    const recomputed = computeBatchHash(getHashInput(batch));
    const onChain = await getBatchOnChain(batchId);

    const verified =
      recomputed.toLowerCase() === String(batch.dataHash).toLowerCase() &&
      String(onChain.dataHash).toLowerCase() === String(batch.dataHash).toLowerCase();

    return res.json({
      ok: true,
      status: verified ? "VERIFIED" : "TAMPERED",
      recomputedHash: recomputed,
      dbHash: batch.dataHash,
      onChainHash: onChain.dataHash,
      txHash: batch.txHash,
      batch,
    });
  } catch (err) {
    return res.status(500).json({ ok: false, message: err.message });
  }
};

// GET /api/drugs
exports.listBatches = async (req, res) => {
  try {
    const batches = await DrugsBatch.find({})
      .sort({ createdAt: -1 })
      .lean();

    return res.json({ ok: true, batches });
  } catch (err) {
    return res.status(500).json({ ok: false, message: err.message });
  }
};

// GET /api/drugs/history/:batchId
exports.getBatchHistory = async (req, res) => {
  try {
    const { batchId } = req.params;
    const batch = await DrugsBatch.findOne({ batchId }).lean();

    if (!batch) {
      return res.status(404).json({ ok: false, message: 'Batch not found' });
    }

    const mfgDate = batch.mfgDate || null;
    const chainDate = batch.createdAt || batch.timestamp || null;
    const updatedDate = batch.updatedAt || chainDate || null;

    const timeline = [
      {
        title: 'Manufactured',
        action: 'Batch Production Complete',
        location: batch.plantCode || 'Unknown Plant',
        time: mfgDate,
        txHash: batch.txHash || null,
      },
      {
        title: 'Registered On Chain',
        action: 'Hash Anchored on Blockchain',
        location: batch.manufacturerId || 'Unknown Manufacturer',
        time: chainDate,
        txHash: batch.txHash || null,
      },
      {
        title: 'Latest System Update',
        action: 'Verification Record Synced',
        location: batch.plantCode || 'Unknown Plant',
        time: updatedDate,
        txHash: batch.txHash || null,
      },
    ];

    const recentEvents = [
      {
        location: batch.plantCode || 'Unknown Plant',
        action: 'Batch Registered',
        time: chainDate,
      },
      {
        location: batch.manufacturerId || 'Unknown Manufacturer',
        action: 'Hash Verified',
        time: updatedDate,
      },
    ];

    return res.json({
      ok: true,
      batchId,
      timeline,
      recentEvents,
    });
  } catch (err) {
    return res.status(500).json({ ok: false, message: err.message });
  }
};

// GET /api/drugs/anomalies
exports.getAnomalyAlerts = async (req, res) => {
  try {
    const batches = await DrugsBatch.find({}).sort({ updatedAt: -1 }).lean();
    const { alerts, stats } = getAnomalySnapshot(batches);

    return res.json({
      ok: true,
      generatedAt: new Date().toISOString(),
      stats,
      alerts,
    });
  } catch (err) {
    return res.status(500).json({ ok: false, message: err.message });
  }
};

// GET /api/drugs/recalls/plan
exports.getRecallPlan = async (req, res) => {
  try {
    const [batches, activeRecalls] = await Promise.all([
      DrugsBatch.find({}).sort({ updatedAt: -1 }).lean(),
      RecallCase.find({ status: 'ACTIVE' }).select({ batchId: 1, _id: 0 }).lean(),
    ]);

    const { alerts } = getAnomalySnapshot(batches);
    const activeRecallBatchIds = new Set(activeRecalls.map((r) => r.batchId));

    const candidates = buildRecallPlanCandidates({
      batches,
      alerts,
      activeRecallBatchIds,
    });

    return res.json({
      ok: true,
      generatedAt: new Date().toISOString(),
      candidates,
    });
  } catch (err) {
    return res.status(500).json({ ok: false, message: err.message });
  }
};

// GET /api/drugs/recalls
exports.listRecalls = async (req, res) => {
  try {
    const recalls = await RecallCase.find({})
      .sort({ createdAt: -1 })
      .lean();

    return res.json({ ok: true, recalls });
  } catch (err) {
    return res.status(500).json({ ok: false, message: err.message });
  }
};

// POST /api/drugs/recalls
exports.triggerRecall = async (req, res) => {
  try {
    const {
      batchId,
      reason,
      severity,
      instructions,
      channels,
      sourceAlertTypes,
      plannedActions,
      riskScore,
    } = req.body || {};

    if (!batchId || !reason) {
      return res.status(400).json({ ok: false, message: 'batchId and reason are required' });
    }

    const batch = await DrugsBatch.findOne({ batchId }).lean();
    if (!batch) {
      return res.status(404).json({ ok: false, message: 'Batch not found' });
    }

    const existingActive = await RecallCase.findOne({ batchId, status: 'ACTIVE' }).lean();
    if (existingActive) {
      return res.status(409).json({ ok: false, message: 'Active recall already exists for this batch' });
    }

    const totalTargets = Number(batch.quantity || 0);
    const selectedChannels = Array.isArray(channels) && channels.length > 0 ? channels : ['wallet', 'sms'];
    const recall = await RecallCase.create({
      recallId: generateRecallId(),
      batchId,
      productName: batch.productName,
      severity: severity || 'Standard (Class III)',
      status: 'ACTIVE',
      reason,
      instructions: instructions || '',
      channels: selectedChannels,
      sourceAlertTypes: Array.isArray(sourceAlertTypes) ? sourceAlertTypes : [],
      riskScore: Number(riskScore || 0),
      plannedActions: Array.isArray(plannedActions) ? plannedActions : [],
      notified: totalTargets,
      totalTargets,
      notificationLatencySec: latencyForSeverity(severity),
    });

    return res.status(201).json({ ok: true, recall });
  } catch (err) {
    return res.status(500).json({ ok: false, message: err.message });
  }
};

// PATCH /api/drugs/recalls/:recallId/status
exports.updateRecallStatus = async (req, res) => {
  try {
    const { recallId } = req.params;
    const { status } = req.body || {};

    if (!['ACTIVE', 'RESOLVED', 'CANCELLED'].includes(status)) {
      return res.status(400).json({ ok: false, message: 'Invalid status' });
    }

    const updates = {
      status,
      resolvedAt: status === 'RESOLVED' ? new Date() : null,
    };

    const recall = await RecallCase.findOneAndUpdate(
      { recallId },
      { $set: updates },
      { new: true }
    ).lean();

    if (!recall) {
      return res.status(404).json({ ok: false, message: 'Recall not found' });
    }

    return res.json({ ok: true, recall });
  } catch (err) {
    return res.status(500).json({ ok: false, message: err.message });
  }
};