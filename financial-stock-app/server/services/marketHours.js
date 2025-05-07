const moment = require("moment-timezone");

/**
 * True if `date` (America/New_York) is Mon–Fri between 09:30 and 16:00.
 */
function isMarketOpen(date = new Date()) {
  const ny   = moment.tz(date, "America/New_York");
  const day  = ny.isoWeekday();        // 1=Mon … 7=Sun
  const time = ny.format("HH:mm");

  return day <= 5 && time >= "09:30" && time < "16:00";
}

module.exports = { isMarketOpen };
