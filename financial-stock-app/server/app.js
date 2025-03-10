require('dotenv').config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");   
const authRoutes = require('./routes/authRoutes.js');
const stockRoutes = require('./routes/stockRoutes.js');
const createError = require('http-errors');


const PORT =process.env.PORT || 5000;
const app = express();

connectDB();

app.use(express.json());
app.use(cors())

app.use('/api', authRoutes);
app.use('/api', stockRoutes)

// Default route
app.get('/', (req, res) => {
  res.send('Welcome to my User Registration and Login API!');
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

  app.listen(PORT, ()=> {
    console.log(`Server Started at ${PORT}`)
});
  
  module.exports = app;
  