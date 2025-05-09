// Updated simulator.js with proper market hours handling
const RealTimeData = require("../models/RealtimeData");
const Historical = require("../models/stockHistoryModel");
const { isMarketOpen } = require("./marketHours");
const moment = require("moment-timezone");

async function simulateOnce(symbol) {
  const now = new Date();
  const marketOpen = isMarketOpen(now);

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

  // Only simulate price changes when market is open
  let newPrice = last.price;
  let priceChanged = false;
  
  if (marketOpen) {
    // During market hours: use normal volatility for simulation
    const volatilityFactor = 0.003; // 0.3% volatility
    const vol = last.price * volatilityFactor;
    const variation = (Math.random() - 0.5) * 2 * vol;
    
    // Ensure price changes by at least a small amount with 2 decimal precision
    newPrice = parseFloat((last.price + variation).toFixed(2));
    
    // Ensure we don't get exactly the same price
    if (newPrice === last.price) {
      // Force a minimum change of +/- $0.01
      newPrice = parseFloat((last.price + (Math.random() > 0.5 ? 0.01 : -0.01)).toFixed(2));
    }
    
    priceChanged = true;
  } else {
    // Outside market hours: reuse the same price
    newPrice = last.price;
    // Only create a new entry if it's been more than 5 minutes since last update
    const lastUpdateTime = new Date(last.timestamp).getTime();
    const currentTime = now.getTime();
    priceChanged = (currentTime - lastUpdateTime) > 5 * 60 * 1000;
  }

  // Only write to database if we have a new price or enough time has passed
  if (priceChanged) {
    await RealTimeData.create({ symbol, price: newPrice, timestamp: now });
    console.log(`[Sim] ${symbol} → $${newPrice} @ ${now.toISOString()} [Market ${marketOpen ? 'Open' : 'Closed'}]`);
  }
}

function startSimulators(symbols) {
  symbols.forEach(sym => {
    // kick off immediately, then every 10 seconds (changed from 30 seconds for more frequent updates)
    simulateOnce(sym).catch(console.error);
    setInterval(() => simulateOnce(sym).catch(console.error), 10 * 1000);
  });
}

module.exports = { startSimulators };