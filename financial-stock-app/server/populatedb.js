const Stock = require("./models/stock");
const User = require("./models/user");
const WatchList = require("./models/watchList");
require('dotenv').config();


const stock = [];
const user = [];
const watchList =[];
const stockApiKey = process.env.ALPHA_VINTAGE_API_KEY;
const ticker = "TSLA"
const stockUrl = "https://www.alphavantage.co/query?function=SMA&symbol={ticker}&interval=daily&time_period=10&series_type=close&apikey=${stockApiKey}";
const mongoDB = process.env.MONGO_URL;

const mongoose = require ('mongoose');
mongoose.set("strictQuery", false);

main().catch((err) => console.log(err));

async function main(){
    console.log("Awaiting Database Connection");
    await mongoose.connect(mongoDB);
    console.log("Connected to MongoDB");
}

async function fetchStockData(symbol)
    try{
      const response = await fetch(``)
    }


} 


