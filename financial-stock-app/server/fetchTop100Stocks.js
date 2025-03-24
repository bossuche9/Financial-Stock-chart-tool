// fetchTop100Stocks.js
require('dotenv').config();
const yahooFinance = require('yahoo-finance2').default;
const connectDB = require('./config/db');
const Stock = require('./models/stockHistoryModel');
const fs = require('fs');
const path = require('path');

console.log('Script started...')
// Top 100 stock symbols by market cap (as of early 2025)
// This is a predefined list to save you time
const top100Symbols = [
  // US Large Cap Tech
  'AAPL', 'MSFT', 'GOOGL', 'GOOG', 'AMZN', 'META', 'NVDA', 'TSLA', 'AVGO', 'ADBE',
  'ORCL', 'CRM', 'CSCO', 'INTC', 'AMD', 'IBM', 'QCOM', 'TXN', 'NFLX', 'PYPL',
  
  // Financial
  'JPM', 'V', 'MA', 'BAC', 'WFC', 'GS', 'MS', 'C', 'BLK', 'AXP',
  
  // Healthcare
  'JNJ', 'UNH', 'LLY', 'PFE', 'MRK', 'ABBV', 'TMO', 'DHR', 'ABT', 'BMY',
  
  // Consumer
  'WMT', 'PG', 'KO', 'PEP', 'HD', 'MCD', 'NKE', 'COST', 'DIS', 'SBUX',
  
  // Industrial/Energy
  'XOM', 'CVX', 'RTX', 'HON', 'UPS', 'CAT', 'BA', 'GE', 'LMT', 'MMM',
  
  // Telecom/Communication
  'VZ', 'T', 'TMUS', 'CMCSA', 'CHTR', 'NXPI', 'AMT', 'CCI',
  
  // Other Sectors
  'BRK-A', 'BRK-B', 'PM', 'MO', 'MDLZ', 'TGT', 'LOW', 'BKNG', 'GILD', 'AMGN',
  'ISRG', 'REGN', 'VRTX', 'CVS', 'CI', 'ANTM', 'HUM', 'ZTS', 'MRNA', 'ILMN',
  'IDXX', 'SYK', 'EW', 'BSX', 'MDT', 'BDX', 'DXCM', 'A', 'DG', 'TJX',
  'F', 'GM', 'UBER', 'LYFT', 'SPOT', 'ABNB'
];

// Delay function to avoid rate limiting
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

async function fetchAndStoreTop100Stocks() {
  try {
    await connectDB();
    console.log('Connected to MongoDB');
    console.log(`Fetching data for top ${top100Symbols.length} stocks...`);
    
    const results = {
      success: [],
      failed: []
    };
    
    // Process stocks with delay between requests
    for (const symbol of top100Symbols) {
      try {
        console.log(`Fetching ${symbol}...`);
        
        // Get quote data
        const quote = await yahooFinance.quote(symbol);
        
        // Get company profile (with additional details)
        const moduleOptions = { modules: ['assetProfile', 'summaryDetail', 'defaultKeyStatistics'] };
        const company = await yahooFinance.quoteSummary(symbol, moduleOptions);
        
        // Check if stock already exists
        let stock = await Stock.findOne({ symbol });
        
        const historicalData = await yahooFinance.historical(symbol, {
          period1: '2024-01-01', // Start date (change as needed)
          period2: new Date().toISOString().split('T')[0], // End date (today)
          interval: '1d', // Daily data
        });
        
        const stockData = {
          symbol,
          name: quote.shortName || symbol, // Use company name if available
          historicalData: historicalData.map(entry => ({
            date: entry.date,
            open: entry.open,
            high: entry.high,
            low: entry.low,
            close: entry.close,
            adjClose: entry.adjClose,
            volume: entry.volume
          }))
        };
        
        
        if (stock) {
          // Update existing stock
          await Stock.findOneAndUpdate({ symbol }, stockData, { new: true });
          console.log(`Updated ${symbol}`);
        } else {
          // Create new stock
          stock = new Stock(stockData);
          await stock.save();
          console.log(`Added ${symbol}`);
        }
        
        results.success.push(symbol);
        
        // Add delay to avoid rate limiting (2 seconds between requests)
        await delay(5000);
        
      } catch (error) {
        console.error(`Error fetching ${symbol}:`, error.message);
        results.failed.push({ symbol, error: error.message });
        
        // Continue with next symbol after a small delay
        await delay(1000);
      }
    }
    
    // Save the results log
    fs.writeFileSync(
      path.join(__dirname, 'fetch-results.json'),
      JSON.stringify(results, null, 2)
    );
    
    console.log(`Successfully fetched ${results.success.length} stocks`);
    console.log(`Failed to fetch ${results.failed.length} stocks`);
    console.log('Results saved to fetch-results.json');
    
    if (results.failed.length > 0) {
      console.log('Failed symbols:');
      results.failed.forEach(item => console.log(`- ${item.symbol}: ${item.error}`));
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Script error:', error);
    process.exit(1);
  }
}

fetchAndStoreTop100Stocks();