const express = require("express");
const { getMarketStatus } = require("../controllers/marketController");
const router = express.Router();

router.get("/status", getMarketStatus);

module.exports = router;