const asyncHandler = require("express-async-handler");
const { isMarketOpen } = require("../services/marketHours");
const moment = require("moment-timezone");

const getMarketStatus = asyncHandler(async (req, res) => {
  const now = new Date();
  const nyTime = moment.tz(now, "America/New_York");
  const marketOpen = isMarketOpen(now);
  
  // Calculate when the next market event will occur (open or close)
  let nextEvent = "";
  
  const currentDay = nyTime.isoWeekday(); // 1=Mon ... 7=Sun
  const currentTime = nyTime.format("HH:mm");
  
  if (marketOpen) {
    // Market is open, so next event is close (4:00 PM)
    nextEvent = `Closes at 4:00 PM ET`;
  } else {
    // Market is closed, calculate when it will open next
    if (currentDay <= 5) { // Mon-Fri
      if (currentTime < "09:30") {
        // Same day opening
        nextEvent = `Opens at 9:30 AM ET today`;
      } else {
        // Next day opening
        if (currentDay === 5) { // Friday
          nextEvent = `Opens on Monday at 9:30 AM ET`;
        } else {
          nextEvent = `Opens tomorrow at 9:30 AM ET`;
        }
      }
    } else if (currentDay === 6) { // Saturday
      nextEvent = `Opens on Monday at 9:30 AM ET`;
    } else { // Sunday
      nextEvent = `Opens tomorrow at 9:30 AM ET`;
    }
  }

  res.json({ 
    isOpen: marketOpen,
    currentTime: nyTime.format("h:mm A ET"),
    nextEvent
  });
});

module.exports = { getMarketStatus };