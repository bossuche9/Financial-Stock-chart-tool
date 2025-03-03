const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const StockSchema = new Schema ({
    symbol: { type:String, required: true, unique: true},
    currency: { type:String, required: true},
    marketCap: { type: Number},
    percentChange: { type: Number},
});

module.exports = mongoose.model("Stock", StockSchema);
