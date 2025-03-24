const express = require('express');
const router = express.Router();
const { getWatchlist, addToWatchlist, removeFromWatchlist} = require("../controllers/watchlistController");
const verifyToken = require('../middleware/authMiddleware');

router.get('/watchlist', verifyToken, getWatchlist);
router.post('/watchlist/add',verifyToken, addToWatchlist);
router.post('/watchlist/remove',verifyToken, removeFromWatchlist);

module.exports = router