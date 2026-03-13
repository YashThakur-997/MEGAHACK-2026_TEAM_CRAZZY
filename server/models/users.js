let mongoose = require('mongoose');
let dotenv = require('dotenv');

dotenv.config();

const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { 
        type: String, 
        enum: ['MANUFACTURER', 'DISTRIBUTOR', 'PHARMACY', 'PATIENT'], 
        required: true 
    },
    walletAddress: { type: String, unique: true, sparse: true }, // For the blockchain link
    
    // Nested details based on your UI images
    manufacturerDetails: {
        companyName: String,
        drugLicenseNo: String,
        cdscoApprovalNo: String,
        gstNumber: String,
        fullName: String,
        phone: String
    },
    distributorDetails: {
        companyName: String,
        drugLicenseNo: String,
        gstNumber: String,
        stateOfOperation: String,
        warehouseAddress: String,
        fullName: String,
        phone: String
    },
    patientDetails: {
        fullName: String,
        phone: String,
        city: String,
        aadharNumber: String // Optional as per your UI
    }
}, { timestamps: true });

let UserModel = mongoose.model('User', userSchema);

module.exports = UserModel;