const router=require('express').Router();
const {saveChart,getMainChart,importChart,deleteAllCharts,getTransitGraph,getTransitChart,getCompositeChart,getSynastryChart,
  deleteMainChart, 
  deleteCompositeChart, 
  deleteTransitChart, 
  getTimeZone,
  deleteSynastryChart, 
  deleteTransitGraph 
}=require('../controllers/chart')
const {middleware}=require('../middleware/middleware')
const { uploadMultipleCSV, handleMulterError } = require('../middleware/uploadMiddleware');

router.post('/deleteAllCharts',middleware,deleteAllCharts)
router.post('/saveChart',middleware,saveChart)
router.get('/getMainChart',middleware,getMainChart)
router.get('/getTransitChart',middleware,getTransitChart)
router.get('/getCompositeChart',middleware,getCompositeChart)
router.get('/getSynastryChart',middleware,getSynastryChart)
router.get('/getTransitGraph',middleware,getTransitGraph)
router.post('/import-chart', 
    middleware,
    uploadMultipleCSV,
    handleMulterError,
    importChart
  );


  router.delete('/main-chart/:id', deleteMainChart);
router.delete('/composite-chart/:id', deleteCompositeChart);
router.delete('/transit-chart/:id', deleteTransitChart);
router.delete('/synastry-chart/:id', deleteSynastryChart);
router.delete('/transit-graph/:id', deleteTransitGraph);
router.get('/getTimeZone',getTimeZone)
module.exports=router;