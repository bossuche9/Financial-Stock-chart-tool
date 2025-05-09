// realtimeController.js
const asyncHandler = require("express-async-handler");
const RealTimeData = require("../models/RealtimeData");
const Historical = require("../models/stockHistoryModel");
const { isMarketOpen } = require("../services/marketHours");

// Get realtime data for a specific symbol
const getRealtime = asyncHandler(async (req, res) => {
  const { symbol } = req.params;
  
  if (!symbol) {
    res.status(400);
    throw new Error("Symbol is required");
  }

  // Check market status
  const marketOpen = isMarketOpen();
  
  try {
    // Get the last closing price from historical data
    const historical = await Historical.findOne({ symbol }).sort({ updatedAt: -1 });
    let lastClosePrice = null;
    let lastCloseDate = null;
    
    if (historical && historical.historicalData.length > 0) {
      // Sort by date to get the most recent closing price
      const sortedData = [...historical.historicalData].sort((a, b) => 
        new Date(b.date) - new Date(a.date)
      );
      lastClosePrice = sortedData[0].close;
      lastCloseDate = sortedData[0].date;
    }

    // Get realtime data
    const data = await RealTimeData.find({ symbol })
      .sort({ timestamp: 1 })
      .limit(100); // Limit to prevent too much data
    
    // Format the data for the chart
    const formattedData = data.map(item => ({
      date: item.timestamp,
      close: item.price
    }));

    // Add market status information and last closing price
    res.json({
      data: formattedData,
      isMarketOpen: marketOpen,
      lastPrice: lastClosePrice,
      lastUpdate: lastCloseDate
    });
  } catch (error) {
    console.error("Error fetching realtime data:", error);
    res.status(500);
    throw new Error("Failed to fetch realtime data");
  }
});

module.exports = { getRealtime };