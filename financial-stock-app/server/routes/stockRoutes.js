const express = require('express');
const router = express.Router();
const { searchStock, dropdownSearchSymbols } = require("../controllers/stockController")

router.post('/search', searchStock);
router.get('/dropdown', dropdownSearchSymbols);

module.exports = router;