const mongoose = require('mongoose');

const recallCaseSchema = new mongoose.Schema(
  {
    recallId: { type: String, required: true, unique: true, index: true },
    batchId: { type: String, required: true, index: true },
    productName: { type: String, required: true },
    severity: {
      type: String,
      enum: ['Critical (Class I)', 'High (Class II)', 'Standard (Class III)'],
      default: 'Standard (Class III)',
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'RESOLVED', 'CANCELLED'],
      default: 'ACTIVE',
      index: true,
    },
    reason: { type: String, required: true },
    instructions: { type: String, default: '' },
    channels: {
      type: [String],
      default: ['wallet', 'sms'],
    },
    sourceAlertTypes: {
      type: [String],
      default: [],
    },
    riskScore: { type: Number, default: 0 },
    plannedActions: {
      type: [String],
      default: [],
    },
    notified: { type: Number, default: 0 },
    totalTargets: { type: Number, default: 0 },
    notificationLatencySec: { type: Number, default: 4.2 },
    resolvedAt: { type: Date, default: null },
  },
  {
    timestamps: true,
    collection: 'recallcases',
  }
);

const RecallCase = mongoose.models.RecallCase || mongoose.model('RecallCase', recallCaseSchema);

module.exports = RecallCase;
