require('dotenv').config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const connectDB = require("./config/db");   

const indexRouter = require ("./routes/index");

const app = express();
app.use(express.json());
app.use(cors())

app.use('/', indexRouter);

connectDB();

const PORT =process.env.PORT || 5000;
app.listen(PORT, ()=> {
    console.log(`Server Started at ${PORT}`)
});

 // error handlers
app.use(function(req, res, next) {
    next(createError(404));
  });
  
  app.use(function(err, req, res, next) {
   
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};
  
    res.status(err.status || 500);
    res.render('error');
  });
  
  module.exports = app;
  