const Stock = require('../models/stockModel');
const axios = require('axios');
const asyncHandler = require("express-async-handler");
require('dotenv').config();

const apiKey = process.env.ALPHA_VINTAGE_API_KEY;
console.log("Alpha Vantage API Key:", process.env.ALPHA_VINTAGE_API_KEY);


const searchStock = asyncHandler(async (req, res) => {
    const { symbol } = req.body;
    
    if (!symbol) {
        return res.status(400).json({ message: "Stock symbol is required." });
    }

    let stock = await Stock.findOne({ symbol });

    if (!stock) {
        console.log("Fetching from API...");

        try {
            // Fetch stock overview (name, description, market cap, etc.)
            const overviewResponse = await axios.get(
                `https://www.alphavantage.co/query?function=OVERVIEW&symbol=${symbol}&apikey=${apiKey}`
            );
            const overviewData = overviewResponse.data;

            if (!overviewData || !overviewData.Symbol) {
                return res.status(400).json({ message: "Company overview not found." });
            }

            // Fetch daily time series data for stock prices (lastClose, prevClose, volume)
            const dailyResponse = await axios.get(
                `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${symbol}&apikey=${apiKey}`
            );
            const dailyData = dailyResponse.data;

            if (!dailyData || !dailyData["Time Series (Daily)"]) {
                return res.status(400).json({ message: "Stock time series data not found." });
            }

            const latestDate = Object.keys(dailyData["Time Series (Daily)"])[0];
            const latestData = dailyData["Time Series (Daily)"][latestDate];

            
            stock = new Stock({
                symbol: overviewData.Symbol,
                name: overviewData.Name,
                description: overviewData.Description,
                marketCap: parseFloat(overviewData.MarketCapitalization),
                currency: overviewData.Currency,
                lastClose: parseFloat(latestData["4. close"]),
                prevClose: parseFloat(latestData["1. open"]),
                volumeData: parseFloat(latestData["5. volume"]),
            });

            // Save the stock info to the database
            await stock.save();
        } catch (error) {
            console.error("Error fetching stock data:", error);
            return res.status(500).json({ message: "Error fetching stock data" });
        }
    }

    // Respond with the stock info (from the database)
    res.json(stock);
});

module.exports = { searchStock };
