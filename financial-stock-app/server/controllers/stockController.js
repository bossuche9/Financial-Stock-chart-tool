const Stock = require('../models/stockModel');
const asyncHandler = require("express-async-handler");
const HistoricalStockData = require("../models/stockHistoryModel");
const yahooFinance = require("yahoo-finance2").default;
require('dotenv').config();


const getHistoricalData = asyncHandler(async(req,res) => {
    const {symbol} = req.body

    if (!symbol) {
        return res.status(400).json({ message: "Stock symbol or name is required." });
    }

    try{
        // First, check if the stock exists by symbol (case insensitive)
        let stockHistory = await HistoricalStockData.findOne({
            symbol: { $regex: new RegExp(`^${symbol}$`, "i") }
        });
    
        // If not found by symbol, try to find by name
        if(!stockHistory){
            stockHistory = await HistoricalStockData.findOne({
                name: { $regex: new RegExp(`${symbol}`, "i") }
            });
        }
    
        let startDate = new Date('1970-01-01');
        if(stockHistory && stockHistory.historicalData.length > 0) {
            startDate = new Date(Math.max(...stockHistory.historicalData.map(d => new Date(d.date))));
        }
    
        const queryOptions = {
            period1: startDate,
            period2: new Date(),
            interval: '1d'
        };
    
        const result = await yahooFinance.chart(symbol, queryOptions);
        const stockquote = await yahooFinance.quote(symbol);
    
        const newHistoricalData = result.quotes.map(quote => ({
            date: quote.date,
            open: quote.open,
            high: quote.high,
            low: quote.low,
            close: quote.close,
            adjClose: quote.adjclose,
            volume: quote.volume
        }));

        if(!stockHistory) {
            
            stockHistory = new HistoricalStockData({
                symbol: result.meta.symbol,
                name: stockquote.shortName,
                marketcap: stockquote.marketCap,
                historicalData: newHistoricalData,
                updatedAt: new Date()
            });
        } else {
            
            const existingDateSet = new Set(
                stockHistory.historicalData.map(d => new Date(d.date).toISOString().split('T')[0])
            );
            
            const uniqueNewData = newHistoricalData.filter(
                item => !existingDateSet.has(new Date(item.date).toISOString().split('T')[0])
            );

            stockHistory.historicalData.push(...uniqueNewData);
            stockHistory.updatedAt = new Date();
            stockHistory.marketcap = stockquote.marketCap; // Update market cap
            
            
            if (stockHistory.symbol !== result.meta.symbol) {
                stockHistory.symbol = result.meta.symbol;
            }
        }

        await stockHistory.save();

        res.status(200).json({
            message: 'Historical data retrieved and stored successfully',
            dataPoints: stockHistory.historicalData.length
        });

    } catch (error) {
        console.error('Error fetching historical stock data:', error);
        
        // Handle specific Yahoo Finance error for non-existent symbols
        if (error.message && error.message.includes('No data found')) {
            return res.status(404).json({ 
                message: 'No stock data found for the given symbol',
                symbol: symbol 
            });
        }

        res.status(500).json({ 
            message: `Error retrieving ${symbol} historical stock data`, 
            error: error.message ,
            historicalData:stockHistory.historicalData,
            quote: {
                symbol: stockquote.symbol,
                longName: stockquote.longName,
                regularMarketPrice: stockquote.regularMarketPrice,
                regularMarketPreviousClose: stockquote.regularMarketPreviousClose,
                regularMarketChangePercent: stockquote.regularMarketChangePercent,
                marketCap: stockquote.marketCap,
                regularMarketVolume: stockquote.regularMarketVolume,
                fiftyDayAverage: stockquote.fiftyDayAverage,
                twoHundredDayAverage: stockquote.twoHundredDayAverage
            }
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

const getQuote = asyncHandler(async (req, res) => {
    const { symbol } = req.params;
    const quote = await yahooFinance.quote(symbol);
    console.log(quote);
  
    res.json({
      name: quote.displayName,
      price: quote.regularMarketPrice,
      changePercent: quote.regularMarketChangePercent,
      previousClose: quote.regularMarketPreviousClose,
      marketCap: quote.marketCap,
      volume: quote.regularMarketVolume,
      fiftyDayAvg: quote.fiftyDayAverage,
      twoHundredDayAvg: quote.twoHundredDayAverage,
    });
  });



module.exports = { getHistoricalData, sortedHistoricalDataFunc, getStockSuggestions,  getQuote};
