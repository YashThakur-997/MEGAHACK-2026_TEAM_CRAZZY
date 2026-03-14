let mongoose = require('mongoose');
let dotenv = require('dotenv');
const UserModel = require('./users');
const DrugsBatchModel = require('./drugsbatch');
const RecallCaseModel = require('./recall.case');

dotenv.config();

mongoose.connect(process.env.MONGODB_URI, {
}).then(async () => {
    console.log('MongoDB connected');
    try {
        await UserModel.syncIndexes();
        console.log('User indexes synced successfully');
        await DrugsBatchModel.syncIndexes();
        console.log('DrugsBatch indexes synced successfully');
        await RecallCaseModel.syncIndexes();
        console.log('RecallCase indexes synced successfully');

        try {
            await DrugsBatchModel.collection.dropIndex('batchNumber_1');
            console.log('Dropped stale DrugsBatch index: batchNumber_1');
        } catch (dropErr) {
            // Ignore when index does not exist; surface only real drop failures.
            if (!/index not found/i.test(dropErr.message || '')) {
                console.error('DrugsBatch stale index cleanup error:', dropErr.message);
            }
        }
    } catch (indexErr) {
        console.error('Index sync error:', indexErr.message);
    }
}).catch(err => {
    console.error('MongoDB connection error:', err);
});
module.exports = mongoose;