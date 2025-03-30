const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const stockHistoryModel = new Schema({
    symbol: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    marketcap: { type: Number, required: true},
    historicalData: [
        {
            date: {type: Date},
            open:{type: Number, required: true},
            high: {type: Number, required: true},
            low: {type: Number, required: true},
            close:{type: Number, required: true},
            adjClose: {type: Number},
            volume: {type: Number, required: true}
        }
    ],
    updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('StockHistory', stockHistoryModel);