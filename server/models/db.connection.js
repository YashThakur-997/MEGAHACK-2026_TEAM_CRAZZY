let mongoose = require('mongoose');
let dotenv = require('dotenv');
const UserModel = require('./users');

dotenv.config();

mongoose.connect(process.env.MONGODB_URI, {
}).then(async () => {
    console.log('MongoDB connected');
    try {
        await UserModel.syncIndexes();
        console.log('User indexes synced successfully');
    } catch (indexErr) {
        console.error('User index sync error:', indexErr.message);
    }
}).catch(err => {
    console.error('MongoDB connection error:', err);
});
module.exports = mongoose;