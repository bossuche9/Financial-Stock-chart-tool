const Stock = require('../models/stockModel');
const axios = require('axios');
const asyncHandler = require("express-async-handler");
const HistoricalStockData = require("../models/stockHistoryModel");
const yahooFinance = require("yahoo-finance2").default;
require('dotenv').config();



const apiKey = process.env.ALPHA_VINTAGE_API_KEY;



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


const getHistoricalData = asyncHandler(async(req,res) => {
    const {symbol} = req.body

    if (!symbol) {
        return res.status(400).json({ message: "Stock symbol or name is required." });
    }

    try{

        let stockHistory = await HistoricalStockData.findOne({symbol: symbol.toUpperCase()});
    
        if(!stockHistory){
            stockHistory = await HistoricalStockData.findOne({name: {$regex: new RegExp(`${symbol}$`, "i") } });
        }
    
        let startDate = new Date('1970-01-01');
        if(stockHistory && stockHistory.historicalData.length > 0) {
            startDate = new Date(Math.max(...stockHistory.historicalData.map(d => d.date)))
        }
    
        const queryOptions = {
            period1: startDate,
            period2: new Date(),
            interval: '1d'
        }
    
        const result = await yahooFinance.chart(symbol,queryOptions);
    
        const newHistoricalData = result.quotes.map(quote => ({
            date: quote.date,
            open: quote.open,
            high: quote.high,
            low: quote.low,
            close: quote.close,
            adjClose: quote.adjclose,
            volume: quote.volume
        }));

        const stockquote = await yahooFinance.quote(symbol);

        if(!stockHistory) {
            stockHistory = new HistoricalStockData({
                symbol: result.meta.symbol,
                name: stockquote.shortName,
                marketcap: stockquote.marketCap,
                historicalData: newHistoricalData,
                updatedAt: new Date()
            });
        } else {
            // Append new data to existing historical data
            // Use Set to avoid duplicates based on date
            const existingDateSet = new Set(stockHistory.historicalData.map(d => d.date.toISOString()));
            const uniqueNewData = newHistoricalData.filter(
                item => !existingDateSet.has(item.date.toISOString())
            );

            stockHistory.historicalData.push(...uniqueNewData);
            stockHistory.updatedAt = new Date();
        }

        await stockHistory.save();

        res.status(200).json({
            message: 'Historical data retrieved and stored successfully',
            dataPoints: stockHistory.historicalData.length
        });

    } catch (error) {
        console.error('Error fetching historical stock data:', error);
        
        // Handle specific Yahoo Finance error for non-existent symbols
        if (error.message.includes('No data found')) {
            return res.status(404).json({ 
                message: 'No stock data found for the given symbol',
                symbol: symbol 
            });
        }

        res.status(500).json({ 
            message: `Error retrieving ${symbol} historical stock data`, 
            error: error.message 
        });
    }
});

const sortedHistoricalDataFunc = asyncHandler(async(req,res) => {
    const { symbol } = req.params;

    try {
        const stockHistory = await HistoricalStockData.findOne({ 
            $or: [
                { symbol: symbol.toUpperCase() },
                { name: { $regex: new RegExp(`${symbol}$`, "i") } }
            ]
        });

        if (!stockHistory) {
            return res.status(404).json({ message: "No historical data found for this stock" });
        }

        // Sort historical data by date in ascending order
        const sortedHistoricalData = stockHistory.historicalData.sort((a, b) => 
            new Date(a.date) - new Date(b.date)
        );

        res.json({
            symbol: stockHistory.symbol,
            name: stockHistory.name,
            historicalData: sortedHistoricalData
        });
    } catch (error) {
        console.error('Error retrieving historical stock data:', error);
        res.status(500).json({ 
            message: 'Error retrieving historical stock data', 
            error: error.message 
        });
    }
});

const getStockSuggestions = asyncHandler(async(req,res) => {
    const {query} = req.query;

    try{
        if(!query) {
            const randomStocks = await Stock.aggregate([{ $sample: {size: 5}}]);
            return res.json(randomStocks);
        }
    
        const regex = new RegExp(`^${query}`, 'i');

        const suggestions = await Stock.find({
            $or: [
                { symbol: regex},
                { name: regex}
            ]
        })
        .limit(5)
        .select(`symbol  name`);

        res.json(suggestions);
    }catch(error) {
        console.error(`Error fetching stock suggestions:`, error);
        res.status(500).json({
            message: "Error retrieving stock suggestions",
            error: error.message
        });
    }


});

module.exports = { searchStock, getHistoricalData, sortedHistoricalDataFunc, getStockSuggestions};
