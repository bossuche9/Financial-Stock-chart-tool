import React, { useState, useMemo, useEffect } from 'react';
import axios from 'axios';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

// Time range options
const TIME_RANGES = [
  { label: '1D', value: '1d' },
  { label: '5D', value: '5d' },
  { label: '1M', value: '1m' },
  { label: '3M', value: '3m' },
  { label: '6M', value: '6m' },
  { label: 'YTD', value: 'ytd' },
  { label: '1Y', value: '1y' },
  { label: '5Y', value: '5y' },
  { label: 'ALL', value: 'all' }
];

const StockChart = () => {
  // State for stock input and search
  const [symbol, setSymbol] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  // State for chart data
  const [historicalData, setHistoricalData] = useState([]);
  const [selectedTimeRange, setSelectedTimeRange] = useState('1y');
  
  // State for UI
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // State for stock details
  const [stockDetails, setStockDetails] = useState({
    name: '',
    marketCap: 0,
    symbol: '',
    volumeData: 0,
    lastClose: 0,
    currency: ''
  });

  // Using useMemo for derived state
  const filteredData = useMemo(() => {
    return filterDataByTimeRange(historicalData, selectedTimeRange);
  }, [historicalData, selectedTimeRange]);

  // Calculate percentage change
  const priceChange = useMemo(() => {
    if (filteredData.length < 2) return { value: 0, percentage: 0 };
    
    const latest = filteredData[filteredData.length - 1].close;
    const earliest = filteredData[0].close;
    const change = latest - earliest;
    const percentage = (change / earliest) * 100;
    
    return {
      value: change,
      percentage: percentage
    };
  }, [filteredData]);

  const fetchSuggestions = async (query) => {
    if (query.length < 1) {
      setSuggestions([]);
      return;
    }

    try {
      const response = await axios.get(`/api/stocks/suggestions?query=${query}`);
      console.log("Fetched Suggestions:", response.data);
      setSuggestions(response.data);
      setShowSuggestions(true);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value.toUpperCase();
    setSymbol(value);
    fetchSuggestions(value);
  };

  const handleSuggestionSelect = (selectedSymbol) => {
    setSymbol(selectedSymbol);
    setShowSuggestions(false);
    fetchHistoricalData(selectedSymbol);
  };

  // Filter data based on time range
  function filterDataByTimeRange(data, range) {
    if (!data || data.length === 0) return [];

    let filteredData = [...data];
    const now = new Date();

    // Create a pure date at the start of the day to avoid time zone issues
    const createDateAtStartOfDay = (date) => {
      const newDate = new Date(date);
      newDate.setHours(0, 0, 0, 0);
      return newDate;
    };

    switch (range) {
      case '1d':
        filteredData = data.slice(-1);
        break;
      case '5d':
        filteredData = data.slice(-5);
        break;
      case '1m':
        filteredData = data.filter(item => {
          const itemDate = createDateAtStartOfDay(new Date(item.date));
          const oneMonthAgo = createDateAtStartOfDay(new Date(now.getFullYear(), now.getMonth() - 1, now.getDate()));
          return itemDate >= oneMonthAgo;
        });
        break;
      case '3m':
        filteredData = data.filter(item => {
          const itemDate = createDateAtStartOfDay(new Date(item.date));
          const threeMonthsAgo = createDateAtStartOfDay(new Date(now.getFullYear(), now.getMonth() - 3, now.getDate()));
          return itemDate >= threeMonthsAgo;
        });
        break;
      case '6m':
        filteredData = data.filter(item => {
          const itemDate = createDateAtStartOfDay(new Date(item.date));
          const sixMonthsAgo = createDateAtStartOfDay(new Date(now.getFullYear(), now.getMonth() - 6, now.getDate()));
          return itemDate >= sixMonthsAgo;
        });
        break;
      case 'ytd':
        filteredData = data.filter(item => {
          const itemDate = createDateAtStartOfDay(new Date(item.date));
          const yearStart = createDateAtStartOfDay(new Date(now.getFullYear(), 0, 1));
          return itemDate >= yearStart;
        });
        break;
      case '1y':
        filteredData = data.filter(item => {
          const itemDate = createDateAtStartOfDay(new Date(item.date));
          const oneYearAgo = createDateAtStartOfDay(new Date(now.getFullYear() - 1, now.getMonth(), now.getDate()));
          return itemDate >= oneYearAgo;
        });
        break;
      case '5y':
        filteredData = data.filter(item => {
          const itemDate = createDateAtStartOfDay(new Date(item.date));
          const fiveYearsAgo = createDateAtStartOfDay(new Date(now.getFullYear() - 5, now.getMonth(), now.getDate()));
          return itemDate >= fiveYearsAgo;
        });
        break;
      case 'all':
      default:
        // No filtering
        break;
    }

    return filteredData;
  };

  // Format market cap for display
  const formatMarketCap = (marketCap) => {
    if (!marketCap) return 'N/A';
    
    if (marketCap >= 1_000_000_000_000) {
      return `$${(marketCap / 1_000_000_000_000).toFixed(2)}T`;
    } else if (marketCap >= 1_000_000_000) {
      return `$${(marketCap / 1_000_000_000).toFixed(2)}B`;
    } else if (marketCap >= 1_000_000) {
      return `$${(marketCap / 1_000_000).toFixed(2)}M`;
    } else if (marketCap >= 1_000) {
      return `$${(marketCap / 1_000).toFixed(2)}K`;
    } else {
      return `$${marketCap}`;
    }
  };

  // Format volume for display
  const formatVolume = (volume) => {
    if (!volume) return 'N/A';
    
    if (volume >= 1_000_000_000) {
      return `${(volume / 1_000_000_000).toFixed(2)}B`;
    } else if (volume >= 1_000_000) {
      return `${(volume / 1_000_000).toFixed(2)}M`;
    } else if (volume >= 1_000) {
      return `${(volume / 1_000).toFixed(2)}K`;
    } else {
      return volume.toString();
    }
  };

  // Fetch stock details
  const fetchStockDetails = async (symbolToFetch) => {
    try {
      const response = await axios.post('/api/stocks/search', { symbol: symbolToFetch });
      setStockDetails({
        name: response.data.name || '',
        marketCap: response.data.marketCap || 0,
        symbol: response.data.symbol || '',
        volumeData: response.data.volumeData || 0,
        lastClose: response.data.lastClose || 0,
        currency: response.data.currency || 'USD'
      });
    } catch (error) {
      console.error('Error fetching stock details:', error);
      // Don't set error state - we'll let the historical data fetch handle errors
    }
  };

  // Fetch historical data
  const fetchHistoricalData = async (symbolToFetch = symbol) => {
    if (!symbolToFetch) return;
  
    setLoading(true);
    setError(null);
  
    try {
      // Fetch stock details first
      await fetchStockDetails(symbolToFetch);
      
      // First call to fetch and store the data
      const postResponse = await axios.post('/api/stocks/historical', { symbol: symbolToFetch });
      
      // Only proceed to get the data after the first call completes successfully
      if (postResponse.status === 200) {
        const response = await axios.get(`/api/historical/${symbolToFetch}`);
        
        const data = response.data.historicalData;
  
        setHistoricalData(data);
      }
    } catch (error) {
      console.error('Error fetching historical data:', error);
      setError('Failed to fetch stock data. Please check the symbol and try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle time range selection
  const handleTimeRangeSelect = (range) => {
    setSelectedTimeRange(range);
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-5xl">
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        {/* Search and Input Section */}
        <div className="p-4 bg-gray-100 flex items-center space-x-4 relative">
          <input 
            type="text" 
            value={symbol} 
            onChange={handleInputChange}
            onFocus={() => fetchSuggestions(symbol)}
            placeholder="Enter Stock Symbol"
            className="flex-grow px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button 
            onClick={() => fetchHistoricalData()} 
            disabled={loading}
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Fetching...' : 'Fetch Data'}
          </button>

          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg top-full">
              {suggestions.map((suggestion) => (
                <div
                  key={suggestion.symbol}
                  onClick={() => handleSuggestionSelect(suggestion.symbol)}
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                >
                  <span className="font-bold">{suggestion.symbol}</span>
                  <span className="text-gray-500 ml-2">{suggestion.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Stock Header */}
        {stockDetails.name && (
          <div className="p-4 bg-gray-50 border-b">
            <div className="flex flex-wrap justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold">
                  {stockDetails.name} ({stockDetails.symbol})
                </h2>
                <div className="text-gray-600 mt-1">
                  {stockDetails.lastClose > 0 ? `$${stockDetails.lastClose.toFixed(2)} ${stockDetails.currency}` : 'Price not available'}
                </div>
              </div>
              {priceChange.value !== 0 && (
                <div className={`text-lg font-medium ${priceChange.value >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {priceChange.value >= 0 ? '+' : ''}
                  {priceChange.value.toFixed(2)} ({priceChange.percentage.toFixed(2)}%)
                </div>
              )}
            </div>
          </div>
        )}

        {/* Time Range Buttons */}
        <div className="flex justify-center space-x-2 p-4 bg-gray-50 flex-wrap">
          {TIME_RANGES.map((range) => (
            <button
              key={range.value}
              onClick={() => handleTimeRangeSelect(range.value)}
              className={`
                px-3 py-1 text-sm rounded-full transition-all duration-200
                ${selectedTimeRange === range.value 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}
              `}
            >
              {range.label}
            </button>
          ))}
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        {/* Chart and Details Section */}
        <div className="p-4 grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Chart takes up 3/4 of the width on large screens */}
          <div className="lg:col-span-3">
            {filteredData.length > 0 ? (
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={filteredData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(tick) => new Date(tick).toLocaleDateString()} 
                    className="text-sm"
                  />
                  <YAxis 
                    className="text-sm"
                    tickFormatter={(value) => `$${value.toFixed(2)}`}
                  />
                  <Tooltip 
                    labelFormatter={(label) => new Date(label).toLocaleDateString()}
                    formatter={(value) => [`$${value.toFixed(2)}`, 'Close Price']}
                    contentStyle={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.9)', 
                      border: '1px solid #ddd',
                      borderRadius: '8px'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="close" 
                    stroke="#3b82f6" 
                    strokeWidth={3}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center text-gray-500 py-10">
                {loading 
                  ? 'Loading...' 
                  : 'Enter a stock symbol to view historical data'}
              </div>
            )}
          </div>
          
          {/* Stock details takes up 1/4 of the width on large screens */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-bold mb-4">Stock Details</h3>
            
            {stockDetails.symbol ? (
              <div className="space-y-3">
                <div>
                  <div className="text-sm text-gray-500">Symbol</div>
                  <div className="font-medium">{stockDetails.symbol}</div>
                </div>
                
                <div>
                  <div className="text-sm text-gray-500">Company</div>
                  <div className="font-medium">{stockDetails.name || 'N/A'}</div>
                </div>
                
                <div>
                  <div className="text-sm text-gray-500">Market Cap</div>
                  <div className="font-medium">{formatMarketCap(stockDetails.marketCap)}</div>
                </div>
                
                <div>
                  <div className="text-sm text-gray-500">Volume</div>
                  <div className="font-medium">{formatVolume(stockDetails.volumeData)}</div>
                </div>
                
                <div>
                  <div className="text-sm text-gray-500">Last Close</div>
                  <div className="font-medium">
                    {stockDetails.lastClose ? `$${stockDetails.lastClose.toFixed(2)}` : 'N/A'}
                  </div>
                </div>
                
                {filteredData.length > 0 && (
                  <>
                    <div>
                      <div className="text-sm text-gray-500">Period High</div>
                      <div className="font-medium">
                        ${Math.max(...filteredData.map(d => d.high)).toFixed(2)}
                      </div>
                    </div>
                    
                    <div>
                      <div className="text-sm text-gray-500">Period Low</div>
                      <div className="font-medium">
                        ${Math.min(...filteredData.map(d => d.low)).toFixed(2)}
                      </div>
                    </div>
                    
                    <div>
                      <div className="text-sm text-gray-500">Period Change</div>
                      <div className={`font-medium ${priceChange.value >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {priceChange.value >= 0 ? '+' : ''}
                        {priceChange.value.toFixed(2)} ({priceChange.percentage.toFixed(2)}%)
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="text-gray-500 italic">
                {loading ? 'Loading stock details...' : 'Search for a stock to see details'}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StockChart;