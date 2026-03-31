const express = require('express');
const router = express.Router();
const siderealChartController = require('../controllers/calculator');

router.get('/health', siderealChartController.healthCheck);
router.post('/chart/natal', siderealChartController.calculateNatalChart);
router.post('/chart/transit', siderealChartController.calculateTransitChart);
router.post('/chart/synastry', siderealChartController.calculateSynastryChart);
router.post('/chart/composite', siderealChartController.calculateCompositeChart);
router.post('/chart/progressions', siderealChartController.calculateProgressions);
router.post('/chart/simple', siderealChartController.calculateSimpleChart);
router.post('/chart', siderealChartController.calculateDetailedChart);
router.post('/chart/interpretation', siderealChartController.calculateChartWithInterpretation);

module.exports = router;