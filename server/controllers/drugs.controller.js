const { computeBatchHash } = require("../utils/hash");
const { generateQrDataUrl } = require("../utils/qr");
const { registerBatchOnChain, getBatchOnChain } = require("../services/blockchain.service");
const DrugsBatch = require("../models/drugsbatch");

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