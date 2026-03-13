const mongoose = require('mongoose');

const drugsBatchSchema = new mongoose.Schema(
  {
    batchId: { type: String, required: true, unique: true, index: true },
    productName: { type: String, required: true },
    manufacturerId: { type: String, required: true },
    mfgDate: { type: String, required: true },
    expDate: { type: String, required: true },
    quantity: { type: Number, required: true },
    plantCode: { type: String, required: true },
    timestamp: { type: String, required: true },
    category: { type: String },
    storageConditions: { type: String },
    ingredients: { type: String },
    dataHash: { type: String, required: true },
    txHash: { type: String, required: true },
    qrPayload: { type: mongoose.Schema.Types.Mixed },
  },
  { timestamps: true }
);

const DrugsBatch = mongoose.models.DrugsBatch || mongoose.model('DrugsBatch', drugsBatchSchema);

module.exports = DrugsBatch;
