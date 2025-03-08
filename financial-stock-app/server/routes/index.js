const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

router.get("/", (req, res, next) => {
    res.send("respond with a resource")
});

module.exports = router;