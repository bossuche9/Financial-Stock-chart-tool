const yahooFinance = require('yahoo-finance2').default;

async function testYahooFinanceAPI() {
  try {
    // Stock symbol to query
    const query = 'AAPL';

    // Query options - you can modify these as needed
    const queryOptions = { 
      period1: '2023-01-01', 
      period2: '2024-03-25',
      interval: '1d' 
    };

    // Fetch stock chart data
    console.log(`Fetching data for ${query}...`);
    const result = await yahooFinance.chart(query, queryOptions);

    // Print key metadata
    console.log('Metadata:');
    console.log('Currency:', result.meta.currency);
    console.log('Symbol:', result.meta.symbol);
    console.log('Exchange:', result.meta.exchangeName);
    console.log('Regular Market Price:', result.meta.regularMarketPrice);

    // Print first few data points
    console.log('\nFirst few data points:');
    result.quotes.slice(0, 5).forEach((quote, index) => {
      console.log(`Day ${index + 1}:`, {
        date: quote.date,
        open: quote.open,
        high: quote.high,
        low: quote.low,
        close: quote.close
      });
    });

  } catch (error) {
    console.error('Error fetching stock data:', error);
  }
}

// Run the test function
testYahooFinanceAPI();