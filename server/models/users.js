let mongoose = require('mongoose');
let dotenv = require('dotenv');

dotenv.config();

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    // --- ADD THESE FOR THE HACKATHON ---
    role: { 
        type: String, 
        enum: ['MANUFACTURER', 'DISTRIBUTOR', 'PHARMACY', 'CONSUMER'], 
        default: 'CONSUMER' 
    },
    walletAddress: { type: String, unique: true, sparse: true } 
    // sparse: true allows nulls for consumers who don't have wallets yet
});

let UserModel = mongoose.model('User', userSchema);

module.exports = UserModel;