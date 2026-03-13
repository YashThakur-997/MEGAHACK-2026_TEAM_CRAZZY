const { computeBatchHash } = require("../utils/hash");
const { generateQrDataUrl } = require("../utils/qr");
const { registerBatchOnChain, getBatchOnChain } = require("../services/blockchain.service");
const DrugsBatch = require("../models/drugsbatch");

function normalizeBatchPayload(input, user) {
  const nowIso = new Date().toISOString();
  return {
    batchId: input.batchId || input.batchNumber,
    productName: input.productName || input.name,
    manufacturerId: input.manufacturerId || String(user?.id || user?._id || 'SYSTEM'),
    mfgDate: input.mfgDate || input.manufacturingDate || nowIso,
    expDate: input.expDate || input.expiryDate,
    quantity: Number(input.quantity || 1),
    plantCode: input.plantCode || 'PLANT-NA',
    timestamp: input.timestamp || nowIso,
    category: input.category || '',
    storageConditions: input.storageConditions || '',
    ingredients: input.ingredients || '',
  };
}

// POST /api/drugs/register-batch
exports.registerBatchWithHashAndQR = async (req, res) => {
  try {
    const batch = normalizeBatchPayload(req.body, req.user);

    if (!batch.batchId || !batch.productName || !batch.expDate) {
      return res.status(400).json({
        ok: false,
        message: 'batchId/batchNumber, productName/name, and expDate/expiryDate are required',
      });
    }

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

    // Upsert makes registration idempotent and avoids duplicate-key crashes on retries.
    const saved = await DrugsBatch.findOneAndUpdate(
      { batchId: batch.batchId },
      {
        $set: {
          ...batch,
          dataHash,
          txHash,
          qrPayload,
        },
      },
      {
        returnDocument: 'after',
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      }
    );

    return res.status(201).json({ ok: true, batch: saved, qrDataUrl });
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