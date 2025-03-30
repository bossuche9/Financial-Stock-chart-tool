const express = require('express');
const router = express.Router();
const { searchStock, dropdownSearchSymbols,  getHistoricalData, sortedHistoricalDataFunc, getStockSuggestions} = require("../controllers/stockController")
const HistoricalStockData = require('../models/stockHistoryModel');

router.post('/stocks/search', searchStock);
router.post('/stocks/historical',  getHistoricalData);
router.get('/historical/:symbol', sortedHistoricalDataFunc);
router.get('/stocks/suggestions', getStockSuggestions);

router. get('/',)

module.exports = router;
