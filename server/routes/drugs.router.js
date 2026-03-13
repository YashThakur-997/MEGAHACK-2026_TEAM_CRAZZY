const router = require('express').Router();
const drugsController = require('../controllers/drugs.controller');

router.post('/register-batch', drugsController.registerBatchWithHashAndQR);
router.post('/add', drugsController.registerBatchWithHashAndQR);
router.get('/verify/:batchId', drugsController.verifyBatchById);

module.exports = router;