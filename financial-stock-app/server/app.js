require('dotenv').config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");   
const authRoutes = require('./routes/authRoutes.js');
const stockRoutes = require('./routes/stockRoutes.js');
const watchListRoutes = require('./routes/watchListRoutes.js')
const createError = require('http-errors');
const { watch } = require('./models/userModel.js');
const path = require("path");
const { startSimulators } = require("./services/simulator.js");
const realtimeRoutes = require("./routes/realtimeRoutes.js");
const marketRoutes = require("./routes/marketRoutes.js");


const PORT =process.env.PORT || 3000;
const app = express();

connectDB();

app.use(express.json());
app.use(cors());


app.use('/api', authRoutes);
app.use('/api', stockRoutes);
app.use('/api', watchListRoutes);
app.use("/api/realtime", realtimeRoutes);
app.use("/api/market", marketRoutes);

// Default route
app.get('/', (req, res) => {
  res.send('Welcome to my Stock API!');
});

app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working!' });
});

 // error handlers
app.use(function(req, res, next) {
    next(createError(404));
  });
  
  app.use(function(err, req, res, next) {
   
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};
  
    res.status(err.status || 500);
    res.json('error page does not exist');
  });

  (async function bootstrap() {
    const Stock = require("./models/stockModel");
    let symbols = (await Stock.find().select("symbol -_id"))
                  .map(s => s.symbol);
  
    // if your stocks collection is empty, fallback to history:
    if (!symbols.length) {
      const Hist = require("./models/stockHistoryModel");
      symbols = (await Hist.find().select("symbol -_id"))
                .map(h => h.symbol);
    }
  
    console.log("🟢 Starting simulators for:", symbols);
    startSimulators(symbols);
  })();

  // Start the HTTP server
app.listen(PORT, () => {
  console.log(`🚀 Server listening on port ${PORT}`);
});

  
  module.exports = app;
  