let router = require('express').Router();
let  authorizeRoles  = require('../middlewares/auth.roles');
let  authMiddleware  = require('../middlewares/auth');
const { createDrugBatch, getDrugBatch } = require('../controllers/drugs.controller');

// 1. MUST verify token FIRST, then authorize role
router.post(
    '/add', 
    authMiddleware, 
    authorizeRoles('MANUFACTURER'), // Only MANUFACTURER can add batches
    createDrugBatch
);

// 2. Viewing a batch: Usually, anyone logged in (Distributor/Pharmacy) can do this
router.get(
    '/batch/:batchNumber', 
    authMiddleware, 
    getDrugBatch
);

module.exports = router;