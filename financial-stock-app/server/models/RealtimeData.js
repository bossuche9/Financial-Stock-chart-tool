const mongoose = require("mongoose");
const { Schema } = mongoose;

const realtimeSchema = new Schema({
  symbol:    { type: String, required: true, index: true },
  price:     { type: Number, required: true },
  timestamp: {
    type: Date,
    default: Date.now,
    index: { expires: 60 * 60 * 24 }  // auto‑delete after 24h
  }
});

module.exports = mongoose.model("RealtimeData", realtimeSchema);
