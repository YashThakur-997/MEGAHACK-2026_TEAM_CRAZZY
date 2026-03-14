const router = require('express').Router();
const drugsController = require('../controllers/drugs.controller');

router.post('/register-batch', drugsController.registerBatchWithHashAndQR);
router.post('/add', drugsController.registerBatchWithHashAndQR);
router.get('/', drugsController.listBatches);
router.get('/list', drugsController.listBatches);
router.get('/history/:batchId', drugsController.getBatchHistory);
router.get('/anomalies', drugsController.getAnomalyAlerts);
router.get('/recalls/plan', drugsController.getRecallPlan);
router.get('/recalls', drugsController.listRecalls);
router.post('/recalls', drugsController.triggerRecall);
router.patch('/recalls/:recallId/status', drugsController.updateRecallStatus);
router.get('/verify/:batchId', drugsController.verifyBatchById);
router.get('/verify-by-hash/:hash', drugsController.verifyBatchByHash);

module.exports = router;