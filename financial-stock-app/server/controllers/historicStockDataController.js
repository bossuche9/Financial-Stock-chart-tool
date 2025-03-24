const asyncHandler = require("express-async-handler");
const historicalStockData = require("../models/stockHistoryModel");
const axios = require('axios');
require('dotenv').config();

const apiKey = process.env.ALPHA_VINTAGE_API_KEY;

