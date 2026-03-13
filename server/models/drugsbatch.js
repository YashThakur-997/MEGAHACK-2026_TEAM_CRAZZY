let mongoose = require('mongoose');

const drugBatchSchema = new mongoose.Schema({
    // --- BASIC INFO ---
    name: { type: String, required: true }, // e.g., "Aspirin 500mg"
    batchNumber: { type: String, required: true, unique: true }, // The physical ID on the bottle
    description: String,
    manufacturerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    manufacturingDate: { type: Date, default: Date.now },
    expiryDate: { type: Date, required: true },

    // --- BLOCKCHAIN & SECURITY ---
    dataHash: { type: String, required: true }, // The SHA-256 digital seal
    transactionHash: { type: String }, // The hash from the blockchain transaction
    
    // --- TRACKING ---
    status: { 
        type: String, 
        enum: ['MANUFACTURED', 'IN_TRANSIT', 'DELIVERED', 'COMPROMISED'],
        default: 'MANUFACTURED'
    },
    currentHolder: { type: String } // Wallet address of who currently has it
}, { timestamps: true }); // Automatically adds createdAt and updatedAt

let DrugBatchModel = mongoose.model('DrugBatch', drugBatchSchema);
module.exports = DrugBatchModel;