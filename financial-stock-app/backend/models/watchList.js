const mongoose = require("mongoose");
const stock = require("./stock");

const Schema = mongoose.Schema;

const watchlistSchema = new Schema ({
    userid: { type: Schema.Types.ObjectId, ref: "User"},
    stocks: [{ type: mongoose.Schema.Types.ObjectId, ref: "Stock" }]

})