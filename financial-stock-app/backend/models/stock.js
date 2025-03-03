const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const StockSchema = new Schema ({
    symbol: String,
    currency: String,

});

module.exports = mongoose.model("Stock", StockSchema);