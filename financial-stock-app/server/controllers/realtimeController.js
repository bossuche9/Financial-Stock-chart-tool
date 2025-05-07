const asyncHandler = require("express-async-handler");
const RealTimeData = require("../models/RealtimeData");

const getRealtime = asyncHandler(async (req, res) => {
  const { symbol } = req.params;
  const docs = await RealTimeData
    .find({ symbol })
    .sort({ timestamp: 1 })
    .limit(288);        // 24 h × 12 bars/hour

  res.json(docs.map(d => ({
    date:  d.timestamp,
    close: d.price
  })));
});

module.exports = { getRealtime };
