const { computeBatchHash } = require("../utils/hash");
const { generateQrDataUrl } = require("../utils/qr");
const { registerBatchOnChain, getBatchOnChain } = require("../services/blockchain.service");
const DrugsBatch = require("../models/drugsbatch");

// POST /api/drugs/register-batch
exports.registerBatchWithHashAndQR = async (req, res) => {
  try {
    const batch = req.body;

    // Keep only immutable fields for hashing
    const hashInput = {
      batchId: batch.batchId,
      productName: batch.productName,
      manufacturerId: batch.manufacturerId,
      mfgDate: batch.mfgDate,
      expDate: batch.expDate,
      quantity: batch.quantity,
      plantCode: batch.plantCode,
      timestamp: batch.timestamp,
    };

    const dataHash = computeBatchHash(hashInput);
    const txHash = await registerBatchOnChain(batch, dataHash);

    const qrPayload = {
      v: 1,
      bid: batch.batchId,
      h: dataHash,
      tx: txHash,
      c: process.env.BATCH_REGISTRY_ADDRESS,
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
      saved = {
        ...batch,
        dataHash,
        txHash,
        qrPayload,
        persisted: false,
      };
    }

    return res.status(201).json({ ok: true, batch: saved, qrDataUrl, warning });
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

    const onChain = await getBatchOnChain(batchId);

    const verified =
      recomputed.toLowerCase() === batch.dataHash.toLowerCase() &&
      onChain.dataHash.toLowerCase() === batch.dataHash.toLowerCase();

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