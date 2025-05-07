const express = require("express");
const { getRealtime } = require("../controllers/realtimeController");
const router = express.Router();

router.get("/:symbol", getRealtime);

module.exports = router;
