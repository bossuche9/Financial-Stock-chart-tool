require('dotenv').config();
const mongoose = require('mongoose');
const axios = require('axios');
const cheerio = require('cheerio');

// MongoDB connection
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URL);
        console.log("MongoDB connected");
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

// Define Schema & Model
const stockSchema = new mongoose.Schema({
    symbol: String,
    name: String
});

const Stock = mongoose.model('Stock', stockSchema);

// Wikipedia URL
const WIKI_URL = "https://en.wikipedia.org/wiki/List_of_S%26P_500_companies";

// Fetch and store S&P 500 stocks
const fetchAndStoreStocks = async () => {
    try {
        const { data } = await axios.get(WIKI_URL);
        const $ = cheerio.load(data);
        const stocks = [];

        // Locate the table and extract stock symbols
        $("table.wikitable tbody tr").each((index, element) => {
            const columns = $(element).find("td");
            if (columns.length > 0) {
                const symbol = $(columns[0]).text().trim();
                const name = $(columns[1]).text().trim();
                stocks.push({ symbol, name });
            }
        });

        // Store in MongoDB
        await Stock.deleteMany({}); // Clear old data
        await Stock.insertMany(stocks);

        console.log("S&P 500 stocks stored successfully.");
        mongoose.connection.close();
    } catch (error) {
        console.error("Error fetching/storing stocks:", error);
        mongoose.connection.close();
    }
};

// Run Script
(async () => {
    await connectDB();
    await fetchAndStoreStocks();
})();
