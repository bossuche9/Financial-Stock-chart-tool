const mongoose = require("mongoose");


const Schema = mongoose.Schema;

const watchlistSchema = new Schema ({
    userid: { type: Schema.Types.ObjectId, ref: "User", required: true},
    stocks: [{ type: mongoose.Schema.Types.ObjectId, ref: "Stock", unique: true}]

})

module.exports = mongoose.model("Watchlist", watchlistSchema);