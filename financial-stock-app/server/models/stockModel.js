const mongoose = require("mongoose");

const Schema = mongoose.Schema;

// Define the Stock Schema
const stockSchema = new Schema({
    symbol: { type: String, required: true, unique: true },
    name: { type: String },
    marketCap: { type: Number },
    currency: { type: String },
    lastClose: { type: Number },  
    prevClose: { type: Number },  
    volumeData: { type: Number },     
  }, 
  
  // Virtual function to calculate % change
  stockSchema.virtual('percentChange').get(function () {
    if (!this.lastClose || !this.prevClose) return null;
    return (((this.lastClose - this.prevClose) / this.prevClose) * 100).toFixed(2);
  });
  
  module.exports = mongoose.model('Stock', stockSchema);


