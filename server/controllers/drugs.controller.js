const DrugBatch = require('../models/drugsbatch'); // Renamed to be more descriptive
const crypto = require('crypto');

const createDrugBatch = async (req, res) => {
    try {
        const { name, expiryDate, batchNumber } = req.body;

        // 1. Generate the hash dynamically based on the specific request data
        // We include the batchNumber and name to ensure the hash is unique
        const dataToHash = `${name}-${expiryDate}-${batchNumber}`;
        const dataHash = crypto.createHash('sha256').update(dataToHash).digest('hex');

        // 2. Create the document in MongoDB
        const newBatch = new DrugBatch({
            name,
            expiryDate,
            batchNumber,
            dataHash, // This is what you'll eventually send to the Smart Contract
            manufacturer: req.user.id // Assuming your JWT middleware attaches the user
        });

        await newBatch.save();

        // 3. Return the data so the Frontend can now call the Smart Contract
        res.status(201).json({
            message: 'Drug batch created in DB',
            mongoId: newBatch._id,
            hashToSign: dataHash 
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

const getDrugBatch = async (req, res) => {
    try {
        const { batchNumber } = req.params;
        const batch = await DrugBatch.findOne({ batchNumber });
        
        if (!batch) {
            return res.status(404).json({ error: 'Batch not found' });
        }
        
        res.status(200).json(batch);
    } catch (err) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

module.exports = { createDrugBatch, getDrugBatch };