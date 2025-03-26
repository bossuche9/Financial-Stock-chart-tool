const asyncHandler = require("express-async-handler");
const Stock = require('../models/stockModel');
const User = require('../models/userModel');
const axios = require('axios');
require('dotenv').config();

const apiKey = process.env.ALPHA_VINTAGE_API_KEY;

const getWatchlist = asyncHandler(async(req, res) => {
    const userEmail = req.user.email;

    const user = await User.findOne({email: userEmail}).populate('watchlist');

    if (!user){
        return res.status(404).json({message: "User not found." });
    }

    res.json({watchlist: user.watchlist});
});

const addToWatchlist = asyncHandler(async(req, res) => {
    const userEmail = req.user.email;
    const { symbol } = req.body;

    if (!symbol) {
        return res.status(404).json({message: "Stock symbol is required." });
    }

    const user = await User.findOne({email: userEmail });
    if(!user) {
        return res.status(404).json({message: "User does not exist." });
    }

    let stock = await Stock.findOne({symbol: symbol.toUpperCase()});

    if(!stock){
        stock = await Stock.findOne({name: {$regex: new RegExp(`${symbol}$`, "i") } });
    }
    
   
    if(!stock) {
    console.log("Fetching from API...");
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
        console.log(symbol, "added to watchlist")
    } catch (error) {
        console.error("Error fetching stock data:", error);
        return res.status(500).json({ message: "Error fetching stock data" });
    }
    }

    if (user.watchlist.some(id => id.toString() === stock._id.toString())){
        return res.status(500).json({ message: "Stock is already in the watchlist" });
    }

    user.watchlist.push(stock._id);
    await user.save();

    const updatedUser = await User.findById(user._id).populate('watchlist');
    res.json({watchlist: updatedUser.watchlist, message: `${symbol} added to watchlist` });
});

const removeFromWatchlist = asyncHandler(async (req, res) => {
    const userEmail = req.user.email;
    const { symbol } = req.body;

    if (!symbol) {
        return res.status(404).json({message: "Stock symbol is required." });
    }

    const user = await User.findOne({email: userEmail });
    if(!user) {
        return res.status(404).json({message: "User does not exist." });
    }

    const stock = await Stock.findOne({ symbol: symbol.toUpperCase() });
    if(!stock){
        return res.status(404).json({ message: "stock not found."});
    }

    user.watchlist = user.watchlist.filter(stockId => stockId.toString() != stock._id.toString());
    await user.save();
    console.log(symbol, "removed from watchlist");
    
    const updatedUser = await User.findById(user._id).populate('watchlist');
    res.json({watchlist: updatedUser.watchlist, message: `${symbol} removed to watchlist`});
});

module.exports = { getWatchlist, addToWatchlist, removeFromWatchlist};