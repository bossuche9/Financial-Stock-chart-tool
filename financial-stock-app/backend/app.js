require('dotenv').config();
const express = require("express");
const moongoose = require("mongoose");
const cors = require("cors");


const indexRouter = require ("./routes/index");

const app = express();

app.use(express.json());

 // error handlers
app.use(function(req, res, next) {
    next(createError(404));
  });
  
  /
  app.use(function(err, req, res, next) {
   
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};
  
    res.status(err.status || 500);
    res.render('error');
  });
  
  module.exports = app;
  