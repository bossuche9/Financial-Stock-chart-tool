const asyncHandler = require("express-async-handler");
const Stock = require('../models/stockModel');
const User = require('../models/userModel');
const Watchlist = require('../models/watchListModel');
const axios = require('axios');
const { default: yahooFinance } = require("yahoo-finance2");
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

    let stock = await Watchlist.findOne({symbol: symbol.toUpperCase()});

    if(!stock){
        stock = await Watchlist.findOne({name: {$regex: new RegExp(`${symbol}$`, "i") } });
    }
    

    if(!stock) {
        console.log("Fetching from API instead of database...");

    try {

        const queryOptions = {
            fields : ["symbol", "displayName", "regularMarketChange", "regularMarketChangePercent", "shortName", "longName" ]
        };

        const StockResponse = await yahooFinance.quote(symbol,queryOptions);

        console.log("Yahoo Finance Response:", StockResponse);


        if(!StockResponse){
            return res.status(400).json({ message: "Stock quote not found on yahoo finance."});
        }

        let existingStock =  await Watchlist.findOne({ symbol: StockResponse.symbol });

        if(!existingStock){
            stock = new Watchlist({
                symbol: StockResponse.symbol,
                name: StockResponse.displayName || StockResponse.shortName || StockResponse.longName ,
                percentchange: StockResponse.regularMarketChangePercent || "N/A" ,
                change: StockResponse.regularMarketChange || "N/A",
            });
        
        try {
            await stock.save();
        } catch (error) {
            console.error("Error saving stock data:", error);
            return res.status(500).json({ message: "Error saving stock data" });
        }
    } else {
        stock = existingStock; // Use the existing stock to avoid duplicates
    }
        

    }catch(error){
        console.error("Error fetching stock data:", error);
        return res.status(500).json({ message: "Error fetching stock data" });
    }
    }

    if (user.watchlist.some(id => id.toString() === stock._id.toString())){
        return res.status(500).json({ message: "Stock is already in the watchlist" });
    }

    user.watchlist.push(stock._id);
    console.log(symbol, "added to watchlist")
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

    const stock = await Watchlist.findOne({ symbol: symbol.toUpperCase() });
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