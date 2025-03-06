const Stock = require("./models/stock");
const User = require("./models/user");
const WatchList = require("./models/watchList");
require('dotenv').config();


const stock = [];
const user = [];
const watchList =[];
const stockUrl = "https://www.alphavantage.co/query?function=MARKET_STATUS&apikey=";
const stockApiKey = process.env.ALPHA_VINTAGE_API_KEY;
const mongoDB = process.env.MONGO_URL;

const mongoose = require ('mongoose');
mongoose.set("strictQuery", false);

main().catch((err) => console.log(err));

async function main(){
    console.log("Awaiting Database Connection");
    await mongoose.connect(mongoDB);
}

async function getData(data){
    try{
        const response = await fetch(url, {
            headers: {
                'x-api_key' : stockApiKey
            },
            method: "GET"
        })

        if(!response.ok){
            throw new Error(`Response status: ${response.status}`);
        }
    }


}


