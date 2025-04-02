const mongoose = require("mongoose");


const Schema = mongoose.Schema;

const watchlistSchema = new Schema ({
  symbol: {type: String, required: true, unique: true},
  name: {type: String, required: true},
  percentchange: {type: Number},
  change: {type: Number}
})

module.exports = mongoose.model("Watchlist", watchlistSchema);