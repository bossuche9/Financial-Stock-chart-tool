const RealTimeData = require("../models/RealtimeData");
const Historical   = require("../models/stockHistoryModel");
const { isMarketOpen } = require("./marketHours");
const moment = require("moment-timezone");

async function simulateOnce(symbol) {
  const now = new Date();

  // fetch the last bar
  let last = await RealTimeData
    .findOne({ symbol })
    .sort({ timestamp: -1 });

  // bootstrap from history if needed
  if (!last) {
    const hist = await Historical.findOne({ symbol }).sort({ updatedAt: -1 });
    if (!hist || !hist.historicalData.length) return;
    const lastPoint = hist.historicalData[hist.historicalData.length - 1];
    last = { price: lastPoint.close, timestamp: now };
  }

  // determine the price to write:
  // – during open hours: random‑walk ±0.1% off last.price
  // – off‑hours: flat last.price
  let newPrice = last.price;
  if (isMarketOpen(now)) {
    const vol = last.price * 0.001; 
    const variation = (Math.random() - 0.5) * 2 * vol;
    newPrice = parseFloat((last.price + variation).toFixed(2));
  }

  // write it
  await RealTimeData.create({ symbol, price: newPrice, timestamp: now });
  console.log(`[Sim] ${symbol} → $${newPrice} @ ${now.toISOString()}`);
}

function startSimulators(symbols) {
  symbols.forEach(sym => {
    // kick off immediately, then every 5 min
    simulateOnce(sym).catch(console.error);
    setInterval(() => simulateOnce(sym).catch(console.error),
                5 * 60 * 1000);
  });
}

module.exports = { startSimulators };
