const express = require('express');
const router = express.Router();
const { searchStock } = require("../controllers/stockController")

router.post('/search', searchStock);

module.exports = router;