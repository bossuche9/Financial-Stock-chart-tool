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
        console.log(`Fetching ${stock} stock from API ...`);

        try {
           
            const overviewResponse = await axios.get(
                `https://www.alphavantage.co/query?function=OVERVIEW&symbol=${symbol}&apikey=${apiKey}`
            );
            const overviewData = overviewResponse.data;

            if (!overviewData || !overviewData.Symbol) {
                return res.status(400).json({ message: "Company overview not found." });
            }

            
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
            console.log(`Stored ${stock} stock in database`);
        } catch (error) {
            console.error("Error fetching stock data from API:", error);
            return res.status(500).json({ message: "Error fetching stock data from API" });
        }
    }

    
    res.json(stock);
});

const dropdownSearchSymbols = asyncHandler(async(req,res) => {
    const { keywords } = req.query;
    
    if(!keywords) {
        return res.status(400).json({message: "Search keywords are required."});
    }

    try{
        const response = await axios.get(
             `https://www.alphavantage.co/query?function=SYMBOL_SEARCH&keywords=${keywords}&apikey=${apiKey}`
        );

        console.log("Alpha Vantage Response:", JSON.stringify(response.data, null, 2));
        
        const symbolSearchData = response.data;

        if(symbolSearchData && symbolSearchData.bestMatches) {
            const symbols = response.data.bestMatches.map(match => ({
                symbol: match['1. symbol'],
                name: match['2. name'],
            }));

            return res.json(symbols);
        } else {
            return res.status(404).json({message: "Error searching symbols"});
            
        }
    }catch(error) {
        console.error("Error searching symbols:", error.response ? error.response.data : error.message);
        return res.status(500).json({message: "Error failed to get data from API", details: error.message});
    }
});

module.exports = { searchStock, dropdownSearchSymbols };
