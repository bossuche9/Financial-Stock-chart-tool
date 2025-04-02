const express = require('express');
const router = express.Router();
const {  getHistoricalData, sortedHistoricalDataFunc, getStockSuggestions} = require("../controllers/stockController")


router.post('/stocks/historical',  getHistoricalData);
router.get('/historical/:symbol', sortedHistoricalDataFunc);
router.get('/stocks/suggestions', getStockSuggestions);

router. get('/',)

module.exports = router;
